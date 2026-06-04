// Pure helpers + availability logic (framework-free, unit-testable)

export const pad = (n) => String(n).padStart(2, "0");
export const t2m = (t) => { const [a, b] = t.split(":").map(Number); return a * 60 + b; };
export const m2t = (x) => pad(Math.floor(x / 60)) + ":" + pad(x % 60);
export const dstr = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
export const todayStr = () => dstr(new Date());
export const fmtDate = (s) =>
  new Date(s + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
export const hrs = (m) => Math.round((m / 60) * 10) / 10;
export const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function normPhone(p) {
  let s = (p || "").replace(/[^0-9]/g, "");
  if (s.startsWith("00")) s = s.slice(2);
  if (s.startsWith("20")) return s;
  if (s.startsWith("0")) return "20" + s.slice(1);
  if (s.length === 10) return "20" + s;
  return s;
}
export const waLink = (phone, msg) => "https://wa.me/" + normPhone(phone) + "?text=" + encodeURIComponent(msg);

// time-off blocks (owner-set) overlapping a date, as minute intervals
export function blockIntervals(settings, dateStr) {
  const open = t2m(settings.openTime), close = t2m(settings.closeTime);
  return (settings.blocks || [])
    .filter((b) => b.date === dateStr)
    .map((b) => (b.allDay ? { start: open, end: close } : { start: t2m(b.start), end: t2m(b.end) }));
}
export const isDayFullyBlocked = (settings, dateStr) =>
  (settings.blocks || []).some((b) => b.date === dateStr && b.allDay);

// available start times for a service of `durMin` on `dateStr`, given booked intervals
export function availableStarts(dateStr, durMin, settings, intervals) {
  const wd = new Date(dateStr + "T00:00:00").getDay();
  if (!settings.workDays.includes(wd)) return [];
  const open = t2m(settings.openTime), close = t2m(settings.closeTime), step = settings.slotStep;
  const blocked = intervals.concat(blockIntervals(settings, dateStr));
  const out = [];
  const isToday = dateStr === todayStr();
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  for (let s = open; s + durMin <= close; s += step) {
    const e = s + durMin;
    if (isToday && s < nowMin + 30) continue;
    if (!blocked.some((iv) => s < iv.end && e > iv.start)) out.push(m2t(s));
  }
  return out;
}

export function firstWorkingDay(settings) {
  const d = new Date();
  for (let i = 0; i < 28; i++) {
    if (settings.workDays.includes(d.getDay()) && !isDayFullyBlocked(settings, dstr(d))) return dstr(d);
    d.setDate(d.getDate() + 1);
  }
  return todayStr();
}

// Category key for a service: explicit `group` field (new model) or, for
// older data, the part before the " · " in the name (backward compatible).
export const groupKey = (s) => s.group || s.name.split(" · ")[0];
// Short variant label shown on the chips: the full custom name when a group
// is set, otherwise the size that followed the " · ".
export const variantLabel = (s) => (s.group ? s.name : (s.name.split(" · ")[1] || s.name));

// Group services into category cards (e.g. one "Boho" card with its variants).
export function groupStyles(services) {
  const m = {}, order = [];
  services.forEach((s) => {
    const g = groupKey(s);
    if (!m[g]) { m[g] = { group: g, lane: s.lane, opts: [] }; order.push(g); }
    m[g].opts.push({ ...s, variant: variantLabel(s) });
  });
  return order.map((k) => m[k]);
}

// lightweight DOM toast (client only)
export function toast(msg) {
  if (typeof document === "undefined") return;
  const e = document.createElement("div");
  e.className = "toast";
  e.textContent = msg;
  document.body.appendChild(e);
  setTimeout(() => e.remove(), 1900);
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Resize an uploaded image in-browser to a compact JPEG data URL.
// Keeps it well under Firestore's 1MB document limit so we can store the
// photo on the service doc itself (no Firebase Storage / billing needed).
export function fileToDataURL(file, max = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") return reject(new Error("no dom"));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width: w, height: h } = img;
      if (w > h && w > max) { h = Math.round((h * max) / w); w = max; }
      else if (h >= w && h > max) { w = Math.round((w * max) / h); h = max; }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      let q = quality;
      let out = c.toDataURL("image/jpeg", q);
      while (out.length > 920000 && q > 0.4) { q -= 0.12; out = c.toDataURL("image/jpeg", q); }
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}
