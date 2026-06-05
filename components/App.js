"use client";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { firstWorkingDay } from "@/lib/util";
import { track } from "@/lib/analytics";
import { useLang, tName } from "@/lib/i18n";
import Hero from "./Hero";
import TopBar from "./TopBar";
import Home from "./Home";
import Booking from "./Booking";
import Confirm from "./Confirm";

function SiteNav({ onBook }) {
  const { lang, setLang, t } = useLang();
  return (
    <nav className="snav">
      <div className="snav-in">
        <div className="snav-brand">Slay Studio<span className="dot">.</span></div>
        <div className="snav-sp" />
        <div className="langtoggle">
          <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>ع</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
        <button className="snav-book" onClick={onBook}>{t("ctaBook")}</button>
      </div>
    </nav>
  );
}

export default function App() {
  const { lang, t } = useLang();
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
    track("view_style", { name: family.group, value: Math.min(...family.opts.map((o) => o.price)) });
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

  const scrollToStyles = () => {
    const el = typeof document !== "undefined" && document.getElementById("styles");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  if (!ready || !settings) {
    return (
      <div className="site">
        <SiteNav onBook={scrollToStyles} />
        <div className="shell">
          <Hero onBook={scrollToStyles} />
          <div className="scard-empty" style={{ marginTop: 24 }}>{t("loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="site">
      {view === "home" && <SiteNav onBook={scrollToStyles} />}
      {view === "book" && <TopBar title={sel.family ? tName(sel.family.group, lang) : ""} onBack={() => setView("home")} />}
      {view === "confirm" && <TopBar onBack={() => setView("home")} />}

      <div className="shell">
        {view === "home" && (
          <>
            <Hero onBook={scrollToStyles} />
            <div className="viewfade" key="home">
              <Home services={services} settings={settings} onPick={goBook} />
            </div>
            <div className="sfoot">Slay Studio · <b>@braids.bymarmora</b> · Fifth Settlement, New Cairo</div>
          </>
        )}

        {view === "book" && (
          <div className="viewfade" key="book">
            <Booking
              sel={sel}
              setSel={setSel}
              settings={settings}
              onBack={() => setView("home")}
              onBooked={onBooked}
            />
          </div>
        )}

        {view === "confirm" && (
          <div className="viewfade" key="confirm">
            <div className="formcol">
              <Confirm booking={sel.booking} settings={settings} onHome={() => setView("home")} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
