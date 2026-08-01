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
