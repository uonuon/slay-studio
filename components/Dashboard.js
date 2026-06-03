"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { USE_FB } from "@/lib/firebase";
import { store } from "@/lib/store";
import { todayStr, dstr, uid, waLink, toast, groupKey, normPhone, fileToDataURL } from "@/lib/util";
import { useLang, fmtDateL, tName, dayShort } from "@/lib/i18n";

function AdLang() {
  const { lang, setLang } = useLang();
  return (
    <div className="langtoggle">
      <button className={lang === "ar" ? "on" : ""} onClick={() => setLang("ar")}>ع</button>
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

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
  const exit = async () => { await store.logout(); onExit(); };

  const TABS = [
    ["sched", "🗓️", t("tabSchedule")],
    ["clients", "👥", t("tabClients")],
    ["money", "📊", t("tabMoney")],
    ["setup", "⚙️", t("tabSetup")],
  ];
  const title = (TABS.find((x) => x[0] === tab) || [])[2];

  return (
    <div className="admin">
      <aside className="adside">
        <div className="adbrand">slay studio</div>
        <nav className="adnav">
          {TABS.map(([k, ic, lab]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              <span className="ic">{ic}</span>{lab}
            </button>
          ))}
        </nav>
        <button className="adside-exit" onClick={exit}><span className="ic">↩︎</span>{t("tabExit")}</button>
      </aside>

      <main className="admain">
        <header className="adtop">
          <h1>{title}</h1>
          <AdLang />
        </header>
        <div className="adcontent">
          {tab === "sched" && (
            <Schedule bookings={bookings} settings={settings} services={services} openAdd={openAdd} setOpenAdd={setOpenAdd} setStatus={setStatus} onAdded={refresh} />
          )}
          {tab === "clients" && <Clients bookings={bookings} settings={settings} />}
          {tab === "money" && <Money bookings={bookings} settings={settings} />}
          {tab === "setup" && (
            <Setup services={services} settings={settings} setServices={setServices} setSettings={setSettings} />
          )}
        </div>
      </main>

      <div className="adbottom">
        {TABS.map(([k, ic, lab]) => (
          <button key={k} className={"t" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
            <span className="ic">{ic}</span>{lab}
          </button>
        ))}
        <button className="t" onClick={exit}><span className="ic">↩︎</span>{t("tabExit")}</button>
      </div>
    </div>
  );
}

function BookingCard({ b, settings, services = [], setStatus, onChanged }) {
  const { lang, t } = useLang();
  const dep = Math.round((b.price * settings.depositPct) / 100);
  const dateStr = fmtDateL(b.date, lang);
  const svcName = tName(b.serviceName, lang);
  const conf = t("waConfirm", { name: b.clientName, service: svcName, date: dateStr, time: b.start, dep: dep.toLocaleString(), ip: settings.instapay });
  const rem = t("waRemind", { name: b.clientName, service: svcName, date: dateStr, time: b.start });
  const editable = b.status !== "done" && b.status !== "cancelled";
  const [editing, setEditing] = useState(false);
  const [svId, setSvId] = useState(b.serviceId);
  const [date, setDate] = useState(b.date);
  const [time, setTime] = useState(b.start);

  const saveEdit = async () => {
    if (!/^\d{1,2}:\d{2}$/.test(time.trim())) return toast(t("timeFmt"));
    const s = services.find((x) => x.id === svId);
    const nb = { ...b, date, start: time.trim(), ...(s ? { serviceId: s.id, serviceName: s.name, price: s.price, dur: s.dur } : {}) };
    await store.updateBooking(nb);
    setEditing(false); toast(t("saved"));
    onChanged && onChanged();
  };

  return (
    <div className={"bk bk-" + b.status}>
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
        {editable && <button className={"ghost sm" + (editing ? " on" : "")} onClick={() => setEditing((v) => !v)}>{t("edit")}</button>}
        <a className="btn wa sm" href={waLink(b.clientPhone, conf)} target="_blank" rel="noopener noreferrer">{t("confirmW")}</a>
        <a className="btn ghost sm" href={waLink(b.clientPhone, rem)} target="_blank" rel="noopener noreferrer">{t("remind")}</a>
        <button className="danger sm" onClick={() => { if (confirm(t("cancelQ"))) setStatus(b.id, "cancelled"); }}>{t("cancel")}</button>
      </div>

      {editing && (
        <div className="card glass" style={{ marginTop: 11 }}>
          <label>{t("changeService")}</label>
          <select value={svId} onChange={(e) => setSvId(e.target.value)}>
            {services.map((s) => <option key={s.id} value={s.id}>{tName(s.name, lang)} — {s.price}</option>)}
          </select>
          <div className="row2" style={{ marginTop: 10 }}>
            <div><label>{t("date")}</label><input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} /></div>
            <div><label>{t("time")}</label><input value={time} onChange={(e) => setTime(e.target.value)} placeholder="14:00" /></div>
          </div>
          <div className="acts" style={{ marginTop: 10 }}>
            <button className="pink sm" onClick={saveEdit}>{t("save")}</button>
            <button className="ghost sm" onClick={() => setEditing(false)}>{t("cancel")}</button>
          </div>
        </div>
      )}
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
      <div className="panelcol">
        <button className="ghost full" style={{ margin: "8px 0" }} onClick={() => setOpenAdd(!openAdd)}>{t("addBooking")}</button>
        {openAdd && <AddForm services={services} onAdded={() => { setOpenAdd(false); onAdded(); }} />}
      </div>

      <h2 className="sect">{t("today")}</h2>
      {today.length === 0
        ? <div className="card"><div className="empty"><span className="big">☕</span>{t("noToday")}</div></div>
        : <div className="cards">{today.map((b) => <BookingCard key={b.id} b={b} settings={settings} services={services} setStatus={setStatus} onChanged={onAdded} />)}</div>}

      <h2 className="sect">{t("upcoming")}</h2>
      {up.length === 0
        ? <div className="card"><div className="empty"><span className="big">🗓️</span>{t("noUpcoming")}</div></div>
        : <div className="cards">{up.map((b) => <BookingCard key={b.id} b={b} settings={settings} services={services} setStatus={setStatus} onChanged={onAdded} />)}</div>}

      {past.length > 0 && (
        <Collapse title={t("history", { n: past.length })}>
          {past.map((b) => (
            <div key={b.id} className={"bk bk-" + b.status} style={{ opacity: 0.8 }}>
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
    <div className="panelcol">
      <h2 className="sect">{t("thisMonth")}</h2>
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
    </div>
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
    <div className="panelcol">
      <h2 className="sect">{t("availability")}</h2>
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
        <AddService services={services} setServices={setServices} />
      </Collapse>

      <Collapse title={t("reviews")}>
        <ReviewsManager />
      </Collapse>

      <Collapse title={t("studioSettings")}>
        <StudioSettings settings={settings} setSettings={setSettings} />
      </Collapse>
    </div>
  );
}

function ServiceRow({ s, setServices }) {
  const { lang, t } = useLang();
  const inputRef = useRef(null);
  const [group, setGroup] = useState(groupKey(s));
  const [name, setName] = useState(s.name);
  const [price, setPrice] = useState(s.price);
  const [dur, setDur] = useState(s.dur);
  const [busy, setBusy] = useState(false);
  const img = s.img;

  const save = async () => {
    await store.saveService({ ...s, group: group.trim(), name: name.trim(), price: +price, dur: +dur });
    setServices(await store.getServices()); toast(t("saved"));
  };
  const onPhoto = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return; setBusy(true);
    try { const url = await fileToDataURL(file); await store.saveService({ ...s, img: url }); setServices(await store.getServices()); toast(t("photoSaved")); }
    catch (err) { toast("⚠︎"); }
    setBusy(false);
  };
  const rmPhoto = async () => { await store.saveService({ ...s, img: "" }); setServices(await store.getServices()); toast(t("photoRemoved")); };

  return (
    <div className="card" style={{ margin: "8px 0", background: "var(--card-2)" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        {img
          ? <div className="thumb img" style={{ backgroundImage: `url(${img})`, width: 56, height: 56, flex: "0 0 56px" }} />
          : <div className="thumb" style={{ background: "rgba(255,255,255,.06)", width: 56, height: 56, flex: "0 0 56px", fontSize: 22 }}>📷</div>}
        <div style={{ flex: 1 }}>
          <label>{t("category")}</label>
          <input value={group} onChange={(e) => setGroup(e.target.value)} />
        </div>
      </div>
      <label style={{ marginTop: 10, display: "block" }}>{t("styleName")}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <div className="row2" style={{ marginTop: 10 }}>
        <div><label>{t("priceLab")}</label><input value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label>{t("minLab")}</label><input value={dur} onChange={(e) => setDur(e.target.value)} /></div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
      <div className="acts">
        <button className="pink sm" onClick={save}>{t("save")}</button>
        <button className="ghost sm" disabled={busy} onClick={() => inputRef.current?.click()}>{img ? t("changePhoto") : t("addPhoto")}</button>
        {img && <button className="ghost sm" disabled={busy} onClick={rmPhoto}>{t("removePhoto")}</button>}
        <button className="danger sm" onClick={async () => { if (confirm(t("removeQ", { x: tName(s.name, lang) }))) { await store.delService(s.id); setServices(await store.getServices()); } }}>{t("remove")}</button>
      </div>
    </div>
  );
}

function AddService({ services, setServices }) {
  const { t } = useLang();
  const inputRef = useRef(null);
  const [lane, setLane] = useState("Slay Studio");
  const [group, setGroup] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [dur, setDur] = useState("");
  const [img, setImg] = useState("");
  const [busy, setBusy] = useState(false);
  const existing = [...new Set(services.map(groupKey))];

  const onPhoto = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return; setBusy(true);
    try { setImg(await fileToDataURL(file)); } catch (err) { toast("⚠︎"); }
    setBusy(false);
  };
  const add = async () => {
    if (!group.trim() || !name.trim() || !price) return toast(t("catNamePrice"));
    await store.addService({ id: uid(), lane, group: group.trim(), name: name.trim(), price: +price, dur: +dur || 120, img });
    setServices(await store.getServices());
    setGroup(""); setName(""); setPrice(""); setDur(""); setImg("");
  };

  return (
    <div className="card" style={{ margin: "8px 0", background: "var(--card-2)" }}>
      <div className="svcn" style={{ color: "#fff", marginBottom: 8 }}>{t("addServiceTitle")}</div>
      <label>{t("category")}</label>
      <input list="ss-groups" value={group} onChange={(e) => setGroup(e.target.value)} placeholder={t("categoryPh")} />
      <datalist id="ss-groups">{existing.map((g) => <option key={g} value={g} />)}</datalist>
      <label style={{ marginTop: 10, display: "block" }}>{t("styleName")}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("styleNamePh")} />
      <div className="row2" style={{ marginTop: 8 }}>
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t("pricePh")} />
        <input value={dur} onChange={(e) => setDur(e.target.value)} placeholder={t("minutesPh")} />
      </div>
      <select style={{ marginTop: 8 }} value={lane} onChange={(e) => setLane(e.target.value)}>
        <option value="Slay Studio">Slay Studio</option>
        <option value="Little Slays">Little Slays</option>
        <option value="Signature">Signature</option>
      </select>
      <input ref={inputRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
      <div className="acts" style={{ marginTop: 10, alignItems: "center" }}>
        <button className="ghost sm" disabled={busy} onClick={() => inputRef.current?.click()}>{img ? t("changePhoto") : t("addPhoto")}</button>
        {img && <div className="thumb img" style={{ backgroundImage: `url(${img})`, width: 40, height: 40, flex: "0 0 40px" }} />}
      </div>
      <button className="pink full" style={{ marginTop: 10 }} onClick={add}>{t("addBtn")}</button>
    </div>
  );
}

// ── Clients (CRM + rebooking follow-ups) ─────────────────────────────────
function Clients({ bookings, settings }) {
  const { lang, t } = useLang();
  const [meta, setMeta] = useState({});
  useEffect(() => { (async () => setMeta(await store.getClientMeta()))(); }, []);

  const rebookWeeks = settings.rebookWeeks || 6;
  const today = todayStr();

  const clients = useMemo(() => {
    const m = {};
    bookings.forEach((b) => {
      const key = normPhone(b.clientPhone || "");
      if (!key) return;
      if (!m[key]) m[key] = { key, phone: b.clientPhone, name: b.clientName, visits: 0, spent: 0, last: null, upcoming: false, history: [] };
      const c = m[key];
      if (b.clientName) c.name = b.clientName;
      if (b.status !== "cancelled") c.history.push(b);
      if (b.status === "done" || b.status === "confirmed") { c.visits++; c.spent += b.price; }
      if (b.status === "done" && (!c.last || b.date > c.last)) c.last = b.date;
      if (b.date >= today && b.status !== "cancelled" && b.status !== "done") c.upcoming = true;
    });
    const arr = Object.values(m);
    arr.forEach((c) => {
      c.history.sort((x, y) => (y.date + y.start).localeCompare(x.date + x.start));
      const weeks = c.last ? (new Date(today) - new Date(c.last)) / (7 * 864e5) : 0;
      c.due = !!c.last && weeks >= rebookWeeks && !c.upcoming;
    });
    arr.sort((a, b) => (b.due - a.due) || ((b.last || "") > (a.last || "") ? 1 : -1));
    return arr;
  }, [bookings, rebookWeeks, today]);

  const due = clients.filter((c) => c.due);

  const saveNote = async (key, name, notes) => {
    await store.saveClientMeta(key, { name, notes });
    setMeta((m) => ({ ...m, [key]: { ...(m[key] || {}), name, notes } }));
    toast(t("saved"));
  };

  if (!clients.length) return <div className="card"><div className="empty"><span className="big">👥</span>{t("noClients")}</div></div>;

  const renderCard = (c) => <ClientCard key={c.key} c={c} note={meta[c.key]} onSave={saveNote} lang={lang} t={t} />;

  return (
    <>
      {due.length > 0 && <h2 className="sect">{t("clientsDue", { n: due.length })}</h2>}
      {due.length > 0 && <div className="cards">{due.map(renderCard)}</div>}
      <h2 className="sect">{t("clientsAll", { n: clients.length })}</h2>
      <div className="cards">{clients.filter((c) => !c.due).map(renderCard)}</div>
    </>
  );
}

function ClientCard({ c, note, onSave, lang, t }) {
  const [notes, setNotes] = useState(note?.notes || "");
  const [open, setOpen] = useState(false);
  useEffect(() => { setNotes(note?.notes || ""); }, [note]);
  const refresh = t("waRefresh", { name: c.name });
  return (
    <div className={"bk" + (c.due ? " bk-pending" : "")}>
      <div className="top">
        <div>
          <div className="when">{c.name}</div>
          <div className="meta">{c.phone}</div>
          <div className="meta">
            {c.visits ? (c.visits === 1 ? t("oneVisit") : t("visitsN", { n: c.visits })) : "—"}
            {c.last ? " · " + t("lastVisit", { d: fmtDateL(c.last, lang) }) : ""}
            {c.spent ? " · " + t("spentTotal", { n: c.spent.toLocaleString() }) : ""}
          </div>
        </div>
        {c.due ? <span className="badge b-pending">{t("dueRefresh")}</span>
          : c.upcoming ? <span className="badge b-confirmed">{t("hasUpcoming")}</span> : null}
      </div>

      <label style={{ marginTop: 12, display: "block" }}>{t("hairNotes")}</label>
      <textarea className="ta" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("hairNotesPh")} />

      <div className="acts">
        <button className="pink sm" onClick={() => onSave(c.key, c.name, notes)}>{t("save")}</button>
        <a className="btn wa sm" href={waLink(c.phone, refresh)} target="_blank" rel="noopener noreferrer">{t("sendRefresh")}</a>
        {c.history.length > 0 && <button className="ghost sm" onClick={() => setOpen((v) => !v)}>{c.history.length} ⌄</button>}
      </div>

      {open && (
        <div style={{ marginTop: 8 }}>
          {c.history.map((b) => (
            <div key={b.id} className="meta" style={{ padding: "5px 0", borderTop: "1px solid var(--line)" }}>
              {fmtDateL(b.date, lang)} · {tName(b.serviceName, lang)} · {b.price.toLocaleString()} {t("egp")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reviews (owner-posted testimonials) ──────────────────────────────────
function Stars({ value, onChange, size = 22 }) {
  return (
    <div className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "on" : ""} onClick={onChange ? () => onChange(n) : undefined}
          style={{ cursor: onChange ? "pointer" : "default" }}>★</span>
      ))}
    </div>
  );
}

function ReviewsManager() {
  const { t } = useLang();
  const inputRef = useRef(null);
  const [list, setList] = useState([]);
  const [img, setImg] = useState("");
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const load = async () => setList(await store.listReviews());
  useEffect(() => { load(); }, []);

  const pick = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return; setBusy(true);
    try { setImg(await fileToDataURL(file, 1080, 0.78)); } catch (err) { toast("⚠︎"); }
    setBusy(false);
  };
  const post = async () => {
    if (!img) return toast(t("reviewImgNeed"));
    await store.saveReview({ id: uid(), img, rating, createdAt: Date.now() });
    setImg(""); setRating(5); load(); toast(t("saved"));
  };

  const sorted = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <>
      <div className="card" style={{ margin: "8px 0", background: "var(--card-2)" }}>
        <div className="svcn" style={{ color: "#fff", marginBottom: 8 }}>{t("addReview")}</div>
        <input ref={inputRef} type="file" accept="image/*" onChange={pick} style={{ display: "none" }} />
        {img
          ? <img src={img} alt="" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)", marginBottom: 4 }} />
          : <div className="empty" style={{ padding: "18px 10px" }}><span className="big">🖼️</span>{t("reviewScreenshotHint")}</div>}
        <label style={{ marginTop: 8, display: "block" }}>{t("rating")}</label>
        <Stars value={rating} onChange={setRating} />
        <div className="acts" style={{ marginTop: 12 }}>
          <button className="ghost sm" disabled={busy} onClick={() => inputRef.current?.click()}>{img ? t("changePhoto") : t("addReviewPhoto")}</button>
          <button className="pink sm" onClick={post}>{t("postReview")}</button>
        </div>
      </div>
      {sorted.map((r) => (
        <div key={r.id} className="card" style={{ margin: "8px 0", background: "var(--card-2)" }}>
          <div className="top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            {r.img
              ? <img src={r.img} alt="" style={{ width: 96, borderRadius: 10, border: "1px solid var(--line)" }} />
              : <div className="meta">{r.text}</div>}
            <div style={{ textAlign: "end" }}>
              <Stars value={r.rating || 5} size={14} />
              <button className="danger sm" style={{ marginTop: 10 }} onClick={async () => { await store.delReview(r.id); load(); }}>{t("remove")}</button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function StudioSettings({ settings, setSettings }) {
  const { t } = useLang();
  const [wa, setWa] = useState(settings.whatsapp);
  const [ip, setIp] = useState(settings.instapay);
  const [dp, setDp] = useState(settings.depositPct);
  const [rt, setRt] = useState(settings.rent);
  const [rw, setRw] = useState(settings.rebookWeeks ?? 6);
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
      <label style={{ marginTop: 10, display: "block" }}>{t("rebookWeeks")}</label>
      <input value={rw} onChange={(e) => setRw(e.target.value)} />
      <button className="pink full" style={{ marginTop: 12 }} onClick={async () => {
        const ns = { ...settings, whatsapp: wa, instapay: ip, depositPct: +dp, rent: +rt, rebookWeeks: +rw || 6 };
        await store.saveSettings(ns); setSettings(ns); toast(t("saved"));
      }}>{t("saveSettings")}</button>
    </div>
  );
}
