"use client";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { USE_FB } from "@/lib/firebase";
import { firstWorkingDay } from "@/lib/util";
import Hero from "./Hero";
import Home from "./Home";
import Booking from "./Booking";
import Confirm from "./Confirm";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("home");
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [sel, setSel] = useState({});
  const [, setAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      await store.init();
      setServices(await store.getServices());
      setSettings(await store.getSettings());
      setReady(true);
    })();
  }, []);

  const goBook = (family) => {
    setSel({
      family,
      service: family.opts.length === 1 ? family.opts[0] : null,
      date: firstWorkingDay(settings),
    });
    setView("book");
  };

  const onBooked = (b) => {
    setSel((s) => ({ ...s, booking: b }));
    setView("confirm");
  };

  const onLoginSuccess = async () => {
    if (USE_FB) {
      await store.ensureSeed();
      setServices(await store.getServices());
      setSettings(await store.getSettings());
    }
    setAdmin(true);
    setView("admin");
  };

  if (!ready || !settings) {
    return (
      <div className="wrap">
        <Hero />
        <div className="empty" style={{ marginTop: 40 }}>loading…</div>
      </div>
    );
  }

  if (view === "admin") {
    return (
      <Dashboard
        services={services}
        settings={settings}
        setServices={setServices}
        setSettings={setSettings}
        onExit={() => { setAdmin(false); setView("home"); }}
      />
    );
  }

  return (
    <div className="wrap">
      <Hero />
      <div className="viewfade" key={view}>
        {view === "home" && (
          <Home services={services} onPick={goBook} onLogin={() => setView("login")} />
        )}
        {view === "book" && (
          <Booking
            sel={sel}
            setSel={setSel}
            settings={settings}
            onBack={() => setView("home")}
            onBooked={onBooked}
          />
        )}
        {view === "confirm" && (
          <Confirm booking={sel.booking} settings={settings} onHome={() => setView("home")} />
        )}
        {view === "login" && (
          <Login onBack={() => setView("home")} onSuccess={onLoginSuccess} />
        )}
      </div>
      <div className="foot">slay studio · <b>@braids.bymarmora</b></div>
    </div>
  );
}
