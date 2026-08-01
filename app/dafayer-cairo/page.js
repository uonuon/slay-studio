// /dafayer-cairo — the Arabic twin of /braids-cairo, targeting the unowned
// Arabic SERP: "ضفاير في القاهرة", "اسعار الضفاير في مصر", "صالون ضفاير".
// The Franco slug "dafayer" is itself a common search transliteration.
import { getSeoData, familiesOf, AR_NAMES, fmtEGP } from "@/lib/seo-data";

export const revalidate = 3600;

const SITE = "https://slay-studio.com";

export const metadata = {
  title: "ضفاير في القاهرة — الأنواع والأسعار الحقيقية وإزاي تحجزي (دليل ٢٠٢٦)",
  description:
    "أسعار الضفاير في مصر ٢٠٢٦ بشكل حقيقي ومباشر: بوكس برايدز، بوهو، كورن رو وخصل ملونة — الأسعار لايف من نظام حجز فعلي، مدة كل ستايل، نصايح ضفاير صحية، خدمة منزلية، وحجز أونلاين في التجمع الخامس.",
  alternates: {
    canonical: `${SITE}/dafayer-cairo`,
    languages: { en: `${SITE}/braids-cairo`, ar: `${SITE}/dafayer-cairo` },
  },
  openGraph: {
    title: "ضفاير في القاهرة — الأنواع والأسعار الحقيقية (دليل ٢٠٢٦)",
    description: "أسعار الضفاير لايف، دليل الستايلات، ونصايح الضفاير الصحية.",
    url: `${SITE}/dafayer-cairo`,
    type: "article",
  },
};

const STYLE_NOTES = [
  ["بوكس برايدز", "الكلاسيك: الشعر بيتقسم مربعات منظمة وبيتضفر من الجذور للأطراف بخصل صناعية. من ساعتين لأربع ساعات على حسب الحجم، وبتقعد ٤–٦ أسابيع بالعناية."],
  ["بوهو / راستا كيرلي", "ضفاير مع خصل كيرلي متسايبة — اللوك الناعم اللي مكسّر الدنيا آخر صيفين. من ٣ لـ ٥ ساعات."],
  ["كورن رو", "ضفاير ملتصقة بفروة الراس في خطوط مستقيمة أو منحنية. أسرع ستايل (ساعة–ساعتين) وأخف على الشعر الخفيف."],
  ["ضفاير فقاعات (بابلز)", "ذيل مقسم «فقاعات» — شيك وسريع ومناسب جداً للمناسبات وللبنات الصغيرين."],
  ["ذيل حصان مضفر", "ذيل عالي مضفر — أسرع لوك للمناسبة."],
  ["ضفاير أطفال وحفلات", "شد أخف ووقت أقصر لشعر البنات الصغيرين، وباقات بتضفّر بنات عيد الميلاد كلهم."],
];

