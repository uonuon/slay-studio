"use client";
// Standalone split entry screen — the first thing a visitor sees on "/".
// Ad traffic self-selects: "customize your clip-in braid" → /clip-ins, or
// "book your braids at the studio" → enters the booking homepage.
// Renders instantly (no data needed), so ad landings feel immediate.
import { useLang } from "@/lib/i18n";

export default function SplitGate({ onStudio }) {
  const { lang, setLang, t } = useLang();
  const goClip = () => { if (typeof window !== "undefined") window.location.href = "/clip-ins"; };
  return (
    <div className="gatewrap">
      <header className="gate-head">
        <span className="snav-brand" style={{ textDecoration: "none" }}>
          <img className="snav-logo" src="/logo-s.png" alt="Slay Studio logo" />
          Slay Studio<span className="dot">.</span>
        </span>
        <div className="langtoggle">
          <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>ع</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
      </header>

      <section className="gate">
        <div className="gate-panel" onClick={goClip} role="link" tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goClip()}>
          <div className="gate-bg" style={{ backgroundImage: "url(/hero-clip.jpg)" }} />
          <div className="gate-copy">
            <span className="gate-kicker">🎀 {t("gateClipKicker")}</span>
            <h2 className="gate-title">{t("gateClipTitle")}</h2>
            <p className="gate-sub">{t("gateClipSub")}</p>
            <a className="gate-btn" href="/clip-ins" onClick={(e) => e.stopPropagation()}>
              {t("clipBandBtn")} <span className="gate-arr">→</span>
            </a>
          </div>
        </div>
        <div className="gate-panel" onClick={onStudio} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onStudio()}>
          <div className="gate-bg" style={{ backgroundImage: "url(/hero-braids.jpg)" }} />
          <div className="gate-copy">
            <span className="gate-kicker">✨ {t("gateStudioKicker")}</span>
            <h2 className="gate-title">{t("gateStudioTitle")}</h2>
            <p className="gate-sub">{t("gateStudioSub")}</p>
            <button className="gate-btn" onClick={(e) => { e.stopPropagation(); onStudio(); }}>
              {t("ctaBook")} <span className="gate-arr">→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
