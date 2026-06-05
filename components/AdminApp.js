"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { USE_FB } from "@/lib/firebase";
import { useLang } from "@/lib/i18n";
import Login from "./Login";
import Dashboard from "./Dashboard";

function AdminHead() {
  const { t, lang, setLang } = useLang();
  return (
    <div className="adminhead">
      <div className="ah-top">
        <span className="ah-brand">Slay Studio<span className="dot">.</span></span>
        <div className="langtoggle">
          <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>ع</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
      </div>
      <span className="ah-sub">{t("ownerDashboard")}</span>
    </div>
  );
}

export default function AdminApp() {
  const router = useRouter();
  const { t } = useLang();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);

  const loadData = async () => {
    setServices(await store.getServices());
    setSettings(await store.getSettings());
  };

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      await store.init();
      await loadData();
      if (!USE_FB) { setReady(true); return; }
      // Restore a persisted owner session (no re-login needed)
      unsub = store.watchAuth(async (user) => {
        if (user) { await store.ensureSeed(); await loadData(); setAuthed(true); }
        else setAuthed(false);
        setReady(true);
      });
    })();
    return () => unsub();
  }, []);

  const onSuccess = async () => {
    if (USE_FB) await store.ensureSeed();
    await loadData();
    setAuthed(true);
  };

  if (!ready || !settings) {
    return (
      <div className="wrap">
        <AdminHead />
        <div className="empty" style={{ marginTop: 40 }}>{t("loading")}</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="wrap">
        <AdminHead />
        <div className="viewfade">
          <Login onBack={() => router.push("/")} onSuccess={onSuccess} />
        </div>
        <div className="foot">slay studio · <b>@braids.bymarmora</b></div>
      </div>
    );
  }

  return (
    <Dashboard
      services={services}
      settings={settings}
      setServices={setServices}
      setSettings={setSettings}
      onExit={() => router.push("/")}
    />
  );
}
