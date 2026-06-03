import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
