"use client";
import { useState } from "react";
import { waLink } from "@/lib/util";
import { track } from "@/lib/analytics";
import { cldImg, IMG } from "@/lib/img";
import { useLang, fmtDateL, tName } from "@/lib/i18n";
import Lightbox from "./Lightbox";

export default function Confirm({ booking, settings, onHome }) {
  const { lang, t } = useLang();
  const [zoom, setZoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const copyIp = async () => {
    try { await navigator.clipboard.writeText(settings.instapay); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) {}
  };
  const b = booking;
  const dep = Math.round((b.price * settings.depositPct) / 100);
  const dateStr = fmtDateL(b.date, lang);
  const svcName = tName(b.serviceName, lang) + (b.color ? " · " + b.color : "");
  const msg = t("waClient", {
    service: svcName, date: dateStr, time: b.start, name: b.clientName, dep: dep.toLocaleString(),
  });
  const waMsg = settings.mapsUrl ? msg + "\n📍 " + settings.mapsUrl : msg;

  return (
    <>
      <div className="confirm-head">
        <div className="check">
          <svg viewBox="0 0 36 36"><path d="M9 18.5l6 6 12-13" /></svg>
        </div>
        <div className="eyebrow" style={{ color: "var(--pink-2)" }}>{t("confirmEyebrow")}</div>
        <h2 style={{ textAlign: "center", margin: "6px 0 0" }}>{t("almostBooked")}</h2>
      </div>

      {b.img && <div className="styleimg zoomable" style={{ backgroundImage: `url(${cldImg(b.img, IMG.hero)})` }} onClick={() => setZoom(cldImg(b.img, IMG.full))} />}
      <Lightbox src={zoom} onClose={() => setZoom(null)} />

      <div className="card glass">
        <div className="summary" style={{ border: "none", background: "none", padding: 0 }}>
          <div>
            <div className="when">{dateStr} · {b.start}</div>
            <div className="svcn">{svcName} · {b.clientName}</div>
          </div>
          <div className="amt">{b.price.toLocaleString()}</div>
        </div>
        {b.promoCode && <div className="confirm-promo">{t("discountApplied", { code: b.promoCode, pct: b.discountPct })}</div>}
      </div>

      {(settings.address || settings.addressEn || settings.mapsUrl) && (
        <div className="card loc-card">
          <div className="eyebrow">{t("ourStudio")}</div>
          {(lang === "ar" ? settings.address : settings.addressEn) || settings.address || settings.addressEn ? (
            <p className="loc-addr">{(lang === "ar" ? settings.address : settings.addressEn) || settings.address || settings.addressEn}</p>
          ) : null}
          {settings.mapsUrl && (
            <a className="btn ghost full" href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">{t("openInMaps")}</a>
          )}
        </div>
      )}

      <div className="card deposit">
        <div className="eyebrow">{t("lockSlot")}</div>
        <div className="depbig">{dep.toLocaleString()} <span>{t("egp")}</span></div>
        <p>{t("depositPara", { dep: dep.toLocaleString(), ip: settings.instapay })}</p>
        <button type="button" className="ip-copy" onClick={copyIp}>
          <span className="ip-num">{settings.instapay}</span>
          <span className="ip-lab">{copied ? t("copied") : "⧉ " + t("copyTap")}</span>
        </button>
      </div>

      <a className="btn wa full glass" style={{ marginTop: 14 }} href={waLink(settings.whatsapp, waMsg)} target="_blank" rel="noopener noreferrer"
         onClick={() => track("whatsapp", { name: svcName, value: dep })}>
        {t("sendOnWa")}
      </a>
      <button className="ghost full" style={{ marginTop: 9 }} onClick={onHome}>{t("backToStyles")}</button>
    </>
  );
}
