// Server component — rendered into the HTML itself so Google and AI
// crawlers (which don't run JavaScript) can read the studio's services,
// prices, FAQ and location. Also carries the site's structured data.
import { SOCIALS } from "@/lib/config";
import { familiesOf, minPrice, AR_NAMES, fmtEGP } from "@/lib/seo-data";

const SITE = "https://slay-studio.com";

// workDays uses JS getDay() indexes: 0 = Sunday … 5 = Friday, 6 = Saturday
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_AR = ["الأحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];
const workDaysOf = (settings) => settings?.workDays?.length ? settings.workDays : [0, 1, 2, 3, 4, 6];

function hoursLine(settings, ar = false) {
  const open = settings?.openTime || "11:00";
  const close = settings?.closeTime || "21:00";
  const off = [0, 1, 2, 3, 4, 5, 6].filter((d) => !workDaysOf(settings).includes(d));
  if (!off.length) return ar ? `يومياً ${open}–${close}` : `Daily ${open}–${close}`;
  return ar
    ? `${open}–${close} · ${off.map((d) => DAYS_AR[d]).join(" و")} إجازة`
    : `${open}–${close} · ${off.map((d) => DAYS_EN[d]).join(", ")} closed`;
}

export default function SeoSections({ services = [], reviews = [], settings = {} }) {
  const fams = familiesOf(services);
  const all = fams.map((f) => f.min).filter(Boolean);
  const lowest = all.length ? Math.min(...all) : 1000;
  const highest = all.length ? Math.max(...all) : 2700;
  // Price examples for the FAQ, taken from styles that actually exist on the
  // live menu (well-known search terms first, then whatever else is on it).
  const examples = [];
  for (const term of ["knotless", "box", "boho", "cornrow"]) {
    const hit = fams.find((f) => f.group.toLowerCase().includes(term));
    if (hit && !examples.includes(hit)) examples.push(hit);
  }
  for (const f of fams) {
    if (examples.length >= 3) break;
    if (!examples.includes(f)) examples.push(f);
  }
  const exEn = examples.slice(0, 3).map((f) => `${f.group.trim()} from ${fmtEGP(f.min)} EGP`).join(", ");
  const exAr = examples.slice(0, 3).map((f) => `${(AR_NAMES[f.group] || f.group).trim()} من ${fmtEGP(f.min)} جنيه`).join("، ");

  const rated = reviews.filter((r) => r);
  const avg = rated.length
    ? rated.reduce((s, r) => s + (r.rating || 5), 0) / rated.length
    : null;

  const addressEn = settings.addressEn || "Villa 19, Nargis 5, Fifth Settlement";
  const addressAr = settings.address || "فيلا ١٩ ، النرجس ٥ ، التجمع الخامس";
  const mapsUrl = settings.mapsUrl || "https://www.google.com/maps?q=30.011137008666992,31.46440315246582&z=17&hl=en";
  const wa = `https://wa.me/${settings.whatsapp || "201555842544"}`;

  const faq = [
    {
      lang: "en",
      q: "How much do braids cost in Cairo?",
      a: `At Slay Studio prices start from ${fmtEGP(lowest)} EGP depending on the style and size — for example ${exEn}. The full live price list is on slay-studio.com, where you can book online in minutes.`,
    },
    {
      lang: "en",
      q: "Where can I get knotless or box braids in New Cairo?",
      a: `Slay Studio is a hair braiding studio at ${addressEn}, Fifth Settlement (El Tagamoa El Khames), New Cairo. Hours: ${hoursLine(settings)}. Pick a style and reserve your appointment online at slay-studio.com or on WhatsApp.`,
    },
    {
      lang: "en",
      q: "Do you offer home service for braids in Cairo?",
      a: "Yes — Slay Studio offers braiding home service across Cairo and New Cairo (Fifth Settlement, Rehab, Madinaty and nearby areas). Choose “Home service” when booking online and we come to you.",
    },
    {
      lang: "en",
      q: "Do you braid kids' hair or do birthday parties?",
      a: "Yes — our Little Slays packages cover kids' braids and birthday parties for groups of 10 to 30 girls, in the studio or at your place.",
    },
    {
      lang: "ar",
      q: "بكام الضفاير في القاهرة؟",
      a: `في سلاي ستوديو الأسعار بتبدأ من ${fmtEGP(lowest)} جنيه على حسب الستايل والحجم — مثلاً ${exAr}. قايمة الأسعار كاملة على slay-studio.com وتقدري تحجزي أونلاين في دقايق.`,
    },
    {
      lang: "ar",
      q: "فين مكان ستوديو ضفاير في التجمع الخامس؟",
      a: `عنواننا: ${addressAr} — القاهرة الجديدة. ${hoursLine(settings, true)}. اختاري الستايل واحجزي معادك أونلاين أو كلمينا واتساب.`,
    },
    {
      lang: "ar",
      q: "بتعملوا خصل ملونة مع الضفاير؟",
      a: "أيوه — بنركب خصل (خصلات) صناعية وألوان مع الضفاير على حسب الستايل، وبنساعدك تختاري اللون المناسب يوم المعاد.",
    },
    {
      lang: "ar",
      q: "هل في خدمة منزلية؟",
      a: "أيوه — في خدمة منزلية في القاهرة والقاهرة الجديدة (التجمع الخامس، الرحاب، مدينتي وما حولهم). اختاري «خدمة منزلية» وانتي بتحجزي.",
    },
  ];

  const salonLd = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${SITE}/#salon`,
    name: "Slay Studio",
    alternateName: ["سلاي ستوديو", "Slay Studio Cairo", "Braids by Marmora"],
    url: SITE,
    image: [`${SITE}/og-image.png`, `${SITE}/hero-braids.jpg`],
    telephone: "+201555842544",
    priceRange: `EGP ${fmtEGP(lowest)}–${fmtEGP(highest)}`,
    currenciesAccepted: "EGP",
    paymentAccepted: "Cash, InstaPay",
    description:
      "Hair braiding studio in Fifth Settlement, New Cairo: knotless braids, box braids, boho braids, cornrows and colored strands, for adults and kids, in-studio or home service across Cairo. ستوديو ضفاير في التجمع الخامس — القاهرة الجديدة.",
    address: {
      "@type": "PostalAddress",
      streetAddress: addressEn,
      addressLocality: "Fifth Settlement, New Cairo",
      addressRegion: "Cairo",
      addressCountry: "EG",
    },
    geo: { "@type": "GeoCoordinates", latitude: 30.011137, longitude: 31.464403 },
    hasMap: mapsUrl,
    areaServed: ["Cairo", "New Cairo", "Fifth Settlement", "El Rehab", "Madinaty"],
    knowsAbout: [
      "hair braiding", "knotless braids", "box braids", "boho braids", "cornrows",
      "colored braid strands", "kids braids", "protective hairstyles",
      "ضفاير", "ضفائر افريقية", "خصل ملونة",
    ],
    knowsLanguage: ["ar", "en"],
    sameAs: [SOCIALS.instagram, SOCIALS.tiktok],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: workDaysOf(settings).map((d) => DAYS_EN[d]),
        opens: settings.openTime || "11:00",
        closes: settings.closeTime || "21:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Braiding styles",
      itemListElement: fams.map((f) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: f.group, serviceType: "Hair braiding" },
        price: f.min,
        priceCurrency: "EGP",
        description: `${f.group} from ${fmtEGP(f.min)} EGP at Slay Studio, New Cairo`,
      })),
    },
    ...(avg
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avg.toFixed(1),
            reviewCount: rated.length,
            bestRating: 5,
          },
        }
      : {}),
  };

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
    <div className="seo">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(salonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <section aria-label="About Slay Studio">
        <div className="lane2-head">
          <h2 className="lane2-title">About · عن الاستوديو</h2>
          <span className="lane2-line" />
        </div>
        <div className="seo-cols">
          <p lang="en" dir="ltr">
            <strong>Slay Studio</strong> is a hair braiding studio in Fifth Settlement
            (El Tagamoa El Khames), New Cairo. We specialise in knotless braids, box
            braids, boho braids, cornrows and colored strands — what Egyptians search
            as <em>dafayer</em> (ضفاير) and <em>5osal</em> (خصل) — for adults and kids,
            in the studio or with home service across Cairo. Clients rate us on{" "}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">Google reviews</a>,
            and you can book your appointment online in minutes.
          </p>
          <p lang="ar" dir="rtl">
            <strong>سلاي ستوديو</strong> — ستوديو ضفاير في التجمع الخامس، القاهرة
            الجديدة. متخصصين في الضفاير الافريقية: نوتلس، بوكس برايدز، بوهو، كورن
            رو، وخصل ملونة — للكبار والأطفال، في الاستوديو أو بخدمة منزلية في
            القاهرة. عملاؤنا بيقيّمونا على جوجل، وتقدري تحجزي معادك أونلاين في
            دقايق.
          </p>
        </div>
        <p className="seo-note">
          Read more: <a href="/braids-cairo">Braids in Cairo — the 2026 guide with real prices</a>
          {" · "}
          <a href="/dafayer-cairo" lang="ar" dir="rtl">دليل الضفاير في القاهرة والأسعار</a>
        </p>
        <img
          className="seo-img"
          src="/hero-braids.jpg"
          alt="Knotless braids by Slay Studio — hair braiding salon in Fifth Settlement, New Cairo · ضفاير نوتلس في التجمع الخامس"
          width="1200"
          height="800"
          loading="lazy"
        />
      </section>

      <section aria-label="Braiding prices in Cairo">
        <div className="lane2-head">
          <h2 className="lane2-title">Prices · الأسعار</h2>
          <span className="lane2-line" />
        </div>
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
          Final price depends on size and length — pick a style above to see every
          option and book online. الأسعار النهائية على حسب الحجم والطول.
        </p>
      </section>

      <section aria-label="Frequently asked questions">
        <div className="lane2-head">
          <h2 className="lane2-title">FAQ · أسئلة شايعة</h2>
          <span className="lane2-line" />
        </div>
        <div className="faqlist">
          {faq.map((f) => (
            <details key={f.q} lang={f.lang} dir={f.lang === "ar" ? "rtl" : "ltr"}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-label="Visit Slay Studio">
        <div className="lane2-head">
          <h2 className="lane2-title">Visit us · زورينا</h2>
          <span className="lane2-line" />
        </div>
        <div className="seo-visit">
          <div>
            <h3 lang="en">Address · العنوان</h3>
            <p lang="en" dir="ltr">{addressEn}, Fifth Settlement, New Cairo</p>
            <p lang="ar" dir="rtl">{addressAr} — القاهرة الجديدة</p>
            <a className="findus-btn" href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Google Maps
            </a>
          </div>
          <div>
            <h3 lang="en">Hours · المواعيد</h3>
            <p lang="en" dir="ltr">{hoursLine(settings)}</p>
            <p lang="ar" dir="rtl">{hoursLine(settings, true)}</p>
          </div>
          <div>
            <h3 lang="en">Contact · تواصلي معانا</h3>
            <p>
              <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              {" · "}
              <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              {" · "}
              <a href={SOCIALS.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>
            </p>
            <p lang="en" dir="ltr">Serving Fifth Settlement, Rehab, Madinaty & all of Cairo.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
