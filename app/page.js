import App from "@/components/App";
import SiteFooter from "@/components/SiteFooter";
import { getSeoData } from "@/lib/seo-data";

// Re-fetch services/reviews/settings for the crawlable footer every hour.
export const revalidate = 3600;

export default async function Page() {
  const data = await getSeoData();
  return <App seoFooter={<SiteFooter {...data} />} />;
}
