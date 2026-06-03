"use client";
import { useState } from "react";
import { LANE_META, LANES } from "@/lib/config";
import { groupStyles, hrs } from "@/lib/util";
import { useLang, laneLabel, tName } from "@/lib/i18n";

export default function Home({ services, onPick }) {
  const { lang, t } = useLang();
  const [filter, setFilter] = useState("all");
  const grps = groupStyles(services);

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
            <h2>{laneLabel(L, lang, "full")}</h2>
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
    </>
  );
}
