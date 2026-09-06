"use client";
// Clip-in braids shop (/clip-ins): pick a braid style → color → chains &
// accessories → order on WhatsApp with the choices pre-written. No booking is
// saved — the chat handles price confirmation, payment and delivery.
import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { waLink, toast } from "@/lib/util";
import { track } from "@/lib/analytics";
import { cldImg, IMG } from "@/lib/img";
import { useLang, biName } from "@/lib/i18n";
import Lightbox from "./Lightbox";

// warm placeholder gradients rotated across type cards until photos are uploaded
const TYPE_GRADS = [
  "linear-gradient(150deg,#9aa385,#6E7B58)",
  "linear-gradient(150deg,#c9a36a,#a9803f)",
  "linear-gradient(150deg,#d9b3ad,#bb8478)",
  "linear-gradient(150deg,#b0a18b,#8c7c6c)",
];

function ClipNav({ onOrder }) {
  const { lang, setLang, t } = useLang();
  return (
    <nav className="snav">
      <div className="snav-in">
        <a className="snav-brand" href="/" style={{ textDecoration: "none" }}>
          <img className="snav-logo" src="/logo-s.png" alt="Slay Studio logo" />
          Slay Studio<span className="dot">.</span>
        </a>
        <div className="snav-sp" />
        <div className="langtoggle">
          <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>ع</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
        <button className="snav-book" onClick={onOrder}>{t("clipOrderWa")}</button>
      </div>
    </nav>
  );
}

