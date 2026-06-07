"use client";
import { useEffect, useMemo, useState } from "react";
import { LANE_META } from "@/lib/config";
import { store } from "@/lib/store";
import { availableStarts, dstr, hrs, t2m, todayStr, uid, toast, isDayFullyBlocked, findPromo, applyPromo } from "@/lib/util";
import { track } from "@/lib/analytics";
import { cldImg, IMG } from "@/lib/img";
import { useLang, tVariant, tName, dayShort } from "@/lib/i18n";
import Lightbox from "./Lightbox";

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
  const [color, setColor] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [promoInput, setPromoInput] = useState("");

  const colors = useMemo(() => {
    if (!settings.colorsEnabled) return [];                 // colour feature off → no picker / no add-on
    const cs = (settings.colorSets || []).find((c) => c.id === service?.colorSet);
    return cs?.colors || [];
  }, [service, settings.colorSets, settings.colorsEnabled]);
  useEffect(() => { setColor(null); }, [service]);
  const promo = useMemo(() => findPromo(settings, promoInput), [settings, promoInput]);
  const base = (service?.price || 0) + (color?.price || 0);
  const total = applyPromo(base, promo);

  // 28-day strip
  const dates = useMemo(() => {
    const arr = [];
    const base = new Date();
    for (let i = 0; i < 28; i++) {
      const cur = new Date(base);
      cur.setDate(base.getDate() + i);
      const str = dstr(cur);
      arr.push({ str, dow: cur.getDay(), dn: cur.getDate(), work: settings.workDays.includes(cur.getDay()) && !isDayFullyBlocked(settings, str) });
    }
    return arr;
  }, [settings.workDays, settings.blocks]);

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
    if (colors.length && !color) return toast(t("pickColorFirst"));
    if (!start) return toast(t("pickTimeFirst"));
    if (!name.trim() || !phone.trim()) return toast(t("addNamePhone"));
    const b = {
      id: uid(), serviceId: service.id, serviceName: service.name, price: total, dur: service.dur,
      color: color?.name || "", colorHex: color?.hex || "",
      promoCode: promo?.code || "", discountPct: promo?.pct || 0,
      date, start, clientName: name.trim(), clientPhone: phone.trim(), status: "pending", createdAt: Date.now(),
    };
    // Persist without the (heavy) image; pass it to the confirm screen in memory only.
    try {
      await store.createBooking(b);
      track("book", { name: service.name, value: service.price });
      onBooked({ ...b, img: service.img || groupImg || "" });
    } catch (e) { toast(t("slotTaken")); setStart(null); }
  };

  const styleImg = service?.img || groupImg;

  const groups = [
    [t("morning"), (tm) => t2m(tm) < 720],
    [t("afternoon"), (tm) => t2m(tm) >= 720 && t2m(tm) < 1020],
    [t("evening"), (tm) => t2m(tm) >= 1020],
  ];

  const prices = group.opts.map((o) => o.price);
  const durs = group.opts.map((o) => o.dur);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const desc = service?.description || group.opts.find((o) => o.description)?.description || "";
  const priceLabel = service ? total.toLocaleString() : (lo === hi ? lo.toLocaleString() : lo.toLocaleString() + "+");
  const durLabel = service
    ? t("aboutHours", { n: hrs(service.dur) })
    : (Math.min(...durs) === Math.max(...durs) ? t("aboutHours", { n: hrs(durs[0]) }) : t("aboutHrsRange", { a: hrs(Math.min(...durs)), b: hrs(Math.max(...durs)) }));

  return (
    <div className="bookgrid">
      <div className="book-media">
        {styleImg
          ? <div className="styleimg zoomable" style={{ backgroundImage: `url(${cldImg(styleImg, IMG.hero)})` }} onClick={() => setZoom(cldImg(styleImg, IMG.full))} />
          : <div className="styleimg ph">{LANE_META[group.lane]?.emoji || "✨"}</div>}
      </div>

      <div className="book-panel">
        <div className="steps">
          <span className="s">{t("stStyle")}</span><span className="ln" /><span className="s on">{t("stTime")}</span><span className="ln" /><span className="s">{t("stYou")}</span>
        </div>

        <div className="book-detail">
          <h2 className="book-name">{tName(group.group, lang)}</h2>
          {desc && <p className="book-desc">{desc}</p>}
          <div className="book-metaline">
            <span className="book-price">{priceLabel} <span className="cur">{t("egp")}</span></span>
            {promo && service && <span className="book-was">{base.toLocaleString()}</span>}
            <span className="book-dot">·</span>
            <span className="book-dur">{durLabel}</span>
            {color && <><span className="book-dot">·</span><span className="book-dur">{color.name}</span></>}
          </div>
        </div>

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
          {colors.length > 0 && (
            <div className="card">
              <label>{t("chooseColor")}</label>
              <div className="swatches">
                {colors.map((c) => (
                  <button key={c.id} type="button" className={"sw" + (color?.id === c.id ? " on" : "")} onClick={() => setColor(c)}>
                    {c.img
                      ? <span className="sw-dot img" style={{ backgroundImage: `url(${cldImg(c.img, IMG.swatch)})` }} />
                      : <span className="sw-dot" style={{ background: c.hex }} />}
                    <span className="sw-name">{c.name}{c.price > 0 ? <span className="sw-add"> +{c.price.toLocaleString()}</span> : null}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                            onClick={() => { if (!start) track("begin_booking", { name: service.name, value: service.price }); setStart(tm); }}
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
              <label style={{ marginTop: 12, display: "block" }}>{t("promoCode")}</label>
              <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder={t("promoPh")} autoCapitalize="characters" style={{ textTransform: "uppercase" }} />
              {promoInput.trim() && (
                promo
                  ? <small className="promo-ok">{t("promoApplied", { pct: promo.pct })} · {t("youSave", { n: (base - total).toLocaleString() })}</small>
                  : <small className="promo-bad">{t("promoInvalid")}</small>
              )}
              <button className="pink full" style={{ marginTop: 15 }} onClick={submit}>{t("confirmBooking")}</button>
              <small className="note">{t("depositNote")}</small>
            </div>
          )}
        </>
      )}
      </div>

      <Lightbox src={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}
