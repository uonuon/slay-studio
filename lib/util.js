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

// available start times for a service of `durMin` on `dateStr`, given booked intervals
export function availableStarts(dateStr, durMin, settings, intervals) {
  const wd = new Date(dateStr + "T00:00:00").getDay();
  if (!settings.workDays.includes(wd)) return [];
  const open = t2m(settings.openTime), close = t2m(settings.closeTime), step = settings.slotStep;
  const out = [];
  const isToday = dateStr === todayStr();
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  for (let s = open; s + durMin <= close; s += step) {
    const e = s + durMin;
    if (isToday && s < nowMin + 30) continue;
    if (!intervals.some((iv) => s < iv.end && e > iv.start)) out.push(m2t(s));
  }
  return out;
}

export function firstWorkingDay(settings) {
  const d = new Date();
  for (let i = 0; i < 28; i++) {
    if (settings.workDays.includes(d.getDay())) return dstr(d);
    d.setDate(d.getDate() + 1);
  }
  return todayStr();
}

// group tiered services ("Knotless braids · Large") into one family card
export function families(services) {
  const m = {}, order = [];
  services.forEach((s) => {
    const parts = s.name.split(" · ");
    const fam = parts[0], size = parts[1] || null;
    if (!m[fam]) { m[fam] = { name: fam, lane: s.lane, opts: [] }; order.push(fam); }
    m[fam].opts.push({ ...s, size });
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
