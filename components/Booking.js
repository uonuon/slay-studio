"use client";
import { useEffect, useMemo, useState } from "react";
import { LANE_META } from "@/lib/config";
import { store } from "@/lib/store";
import {
  availableStarts, dstr, DAY, fmtDate, hrs, t2m, todayStr, uid, waLink, toast,
} from "@/lib/util";

export default function Booking({ sel, setSel, settings, onBack, onBooked }) {
  const family = sel.family;
  const [service, setService] = useState(sel.service || null);
  const [date, setDate] = useState(sel.date || todayStr());
  const [starts, setStarts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // 28-day strip
  const dates = useMemo(() => {
    const arr = [];
    const base = new Date();
    for (let i = 0; i < 28; i++) {
      const cur = new Date(base);
      cur.setDate(base.getDate() + i);
      arr.push({ str: dstr(cur), dow: cur.getDay(), dn: cur.getDate(), work: settings.workDays.includes(cur.getDay()) });
    }
    return arr;
  }, [settings.workDays]);

  useEffect(() => {
    let alive = true;
    if (!service) { setStarts([]); return; }
    setLoading(true); setStart(null);
    (async () => {
      const ivs = await store.dayIntervals(date);
      if (!alive) return;
      setStarts(availableStarts(date, service.dur, settings, ivs));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [service, date, settings]);

  const submit = async () => {
    if (!start) return toast("Pick a time first");
    if (!name.trim() || !phone.trim()) return toast("Add your name & number");
    const b = {
      id: uid(), serviceId: service.id, serviceName: service.name, price: service.price, dur: service.dur,
      date, start, clientName: name.trim(), clientPhone: phone.trim(), status: "pending", createdAt: Date.now(),
    };
    try { await store.createBooking(b); onBooked(b); }
    catch (e) { toast("That slot was just taken"); setStart(null); }
  };

  const groups = [
    ["Morning", (t) => t2m(t) < 720],
    ["Afternoon", (t) => t2m(t) >= 720 && t2m(t) < 1020],
    ["Evening", (t) => t2m(t) >= 1020],
  ];

  return (
    <>
      <button className="link" onClick={onBack}>‹ all styles</button>
      <div className="steps">
        <span className="s">Style</span><span className="ln" /><span className="s on">Time</span><span className="ln" /><span className="s">You</span>
      </div>
      <h2>{family.name}</h2>

      {family.opts.length > 1 && (
        <div className="card">
          <label>Choose your size</label>
          <div className="chips">
            {family.opts.map((o) => (
              <div
                key={o.id}
                className={"chip" + (service && service.id === o.id ? " on" : "")}
                onClick={() => { setService(o); setSel((s) => ({ ...s, service: o })); }}
              >
                <div className="cs">{o.size || o.name}</div>
                <div className="cp">{o.price.toLocaleString()} · {hrs(o.dur)}h</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!service ? (
        <div className="empty">Pick a size to see available times ↑</div>
      ) : (
        <>
          <div className="summary" style={{ margin: "13px 0" }}>
            <div>
              <div className="when">{service.price.toLocaleString()} EGP</div>
              <div className="svcn">{service.size ? service.size + " · " : ""}about {hrs(service.dur)} hours</div>
            </div>
            <div className="amt">{LANE_META[service.lane].emoji}</div>
          </div>

          <div className="card glass">
            <label>Pick a date</label>
            <div className="datestrip">
              {dates.map((d) => (
                <div
                  key={d.str}
                  className={"dchip" + (d.work ? "" : " off") + (d.str === date ? " on" : "")}
                  tabIndex={d.work ? 0 : -1}
                  onClick={() => d.work && setDate(d.str)}
                >
                  <div className="dw">{DAY[d.dow]}</div>
                  <div className="dn">{d.dn}</div>
                </div>
              ))}
            </div>

            <div>
              {loading ? (
                <div className="slotgrid" style={{ marginTop: 14 }}>
                  <div className="skel" /><div className="skel" /><div className="skel" />
                </div>
              ) : starts.length === 0 ? (
                <div className="empty"><span className="big">🗓️</span>No open times that day — try another date.</div>
              ) : (
                groups.map(([lab, test]) => {
                  const g = starts.filter(test);
                  if (!g.length) return null;
                  return (
                    <div key={lab}>
                      <div className="sgroup">{lab}</div>
                      <div className="slotgrid">
                        {g.map((t) => (
                          <div
                            key={t}
                            className={"slot" + (start === t ? " sel" : "")}
                            tabIndex={0}
                            onClick={() => setStart(t)}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {start && (
            <div className="card glass">
              <div className="steps">
                <span className="s">Style</span><span className="ln" /><span className="s">Time</span><span className="ln" /><span className="s on">You</span>
              </div>
              <label style={{ marginTop: 6, display: "block" }}>Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              <label style={{ marginTop: 12, display: "block" }}>WhatsApp number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01X XXXX XXXX" inputMode="tel" />
              <button className="pink full" style={{ marginTop: 15 }} onClick={submit}>Confirm booking</button>
              <small className="note">Next you’ll send a 50% deposit on WhatsApp to lock your slot. Refundable if cancelled 24h before.</small>
            </div>
          )}
        </>
      )}
    </>
  );
}
