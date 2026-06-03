"use client";
import { useEffect, useMemo, useState } from "react";
import { LANE_META } from "@/lib/config";
import { store } from "@/lib/store";
import { availableStarts, dstr, hrs, t2m, todayStr, uid, toast } from "@/lib/util";
import { useLang, tVariant, dayShort } from "@/lib/i18n";

export default function Booking({ sel, setSel, settings, onBack, onBooked }) {
  const { lang, t } = useLang();
  const group = sel.family; // category object: { group, lane, opts: [{...service, variant}] }
  const groupImg = group.opts.find((o) => o.img)?.img;
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
    if (!start) return toast(t("pickTimeFirst"));
    if (!name.trim() || !phone.trim()) return toast(t("addNamePhone"));
    const b = {
      id: uid(), serviceId: service.id, serviceName: service.name, price: service.price, dur: service.dur,
      date, start, clientName: name.trim(), clientPhone: phone.trim(), status: "pending", createdAt: Date.now(),
    };
    // Persist without the (heavy) image; pass it to the confirm screen in memory only.
    try { await store.createBooking(b); onBooked({ ...b, img: service.img || groupImg || "" }); }
    catch (e) { toast(t("slotTaken")); setStart(null); }
  };

  const styleImg = service?.img || groupImg;

  const groups = [
    [t("morning"), (tm) => t2m(tm) < 720],
    [t("afternoon"), (tm) => t2m(tm) >= 720 && t2m(tm) < 1020],
    [t("evening"), (tm) => t2m(tm) >= 1020],
  ];

  return (
    <>
      <div className="steps">
        <span className="s">{t("stStyle")}</span><span className="ln" /><span className="s on">{t("stTime")}</span><span className="ln" /><span className="s">{t("stYou")}</span>
      </div>

      {styleImg && <div className="styleimg" style={{ backgroundImage: `url(${styleImg})` }} />}

      {group.opts.length > 1 && (
        <div className="card">
          <label>{t("chooseSize")}</label>
          <div className="chips">
            {group.opts.map((o) => (
              <div
                key={o.id}
                className={"chip" + (service && service.id === o.id ? " on" : "")}
                onClick={() => { setService(o); setSel((s) => ({ ...s, service: o })); }}
              >
                <div className="cs">{tVariant(o, lang)}</div>
                <div className="cp">{o.price.toLocaleString()} · {hrs(o.dur)}h</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!service ? (
        <div className="empty">{t("pickSizeFirst")}</div>
      ) : (
        <>
          <div className="summary" style={{ margin: "13px 0" }}>
            <div>
              <div className="when">{service.price.toLocaleString()} {t("egp")}</div>
              <div className="svcn">{tVariant(service, lang)} · {t("aboutHours", { n: hrs(service.dur) })}</div>
            </div>
            <div className="amt">{LANE_META[service.lane]?.emoji || "✨"}</div>
          </div>

          <div className="card glass">
            <label>{t("pickDate")}</label>
            <div className="datestrip">
              {dates.map((d) => (
                <div
                  key={d.str}
                  className={"dchip" + (d.work ? "" : " off") + (d.str === date ? " on" : "")}
                  tabIndex={d.work ? 0 : -1}
                  onClick={() => d.work && setDate(d.str)}
                >
                  <div className="dw">{dayShort(d.dow, lang)}</div>
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
                <div className="empty"><span className="big">🗓️</span>{t("noTimes")}</div>
              ) : (
                groups.map(([lab, test]) => {
                  const g = starts.filter(test);
                  if (!g.length) return null;
                  return (
                    <div key={lab}>
                      <div className="sgroup">{lab}</div>
                      <div className="slotgrid">
                        {g.map((tm) => (
                          <div
                            key={tm}
                            className={"slot" + (start === tm ? " sel" : "")}
                            tabIndex={0}
                            onClick={() => setStart(tm)}
                          >
                            {tm}
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
                <span className="s">{t("stStyle")}</span><span className="ln" /><span className="s">{t("stTime")}</span><span className="ln" /><span className="s on">{t("stYou")}</span>
              </div>
              <label style={{ marginTop: 6, display: "block" }}>{t("yourName")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("fullName")} />
              <label style={{ marginTop: 12, display: "block" }}>{t("waNumber")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01X XXXX XXXX" inputMode="tel" />
              <button className="pink full" style={{ marginTop: 15 }} onClick={submit}>{t("confirmBooking")}</button>
              <small className="note">{t("depositNote")}</small>
            </div>
          )}
        </>
      )}
    </>
  );
}
