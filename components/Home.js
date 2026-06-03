"use client";
import { useState } from "react";
import { LANE_META, LANES } from "@/lib/config";
import { families, hrs } from "@/lib/util";

export default function Home({ services, onPick, onLogin }) {
  const [filter, setFilter] = useState("all");
  const fams = families(services);

  return (
    <>
      <p className="lead">Choose your style, pick a time — a small deposit locks it in ✨</p>

      <div className="seg">
        {[["all", "All"], ...LANES.map((l) => [l, LANE_META[l].label.split(" ·")[0]])].map(([k, lab]) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>
            {lab}
          </button>
        ))}
      </div>

      {!services.length && (
        <div className="card">
          <div className="empty">
            <span className="big">✨</span>
            Setting up the menu… log in to your dashboard once to finish.
          </div>
        </div>
      )}

      {LANES.map((L) => {
        if (filter !== "all" && filter !== L) return null;
        const list = fams.filter((f) => f.lane === L);
        if (!list.length) return null;
        return (
          <div key={L}>
            <h2>{LANE_META[L].label}</h2>
            {list.map((f) => {
              const prices = f.opts.map((o) => o.price);
              const durs = f.opts.map((o) => o.dur);
              const pr =
                Math.min(...prices) === Math.max(...prices)
                  ? prices[0].toLocaleString()
                  : Math.min(...prices).toLocaleString() + "–" + Math.max(...prices).toLocaleString();
              const dr =
                Math.min(...durs) === Math.max(...durs)
                  ? "about " + hrs(durs[0]) + " hrs"
                  : "about " + hrs(Math.min(...durs)) + "–" + hrs(Math.max(...durs)) + " hrs";
              return (
                <div key={f.name} className="svc" onClick={() => onPick(f)}>
                  <div className="thumb" style={{ background: LANE_META[L].grad }}>{LANE_META[L].emoji}</div>
                  <div>
                    <div className="n">{f.name}</div>
                    <div className="d">{dr}{f.opts.length > 1 ? " · " + f.opts.length + " sizes" : ""}</div>
                  </div>
                  <div className="p">
                    <div className="amt">{pr}</div>
                    <div className="egp">EGP</div>
                  </div>
                  <div className="chev">›</div>
                </div>
              );
            })}
          </div>
        );
      })}

      <button className="link" style={{ display: "block", margin: "28px auto 0" }} onClick={onLogin}>
        Owner login →
      </button>
    </>
  );
}
