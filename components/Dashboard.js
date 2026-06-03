"use client";
import { useEffect, useRef, useState } from "react";
import { USE_FB } from "@/lib/firebase";
import { store } from "@/lib/store";
import { todayStr, dstr, uid, waLink, toast, families, fileToDataURL } from "@/lib/util";
import { useLang, fmtDateL, tName, dayShort } from "@/lib/i18n";
import Hero from "./Hero";

function Collapse({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <div className="collapse" onClick={() => setOpen(!open)}>
        <h2 style={{ margin: 0, fontSize: 19 }}>{title}</h2>
        <span style={{ color: "var(--faint)", fontSize: 18 }}>{open ? "－" : "＋"}</span>
      </div>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}

export default function Dashboard({ services, settings, setServices, setSettings, onExit }) {
  const { t } = useLang();
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("sched");
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      setBookings(await store.listBookings());
      unsub = store.subscribeBookings((bs) => setBookings(bs));
    })();
    return () => unsub();
  }, []);

  const refresh = async () => setBookings(await store.listBookings());
  const setStatus = async (id, status) => { await store.setStatus(id, status); if (!USE_FB) refresh(); };

  return (
    <div className="wrap">
      <Hero subtitle={t("ownerDashboard")} />
      {tab === "sched" && (
        <Schedule bookings={bookings} settings={settings} services={services} openAdd={openAdd} setOpenAdd={setOpenAdd} setStatus={setStatus} onAdded={refresh} />
      )}
      {tab === "money" && <Money bookings={bookings} settings={settings} />}
      {tab === "setup" && (
        <Setup services={services} settings={settings} setServices={setServices} setSettings={setSettings} />
      )}

      <div className="tabbar">
        {[["sched", "🗓️", t("tabSchedule")], ["money", "📊", t("tabMoney")], ["setup", "⚙️", t("tabSetup")]].map(([k, ic, lab]) => (
          <button key={k} className={"t" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
            <span className="ic">{ic}</span>{lab}
          </button>
        ))}
        <button className="t" onClick={async () => { await store.logout(); onExit(); }}>
          <span className="ic">↩︎</span>{t("tabExit")}
        </button>
      </div>
    </div>
  );
}

function BookingCard({ b, settings, setStatus }) {
  const { lang, t } = useLang();
  const dep = Math.round((b.price * settings.depositPct) / 100);
  const dateStr = fmtDateL(b.date, lang);
  const svcName = tName(b.serviceName, lang);
  const conf = t("waConfirm", { name: b.clientName, service: svcName, date: dateStr, time: b.start, dep: dep.toLocaleString(), ip: settings.instapay });
  const rem = t("waRemind", { name: b.clientName, service: svcName, date: dateStr, time: b.start });
  return (
    <div className="bk">
      <div className="top">
        <div>
          <div className="when">{dateStr} · {b.start}</div>
          <div className="svcn">{svcName}</div>
          <div className="meta">{b.clientName} · {b.clientPhone} · {b.price.toLocaleString()} {t("egp")}</div>
        </div>
        <span className={"badge b-" + b.status}>{t("st_" + b.status)}</span>
      </div>
      <div className="acts">
        {b.status === "pending" && <button className="pink sm" onClick={() => setStatus(b.id, "confirmed")}>{t("depositReceived")}</button>}
        {b.status === "confirmed" && <button className="ghost sm" onClick={() => setStatus(b.id, "done")}>{t("markDone")}</button>}
        <a className="btn wa sm" href={waLink(b.clientPhone, conf)} target="_blank" rel="noopener noreferrer">{t("confirmW")}</a>
        <a className="btn ghost sm" href={waLink(b.clientPhone, rem)} target="_blank" rel="noopener noreferrer">{t("remind")}</a>
        <button className="danger sm" onClick={() => { if (confirm(t("cancelQ"))) setStatus(b.id, "cancelled"); }}>{t("cancel")}</button>
      </div>
    </div>
  );
}

