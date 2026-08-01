export default function sitemap() {
  const now = new Date();
  return [
    { url: "https://slay-studio.com", lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: "https://slay-studio.com/braids-cairo", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://slay-studio.com/dafayer-cairo", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
}
