"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { USE_FB } from "@/lib/firebase";
import { useLang } from "@/lib/i18n";
import Hero from "./Hero";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function AdminApp() {
  const router = useRouter();
  const { t } = useLang();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    (async () => {
      await store.init();
      setSettings(await store.getSettings());
      setServices(await store.getServices());
      setReady(true);
    })();
  }, []);

  const onSuccess = async () => {
    if (USE_FB) await store.ensureSeed();
    setServices(await store.getServices());
    setSettings(await store.getSettings());
    setAuthed(true);
  };

  if (!ready || !settings) {
    return (
      <div className="wrap">
        <Hero subtitle={t("ownerDashboard")} />
        <div className="empty" style={{ marginTop: 40 }}>{t("loading")}</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="wrap">
        <Hero subtitle={t("ownerDashboard")} />
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