export default function ClipShop() {
  const { lang, t } = useLang();
  const [settings, setSettings] = useState(null);
  const [type, setType] = useState(null);
  const [color, setColor] = useState(null);
  const [extras, setExtras] = useState([]); // selected extra ids
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    (async () => {
      await store.init();
      setSettings(await store.getSettings());
      track("view_style", { name: "Clip-in braids" });
    })();
  }, []);

  const shop = settings?.clipins || {};
  const types = shop.types || [];
  const colors = shop.colors || [];
  const extraList = shop.extras || [];
  const chosen = extraList.filter((x) => extras.includes(x.id));

  const toggleExtra = (id) =>
    setExtras((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));

  // total shown only once the braid itself has a price; add-on prices ride along
  const total = (+type?.price || 0) + (+color?.price || 0) + chosen.reduce((s, x) => s + (+x.price || 0), 0);
  const showTotal = (+type?.price || 0) > 0;

  const order = () => {
    if (!type) return toast(t("clipPickType"));
    if (colors.length && !color) return toast(t("clipPickColor"));
    const msg = t("waClip", {
      type: biName(type, lang),
      color: color ? biName(color, lang) : "—",
      extras: chosen.length ? chosen.map((x) => biName(x, lang)).join(" + ") : t("clipNone"),
      total: showTotal ? "\n• " + t("clipTotalLine", { n: total.toLocaleString() }) : "",
    });
    track("whatsapp", { name: "clipin:" + (type.name || type.nameAr || ""), value: showTotal ? total : undefined });
    if (typeof window !== "undefined") window.open(waLink(settings.whatsapp, msg), "_blank", "noopener");
  };

  const loading = !settings;
  const off = settings && (!shop.enabled || types.length === 0);
  const wa = settings ? waLink(settings.whatsapp, "") : "#";

  return (
    <div className="site">
      <ClipNav onOrder={order} />
      <div className="shell clipshop">
        <header className="cliphead">
          <div className="eyebrow2">Slay Studio · {t("locLine")}</div>
          <h1 className="h1">{t("clipTitle")}</h1>
          <p className="lede2">{t("clipLede")}</p>
        </header>

        {loading && (
          <div className="skelgrid" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="scard-skel" style={{ "--i": i }} />)}
          </div>
        )}

        {off && (
          <div className="scard-empty">
            <span className="big">🎀</span>
            {t("clipEmpty")}
            <div style={{ marginTop: 14 }}>
              <a className="findus-btn" href={wa} target="_blank" rel="noopener noreferrer">{t("chatOnWa")}</a>
            </div>
          </div>
        )}

        {!loading && !off && (
          <>
            {/* 01 — braid style */}
            <section className="clip-step">
              <div className="lane2-head">
                <span className="lane2-num">01</span>
                <h2 className="lane2-title">{t("clipStep1")}</h2>
                <span className="lane2-line" />
              </div>
              <div className="grid2">
                {types.map((g, gi) => {
                  const on = type?.id === g.id;
                  return (
                    <article key={g.id} className={"scard" + (on ? " on" : "")} style={{ "--i": gi % 9 }} onClick={() => setType(g)}>
                      <div
                        className="scard-img"
                        style={g.img ? { backgroundImage: `url(${cldImg(g.img, IMG.thumb)})` } : { background: TYPE_GRADS[gi % TYPE_GRADS.length] }}
                      >
                        {!g.img && (
                          <>
                            <span className="scard-flutes" />
                            <span className="scard-emoji">🎀</span>
                            <span className="scard-mono">{biName(g, lang).charAt(0)}</span>
                          </>
                        )}
                        {g.img && (
                          <span
                            className="scard-emoji"
                            style={{ cursor: "zoom-in" }}
                            onClick={(e) => { e.stopPropagation(); setZoom(cldImg(g.img, IMG.full)); }}
                          >🔍</span>
                        )}
                      </div>
                      <div className="scard-body">
                        <div className="scard-name">{biName(g, lang)}</div>
                        <div className="scard-foot">
                          {+g.price > 0
                            ? <div className="price2"><span className="amt">{(+g.price).toLocaleString()}</span> <span className="egp">{t("egp")}</span></div>
                            : <div className="price2 home">💬 {t("clipPriceAsk")}</div>}
                          <div className="go2">{on ? "✓" : "→"}</div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* 02 — color */}
            {colors.length > 0 && (
              <section className="clip-step">
                <div className="lane2-head">
                  <span className="lane2-num">02</span>
                  <h2 className="lane2-title">{t("clipStep2")}</h2>
                  <span className="lane2-line" />
                </div>
                <div className="swatches">
                  {colors.map((c) => (
                    <button key={c.id} type="button" className={"sw" + (color?.id === c.id ? " on" : "")} onClick={() => setColor(c)}>
                      {c.img
                        ? <span className="sw-dot img" style={{ backgroundImage: `url(${cldImg(c.img, IMG.swatch)})` }} />
                        : <span className="sw-dot" style={{ background: c.hex || "#666" }} />}
                      <span className="sw-name">
                        {biName(c, lang)}
                        {+c.price > 0 ? <span className="sw-add"> +{(+c.price).toLocaleString()}</span> : null}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 03 — chains & accessories */}
            {extraList.length > 0 && (
              <section className="clip-step">
                <div className="lane2-head">
                  <span className="lane2-num">{colors.length ? "03" : "02"}</span>
                  <h2 className="lane2-title">{t("clipStep3")}</h2>
                  <span className="lane2-line" />
                  <span className="clip-opt">{t("clipOptional")}</span>
                </div>
                <div className="chips">
                  {extraList.map((x) => {
                    const on = extras.includes(x.id);
                    return (
                      <div key={x.id} className={"chip" + (on ? " on" : "")} onClick={() => toggleExtra(x.id)}>
                        <div className="cs">{on ? "✓ " : ""}{biName(x, lang)}</div>
                        {+x.price > 0 && <div className="cp">+{(+x.price).toLocaleString()} {t("egp")}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* sticky order bar */}
            <div className="clipbar">
              <div className="clipbar-sum">
                {type ? <b>{biName(type, lang)}</b> : t("clipPickType")}
                {color ? <> · {biName(color, lang)}</> : null}
                {chosen.length > 0 ? <> · {chosen.map((x) => biName(x, lang)).join(" + ")}</> : null}
                {showTotal ? <span className="clipbar-total"> · {total.toLocaleString()} {t("egp")}</span> : null}
              </div>
              <button className="btn wa" onClick={order}>{t("clipOrderWa")}</button>
            </div>
            <small className="clipnote">{t("clipDeliveryNote")}</small>

            {/* cross-sell back to the booking site */}
            <div className="clipcross">
              <p>{t("clipCross")}</p>
              <a className="findus-btn" href="/">{t("ctaBook")}</a>
            </div>
          </>
        )}

        <footer className="sfoot">
          <img className="sfoot-logo" src="/logo-s.png" alt="" />
          Slay Studio · <b>@slaystudioforbraids</b> · {t("locLine")}
        </footer>
      </div>
      <Lightbox src={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}
