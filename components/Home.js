"use client";
import { useState } from "react";
import { LANE_META, LANES } from "@/lib/config";
import { families, hrs } from "@/lib/util";
import { useLang, laneLabel, tName } from "@/lib/i18n";

export default function Home({ services, onPick }) {
  const { lang, t } = useLang();
  const [filter, setFilter] = useState("all");
  const fams = families(services);

  return (
    <>
      <p className="lead">{t("lead")}</p>

      <div className="seg">
        {[["all", t("all")], ...LANES.map((l) => [l, laneLabel(l, lang, "short")])].map(([k, lab]) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>
            {lab}
          </button>
        ))}
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
        const list = fams.filter((f) => f.lane === L);
        if (!list.length) return null;
        return (
          <div key={L}>
            <h2>{laneLabel(L, lang, "full")}</h2>
            {list.map((f) => {
              const prices = f.opts.map((o) => o.price);
              const durs = f.opts.map((o) => o.dur);
              const img = f.opts.find((o) => o.img)?.img;
              const pr =
                Math.min(...prices) === Math.max(...prices)
                  ? prices[0].toLocaleString()
                  : Math.min(...prices).toLocaleString() + "–" + Math.max(...prices).toLocaleString();
              const dr =
                Math.min(...durs) === Math.max(...durs)
                  ? t("aboutHrs", { n: hrs(durs[0]) })
                  : t("aboutHrsRange", { a: hrs(Math.min(...durs)), b: hrs(Math.max(...durs)) });
              return (
                <div key={f.name} className="svc" onClick={() => onPick(f)}>
                  {img ? (
                    <div className="thumb img" style={{ backgroundImage: `url(${img})` }} />
                  ) : (
                    <div className="thumb" style={{ background: LANE_META[L].grad }}>{LANE_META[L].emoji}</div>
                  )}
                  <div>
                    <div className="n">{tName(f.name, lang)}</div>
                    <div className="d">{dr}{f.opts.length > 1 ? " · " + t("sizesN", { n: f.opts.length }) : ""}</div>
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
    </>
  );
}
