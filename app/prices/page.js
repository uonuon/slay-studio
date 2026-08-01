import PageShell from "@/components/PageShell";
import { getSeoData, familiesOf, AR_NAMES, fmtEGP } from "@/lib/seo-data";

export const revalidate = 3600;

export const metadata = {
  title: "Braid Prices · أسعار الضفاير",
  description:
    "Live braid prices at Slay Studio, Fifth Settlement, New Cairo — box braids, boho, cornrows and more, in EGP. أسعار الضفاير في التجمع الخامس، محدثة تلقائياً من نظام الحجز.",
  alternates: { canonical: "https://slay-studio.com/prices" },
};

export default async function Page() {
  const data = await getSeoData();
  const fams = familiesOf(data.services);
  return (
    <PageShell data={data}>
      <h1>Prices · <span lang="ar">الأسعار</span></h1>
      <p className="lede" lang="en" dir="ltr">
        These are the live starting prices from our booking system — they update
        automatically whenever the menu changes. الأسعار دي لايف من نظام الحجز
        وبتتحدث أوتوماتيك.
      </p>
      <div className="seo-tablewrap">
        <table className="seo-table">
          <thead>
            <tr>
              <th scope="col" lang="en">Style</th>
              <th scope="col" lang="ar">الستايل</th>
              <th scope="col">From · يبدأ من (EGP)</th>
            </tr>
          </thead>
          <tbody>
            {fams.map((f) => (
              <tr key={f.group}>
                <td lang="en">{f.group}</td>
                <td lang="ar" dir="rtl">{AR_NAMES[f.group] || f.group}</td>
                <td>{fmtEGP(f.min)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="seo-note" lang="en" dir="ltr">
        Final price depends on size and length — pick a style on the{" "}
        <a href="/">booking page</a> to see every option. الأسعار النهائية على حسب
        الحجم والطول.
      </p>
      <div className="gcta">
        <p>Pick your style, see the exact price, and lock your slot online.</p>
        <a className="findus-btn" href="/">Book your braids · احجزي ضفايرك ←</a>
        <p className="seo-note">
          <a href="/faq">Questions? Read the FAQ · عندك سؤال؟</a>
        </p>
      </div>
    </PageShell>
  );
}
