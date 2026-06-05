"use client";
import { useLang } from "@/lib/i18n";

export default function TopBar({ title, onBack }) {
  const { lang, setLang } = useLang();
  return (
    <header className="appbar">
      <div className="appbar-in">
        <button className="tb-back" onClick={onBack} aria-label="back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="tb-title">{title || "slay studio"}</div>
        <div className="langtoggle">
          <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>ع</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
      </div>
    </header>
  );
}
