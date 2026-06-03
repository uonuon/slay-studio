"use client";
import { useLang } from "@/lib/i18n";

export default function TopBar({ title, onBack }) {
  const { lang, setLang } = useLang();
  return (
    <div className="topbar">
      <button className="tb-back" onClick={onBack} aria-label="back">‹</button>
      <div className="tb-title">{title || "slay studio"}</div>
      <div className="langtoggle sm">
        <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>ع</button>
        <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
      </div>
    </div>
  );
}
