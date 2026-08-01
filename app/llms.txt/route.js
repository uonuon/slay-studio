// /llms.txt — a plain-text summary of the business for AI assistants and
// crawlers. Built from live Firestore data (same source as the site) so
// prices and hours never drift.
import { getSeoData, familiesOf } from "@/lib/seo-data";
import { SOCIALS } from "@/lib/config";

export const revalidate = 3600;

export async function GET() {
  const { services, reviews, settings } = await getSeoData();
  const fams = familiesOf(services);
  const rated = reviews.filter(Boolean);
  const avg = rated.length
    ? (rated.reduce((s, r) => s + (r.rating || 5), 0) / rated.length).toFixed(1)
    : null;

  const lines = [
    "# Slay Studio — Hair Braiding in Cairo, Egypt (ستوديو ضفاير في القاهرة)",
    "",
    "> Hair braiding studio in Fifth Settlement (El Tagamoa El Khames), New Cairo, Egypt.",
    "> Knotless braids, box braids, boho braids, cornrows, colored strands (5osal/خصل),",
    "> kids' braids and party packages — in-studio or home service across Cairo.",
    "> Egyptians also search for us as: dafayer / ضفاير / ضفاير التجمع الخامس.",
    "",
    "- Website & online booking: https://slay-studio.com",
    `- Address: ${settings.addressEn || "Villa 19, Nargis 5, Fifth Settlement"}, New Cairo, Egypt (${settings.address || ""})`.trim(),
    `- Map: ${settings.mapsUrl || ""}`,
    `- WhatsApp: +${settings.whatsapp || "201555842544"}`,
    `- Hours: ${settings.openTime || "11:00"}–${settings.closeTime || "21:00"}${(settings.workDays || []).includes(5) ? "" : ", closed Friday"}`,
    `- Instagram: ${SOCIALS.instagram}`,
    `- TikTok: ${SOCIALS.tiktok}`,
    "- Languages: Arabic (default), English",
    "- Payment: cash, InstaPay; online booking holds your slot with a deposit",
    ...(avg ? [`- Client rating: ${avg}/5 from ${rated.length} reviews on the site, plus reviews on Google Maps`] : []),
    "",
    "## Services & starting prices (EGP — live menu at https://slay-studio.com)",
    "",
    ...fams.map((f) => `- ${f.group}: from ${f.min.toLocaleString("en-US")} EGP`),
    "",
    "## Good to know",
    "",
    "- Home service available across Cairo & New Cairo (Fifth Settlement, Rehab, Madinaty).",
    "- Little Slays: kids' braids and birthday party packages (10–30 girls).",
    "- Book online in minutes: pick a style, size, date and time at https://slay-studio.com.",
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
