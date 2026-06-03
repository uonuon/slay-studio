"use client";
import { useEffect, useState } from "react";
import { LANE_META, LANES } from "@/lib/config";
import { groupStyles, hrs } from "@/lib/util";
import { store } from "@/lib/store";
import { useLang, laneLabel, tName } from "@/lib/i18n";

function reviewJsonLd(reviews) {
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + (r.rating || 5), 0) / count : 0;
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: "Slay Studio",
    url: "https://slay-studio.com",
    aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: count, bestRating: 5 },
  };
}

export default function Home({ services, onPick }) {
  const { lang, t } = useLang();
  const [filter, setFilter] = useState("all");
  const [reviews, setReviews] = useState([]);
  const grps = groupStyles(services);

  useEffect(() => {
    (async () => { try { setReviews(await store.listReviews()); } catch (e) {} })();
  }, []);

  const sortedReviews = [...reviews].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <>
      <p className="lead">{t("lead")}</p>

      <div className="segwrap">
        <div className="seg">
          {[["all", t("all")], ...LANES.map((l) => [l, laneLabel(l, lang, "short")])].map(([k, lab]) => (
            <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>
              {lab}
            </button>
          ))}
        </div>
      </div>

      {!services.length && (
        <div className="card">
          <div className="empty">
            <span className="big">✨</span>
            {t("setupMenu")}
          </div>
        </div>
      )}

      {LANES.map((L) => {
        if (filter !== "all" && filter !== L) return null;
        const list = grps.filter((g) => g.lane === L);
        if (!list.length) return null;
        return (
          <div key={L}>
            <h2 className="sect">{laneLabel(L, lang, "full")}</h2>
            {list.map((g) => {
              const prices = g.opts.map((o) => o.price);
              const durs = g.opts.map((o) => o.dur);
              const img = g.opts.find((o) => o.img)?.img;
              const lo = Math.min(...prices), hi = Math.max(...prices);
              const pr = lo === hi ? lo.toLocaleString() : lo.toLocaleString() + "+";
              const sub =
                g.opts.length > 1
                  ? t("stylesN", { n: g.opts.length })
                  : Math.min(...durs) === Math.max(...durs)
                    ? t("aboutHrs", { n: hrs(durs[0]) })
                    : t("aboutHrsRange", { a: hrs(Math.min(...durs)), b: hrs(Math.max(...durs)) });
              return (
                <div key={g.group} className="svc" onClick={() => onPick(g)}>
                  {img ? (
                    <div className="thumb img" style={{ backgroundImage: `url(${img})` }} />
                  ) : (
                    <div className="thumb" style={{ background: LANE_META[L].grad }}>{LANE_META[L].emoji}</div>
                  )}
                  <div>
                    <div className="n">{tName(g.group, lang)}</div>
                    <div className="d">{sub}</div>
                  </div>
                  <div className="p">
                    <div className="amt">{pr}</div>
                    <div className="egp">{t("egp")}</div>
                  </div>
                  <div className="chev">›</div>
                </div>
              );
            })}
          </div>
        );
      })}

      {sortedReviews.length > 0 && (
        <div className="testi">
          <h2 className="sect">{t("reviewsHeading")}</h2>
          <div className="revstrip">
            {sortedReviews.map((r) => {
              const rate = Math.max(1, Math.min(5, r.rating || 5));
              return (
                <div key={r.id} className="revcard">
                  <div className="rev-stars">
                    <span className="on">{"★".repeat(rate)}</span><span className="dim">{"★".repeat(5 - rate)}</span>
                  </div>
                  {r.img
                    ? <img src={r.img} alt="client review" loading="lazy" />
                    : (r.text ? <div className="rev-text">“{r.text}” <span className="rev-name">— {r.name}</span></div> : null)}
                </div>
              );
            })}
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd(sortedReviews)) }} />
        </div>
      )}
    </>
  );
}