function Schedule({ bookings, settings, services, openAdd, setOpenAdd, setStatus, onAdded }) {
  const { lang, t } = useLang();
  const today = bookings.filter((b) => b.date === todayStr() && b.status !== "cancelled").sort((x, y) => x.start.localeCompare(y.start));
  const up = bookings.filter((b) => b.date > todayStr() && b.status !== "cancelled" && b.status !== "done").sort((x, y) => (x.date + x.start).localeCompare(y.date + y.start));
  const past = bookings
    .filter((b) => b.status === "done" || b.status === "cancelled" || (b.date < todayStr() && b.status !== "confirmed"))
    .sort((x, y) => (y.date + y.start).localeCompare(x.date + x.start)).slice(0, 25);

  return (
    <>
      <button className="ghost full" style={{ margin: "8px 0" }} onClick={() => setOpenAdd(!openAdd)}>{t("addBooking")}</button>
      {openAdd && <AddForm services={services} onAdded={() => { setOpenAdd(false); onAdded(); }} />}

      <h2>{t("today")}</h2>
      {today.length === 0 && <div className="card"><div className="empty"><span className="big">☕</span>{t("noToday")}</div></div>}
      {today.map((b) => <BookingCard key={b.id} b={b} settings={settings} setStatus={setStatus} />)}

      <h2>{t("upcoming")}</h2>
      {up.length === 0 && <div className="card"><div className="empty"><span className="big">🗓️</span>{t("noUpcoming")}</div></div>}
      {up.map((b) => <BookingCard key={b.id} b={b} settings={settings} setStatus={setStatus} />)}

      {past.length > 0 && (
        <Collapse title={t("history", { n: past.length })}>
          {past.map((b) => (
            <div key={b.id} className="bk" style={{ opacity: 0.8 }}>
              <div className="top">
                <div>
                  <div className="when">{fmtDateL(b.date, lang)} · {b.start}</div>
                  <div className="svcn">{tName(b.serviceName, lang)}</div>
                  <div className="meta">{b.clientName} · {b.price.toLocaleString()} {t("egp")}</div>
                </div>
                <span className={"badge b-" + b.status}>{t("st_" + b.status)}</span>
              </div>
            </div>
          ))}
        </Collapse>
      )}
    </>
  );
}

function AddForm({ services, onAdded }) {
  const { lang, t } = useLang();
  const [svId, setSvId] = useState(services[0]?.id || "");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const add = async () => {
    const s = services.find((x) => x.id === svId);
    if (!s) return;
    if (!/^\d{1,2}:\d{2}$/.test(time.trim())) return toast(t("timeFmt"));
    const b = {
      id: uid(), serviceId: s.id, serviceName: s.name, price: s.price, dur: s.dur,
      date, start: time.trim(), clientName: name.trim() || "Walk-in", clientPhone: phone.trim(),
      status: "confirmed", createdAt: Date.now(),
    };
    await store.createBooking(b);
    toast(t("added"));
    onAdded();
  };

  return (
    <div className="card glass">
      <label>{t("service")}</label>
      <select value={svId} onChange={(e) => setSvId(e.target.value)}>
        {services.map((s) => <option key={s.id} value={s.id}>{tName(s.name, lang)} — {s.price}</option>)}
      </select>
      <div className="row2" style={{ marginTop: 10 }}>
        <div><label>{t("date")}</label><input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label>{t("time")}</label><input value={time} onChange={(e) => setTime(e.target.value)} placeholder="14:00" /></div>
      </div>
      <label style={{ marginTop: 10, display: "block" }}>{t("clientName")}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("clientName")} />
      <label style={{ marginTop: 10, display: "block" }}>{t("phone")}</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
      <button className="pink full" style={{ marginTop: 12 }} onClick={add}>{t("addBookingBtn")}</button>
      <small className="note">{t("walkinNote")}</small>
    </div>
  );
}

