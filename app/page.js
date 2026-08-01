import App from "@/components/App";
import SeoSections from "@/components/SeoSections";
import { getSeoData } from "@/lib/seo-data";

// Re-fetch services/reviews/settings for the crawlable sections every hour.
export const revalidate = 3600;

export default async function Page() {
  const data = await getSeoData();
  return <App seoFooter={<SeoSections {...data} />} />;
}
