"use client";
import { waLink } from "@/lib/util";
import { useLang, fmtDateL, tName } from "@/lib/i18n";

export default function Confirm({ booking, settings, onHome }) {
  const { lang, t } = useLang();
  const b = booking;
  const dep = Math.round((b.price * settings.depositPct) / 100);
  const dateStr = fmtDateL(b.date, lang);
  const svcName = tName(b.serviceName, lang);
  const msg = t("waClient", {
    service: svcName, date: dateStr, time: b.start, name: b.clientName, dep: dep.toLocaleString(),
  });

  return (
    <>
      <div className="check">
        <svg viewBox="0 0 36 36"><path d="M9 18.5l6 6 12-13" /></svg>
      </div>
      <h2 style={{ textAlign: "center" }}>{t("almostBooked")}</h2>

      {b.img && <div className="styleimg" style={{ backgroundImage: `url(${b.img})` }} />}

      <div className="card glass">
        <div className="summary" style={{ border: "none", background: "none", padding: 0 }}>
          <div>
            <div className="when">{dateStr} · {b.start}</div>
            <div className="svcn">{svcName} · {b.clientName}</div>
          </div>
          <div className="amt">{b.price.toLocaleString()}</div>
        </div>
      </div>

      <div className="card deposit">
        <div className="eyebrow">{t("lockSlot")}</div>
        <p>{t("depositPara", { dep: dep.toLocaleString(), ip: settings.instapay })}</p>
      </div>

      <a className="btn wa full glass" style={{ marginTop: 14 }} href={waLink(settings.whatsapp, msg)} target="_blank" rel="noopener noreferrer">
        {t("sendOnWa")}
      </a>
      <button className="ghost full" style={{ marginTop: 9 }} onClick={onHome}>{t("backToStyles")}</button>
    </>
  );
}