function Money({ bookings, settings }) {
  const { t } = useLang();
  const ym = todayStr().slice(0, 7);
  const conf = bookings.filter((b) => b.date.slice(0, 7) === ym && (b.status === "confirmed" || b.status === "done"));
  const rev = conf.reduce((s, b) => s + b.price, 0);
  const pct = Math.min(100, Math.round((rev / settings.rent) * 100));
  const wkStart = new Date();
  wkStart.setDate(wkStart.getDate() - ((wkStart.getDay() + 6) % 7));
  const wk = bookings.filter((b) => b.status !== "cancelled" && new Date(b.date) >= new Date(dstr(wkStart)));
  const pend = bookings.filter((b) => b.status === "pending").length;

  return (
    <>
      <h2>{t("thisMonth")}</h2>
      <div className="tiles">
        <div className="tile"><div className="num">{(rev / 1000).toFixed(1)}k</div><div className="lab">{t("egpConfirmed")}</div></div>
        <div className="tile"><div className="num">{conf.length}</div><div className="lab">{t("bookingsLab")}</div></div>
        <div className="tile"><div className="num">{wk.length}</div><div className="lab">{t("thisWeek")}</div></div>
      </div>
      <div className="card glass">
        <div className="meta" style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)" }}>
          <span>{t("vsRent", { n: settings.rent.toLocaleString() })}</span><span style={{ color: "#fff" }}>{pct}%</span>
        </div>
        <div className="bar"><i style={{ width: pct + "%" }} /></div>
        <small className="note">
          {pct >= 100 ? t("rentCovered") : t("moreBookings", { n: Math.max(0, Math.ceil((settings.rent - rev) / 1800)) })}
        </small>
      </div>
      {pend > 0 && (
        <div className="card"><div className="meta" style={{ color: "var(--warn)" }}>{t("pendingWaiting", { n: pend })}</div></div>
      )}
    </>
  );
}

function Setup({ services, settings, setServices, setSettings }) {
  const { lang, t } = useLang();
  const [days, setDays] = useState([...settings.workDays]);
  const [open, setOpen] = useState(settings.openTime);
  const [close, setClose] = useState(settings.closeTime);
  const [step, setStep] = useState(settings.slotStep);

  const saveAvail = async () => {
    const ns = { ...settings, workDays: [...days].sort(), openTime: open, closeTime: close, slotStep: +step };
    await store.saveSettings(ns); setSettings(ns); toast(t("saved"));
  };

  return (
    <>
      <h2>{t("availability")}</h2>
      <div className="card glass">
        <label>{t("workingDays")}</label>
        <div className="days">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={"day" + (days.includes(i) ? " on" : "")}
              onClick={() => setDays((ds) => ds.includes(i) ? ds.filter((x) => x !== i) : [...ds, i])}>{dayShort(i, lang)}</div>
          ))}
        </div>
        <div className="row2" style={{ marginTop: 12 }}>
          <div><label>{t("open")}</label><input value={open} onChange={(e) => setOpen(e.target.value)} /></div>
          <div><label>{t("close")}</label><input value={close} onChange={(e) => setClose(e.target.value)} /></div>
        </div>
        <label style={{ marginTop: 10, display: "block" }}>{t("slotStep")}</label>
        <input value={step} onChange={(e) => setStep(e.target.value)} />
        <button className="pink full" style={{ marginTop: 12 }} onClick={saveAvail}>{t("saveAvailability")}</button>
      </div>

      <Collapse title={t("servicesPrices")}>
        {services.map((s) => (
          <ServiceRow key={s.id} s={s} setServices={setServices} />
        ))}
        <AddService setServices={setServices} />
      </Collapse>

      <Collapse title={t("stylePhotos")}>
        <StylePhotos services={services} setServices={setServices} />
      </Collapse>

      <Collapse title={t("studioSettings")}>
        <StudioSettings settings={settings} setSettings={setSettings} />
      </Collapse>
    </>
  );
}

function ServiceRow({ s, setServices }) {
  const { lang, t } = useLang();
  const [price, setPrice] = useState(s.price);
  const [dur, setDur] = useState(s.dur);
  return (
    <div className="card" style={{ margin: "8px 0", background: "var(--card-2)" }}>
      <div className="svcn" style={{ color: "#fff", marginBottom: 8 }}>{tName(s.name, lang)}</div>
      <div className="row2">
        <div><label>{t("priceLab")}</label><input value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label>{t("minLab")}</label><input value={dur} onChange={(e) => setDur(e.target.value)} /></div>
      </div>
      <div className="acts">
        <button className="pink sm" onClick={async () => { await store.saveService({ ...s, price: +price, dur: +dur }); setServices(await store.getServices()); toast(t("saved")); }}>{t("save")}</button>
        <button className="danger sm" onClick={async () => { if (confirm(t("removeQ", { x: tName(s.name, lang) }))) { await store.delService(s.id); setServices(await store.getServices()); } }}>{t("remove")}</button>
      </div>
    </div>
  );
}

