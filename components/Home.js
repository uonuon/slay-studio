"use client";
import { useEffect, useMemo, useState } from "react";
import { LANE_META, LANES } from "@/lib/config";
import { groupStyles, hrs } from "@/lib/util";
import { cldImg, IMG } from "@/lib/img";
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

// warm placeholder gradient per lane (used until a style photo is uploaded)
const LANE_GRAD = {
  "Slay Studio": "linear-gradient(150deg,#9aa385,#6E7B58)",
  "Little Slays": "linear-gradient(150deg,#d9b3ad,#bb8478)",
  "Signature": "linear-gradient(150deg,#c9a36a,#a9803f)",
};

export default function Home({ services, settings, onPick, mode = "studio", setMode }) {
  const { lang, t } = useLang();
  const home = mode === "home";
  const [filter, setFilter] = useState("all");
  const [reviews, setReviews] = useState([]);
  // in home-service mode only show styles the owner marked available for home
  const grps = groupStyles(home ? services.filter((s) => s.homeOk) : services);

  // owner-defined ordering (with safe fallbacks)
  const laneOrder = [...(settings?.laneOrder || LANES), ...LANES.filter((l) => !(settings?.laneOrder || LANES).includes(l))];
  const groupOrder = settings?.groupOrder || {};
  const orderedGroups = (lane) => {
    const list = grps.filter((g) => g.lane === lane);
    const ord = groupOrder[lane] || [];
    return list.slice().sort((a, b) => {
      const ia = ord.indexOf(a.group), ib = ord.indexOf(b.group);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  };

  useEffect(() => {
    (async () => { try { setReviews(await store.listReviews()); } catch (e) {} })();
  }, []);

  // scroll-reveal: sections render with .rv (hidden); add .in as they enter the viewport
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".site .rv:not(.in)"));
    if (!els.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filter, mode, services, reviews, settings]);

  // editorial ticker — the studio's own style names, looped
  const marqNames = !home && grps.length >= 3 ? grps.map((g) => tName(g.group, lang)) : [];

  const sortedReviews = [...reviews].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // enter the home-service flow and jump up to the styles to pick one
  const goHomeService = () => {
    if (setMode) setMode("home");
    if (typeof document !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById("styles");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  };

  // colour band — pull real shades from the owner's colour sets (skip if none)
  const swatches = useMemo(() => {
    if (!settings?.colorsEnabled) return [];               // colour feature off → hide the homepage band
    const seen = new Set(), out = [];
    for (const cs of settings?.colorSets || [])
      for (const c of cs.colors || []) {
        const key = (c.name || c.hex || "").toLowerCase();
        if (key && !seen.has(key)) { seen.add(key); out.push(c); }
        if (out.length >= 5) break;
      }
    return out;
  }, [settings?.colorSets]);

  return (
    <>
      {home && (
        <div className="homehint">
          <span>🏠 {t("homeServiceHint")}</span>
          <button className="homehint-back" onClick={() => setMode && setMode("studio")}>{t("backToStudio")}</button>
        </div>
      )}

      {marqNames.length > 0 && (
        <div className="marq" dir="ltr" aria-hidden="true">
          <div className="marq-in">
            {[...marqNames, ...marqNames].map((n, i) => (
              <span key={i}>{n}<i> ✦</i></span>
            ))}
          </div>
        </div>
      )}

      {/* filter */}
      <div className="filterbar">
        <div className="seg2">
          {[["all", t("all")], ...laneOrder.map((l) => [l, laneLabel(l, lang, "short")])].map(([k, lab]) => (
            <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>
              {lab}
            </button>
          ))}
        </div>
      </div>

      {!services.length && (
        <div className="scard-empty">
          <span className="big">✨</span>
          {t("setupMenu")}
        </div>
      )}

      {home && services.length > 0 && grps.length === 0 && (
        <div className="scard-empty"><span className="big">🏠</span>{t("noHomeServices")}</div>
      )}

      <div id="styles">
        {laneOrder
          .filter((L) => (filter === "all" || filter === L) && orderedGroups(L).length)
          .map((L, li) => {
          const list = orderedGroups(L);
          return (
            <section key={L} className="lane2 rv">
              <div className="lane2-head">
                <span className="lane2-num">{String(li + 1).padStart(2, "0")}</span>
                <h2 className="lane2-title">{laneLabel(L, lang, "full")}</h2>
                <span className="lane2-line" />
              </div>
              <div className="grid2">
                {list.map((g, gi) => {
                  const prices = g.opts.map((o) => o.price);
                  const durs = g.opts.map((o) => o.dur);
                  const img = g.opts.find((o) => o.img)?.img;
                  const lo = Math.min(...prices);
                  const sub =
                    g.opts.length > 1
                      ? t("stylesN", { n: g.opts.length })
                      : Math.min(...durs) === Math.max(...durs)
                        ? t("aboutHrs", { n: hrs(durs[0]) })
                        : t("aboutHrsRange", { a: hrs(Math.min(...durs)), b: hrs(Math.max(...durs)) });
                  return (
                    <article key={g.group} className="scard" style={{ "--i": gi % 9 }} onClick={() => onPick(g)}>
                      <div className="scard-img" style={img ? { backgroundImage: `url(${cldImg(img, IMG.thumb)})` } : { background: LANE_GRAD[L] || LANE_GRAD["Slay Studio"] }}>
                        {!img && (
                          <>
                            <span className="scard-flutes" />
                            <span className="scard-emoji">{LANE_META[L]?.emoji || "✨"}</span>
                            <span className="scard-mono">{tName(g.group, lang).charAt(0)}</span>
                          </>
                        )}
                      </div>
                      <div className="scard-body">
                        <div className="scard-name">{tName(g.group, lang)}</div>
                        <div className="scard-meta">{sub}</div>
                        <div className="scard-foot">
                          {home
                            ? (() => {
                                const hp = g.opts.map((o) => +o.homePrice || 0).filter((p) => p > 0);
                                return hp.length
                                  ? <div className="price2"><span className="amt">{Math.min(...hp).toLocaleString()}</span> <span className="egp">{t("egp")}</span></div>
                                  : <div className="price2 home">🏠 {t("homeService")}</div>;
                              })()
                            : <div className="price2"><span className="amt">{lo.toLocaleString()}</span> <span className="egp">{t("egp")}</span></div>}
                          <div className="go2">→</div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* colour teaser — only when the owner has set colour sets */}
      {swatches.length > 0 && (
        <section className="colourband rv">
          <div className="colourband-copy">
            <h3>{t("colourTitle")}</h3>
            <p>{t("colourSub")}</p>
          </div>
          <div className="swatches2">
            {swatches.map((c, i) => (
              <div className="sw2" key={c.id || c.name} style={{ "--i": i }}>
                <i style={c.img ? { backgroundImage: `url(${cldImg(c.img, IMG.swatch)})` } : { background: c.hex || "#888" }} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {sortedReviews.length > 0 && (
        <div className="testi rv">
          <div className="lane2-head">
            <h2 className="lane2-title">{t("reviewsHeading")}</h2>
            <span className="lane2-line" />
          </div>
          <div className="revstrip">
            {sortedReviews.map((r, ri) => {
              const rate = Math.max(1, Math.min(5, r.rating || 5));
              return (
                <div key={r.id} className="revcard" style={{ "--i": ri % 6 }}>
                  <div className="rev-stars">
                    <span className="on">{"★".repeat(rate)}</span><span className="dim">{"★".repeat(5 - rate)}</span>
                  </div>
                  {r.img
                    ? <img src={cldImg(r.img, IMG.review)} alt="client review" loading="lazy" />
                    : (r.text ? <div className="rev-text">“{r.text}” <span className="rev-name">— {r.name}</span></div> : null)}
                </div>
              );
            })}
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd(sortedReviews)) }} />
        </div>
      )}

      {setMode && !home && (
        <section className="homecta rv">
          <div className="homecta-copy">
            <h3>{t("homeCtaTitle")}</h3>
            <p>{t("homeCtaSub")}</p>
          </div>
          <button className="homecta-btn" onClick={goHomeService}>🏠 {t("homeCtaBtn")}</button>
        </section>
      )}

      {(settings?.address || settings?.addressEn || settings?.mapsUrl) && (
        <section className="findus rv">
          <div className="lane2-head">
            <h2 className="lane2-title">{t("findUs")}</h2>
            <span className="lane2-line" />
          </div>
          <div className="findus-body">
            <p className="findus-addr">📍 {(lang === "ar" ? settings.address : settings.addressEn) || settings.address || settings.addressEn}</p>
            {settings?.mapsUrl && (
              <a className="findus-btn" href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">{t("getDirections")}</a>
            )}
          </div>
        </section>
      )}
    </>
  );
}
