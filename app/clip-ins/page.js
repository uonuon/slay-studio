// /clip-ins — ready-made clip-in braids shop (ad landing page).
// Static shell with SEO metadata; products load client-side from settings.
import ClipShop from "@/components/ClipShop";

const TITLE = "Clip-in Braids in Cairo — ready-made braids · ضفاير كليبس جاهزة";
const DESC =
  "Ready-made clip-in braids by Slay Studio, New Cairo: one big braid, twin braids, Rumi braid & more. Pick your style, color and accessories, then order on WhatsApp — delivery across Cairo. ضفاير كليبس جاهزة تتركب في ثواني — اختاري الشكل واللون واطلبي على واتساب.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "https://slay-studio.com/clip-ins" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "https://slay-studio.com/clip-ins",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Slay Studio clip-in braids" }],
  },
};

export default function ClipInsPage() {
  return <ClipShop />;
}
