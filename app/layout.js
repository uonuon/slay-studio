import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import Analytics from "@/components/Analytics";
import { SOCIALS } from "@/lib/config";

const TITLE = "Slay Studio — Braids in Fifth Settlement, New Cairo";
const DESC = "Book braids, knotless, box braids & boho in Fifth Settlement, New Cairo. Pick your style and reserve online in minutes. احجزي ضفائرك أونلاين في التجمّع الخامس.";

export const metadata = {
  metadataBase: new URL("https://slay-studio.com"),
  title: { default: TITLE, template: "%s · Slay Studio" },
  description: DESC,
  applicationName: "Slay Studio",
  keywords: [
    "braids", "knotless braids", "box braids", "boho braids", "cornrows",
    "hair salon", "fifth settlement", "new cairo", "egypt", "book braids online",
    "ضفائر", "تجمع خامس", "القاهرة الجديدة", "صالون شعر", "نوتلس", "بوكس برايدز",
  ],
  manifest: "/site.webmanifest",
  alternates: { canonical: "https://slay-studio.com" },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
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
  themeColor: "#0b0909",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: "Slay Studio",
  image: "https://slay-studio.com/og-image.png",
  url: "https://slay-studio.com",
  telephone: "+201555842544",
  priceRange: "$$",
  currenciesAccepted: "EGP",
  description: DESC,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Fifth Settlement, New Cairo",
    addressRegion: "Cairo",
    addressCountry: "EG",
  },
  areaServed: "New Cairo",
  sameAs: [SOCIALS.instagram, SOCIALS.tiktok],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "11:00",
      closes: "21:00",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" translate="no">
      <head>
        {/* App has its own AR/EN toggle — stop browser auto-translate, which
            rewrites text nodes and crashes React (insertBefore NotFoundError). */}
        <meta name="google" content="notranslate" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
