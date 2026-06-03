"use client";
import { USE_FB } from "@/lib/firebase";
import { useLang } from "@/lib/i18n";

export default function Hero({ subtitle }) {
  const { lang, setLang, t } = useLang();
  return (
    <div className="hero" style={subtitle ? { padding: "20px 4px 6px" } : { paddingTop: 20 }}>
      <div className="langtoggle">
        <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>العربية</button>
        <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
      </div>
      <div className="logo" style={subtitle ? { fontSize: 34 } : undefined}>slay studio</div>
      {subtitle ? (
        <div className="loc">{subtitle}</div>
      ) : (
        <>
          <div className="tag">{t("tagline")}</div>
          <div className="loc">{t("locLine")}</div>
          <div className={"modepill" + (USE_FB ? "" : " demo")}>
            <span className="dot" />
            {USE_FB ? t("live") + " · slay-studio.com" : t("demoDevice")}
          </div>
        </>
      )}
    </div>
  );
}
