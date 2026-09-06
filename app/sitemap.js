export default function sitemap() {
  const now = new Date();
  const page = (path, priority) => ({
    url: `https://slay-studio.com${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  });
  return [
    page("", 1),
    page("/clip-ins", 0.9),
    page("/braids-cairo", 0.8),
    page("/dafayer-cairo", 0.8),
    page("/prices", 0.7),
    page("/faq", 0.6),
    page("/about", 0.5),
  ];
}
