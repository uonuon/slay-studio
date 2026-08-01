// Server-side SEO data. Reads the public Firestore collections over REST so
// crawlers that don't run JavaScript (AI bots, previews) still get real
// content. Any failure falls back to the seeded defaults from config.js.
import { FIREBASE_CONFIG, DEFAULT_SERVICES, DEFAULT_SETTINGS } from "./config";

const BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

function decode(v) {
  if (!v || typeof v !== "object") return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(decode);
  if ("mapValue" in v) return decodeFields(v.mapValue.fields);
  return null;
}
const decodeFields = (fields = {}) =>
  Object.fromEntries(Object.entries(fields).map(([k, val]) => [k, decode(val)]));

async function listColl(coll) {
  const res = await fetch(`${BASE}/${coll}?pageSize=300&key=${FIREBASE_CONFIG.apiKey}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`${coll}: ${res.status}`);
  return ((await res.json()).documents || []).map((d) => decodeFields(d.fields));
}

async function getDocREST(path) {
  const res = await fetch(`${BASE}/${path}?key=${FIREBASE_CONFIG.apiKey}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return decodeFields((await res.json()).fields);
}

export async function getSeoData() {
  const [services, reviews, settings] = await Promise.all([
    listColl("services").then((s) => (s.length ? s : DEFAULT_SERVICES)).catch(() => DEFAULT_SERVICES),
    listColl("reviews").catch(() => []),
    getDocREST("config/settings").then((s) => ({ ...DEFAULT_SETTINGS, ...s })).catch(() => DEFAULT_SETTINGS),
  ]);
  return { services, reviews, settings };
}

// Same family grouping as util.groupKey: explicit group, else "Name · Size".
export function familiesOf(services) {
  const m = new Map();
  for (const s of services) {
    if (!s?.name || !(+s.price > 0)) continue;
    const g = s.group || String(s.name).split(" · ")[0];
    const cur = m.get(g);
    if (!cur) m.set(g, { group: g, lane: s.lane || "", min: +s.price });
    else cur.min = Math.min(cur.min, +s.price);
  }
  return [...m.values()];
}

export const minPrice = (fams, match) => {
  const hits = fams.filter((f) => f.group.toLowerCase().includes(match.toLowerCase()));
  return hits.length ? Math.min(...hits.map((f) => f.min)) : null;
};

// Arabic display names for the seeded style families (fallback: EN name).
export const AR_NAMES = {
  "Knotless braids": "ضفاير نوتلس",
  "Box braids": "بوكس برايدز",
  "Boho rasta": "بوهو راستا",
  "Cornrows": "كورن رو",
  "Dutch braid": "ضفيرة هولندية",
  "Rumi braid": "ضفيرة رومي",
  "Party package": "باقة حفلات للبنات",
  "Bubbles styles": "ضفاير فقاعات (بابلز)",
  "Ponytail": "ذيل حصان مضفر",
  "Jasmine hairstyle": "ضفيرة ياسمين",
};

export const fmtEGP = (n) => (n ? n.toLocaleString("en-US") : null);

// workDays uses JS getDay() indexes: 0 = Sunday … 5 = Friday, 6 = Saturday
export const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_AR = ["الأحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];
export const workDaysOf = (settings) =>
  settings?.workDays?.length ? settings.workDays : [0, 1, 2, 3, 4, 6];

export function hoursLine(settings, ar = false) {
  const open = settings?.openTime || "11:00";
  const close = settings?.closeTime || "21:00";
  const off = [0, 1, 2, 3, 4, 5, 6].filter((d) => !workDaysOf(settings).includes(d));
  if (!off.length) return ar ? `يومياً ${open}–${close}` : `Daily ${open}–${close}`;
  return ar
    ? `${open}–${close} · ${off.map((d) => DAYS_AR[d]).join(" و")} إجازة`
    : `${open}–${close} · ${off.map((d) => DAYS_EN[d]).join(", ")} closed`;
}

// Bilingual FAQ built from live data — rendered on /faq (with FAQPage JSON-LD).
export function buildFaq(fams, settings) {
  const all = fams.map((f) => f.min).filter(Boolean);
  const lowest = all.length ? Math.min(...all) : 1000;
  const examples = [];
  for (const term of ["knotless", "box", "boho", "cornrow"]) {
    const hit = fams.find((f) => f.group.toLowerCase().includes(term));
    if (hit && !examples.includes(hit)) examples.push(hit);
  }
  for (const f of fams) {
    if (examples.length >= 3) break;
    if (!examples.includes(f)) examples.push(f);
  }
  const exEn = examples.slice(0, 3).map((f) => `${f.group.trim()} from ${fmtEGP(f.min)} EGP`).join(", ");
  const exAr = examples.slice(0, 3).map((f) => `${(AR_NAMES[f.group] || f.group).trim()} من ${fmtEGP(f.min)} جنيه`).join("، ");
  const addressEn = settings.addressEn || "Villa 19, Nargis 5, Fifth Settlement";
  const addressAr = settings.address || "فيلا ١٩ ، النرجس ٥ ، التجمع الخامس";

  return [
    {
      lang: "en",
      q: "How much do braids cost in Cairo?",
      a: `At Slay Studio prices start from ${fmtEGP(lowest)} EGP depending on the style and size — for example ${exEn}. The full live price list is on slay-studio.com, where you can book online in minutes.`,
    },
    {
      lang: "en",
      q: "Where can I get knotless or box braids in New Cairo?",
      a: `Slay Studio is a hair braiding studio at ${addressEn}, Fifth Settlement (El Tagamoa El Khames), New Cairo. Hours: ${hoursLine(settings)}. Pick a style and reserve your appointment online at slay-studio.com or on WhatsApp.`,
    },
    {
      lang: "en",
      q: "Do you offer home service for braids in Cairo?",
      a: "Yes — Slay Studio offers braiding home service across Cairo and New Cairo (Fifth Settlement, Rehab, Madinaty and nearby areas). Choose “Home service” when booking online and we come to you.",
    },
    {
      lang: "en",
      q: "Do you braid kids' hair or do birthday parties?",
      a: "Yes — our Little Slays packages cover kids' braids and birthday parties for groups of 10 to 30 girls, in the studio or at your place.",
    },
    {
      lang: "ar",
      q: "بكام الضفاير في القاهرة؟",
      a: `في سلاي ستوديو الأسعار بتبدأ من ${fmtEGP(lowest)} جنيه على حسب الستايل والحجم — مثلاً ${exAr}. قايمة الأسعار كاملة على slay-studio.com وتقدري تحجزي أونلاين في دقايق.`,
    },
    {
      lang: "ar",
      q: "فين مكان ستوديو ضفاير في التجمع الخامس؟",
      a: `عنواننا: ${addressAr} — القاهرة الجديدة. ${hoursLine(settings, true)}. اختاري الستايل واحجزي معادك أونلاين أو كلمينا واتساب.`,
    },
    {
      lang: "ar",
      q: "بتعملوا خصل ملونة مع الضفاير؟",
      a: "أيوه — بنركب خصل (خصلات) صناعية وألوان مع الضفاير على حسب الستايل، وبنساعدك تختاري اللون المناسب يوم المعاد.",
    },
    {
      lang: "ar",
      q: "هل في خدمة منزلية؟",
      a: "أيوه — في خدمة منزلية في القاهرة والقاهرة الجديدة (التجمع الخامس، الرحاب، مدينتي وما حولهم). اختاري «خدمة منزلية» وانتي بتحجزي.",
    },
  ];
}
