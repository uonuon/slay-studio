"use client";
// Clip-in braids shop (/clip-ins): guided flow — pick a braid style first,
// then the color step reveals, then chains & accessories, then order on
// WhatsApp with the choices pre-written. No booking is saved — the chat
// handles price confirmation, payment and delivery.
// Each braid type carries a swipeable strip of photos (settings.clipins
// types[].imgs); colors & extras render as photo tiles.
import { useEffect, useRef, useState } from "react";
import { store } from "@/lib/store";
import { waLink, toast } from "@/lib/util";
import { track } from "@/lib/analytics";
import { cldImg, IMG } from "@/lib/img";
import { useLang, biName } from "@/lib/i18n";
import Lightbox from "./Lightbox";

// dark placeholder gradients rotated across type cards until photos are uploaded
const TYPE_GRADS = [
  "linear-gradient(150deg,#3A1F42,#22132B)",
  "linear-gradient(150deg,#4A1B3C,#2A1226)",
  "linear-gradient(150deg,#3C1530,#1E0F1E)",
  "linear-gradient(150deg,#2C1B3E,#191223)",
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

// One braid-type card with a swipeable photo strip. Tap the card to choose the
// type; once chosen, tapping a photo opens it full-screen.
function TypeCard({ g, on, idx, onPick, onZoom }) {
  const { lang, t } = useLang();
  const stripRef = useRef(null);
  const [slide, setSlide] = useState(0);
  const imgs = g.imgs?.length ? g.imgs : g.img ? [g.img] : [];

  const onScroll = (e) => {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    setSlide((s) => (s === i ? s : i));
  };
  const nudge = (d) => (e) => {
    e.stopPropagation();
    stripRef.current?.scrollBy({ left: d * stripRef.current.clientWidth, behavior: "smooth" });
  };

  return (
    <article className={"scard" + (on ? " on" : "")} style={{ "--i": idx % 9 }} onClick={() => onPick(g)}>
      <div className="scard-media">
        {imgs.length ? (
          <>
            {/* strip is always LTR so slide math stays simple in Arabic too */}
            <div className="scard-strip" dir="ltr" ref={stripRef} onScroll={onScroll}>
              {imgs.map((src, i) => (
                <div
                  key={i}
                  className="scard-slide"
                  style={{ backgroundImage: `url(${cldImg(src, IMG.thumb)})` }}
                  onClick={(e) => { if (on) { e.stopPropagation(); onZoom(cldImg(src, IMG.full)); } }}
                />
              ))}
            </div>
            {imgs.length > 1 && (
              <>
                <button className="strip-nav prev" onClick={nudge(-1)} aria-label="previous photo">‹</button>
                <button className="strip-nav next" onClick={nudge(1)} aria-label="next photo">›</button>
                <div className="scard-dots">{imgs.map((_, i) => <i key={i} className={i === slide ? "on" : ""} />)}</div>
              </>
            )}
          </>
        ) : (
          <div className="scard-slide ph" style={{ background: TYPE_GRADS[idx % TYPE_GRADS.length] }}>
            <span className="scard-flutes" />
            <span className="scard-mono">{biName(g, lang).charAt(0)}</span>
          </div>
        )}
        <span className="scard-emoji">🎀</span>
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
}

// Solid or ombré swatch background from a color's hex stops
const swatchBg = (c) => {
  const stops = [c.hex, c.hex2, c.hex3].filter(Boolean);
  return stops.length > 1 ? `linear-gradient(180deg, ${stops.join(", ")})` : stops[0] || "#666";
};

// Photo tile for a color or an extra (falls back to hex/ombré swatch / 🎀)
function OptTile({ it, on, onPick, t }) {
  const { lang } = useLang();
  return (
    <button type="button" className={"clipopt" + (on ? " on" : "")} onClick={() => onPick(it)}>
      {it.img
        ? <span className="im" style={{ backgroundImage: `url(${cldImg(it.img, IMG.thumb)})` }} />
        : it.hex
          ? <span className="im" style={{ background: swatchBg(it) }} />
          : <span className="im ph2">🎀</span>}
      <span className="nm">
        {on ? "✓ " : ""}{biName(it, lang)}
        {+it.price > 0 ? <i className="ad"> +{(+it.price).toLocaleString()} {t("egp")}</i> : null}
      </span>
    </button>
  );
}

// Compact named swatch chip (photo-less colors) — the dot shows the solid
// shade or the ombré gradient of the actual pack
function ColorChip({ c, on, onPick, dotBg, children }) {
  return (
    <button type="button" className={"sw" + (on ? " on" : "")} onClick={() => onPick(c)}>
      <span className="sw-dot" style={{ background: dotBg || swatchBg(c) }} />
      <span className="sw-name">{children}</span>
    </button>
  );
}

// sentinel for "any other color — decided in the WhatsApp chat"
const ASK_COLOR = { id: "ask", ask: true };

export default function ClipShop() {
  const { lang, t } = useLang();
  const [settings, setSettings] = useState(null);
  const [type, setType] = useState(null);
  const [color, setColor] = useState(null);
  const [extras, setExtras] = useState([]); // selected extra ids
  const [zoom, setZoom] = useState(null);
  const colorRef = useRef(null);
  const extraRef = useRef(null);

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

  // guided reveal: colors open after a braid is picked, extras after a color
  const colorsOpen = !!type && colors.length > 0;
  const extrasOpen = !!type && (color || !colors.length) && extraList.length > 0;
  const barOpen = !!type && (color || !colors.length);

  const scrollTo = (ref) =>
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 90);

  const pickType = (g) => {
    setType(g);
    if (colors.length) scrollTo(colorRef);
    else if (extraList.length) scrollTo(extraRef);
  };
  const pickColor = (c) => {
    setColor(c);
    if (extraList.length) scrollTo(extraRef);
  };
  const toggleExtra = (x) =>
    setExtras((xs) => (xs.includes(x.id) ? xs.filter((i) => i !== x.id) : [...xs, x.id]));

  // total shown only once the braid itself has a price; add-on prices ride along
  const total = (+type?.price || 0) + (+color?.price || 0) + chosen.reduce((s, x) => s + (+x.price || 0), 0);
  const showTotal = (+type?.price || 0) > 0;

  const order = () => {
    if (!type) return toast(t("clipPickType"));
    if (colors.length && !color) return toast(t("clipPickColor"));
    const msg = t("waClip", {
      type: biName(type, lang),
      color: color ? (color.ask ? t("clipColorAskMsg") : biName(color, lang)) : "—",
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
            {/* 01 — braid style (always open) */}
            <section className="clip-step">
              <div className="lane2-head">
                <span className="lane2-num">01</span>
                <h2 className="lane2-title">{t("clipStep1")}</h2>
                <span className="lane2-line" />
              </div>
              <div className="grid2">
                {types.map((g, gi) => (
                  <TypeCard key={g.id} g={g} idx={gi} on={type?.id === g.id} onPick={pickType} onZoom={setZoom} />
                ))}
              </div>
            </section>

            {/* 02 — color (opens after a braid is picked) */}
            {colorsOpen && (
              <section className="clip-step viewfade" ref={colorRef}>
                <div className="lane2-head">
                  <span className="lane2-num">02</span>
                  <h2 className="lane2-title">{t("clipStep2")}</h2>
                  <span className="lane2-line" />
                </div>
                {/* colors WITH a real photo show as big tiles; the rest as
                    named swatch chips (ombrés render their gradient) */}
                {colors.some((c) => c.img) && (
                  <div className="clipopts" style={{ marginBottom: 14 }}>
                    {colors.filter((c) => c.img).map((c) => (
                      <OptTile key={c.id} it={c} on={color?.id === c.id} onPick={pickColor} t={t} />
                    ))}
                  </div>
                )}
                <div className="swatches">
                  {colors.filter((c) => !c.img).map((c) => (
                    <ColorChip key={c.id} c={c} on={color?.id === c.id} onPick={pickColor}>
                      {color?.id === c.id ? "✓ " : ""}{biName(c, lang)}
                      {+c.price > 0 ? <span className="sw-add"> +{(+c.price).toLocaleString()}</span> : null}
                    </ColorChip>
                  ))}
                  <ColorChip c={ASK_COLOR} on={color?.id === "ask"} onPick={pickColor}
                    dotBg="conic-gradient(#E23A8E,#E9D5A4,#187055,#1F4FA3,#6E3AA7,#E23A8E)">
                    {color?.id === "ask" ? "✓ " : ""}🎨 {t("clipMoreColors")}
                  </ColorChip>
                </div>
              </section>
            )}

            {/* 03 — chains & accessories (opens after the color) */}
            {extrasOpen && (
              <section className="clip-step viewfade" ref={extraRef}>
                <div className="lane2-head">
                  <span className="lane2-num">{colors.length ? "03" : "02"}</span>
                  <h2 className="lane2-title">{t("clipStep3")}</h2>
                  <span className="lane2-line" />
                  <span className="clip-opt">{t("clipOptional")}</span>
                </div>
                <div className="clipopts">
                  {extraList.map((x) => (
                    <OptTile key={x.id} it={x} on={extras.includes(x.id)} onPick={toggleExtra} t={t} />
                  ))}
                </div>
              </section>
            )}

            {/* sticky order bar (appears once braid + color are chosen) */}
            {barOpen && (
              <div className="viewfade">
                <div className="clipbar">
                  <div className="clipbar-sum">
                    <b>{biName(type, lang)}</b>
                    {color ? <> · {color.ask ? "🎨 " + t("clipColorAskShort") : biName(color, lang)}</> : null}
                    {chosen.length > 0 ? <> · {chosen.map((x) => biName(x, lang)).join(" + ")}</> : null}
                    {showTotal ? <span className="clipbar-total"> · {total.toLocaleString()} {t("egp")}</span> : null}
                  </div>
                  <button className="btn wa" onClick={order}>{t("clipOrderWa")}</button>
                </div>
                <small className="clipnote">{t("clipDeliveryNote")}</small>
              </div>
            )}

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
