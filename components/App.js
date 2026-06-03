"use client";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { firstWorkingDay } from "@/lib/util";
import { useLang } from "@/lib/i18n";
import Hero from "./Hero";
import Home from "./Home";
import Booking from "./Booking";
import Confirm from "./Confirm";

export default function App() {
  const { t } = useLang();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("home");
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [sel, setSel] = useState({});

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

  if (!ready || !settings) {
    return (
      <div className="wrap">
        <Hero />
        <div className="empty" style={{ marginTop: 40 }}>{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Hero />
      <div className="viewfade" key={view}>
        {view === "home" && <Home services={services} onPick={goBook} />}
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
      </div>
      <div className="foot">slay studio · <b>@braids.bymarmora</b></div>
    </div>
  );
}
