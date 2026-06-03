"use client";
import { useLang } from "@/lib/i18n";

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="langtoggle">
      <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>ع</button>
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

export default function Hero({ subtitle }) {
  const { t } = useLang();

  if (subtitle) {
    return (
      <div className="hero compact">
        <div className="hero-top">
          <span className="eyebrow">slay studio</span>
          <LangToggle />
        </div>
        <div className="loc">{subtitle}</div>
      </div>
    );
  }

  return (
    <header className="hero-ed">
      <div className="hero-top">
        <span className="eyebrow">{t("locLine")}</span>
        <LangToggle />
      </div>
      <h1 className="wordmark">slay studio</h1>
      <div className="tagline">“{t("tagline")}”</div>
      <div className="rule"><span>✦</span></div>
    </header>
  );
}
