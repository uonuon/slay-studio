import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_CONFIG } from "./config";

// DEMO mode when ?demo is in the URL; LIVE everywhere else (e.g. on the real domain).
const forceDemo =
  typeof window !== "undefined" && window.location.search.indexOf("demo") > -1;

export const USE_FB = !!FIREBASE_CONFIG.apiKey && !forceDemo;

let db = null;
let auth = null;

if (USE_FB && typeof window !== "undefined") {
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };
