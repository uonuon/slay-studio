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
  leadTimeMins: 90, // minimum notice: clients can't book a slot starting within this many minutes from now
  depositPct: 25,
  whatsapp: "201555842544",
  instapay: "01025444316",
  instapayUrl: "https://ipn.eg/S/slaystudio/instapay/4GqeV5", // tap-to-pay InstaPay link (username slaystudio)
  instapayQr: "/instapay-qr.jpg",                              // scannable InstaPay QR (in /public)
  rent: 15000,
  rebookWeeks: 6,
  blocks: [],                                            // time off: [{id,date,allDay,start,end,note}]
  laneOrder: ["Slay Studio", "Little Slays", "Signature"], // big-category order on the site
  groupOrder: {},                                        // { lane: [group names in display order] }
  colorSets: [],                                         // [{id,name,colors:[{id,name,hex}]}]
  colorsEnabled: false,                                  // master switch for the colour feature (off until set up)
  promos: [{ id: "promo-local", code: "LOCAL", pct: 25, active: true }], // % discount codes [{id,code,pct,active}]
  msgTemplates: {},                                      // owner edits to canned messages: { [templateId]: { ar, en } }
  address: "فيلا ١٩ ، النرجس ٥ ، التجمع الخامس",          // studio address (Arabic) shown on the site
  addressEn: "Villa 19, Nargis 5, Fifth Settlement",     // studio address (English)
  mapsUrl: "https://www.google.com/maps?q=30.011137008666992,31.46440315246582&z=17&hl=en", // → "Open in Maps"
  // Clip-in braids shop (/clip-ins): ready-made braids ordered via WhatsApp.
  // Owner edits everything in the dashboard's Clip-ins tab; a price of 0
  // shows "Price on WhatsApp" instead of a number.
  clipins: {
    enabled: true,
    paletteV: 2, // bump when the seeded color palette changes (see store.getSettings)
    types: [
      { id: "cl-big", name: "One big braid", nameAr: "ضفيرة واحدة كبيرة", price: 0, imgs: [] },
      { id: "cl-twin", name: "Two identical braids", nameAr: "ضفيرتين متطابقتين", price: 0, imgs: [] },
      { id: "cl-mix", name: "One big + one small", nameAr: "ضفيرة كبيرة + صغيرة", price: 0, imgs: [] },
      { id: "cl-rumi", name: "Rumi braid", nameAr: "ضفيرة رومي", price: 0, imgs: [] },
    ],
    // Colors are the standard X-Pression shades the studio stocks — shown as
    // named swatches (hex, or hex+hex2(+hex3) rendered as an ombré gradient).
    // No photos needed; a customer wanting something else picks the built-in
    // "any other color — on WhatsApp" option in the shop.
    colors: [
      { id: "cc-black", name: "Black", nameAr: "أسود", hex: "#141414", img: "", price: 0 },
      { id: "cc-dbrown", name: "Dark brown", nameAr: "بني غامق", hex: "#3A2A20", img: "", price: 0 },
      { id: "cc-brown", name: "Brown", nameAr: "بني", hex: "#6B4A33", img: "", price: 0 },
      { id: "cc-caramel", name: "Caramel", nameAr: "كراميل", hex: "#9C6B3F", img: "", price: 0 },
      { id: "cc-blonde", name: "Blonde", nameAr: "أشقر", hex: "#E9D5A4", img: "", price: 0 },
      { id: "cc-white", name: "White", nameAr: "أبيض", hex: "#F4F2EC", img: "", price: 0 },
      { id: "cc-silver", name: "Silver grey", nameAr: "رمادي فضي", hex: "#C7C8CE", img: "", price: 0 },
      { id: "cc-bpink", name: "Baby pink", nameAr: "بينك فاتح", hex: "#F4BBD0", img: "", price: 0 },
      { id: "cc-fuchsia", name: "Hot pink", nameAr: "فوشيا", hex: "#E23A8E", img: "", price: 0 },
      { id: "cc-red", name: "Red", nameAr: "أحمر", hex: "#B22030", img: "", price: 0 },
      { id: "cc-burg", name: "Burgundy", nameAr: "عنابي", hex: "#5C2028", img: "", price: 0 },
      { id: "cc-purple", name: "Purple", nameAr: "بنفسجي", hex: "#5B2E91", img: "", price: 0 },
      { id: "cc-lilac", name: "Lilac", nameAr: "ليلكي", hex: "#C6ACE4", img: "", price: 0 },
      { id: "cc-bblue", name: "Baby blue", nameAr: "لبني", hex: "#ABC9E9", img: "", price: 0 },
      { id: "cc-blue", name: "Royal blue", nameAr: "أزرق ملكي", hex: "#1F4FA3", img: "", price: 0 },
      { id: "cc-turq", name: "Turquoise", nameAr: "تركواز", hex: "#2FA8A2", img: "", price: 0 },
      { id: "cc-mint", name: "Mint", nameAr: "منت", hex: "#BDE7D0", img: "", price: 0 },
      { id: "cc-emerald", name: "Emerald", nameAr: "أخضر زمردي", hex: "#187055", img: "", price: 0 },
      { id: "co-emerald", name: "Emerald ombré", nameAr: "أومبريه زمردي", hex: "#141414", hex2: "#187055", hex3: "#C7C8CE", img: "", price: 0 },
      { id: "co-silver", name: "Silver ombré", nameAr: "أومبريه فضي", hex: "#141414", hex2: "#8E8F96", hex3: "#C7C8CE", img: "", price: 0 },
      { id: "co-pink", name: "Pink ombré", nameAr: "أومبريه بينك", hex: "#141414", hex2: "#E87BB1", img: "", price: 0 },
      { id: "co-purple", name: "Purple ombré", nameAr: "أومبريه بنفسجي", hex: "#141414", hex2: "#6E3AA7", img: "", price: 0 },
      { id: "co-blue", name: "Blue ombré", nameAr: "أومبريه أزرق", hex: "#141414", hex2: "#2456A8", img: "", price: 0 },
      { id: "co-burg", name: "Burgundy ombré", nameAr: "أومبريه عنابي", hex: "#141414", hex2: "#7A2833", img: "", price: 0 },
      { id: "co-caramel", name: "Caramel ombré", nameAr: "أومبريه كراميل", hex: "#141414", hex2: "#9C6B3F", hex3: "#E9D5A4", img: "", price: 0 },
    ],
    extras: [
      { id: "cx-gold", name: "Gold chain", nameAr: "سلسلة دهبي", price: 0, img: "" },
      { id: "cx-silver", name: "Silver chain", nameAr: "سلسلة فضي", price: 0, img: "" },
      { id: "cx-beads", name: "Beads", nameAr: "خرز", price: 0, img: "" },
      { id: "cx-rings", name: "Braid rings", nameAr: "حلقات ضفاير", price: 0, img: "" },
    ],
  },
};

export const LANE_META = {
  "Slay Studio": { emoji: "💇", grad: "linear-gradient(135deg,#E8A6BC,#cfa2e0)", label: "Braids" },
  "Little Slays": { emoji: "🎀", grad: "linear-gradient(135deg,#cfa2e0,#a7c7e8)", label: "Little Slays · parties" },
  "Signature": { emoji: "✨", grad: "linear-gradient(135deg,#e8c9a6,#E8A6BC)", label: "Signature" },
};

export const LANES = ["Slay Studio", "Little Slays", "Signature"];

// ── Analytics & ad pixels ────────────────────────────────────────────────
// Paste your IDs below (they are public client-side IDs, safe to commit).
// You can also set them as NEXT_PUBLIC_* env vars in Vercel instead.
// Each tracker stays completely dormant until its ID is filled in.
export const ANALYTICS = {
  ga4: process.env.NEXT_PUBLIC_GA4 || "G-PET8QC12TM",     // Google Analytics 4
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL || "1736736593834727", // Meta/Instagram Pixel
  tiktokPixel: process.env.NEXT_PUBLIC_TIKTOK_PIXEL || "D8GMT03C77U2SBB66P40", // TikTok Pixel
};

// Cloudinary image hosting (free). Paste your cloud name + an *unsigned*
// upload preset. Until both are set, uploads fall back to the in-DB method.
export const CLOUDINARY = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD || "dkmixdugs",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "slay_unsigned",
};

// Public links used for SEO structured data
export const SOCIALS = {
  instagram: "https://instagram.com/slaystudioforbraids",
  tiktok: "https://tiktok.com/@braids.bymarmora", // update if the TikTok handle is renamed too
};
