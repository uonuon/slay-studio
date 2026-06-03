// Firebase + studio configuration

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCe7TpKgHyrBq5yl6yZH5P52XZfJ2oJShk",
  authDomain: "slay-studio.firebaseapp.com",
  projectId: "slay-studio",
  storageBucket: "slay-studio.firebasestorage.app",
  messagingSenderId: "594901633960",
  appId: "1:594901633960:web:49960fd1ab1aa82beeab9d",
  measurementId: "G-PET8QC12TM",
};

export const ADMIN_EMAIL = "minaf65@gmail.com";
export const DEMO_ADMIN_PASS = "slay2026";

export const DEFAULT_SERVICES = [
  { id: "kn-l", lane: "Slay Studio", name: "Knotless braids · Large", price: 1800, dur: 180 },
  { id: "kn-m", lane: "Slay Studio", name: "Knotless braids · Medium", price: 2000, dur: 210 },
  { id: "kn-s", lane: "Slay Studio", name: "Knotless braids · Small", price: 2200, dur: 240 },
  { id: "bx-l", lane: "Slay Studio", name: "Box braids · Large", price: 1600, dur: 150 },
  { id: "bx-m", lane: "Slay Studio", name: "Box braids · Medium", price: 1800, dur: 180 },
  { id: "bx-s", lane: "Slay Studio", name: "Box braids · Small", price: 2000, dur: 210 },
  { id: "bo-l", lane: "Slay Studio", name: "Boho rasta · Large", price: 2200, dur: 180 },
  { id: "bo-m", lane: "Slay Studio", name: "Boho rasta · Medium", price: 2500, dur: 210 },
  { id: "bo-s", lane: "Slay Studio", name: "Boho rasta · Small", price: 2700, dur: 240 },
  { id: "cr", lane: "Signature", name: "Cornrows", price: 1100, dur: 90 },
  { id: "du", lane: "Signature", name: "Dutch braid", price: 1000, dur: 60 },
  { id: "ru", lane: "Signature", name: "Rumi braid", price: 1000, dur: 60 },
  { id: "p10", lane: "Little Slays", name: "Party package · 10 girls", price: 2700, dur: 120 },
  { id: "p20", lane: "Little Slays", name: "Party package · 20 girls", price: 3700, dur: 180 },
  { id: "p30", lane: "Little Slays", name: "Party package · 30 girls", price: 4700, dur: 240 },
];

export const DEFAULT_SETTINGS = {
  workDays: [0, 1, 2, 3, 4, 6], // Sun..Sat, off Friday(5)
  openTime: "11:00",
  closeTime: "21:00",
  slotStep: 30,
  depositPct: 50,
  whatsapp: "201555842544",
  instapay: "01025444316",
  rent: 15000,
  rebookWeeks: 6,
};

export const LANE_META = {
  "Slay Studio": { emoji: "💇🏽‍♀️", grad: "linear-gradient(135deg,#E8A6BC,#cfa2e0)", label: "Braids" },
  "Little Slays": { emoji: "🎀", grad: "linear-gradient(135deg,#cfa2e0,#a7c7e8)", label: "Little Slays · parties" },
  "Signature": { emoji: "✨", grad: "linear-gradient(135deg,#e8c9a6,#E8A6BC)", label: "Signature" },
};

export const LANES = ["Slay Studio", "Little Slays", "Signature"];

// ── Analytics & ad pixels ────────────────────────────────────────────────
// Paste your IDs below (they are public client-side IDs, safe to commit).
// You can also set them as NEXT_PUBLIC_* env vars in Vercel instead.
// Each tracker stays completely dormant until its ID is filled in.
export const ANALYTICS = {
  ga4: process.env.NEXT_PUBLIC_GA4 || "",                 // Google Analytics 4, e.g. "G-XXXXXXXXXX"
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL || "",    // Meta/Instagram Pixel, e.g. "123456789012345"
  tiktokPixel: process.env.NEXT_PUBLIC_TIKTOK_PIXEL || "",// TikTok Pixel, e.g. "CXXXXXXXXXXXXXXXXXXX"
};

// Public links used for SEO structured data
export const SOCIALS = {
  instagram: "https://instagram.com/braids.bymarmora",
  tiktok: "https://tiktok.com/@braids.bymarmora",
};
