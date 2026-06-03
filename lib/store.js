import {
  collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, onSnapshot,
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { USE_FB, db, auth } from "./firebase";
import { DEFAULT_SERVICES, DEFAULT_SETTINGS } from "./config";
import { t2m, m2t, normPhone } from "./util";

const LS = {
  get: (k, f) => {
    if (typeof window === "undefined") return f;
    try { const v = JSON.parse(localStorage.getItem("ss_" + k)); return v ?? f; } catch (e) { return f; }
  },
  set: (k, v) => { if (typeof window !== "undefined") localStorage.setItem("ss_" + k, JSON.stringify(v)); },
};

export const store = {
  async init() {
    if (!USE_FB) {
      if (!LS.get("services")) LS.set("services", DEFAULT_SERVICES);
      if (!LS.get("settings")) LS.set("settings", DEFAULT_SETTINGS);
      if (!LS.get("bookings")) LS.set("bookings", []);
    }
  },
  async ensureSeed() {
    if (!USE_FB) return;
    const sv = await getDocs(collection(db, "services"));
    if (sv.empty) for (const s of DEFAULT_SERVICES) await setDoc(doc(db, "services", s.id), s);
    const st = await getDoc(doc(db, "config", "settings"));
    if (!st.exists()) await setDoc(doc(db, "config", "settings"), DEFAULT_SETTINGS);
  },
  async getServices() {
    return USE_FB ? (await getDocs(collection(db, "services"))).docs.map((d) => d.data()) : LS.get("services", []);
  },
  async saveService(s) {
    if (USE_FB) await setDoc(doc(db, "services", s.id), s);
    else LS.set("services", LS.get("services", []).map((x) => (x.id === s.id ? s : x)));
  },
  async addService(s) {
    if (USE_FB) await setDoc(doc(db, "services", s.id), s);
    else LS.set("services", [...LS.get("services", []), s]);
  },
  async delService(id) {
    if (USE_FB) await deleteDoc(doc(db, "services", id));
    else LS.set("services", LS.get("services", []).filter((x) => x.id !== id));
  },
  async getSettings() {
    if (USE_FB) { const d = await getDoc(doc(db, "config", "settings")); return d.exists() ? d.data() : DEFAULT_SETTINGS; }
    return LS.get("settings", DEFAULT_SETTINGS);
  },
  async saveSettings(s) {
    if (USE_FB) await setDoc(doc(db, "config", "settings"), s);
    else LS.set("settings", s);
  },
  async dayIntervals(dateStr) {
    if (USE_FB) {
      const q = await getDocs(query(collection(db, "slots"), where("date", "==", dateStr)));
      return q.docs.map((d) => ({ start: t2m(d.data().start), end: t2m(d.data().end) }));
    }
    return LS.get("bookings", [])
      .filter((b) => b.date === dateStr && b.status !== "cancelled")
      .map((b) => ({ start: t2m(b.start), end: t2m(b.start) + b.dur }));
  },
  async createBooking(b) {
    if (USE_FB) {
      await setDoc(doc(db, "bookings", b.id), b);
      await setDoc(doc(db, "slots", b.id), { date: b.date, start: b.start, end: m2t(t2m(b.start) + b.dur), bid: b.id });
    } else LS.set("bookings", [...LS.get("bookings", []), b]);
  },
  async updateBooking(b) {
    // Owner edit (e.g. client changed their mind on the day). Overwrites the
    // booking and re-blocks the slot for the possibly-new service/time.
    if (USE_FB) {
      await setDoc(doc(db, "bookings", b.id), b);
      await setDoc(doc(db, "slots", b.id), { date: b.date, start: b.start, end: m2t(t2m(b.start) + b.dur), bid: b.id });
    } else LS.set("bookings", LS.get("bookings", []).map((x) => (x.id === b.id ? b : x)));
  },
  async listBookings() {
    return USE_FB ? (await getDocs(collection(db, "bookings"))).docs.map((d) => d.data()) : LS.get("bookings", []);
  },
  async setStatus(id, status) {
    if (USE_FB) {
      await updateDoc(doc(db, "bookings", id), { status });
      if (status === "cancelled") { try { await deleteDoc(doc(db, "slots", id)); } catch (e) {} }
    } else LS.set("bookings", LS.get("bookings", []).map((b) => (b.id === id ? { ...b, status } : b)));
  },
  subscribeBookings(cb) {
    if (USE_FB && db) return onSnapshot(collection(db, "bookings"), (q) => cb(q.docs.map((d) => d.data())));
    return () => {};
  },
  // ── reviews (owner-posted testimonials; public read) ──────────────────
  async listReviews() {
    return USE_FB ? (await getDocs(collection(db, "reviews"))).docs.map((d) => d.data()) : LS.get("reviews", []);
  },
  async saveReview(r) {
    if (USE_FB) await setDoc(doc(db, "reviews", r.id), r);
    else {
      const all = LS.get("reviews", []);
      const i = all.findIndex((x) => x.id === r.id);
      if (i >= 0) all[i] = r; else all.push(r);
      LS.set("reviews", all);
    }
  },
  async delReview(id) {
    if (USE_FB) await deleteDoc(doc(db, "reviews", id));
    else LS.set("reviews", LS.get("reviews", []).filter((x) => x.id !== id));
  },

  // ── client notes (owner-only CRM; keyed by normalized phone) ──────────
  async getClientMeta() {
    if (USE_FB) {
      const out = {};
      (await getDocs(collection(db, "clients"))).docs.forEach((d) => { out[d.id] = d.data(); });
      return out;
    }
    return LS.get("clientmeta", {});
  },
  async saveClientMeta(phone, data) {
    const key = normPhone(phone);
    if (USE_FB) await setDoc(doc(db, "clients", key), data, { merge: true });
    else { const m = LS.get("clientmeta", {}); m[key] = { ...(m[key] || {}), ...data }; LS.set("clientmeta", m); }
  },

  async login(email, pass) { if (USE_FB) await signInWithEmailAndPassword(auth, email, pass); },
  async logout() { if (USE_FB && auth) await signOut(auth); },
  // Firebase persists the session in the browser (local persistence by default),
  // so this re-authenticates returning owners without a fresh login.
  watchAuth(cb) {
    if (USE_FB && auth) return onAuthStateChanged(auth, cb);
    cb(null);
    return () => {};
  },
};
