"use client";
import { useState } from "react";
import { USE_FB } from "@/lib/firebase";
import { store } from "@/lib/store";
import { DEMO_ADMIN_PASS } from "@/lib/config";
import { toast } from "@/lib/util";
import { useLang } from "@/lib/i18n";

export default function Login({ onBack, onSuccess }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const go = async () => {
    if (USE_FB) {
      try { await store.login(email, pw); onSuccess(); }
      catch (e) { toast(t("wrongLogin")); }
    } else {
      if (pw === DEMO_ADMIN_PASS) onSuccess();
      else toast(t("wrongPasscode"));
    }
  };

  return (
    <>
      <button className="link" onClick={onBack}>{t("back")}</button>
      <div className="login-head">
        <div className="login-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
            <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
          </svg>
        </div>
        <h2 style={{ textAlign: "center", margin: "12px 0 0" }}>{t("ownerLogin")}</h2>
      </div>
      <div className="card glass">
        {USE_FB ? (
          <>
            <label>{t("email")}</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="support@slay-studio.com" type="email" autoComplete="username" />
            <label style={{ marginTop: 12, display: "block" }}>{t("password")}</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
          </>
        ) : (
          <>
            <label>{t("passcode")}</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="passcode" />
            <small className="note">{t("demoPasscode", { x: DEMO_ADMIN_PASS })}</small>
          </>
        )}
        <button className="pink full" style={{ marginTop: 15 }} onClick={go}>
          {USE_FB ? t("logIn") : t("enter")}
        </button>
      </div>
    </>
  );
}
