"use client";
import { useLang } from "@/lib/i18n";

// Editorial light hero for the home screen. The curated braids photo fills the
// arch (kept stable — not swapped for owner style thumbnails).
export default function Hero({ onBook }) {
  const { t } = useLang();

  return (
    <div className="hero2">
      <div className="hero2-copy">
        <div className="eyebrow2">{t("heroEyebrow")}</div>
        <h1 className="h1">
          {t("heroL1")} <em>{t("heroEm")}</em><br />{t("heroL2")}
        </h1>
        <p className="lede2">{t("heroLede")}</p>
        <div className="cta-row">
          <button className="btn2 btn2-primary" onClick={onBook}>{t("ctaBook")} →</button>
          <button className="btn2 btn2-ghost" onClick={onBook}>{t("ctaBrowse")}</button>
        </div>
        <div className="trust2">
          <span className="chip2"><span className="t2-stars">★★★★★</span> <b>4.9</b></span>
          <span className="chip2">{t("chipHealthy")}</span>
          <span className="chip2">{t("chipDeposit")}</span>
        </div>
      </div>

      <div className="arch-wrap">
        <div className="arch">
          <div className="arch-photo" style={{ backgroundImage: "url(/hero-braids.jpg)" }} />
        </div>
        <div className="arch-badge" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <defs>
              <path id="abc" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            <text fill="#4C3F35" fontSize="8.8" letterSpacing="1.4">
              <textPath href="#abc">SLAY STUDIO ✦ NEW CAIRO ✦ BRAIDS ✦</textPath>
            </text>
          </svg>
          <span className="arch-badge-c">✦</span>
        </div>
      </div>
    </div>
  );
}
