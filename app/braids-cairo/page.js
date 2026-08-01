// /braids-cairo — server-rendered English guide targeting "braids cairo",
// "braids prices egypt" etc. Live prices from Firestore (same data as the
// booking menu). Arabic twin lives at /dafayer-cairo.
import { getSeoData, familiesOf, AR_NAMES, fmtEGP } from "@/lib/seo-data";

export const revalidate = 3600;

const SITE = "https://slay-studio.com";

export const metadata = {
  title: "Braids in Cairo — Styles, Real Prices & How to Book (2026 Guide)",
  description:
    "What braids actually cost in Cairo in 2026: live prices for box braids, boho, cornrows and more, how long each style takes and lasts, healthy-braiding checks, home service, and online booking in New Cairo.",
  alternates: {
    canonical: `${SITE}/braids-cairo`,
    languages: { en: `${SITE}/braids-cairo`, ar: `${SITE}/dafayer-cairo` },
  },
  openGraph: {
    title: "Braids in Cairo — Styles, Real Prices & How to Book (2026 Guide)",
    description: "Live braid prices in Cairo, style guide, and healthy-braiding checklist.",
    url: `${SITE}/braids-cairo`,
    type: "article",
  },
};

const STYLE_NOTES = [
  ["Box braids", "The classic: hair sectioned into neat squares, braided root to tip with extensions. 2–4 hours depending on size; lasts 4–6 weeks with care."],
  ["Boho / rasta curly", "Braids with loose curly strands left out for a soft, beachy look. The most-requested style of the last two summers. 3–5 hours."],
  ["Cornrows", "Braided flat against the scalp in straight or curved lines. Fastest to install (1–2 hours) and easiest on fine hair."],
  ["Bubbles styles", "Sectioned ponytails cinched into 'bubbles' — playful, quick, great for events and for kids."],
  ["Braided ponytail", "Sleek high pony with braided length — the fastest glam option for an occasion."],
  ["Kids' braids & parties", "Gentler tension and smaller time windows for little heads; party packages braid a whole birthday group."],
];

export default async function Page() {
  const { services, reviews, settings } = await getSeoData();
  const fams = familiesOf(services);
  const all = fams.map((f) => f.min).filter(Boolean);
  const lowest = all.length ? Math.min(...all) : 700;

  const faq = [
    ["How much do braids cost in Cairo in 2026?", `Realistically from ${fmtEGP(lowest)} EGP for simple styles up to 3,000+ EGP for long, small-size boho installs. The table above is live from our booking system — most Cairo braiders don't publish prices, so always confirm the total (including hair) before you book anywhere.`],
    ["How long do braids last in Cairo's heat?", "4–6 weeks for box and boho styles with a satin scarf or bonnet at night, oiling the scalp 2–3 times a week, and washing gently every 1–2 weeks. Cornrows and bubble styles are shorter-term (1–3 weeks)."],
    ["Do I need to bring my own extension hair?", "At Slay Studio the price includes standard synthetic hair; colored strands (khosal/خصل) can be added when you book. Elsewhere in Cairo, always ask — 'cheap' quotes often exclude the hair."],
    ["Can I swim or wash my hair with braids?", "Yes — rinse with fresh water after the sea or pool, use diluted shampoo on the scalp, squeeze (don't rub) dry, and your braids will hold their shape."],
  ];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Braids in Cairo — Styles, Real Prices & How to Book (2026 Guide)",
    inLanguage: "en",
    datePublished: "2026-08-01",
    dateModified: new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "Slay Studio", url: SITE },
    publisher: { "@type": "Organization", name: "Slay Studio", url: SITE },
    mainEntityOfPage: `${SITE}/braids-cairo`,
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
      <div className="shell guide" lang="en" dir="ltr">
        <header className="gnav">
          <a className="gnav-brand" href="/"><img src="/logo-s.png" alt="Slay Studio logo" />Slay Studio</a>
          <a className="findus-btn" href="/">Book braids online →</a>
        </header>

        <h1>Braids in Cairo: styles, real prices &amp; how to book <span className="gyear">2026 guide</span></h1>
        <p className="lede">
          Getting braids in Cairo usually means DM-ing five Instagram accounts and hoping
          someone replies with a price. This guide skips that: the prices below are <strong>live
          from a real booking system</strong> (they update automatically when the menu changes),
          plus what each style involves and what to check before you sit in <em>anyone's</em> chair.
        </p>

        <h2>What braids cost in Cairo (live prices)</h2>
        <div className="seo-tablewrap">
          <table className="seo-table">
            <thead>
              <tr><th scope="col">Style</th><th scope="col" lang="ar">بالعربي</th><th scope="col">From (EGP)</th></tr>
            </thead>
            <tbody>
              {fams.map((f) => (
                <tr key={f.group}>
                  <td>{f.group}</td>
                  <td lang="ar" dir="rtl">{AR_NAMES[f.group] || f.group}</td>
                  <td>{fmtEGP(f.min)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="seo-note">
          Prices are Slay Studio's live menu (Fifth Settlement, New Cairo) and rise with smaller
          braid size and longer length. Across Cairo, expect similar or higher — and since most
          braiders don't publish prices, always confirm the total <em>including hair</em> up front.
        </p>

        <h2>The styles, explained</h2>
        <ul className="glist">
          {STYLE_NOTES.map(([name, note]) => (
            <li key={name}><strong>{name}.</strong> {note}</li>
          ))}
        </ul>

        <h2>Healthy braids: check this before booking anywhere</h2>
        <ul className="glist">
          <li><strong>Tension.</strong> Braids should feel snug, never painful. Severe pain, headaches or little bumps at the hairline mean too much tension — that's how edges get lost. Gentle, no-tension braiding protects your hair; it's the whole philosophy we built Slay Studio on.</li>
          <li><strong>Clean partings.</strong> Neat sections aren't just beauty — uneven parts pull unevenly and shorten the style's life.</li>
          <li><strong>Real prices up front.</strong> A serious studio tells you the full price before you commit, not after four DMs.</li>
          <li><strong>Aftercare guidance.</strong> You should leave knowing how to sleep, wash and oil — not just looking good for one day.</li>
        </ul>

        <h2>Where to get braided in Cairo</h2>
        <p>
          Most of Cairo's braiding scene clusters in Maadi, Zamalek and Nasr City, and almost all
          of it books through Instagram DMs. On the east side, <strong>Slay Studio in Fifth
          Settlement (New Cairo)</strong> works differently: pick a style, see the exact price,
          choose your time and pay a small deposit — all online, in Arabic or English
          {reviews.length ? ` (rated ${(reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)}/5 by ${reviews.length} clients)` : ""}.
          There's also <strong>home service across Cairo and New Cairo</strong> (Fifth Settlement,
          Rehab, Madinaty and nearby), and kids' braids with birthday-party packages.
        </p>

        <h2>Frequently asked</h2>
        <div className="faqlist">
          {faq.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>

        <div className="gcta">
          <p>Ready? Styles, photos, live prices and open slots are all online.</p>
          <a className="findus-btn" href="/">Book your braids at Slay Studio →</a>
          <p className="seo-note"><a href="/dafayer-cairo" lang="ar" dir="rtl">اقري الدليل ده بالعربي: ضفاير في القاهرة ←</a></p>
        </div>

        <footer className="sfoot">
          <img className="sfoot-logo" src="/logo-s.png" alt="Slay Studio" />
          <div>Slay Studio · <b>@slaystudioforbraids</b> · {settings.addressEn || "Fifth Settlement, New Cairo"}</div>
        </footer>
      </div>
    </div>
  );
}
