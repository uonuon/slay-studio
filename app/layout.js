import "./globals.css";
import { LangProvider } from "@/lib/i18n";

export const metadata = {
  metadataBase: new URL("https://slay-studio.com"),
  title: "Slay Studio — book your braids",
  description: "Braids in Fifth Settlement. Pick your style and book online.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    title: "Slay Studio — book your braids",
    description: "Braids in Fifth Settlement. Pick your style and book online.",
    url: "https://slay-studio.com",
    images: ["/og-image.png"],
  },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
};

export const viewport = {
  themeColor: "#0b0909",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
