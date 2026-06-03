"use client";
import { useState } from "react";
import { USE_FB } from "@/lib/firebase";
import { store } from "@/lib/store";
import { ADMIN_EMAIL, DEMO_ADMIN_PASS } from "@/lib/config";
import { toast } from "@/lib/util";
import { useLang } from "@/lib/i18n";

export default function Login({ onBack, onSuccess }) {
  const { t } = useLang();
  const [email, setEmail] = useState(ADMIN_EMAIL);
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
      <h2>{t("ownerLogin")}</h2>
      <div className="card glass">
        {USE_FB ? (
          <>
            <label>{t("email")}</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
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