export default async function Page() {
  const { services, reviews, settings } = await getSeoData();
  const fams = familiesOf(services);
  const all = fams.map((f) => f.min).filter(Boolean);
  const lowest = all.length ? Math.min(...all) : 700;
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : null;

  const faq = [
    ["بكام الضفاير في مصر في ٢٠٢٦؟", `واقعياً من ${fmtEGP(lowest)} جنيه للستايلات البسيطة لحد ٣٠٠٠+ جنيه للبوهو الطويل بالحجم الصغير. الجدول اللي فوق لايف من نظام الحجز بتاعنا — أغلب صوالين الضفاير في مصر مش بتعلن أسعار، فدايماً اتأكدي من السعر النهائي شامل الخصل قبل ما تحجزي في أي حتة.`],
    ["الضفاير بتقعد قد إيه في حر القاهرة؟", "٤–٦ أسابيع للبوكس والبوهو لو بتناميلي بإيشارب أو بونيه ستان، وبتزيتي فروة الراس ٢–٣ مرات في الأسبوع، وبتغسلي بلطف كل أسبوع أو اتنين. الكورن رو والبابلز أقصر (أسبوع–٣ أسابيع)."],
    ["محتاجة أجيب خصل معايا؟", "في سلاي ستوديو السعر شامل الخصل العادي، وتقدري تضيفي خصل ملونة وانتي بتحجزي. في أماكن تانية اسألي دايماً — السعر «الرخيص» ساعات بيطلع من غير الشعر."],
    ["أعوم وأغسل شعري عادي بالضفاير؟", "أيوه — اشطفي بمية حلوة بعد البحر أو البيسين، شامبو مخفف على الفروة، واعصري من غير دعك، والضفاير هتفضل شكلها زي ما هو."],
  ];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "ضفاير في القاهرة — الأنواع والأسعار الحقيقية وإزاي تحجزي (دليل ٢٠٢٦)",
    inLanguage: "ar",
    datePublished: "2026-08-01",
    dateModified: new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "Slay Studio", url: SITE },
    publisher: { "@type": "Organization", name: "Slay Studio", url: SITE },
    mainEntityOfPage: `${SITE}/dafayer-cairo`,
    image: `${SITE}/hero-braids.jpg`,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <div className="site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="shell guide" lang="ar" dir="rtl">
        <header className="gnav">
          <a className="gnav-brand" href="/"><img src="/logo-s.png" alt="لوجو سلاي ستوديو" />سلاي ستوديو</a>
          <a className="findus-btn" href="/">احجزي ضفايرك أونلاين ←</a>
        </header>

        <h1>ضفاير في القاهرة: الأنواع والأسعار الحقيقية وإزاي تحجزي <span className="gyear">دليل ٢٠٢٦</span></h1>
        <p className="lede">
          عشان تعملي ضفاير في القاهرة، الطبيعي إنك تبعتي رسايل لخمس صفحات انستجرام وتستني حد
          يرد عليكي بسعر. الدليل ده مختلف: الأسعار اللي تحت <strong>لايف من نظام حجز حقيقي</strong>
          (بتتحدث أوتوماتيك لما المنيو تتغير)، ومعاها إيه اللي بيحصل في كل ستايل، وإيه اللي
          لازم تتأكدي منه قبل ما تقعدي على كرسي <em>أي حد</em>.
        </p>

        <h2>أسعار الضفاير في القاهرة (لايف)</h2>
        <div className="seo-tablewrap">
          <table className="seo-table">
            <thead>
              <tr><th scope="col">الستايل</th><th scope="col" lang="en" dir="ltr">In English</th><th scope="col">يبدأ من (جنيه)</th></tr>
            </thead>
            <tbody>
              {fams.map((f) => (
                <tr key={f.group}>
                  <td>{AR_NAMES[f.group] || f.group}</td>
                  <td lang="en" dir="ltr">{f.group}</td>
                  <td>{fmtEGP(f.min)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="seo-note">
          دي منيو سلاي ستوديو الفعلية (التجمع الخامس، القاهرة الجديدة). السعر بيزيد كل ما الضفيرة
          تصغر والطول يزيد. في باقي القاهرة توقعي نفس المستوى أو أعلى — وبما إن أغلب الصوالين
          مش بتعلن أسعار، اتأكدي دايماً من الإجمالي <em>شامل الخصل</em> قبل الحجز.
        </p>

        <h2>الستايلات بالتفصيل</h2>
        <ul className="glist">
          {STYLE_NOTES.map(([name, note]) => (
            <li key={name}><strong>{name}.</strong> {note}</li>
          ))}
        </ul>

        <h2>ضفاير صحية: اتأكدي من دي قبل ما تحجزي في أي مكان</h2>
        <ul className="glist">
          <li><strong>الشد.</strong> الضفاير المفروض تبقى مظبوطة، مش موجعة. وجع شديد أو صداع أو حبوب صغيرة عند خط الشعر معناها شد زيادة — وده اللي بيروح بحواف الشعر (البيبي هير). الضفر اللطيف من غير شد هو الفلسفة اللي اتبنى عليها سلاي ستوديو أصلاً.</li>
          <li><strong>تقسيمات نضيفة.</strong> التقسيم المظبوط مش شكل وبس — التقسيم الملخبط بيشد بشكل غير متساوي وبيقصّر عمر الستايل.</li>
          <li><strong>سعر واضح من الأول.</strong> الستوديو المحترم بيقولك السعر كامل قبل ما تلتزمي، مش بعد أربع رسايل.</li>
          <li><strong>إرشادات العناية.</strong> المفروض تخرجي عارفة تنامي وتغسلي وتزيتي إزاي — مش بس شكلك حلو ليوم واحد.</li>
        </ul>

        <h2>فين تتضفري في القاهرة؟</h2>
        <p>
          أغلب سوق الضفاير متركز في المعادي والزمالك ومدينة نصر، وكله تقريباً بيحجز برسايل
          انستجرام. في شرق القاهرة، <strong>سلاي ستوديو في التجمع الخامس</strong> شغال بطريقة
          مختلفة: اختاري الستايل، شوفي السعر الفعلي، اختاري معادك وادفعي عربون صغير — كله
          أونلاين بالعربي أو الإنجليزي{avg ? ` (تقييم ${avg}/٥ من ${reviews.length} عميلة)` : ""}.
          وفي كمان <strong>خدمة منزلية في القاهرة والقاهرة الجديدة</strong> (التجمع، الرحاب،
          مدينتي وما حولهم)، وضفاير أطفال وباقات أعياد ميلاد.
        </p>

        <h2>أسئلة بتتسأل كتير</h2>
        <div className="faqlist">
          {faq.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>

        <div className="gcta">
          <p>جاهزة؟ الستايلات والصور والأسعار والمواعيد المتاحة كلها أونلاين.</p>
          <a className="findus-btn" href="/">احجزي ضفايرك في سلاي ستوديو ←</a>
          <p className="seo-note"><a href="/braids-cairo" lang="en" dir="ltr">Read this guide in English: Braids in Cairo →</a></p>
        </div>

        <footer className="sfoot">
          <img className="sfoot-logo" src="/logo-s.png" alt="سلاي ستوديو" />
          <div>سلاي ستوديو · <b>@slaystudioforbraids</b> · {settings.address || "التجمع الخامس، القاهرة الجديدة"}</div>
        </footer>
      </div>
    </div>
  );
}