function AddService({ setServices }) {
  const { lang, t } = useLang();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [dur, setDur] = useState("");
  const [lane, setLane] = useState("Slay Studio");
  return (
    <div className="card" style={{ margin: "8px 0", background: "var(--card-2)" }}>
      <div className="svcn" style={{ color: "#fff", marginBottom: 8 }}>{t("addServiceTitle")}</div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("serviceNamePh")} />
      <div className="row2" style={{ marginTop: 8 }}>
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t("pricePh")} />
        <input value={dur} onChange={(e) => setDur(e.target.value)} placeholder={t("minutesPh")} />
      </div>
      <select style={{ marginTop: 8 }} value={lane} onChange={(e) => setLane(e.target.value)}>
        <option value="Slay Studio">Slay Studio</option>
        <option value="Little Slays">Little Slays</option>
        <option value="Signature">Signature</option>
      </select>
      <button className="pink full" style={{ marginTop: 10 }} onClick={async () => {
        if (!name || !price) return toast(t("nameAndPrice"));
        await store.addService({ id: uid(), lane, name, price: +price, dur: +dur || 120 });
        setServices(await store.getServices());
        setName(""); setPrice(""); setDur("");
      }}>{t("addBtn")}</button>
    </div>
  );
}

function StylePhotos({ services, setServices }) {
  const { lang, t } = useLang();
  const fams = families(services);

  const setFamilyImg = async (famName, img) => {
    const all = await store.getServices();
    for (const x of all) if (x.name.split(" · ")[0] === famName) await store.saveService({ ...x, img });
    setServices(await store.getServices());
  };

  return (
    <>
      <small className="note" style={{ marginBottom: 6 }}>{t("photoNote")}</small>
      {fams.map((f) => (
        <PhotoRow key={f.name} fam={f} lang={lang} t={t} onSet={setFamilyImg} />
      ))}
    </>
  );
}

function PhotoRow({ fam, lang, t, onSet }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const img = fam.opts.find((o) => o.img)?.img;

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const url = await fileToDataURL(file);
      await onSet(fam.name, url);
      toast(t("photoSaved"));
    } catch (err) {
      toast("⚠︎");
    }
    setBusy(false);
  };

  return (
    <div className="card" style={{ margin: "8px 0", background: "var(--card-2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {img
          ? <div className="thumb img" style={{ backgroundImage: `url(${img})`, width: 56, height: 56, flex: "0 0 56px" }} />
          : <div className="thumb" style={{ background: "rgba(255,255,255,.06)", width: 56, height: 56, flex: "0 0 56px", fontSize: 22 }}>📷</div>}
        <div style={{ flex: 1 }}>
          <div className="svcn" style={{ color: "#fff" }}>{tName(fam.name, lang)}</div>
          <div className="meta" style={{ fontSize: 11.5, color: "var(--muted)" }}>{img ? "" : t("noPhoto")}</div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={pick} style={{ display: "none" }} />
      <div className="acts">
        <button className="pink sm" disabled={busy} onClick={() => inputRef.current?.click()}>{img ? t("changePhoto") : t("uploadPhoto")}</button>
        {img && <button className="danger sm" disabled={busy} onClick={async () => { await onSet(fam.name, ""); toast(t("photoRemoved")); }}>{t("removePhoto")}</button>}
      </div>
    </div>
  );
}

function StudioSettings({ settings, setSettings }) {
  const { t } = useLang();
  const [wa, setWa] = useState(settings.whatsapp);
  const [ip, setIp] = useState(settings.instapay);
  const [dp, setDp] = useState(settings.depositPct);
  const [rt, setRt] = useState(settings.rent);
  return (
    <div>
      <label>{t("waCC")}</label>
      <input value={wa} onChange={(e) => setWa(e.target.value)} />
      <label style={{ marginTop: 10, display: "block" }}>{t("instapayNumber")}</label>
      <input value={ip} onChange={(e) => setIp(e.target.value)} />
      <div className="row2" style={{ marginTop: 10 }}>
        <div><label>{t("depositPct")}</label><input value={dp} onChange={(e) => setDp(e.target.value)} /></div>
        <div><label>{t("monthlyRent")}</label><input value={rt} onChange={(e) => setRt(e.target.value)} /></div>
      </div>
      <button className="pink full" style={{ marginTop: 12 }} onClick={async () => {
        const ns = { ...settings, whatsapp: wa, instapay: ip, depositPct: +dp, rent: +rt };
        await store.saveSettings(ns); setSettings(ns); toast(t("saved"));
      }}>{t("saveSettings")}</button>
    </div>
  );
}
