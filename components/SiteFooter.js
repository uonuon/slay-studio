// Server component — compact site footer (brand / explore links / visit /
// contact) rendered into the HTML, plus the consolidated HairSalon JSON-LD
// (live OfferCatalog + aggregateRating) so crawlers without JS still get
// the business data. Long-form content lives on /about, /prices, /faq and
// the /braids-cairo · /dafayer-cairo guides.
import { SOCIALS } from "@/lib/config";
import { familiesOf, fmtEGP, hoursLine, workDaysOf, DAYS_EN } from "@/lib/seo-data";

const SITE = "https://slay-studio.com";

export default function SiteFooter({ services = [], reviews = [], settings = {} }) {
  const fams = familiesOf(services);
  const all = fams.map((f) => f.min).filter(Boolean);
  const lowest = all.length ? Math.min(...all) : 700;
  const highest = all.length ? Math.max(...all) : 2700;

  const rated = reviews.filter(Boolean);
  const avg = rated.length
    ? rated.reduce((s, r) => s + (r.rating || 5), 0) / rated.length
    : null;

  const addressEn = settings.addressEn || "Villa 19, Nargis 5, Fifth Settlement";
  const addressAr = settings.address || "فيلا ١٩ ، النرجس ٥ ، التجمع الخامس";
  const mapsUrl = settings.mapsUrl || "https://www.google.com/maps?q=30.011137008666992,31.46440315246582&z=17&hl=en";
  const wa = `https://wa.me/${settings.whatsapp || "201555842544"}`;

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

  return (
    <footer className="bigfoot">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(salonLd) }} />
      <div className="bigfoot-grid">
        <div>
          <div className="bf-brand">
            <img src="/logo-s.png" alt="Slay Studio logo" />
            Slay Studio
          </div>
          <p lang="en" dir="ltr">
            Healthy braids, booked online — Fifth Settlement, New Cairo.
          </p>
          <p lang="ar" dir="rtl">ضفاير صحية بحجز أونلاين — التجمع الخامس.</p>
        </div>
        <div>
          <h4>Explore · استكشفي</h4>
          <ul>
            <li><a href="/clip-ins">Clip-in braids · ضفاير كليبس</a></li>
            <li><a href="/prices">Prices · الأسعار</a></li>
            <li><a href="/faq">FAQ · أسئلة شايعة</a></li>
            <li><a href="/about">About · عن الاستوديو</a></li>
            <li><a href="/braids-cairo">Braids in Cairo — 2026 guide</a></li>
            <li><a href="/dafayer-cairo" lang="ar">دليل الضفاير في القاهرة</a></li>
          </ul>
        </div>
        <div>
          <h4>Visit · زورينا</h4>
          <p lang="en" dir="ltr">{addressEn}, New Cairo</p>
          <p lang="ar" dir="rtl">{addressAr}</p>
          <p lang="en" dir="ltr">{hoursLine(settings)}</p>
          <p><a href={mapsUrl} target="_blank" rel="noopener noreferrer">Google Maps ↗</a></p>
        </div>
        <div>
          <h4>Contact · كلمينا</h4>
          <ul>
            <li><a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href={SOCIALS.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a></li>
          </ul>
        </div>
      </div>
      <div className="bf-bottom">
        Slay Studio · <b>@slaystudioforbraids</b> · Fifth Settlement, New Cairo
      </div>
    </footer>
  );
}
