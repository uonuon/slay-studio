import PageShell from "@/components/PageShell";
import { getSeoData, familiesOf, buildFaq } from "@/lib/seo-data";

export const revalidate = 3600;

export const metadata = {
  title: "FAQ — Braids in Cairo · أسئلة شايعة",
  description:
    "How much do braids cost in Cairo? Where is Slay Studio? Home service, colored strands (خصل), kids' braids — answers in English and Arabic. بكام الضفاير؟ فين المكان؟ كل الإجابات هنا.",
  alternates: { canonical: "https://slay-studio.com/faq" },
};

export default async function Page() {
  const data = await getSeoData();
  const faq = buildFaq(familiesOf(data.services), data.settings);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <PageShell data={data}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <h1>FAQ · <span lang="ar">أسئلة شايعة</span></h1>
      <div className="faqlist">
        {faq.map((f) => (
          <details key={f.q} lang={f.lang} dir={f.lang === "ar" ? "rtl" : "ltr"}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <div className="gcta">
        <p>Didn't find your answer? · مالقتيش إجابتك؟</p>
        <a
          className="findus-btn"
          href={`https://wa.me/${data.settings.whatsapp || "201555842544"}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp us · كلمينا واتساب
        </a>
      </div>
    </PageShell>
  );
}
