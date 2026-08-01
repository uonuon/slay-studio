import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import Analytics from "@/components/Analytics";

const TITLE = "Slay Studio — Hair Braiding in Cairo · ضفاير التجمع الخامس";
const DESC = "Braids in Cairo: knotless, box braids, boho, cornrows & colored strands at Slay Studio, Fifth Settlement, New Cairo — in-studio or home service. Book online in minutes. ستوديو ضفاير في التجمع الخامس — نوتلس، بوكس برايدز، بوهو وخصل ملونة. احجزي أونلاين.";

export const metadata = {
  metadataBase: new URL("https://slay-studio.com"),
  title: { default: TITLE, template: "%s · Slay Studio" },
  description: DESC,
  applicationName: "Slay Studio",
  keywords: [
    "braids cairo", "hair braiding cairo", "african braids cairo", "braiding salon cairo",
    "knotless braids cairo", "box braids cairo", "boho braids", "cornrows", "protective styles",
    "braids new cairo", "braids fifth settlement", "braids tagamoa", "book braids online",
    "dafayer", "dafayer cairo", "5osal", "khosal", "kids braids cairo", "braids home service cairo",
    "ضفاير", "ضفائر", "ضفاير افريقية", "ضفاير القاهرة", "ضفاير التجمع الخامس", "صالون ضفاير",
    "خصل", "خصلات ملونة", "نوتلس", "بوكس برايدز", "بوهو", "كورن رو",
    "تجمع خامس", "القاهرة الجديدة", "خدمة منزلية ضفاير",
  ],
  manifest: "/site.webmanifest",
  alternates: { canonical: "https://slay-studio.com" },
  robots: {
    index: true,
    follow: true,
    // "large" lets Google show a big image thumbnail next to the result
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Slay Studio",
    title: TITLE,
    description: DESC,
    url: "https://slay-studio.com",
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Slay Studio" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/og-image.png"] },
};

export const viewport = {
  themeColor: "#F2EADF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Structured data (HairSalon + FAQPage with live prices/rating) is rendered
// server-side inside the page by components/SeoSections.js.
export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" translate="no">
      <head>
        {/* App has its own AR/EN toggle — stop browser auto-translate, which
            rewrites text nodes and crashes React (insertBefore NotFoundError). */}
        <meta name="google" content="notranslate" />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
