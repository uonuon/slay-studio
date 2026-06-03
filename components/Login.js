"use client";
import { useState } from "react";
import { USE_FB } from "@/lib/firebase";
import { store } from "@/lib/store";
import { ADMIN_EMAIL, DEMO_ADMIN_PASS } from "@/lib/config";
import { toast } from "@/lib/util";

export default function Login({ onBack, onSuccess }) {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [pw, setPw] = useState("");

  const go = async () => {
    if (USE_FB) {
      try { await store.login(email, pw); onSuccess(); }
      catch (e) { toast("Wrong login"); }
    } else {
      if (pw === DEMO_ADMIN_PASS) onSuccess();
      else toast("Wrong passcode");
    }
  };

  return (
    <>
      <button className="link" onClick={onBack}>‹ back</button>
      <h2>Owner login</h2>
      <div className="card glass">
        {USE_FB ? (
          <>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
            <label style={{ marginTop: 12, display: "block" }}>Password</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
          </>
        ) : (
          <>
            <label>Passcode</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="passcode" />
            <small className="note">Demo passcode: {DEMO_ADMIN_PASS}</small>
          </>
        )}
        <button className="pink full" style={{ marginTop: 15 }} onClick={go}>
          {USE_FB ? "Log in" : "Enter"}
        </button>
      </div>
    </>
  );
}
