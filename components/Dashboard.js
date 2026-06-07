"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { USE_FB } from "@/lib/firebase";
import { LANES } from "@/lib/config";
import { store } from "@/lib/store";
import { todayStr, dstr, uid, waLink, toast, groupKey, groupStyles, normPhone } from "@/lib/util";
import { uploadImage, cldImg, IMG } from "@/lib/img";
import { useLang, fmtDateL, tName, dayShort, laneLabel } from "@/lib/i18n";

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

  const PRIMARY = [
    ["sched", "🗓️", t("tabSchedule")],
    ["clients", "👥", t("tabClients")],
    ["money", "📊", t("tabMoney")],
    ["materials", "📦", t("materials")],
  ];
  const MANAGE = [
    ["services", "✂️", t("servicesPrices")],
    ["colors", "🎨", t("colors")],
    ["arrange", "↕️", t("arrange")],
    ["availability", "🕑", t("availability")],
    ["reviews", "⭐", t("reviews")],
    ["settings", "⚙️", t("studioSettings")],
  ];
  const ALL = [...PRIMARY, ...MANAGE];
  const title = (ALL.find((x) => x[0] === tab) || [])[2];

  const navBtn = ([k, ic, lab]) => (
    <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
      <span className="ic">{ic}</span>{lab}
    </button>
  );

  return (
    <div className="admin">
      <aside className="adside">
        <div className="adbrand">slay studio</div>
        <nav className="adnav">
          {PRIMARY.map(navBtn)}
          <div className="adnav-label">{t("manageGroup")}</div>
          {MANAGE.map(navBtn)}
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
          {tab === "materials" && <MaterialsPanel />}
          {tab === "services" && <ServicesPanel services={services} setServices={setServices} settings={settings} />}
          {tab === "colors" && <ColorsPanel settings={settings} setSettings={setSettings} />}
          {tab === "arrange" && <ArrangePanel services={services} settings={settings} setSettings={setSettings} />}
          {tab === "availability" && <AvailabilityPanel settings={settings} setSettings={setSettings} />}
          {tab === "reviews" && <div className="panelcol"><ReviewsManager /></div>}
          {tab === "settings" && <div className="panelcol"><StudioSettings settings={settings} setSettings={setSettings} /></div>}
        </div>
      </main>

      <div className="adbottom">
        {ALL.map(([k, ic, lab]) => (
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
  const svcName = tName(b.serviceName, lang) + (b.color ? " · " + b.color : "");
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
          <div className="svcn">{svcName} {b.homeService && <span className="home-tag">🏠 {t("homeBadge")}</span>}</div>
          <div className="meta">{b.clientName} · {b.clientPhone} · {b.price.toLocaleString()} {t("egp")}</div>
          {b.homeService && b.address && <div className="meta">📍 {b.address}</div>}
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
  const [month, setMonth] = useState(() => todayStr().slice(0, 7));
  const [selected, setSelected] = useState(todayStr());

  const byDate = useMemo(() => {
    const m = {};
    bookings.forEach((b) => { if (b.status !== "cancelled") (m[b.date] = m[b.date] || []).push(b); });
    Object.values(m).forEach((a) => a.sort((x, y) => x.start.localeCompare(y.start)));
    return m;
  }, [bookings]);

  const [y, mo] = month.split("-").map(Number);
  const cells = useMemo(() => {
    const startDow = new Date(y, mo - 1, 1).getDay();
    const days = new Date(y, mo, 0).getDate();
    const arr = [];
    for (let i = 0; i < startDow; i++) arr.push(null);
    for (let d = 1; d <= days; d++) arr.push(dstr(new Date(y, mo - 1, d)));
    while (arr.length % 7) arr.push(null);
    return arr;
  }, [y, mo]);

  const monthLabel = new Date(y, mo - 1, 1).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { month: "long", year: "numeric" });
  const shift = (d) => setMonth(dstr(new Date(y, mo - 1 + d, 1)).slice(0, 7));
  const goToday = () => { setMonth(todayStr().slice(0, 7)); setSelected(todayStr()); };
  const dayList = byDate[selected] || [];

  return (
    <>
      <div className="sched-top">
        <button className="pink" onClick={() => setOpenAdd(!openAdd)}>{t("addBooking")}</button>
      </div>
      {openAdd && <div className="panelcol"><AddForm services={services} onAdded={() => { setOpenAdd(false); onAdded(); }} /></div>}

      <div className="cal">
        <div className="cal-head">
          <button className="cal-nav" onClick={() => shift(-1)} aria-label="prev">‹</button>
          <div className="cal-title">{monthLabel}</div>
          <button className="cal-nav" onClick={() => shift(1)} aria-label="next">›</button>
          <button className="cal-today" onClick={goToday}>{t("todayBtn")}</button>
        </div>
        <div className="cal-grid cal-dow">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="cal-dowc">{dayShort(i, lang)}</div>)}
        </div>
        <div className="cal-grid">
          {cells.map((d, i) => {
            if (!d) return <div key={"e" + i} className="cal-cell empty" />;
            const list = byDate[d] || [];
            return (
              <button key={d} className={"cal-cell" + (d === selected ? " sel" : "") + (d === todayStr() ? " today" : "")} onClick={() => setSelected(d)}>
                <span className="cal-d">{Number(d.slice(8))}</span>
                {list.length > 0 && (
                  <span className="cal-evs">
                    {list.slice(0, 3).map((b) => (
                      <span key={b.id} className={"cal-ev b-" + b.status} title={b.clientName}>
                        <b>{b.start}</b> {(b.clientName || "").split(" ")[0]}
                      </span>
                    ))}
                    {list.length > 3 && <span className="cal-more">+{list.length - 3}</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="cal-legend">
          <span><i className="lg b-pending" />{t("st_pending")}</span>
          <span><i className="lg b-confirmed" />{t("st_confirmed")}</span>
          <span><i className="lg b-done" />{t("st_done")}</span>
        </div>
      </div>

      <h2 className="sect">{fmtDateL(selected, lang)}</h2>
      {dayList.length === 0
        ? <div className="card"><div className="empty"><span className="big">🗓️</span>{t("noDay")}</div></div>
        : <div className="cards">{dayList.map((b) => <BookingCard key={b.id} b={b} settings={settings} services={services} setStatus={setStatus} onChanged={onAdded} />)}</div>}
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
  const [home, setHome] = useState(false);
  const [addr, setAddr] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const add = async () => {
    const s = services.find((x) => x.id === svId);
    if (!s) return;
    if (!/^\d{1,2}:\d{2}$/.test(time.trim())) return toast(t("timeFmt"));
    const b = {
      id: uid(), serviceId: s.id, serviceName: s.name,
      price: home ? (+customPrice || 0) : s.price, dur: s.dur,
      homeService: home, address: home ? addr.trim() : "",
      date, start: time.trim(), clientName: name.trim() || "Walk-in", clientPhone: phone.trim(),
      status: "confirmed", createdAt: Date.now(),
    };
    await store.createBooking(b);
    toast(t("added"));
    onAdded();
  };

  return (
    <div className="card glass">
      <label className="switchrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={home} onChange={(e) => setHome(e.target.checked)} />
        <span>🏠 {t("homeService")}</span>
      </label>
      <label style={{ marginTop: 10, display: "block" }}>{t("service")}</label>
      <select value={svId} onChange={(e) => setSvId(e.target.value)}>
        {services.map((s) => <option key={s.id} value={s.id}>{tName(s.name, lang)}{home ? "" : ` — ${s.price}`}</option>)}
      </select>
      {home && (
        <>
          <label style={{ marginTop: 10, display: "block" }}>{t("customPriceLabel")}</label>
          <input value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} inputMode="numeric" placeholder="0" />
          <label style={{ marginTop: 10, display: "block" }}>{t("homeAddress")}</label>
          <textarea value={addr} onChange={(e) => setAddr(e.target.value)} placeholder={t("homeAddressPh")} rows={2} />
        </>
      )}
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
          <span>{t("vsRent", { n: settings.rent.toLocaleString() })}</span><span style={{ color: "var(--ink)" }}>{pct}%</span>
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

function MaterialsPanel() {
  const { t } = useLang();
  const [list, setList] = useState([]);
  const [adding, setAdding] = useState(false);
  const load = async () => setList(await store.listMaterials());
  useEffect(() => { load(); }, []);

  const isLow = (m) => m.lowAt > 0 && (m.qty || 0) <= m.lowAt;
  const sorted = [...list].sort((a, b) => (isLow(b) - isLow(a)) || a.name.localeCompare(b.name));
  const lowCount = list.filter(isLow).length;

  return (
    <div className="panelcol">
      <div className="sched-top"><button className="pink" onClick={() => setAdding((v) => !v)}>＋ {t("addMaterial")}</button></div>
      {lowCount > 0 && (
        <div className="card" style={{ borderColor: "rgba(236,200,115,.4)" }}>
          <div className="meta" style={{ color: "var(--warn)" }}>⚠︎ {t("lowStockN", { n: lowCount })}</div>
        </div>
      )}
      {adding && <MaterialForm onDone={() => { setAdding(false); load(); }} />}
      {list.length === 0 && !adding && <div className="card"><div className="empty"><span className="big">📦</span>{t("noMaterials")}</div></div>}
      {sorted.map((m) => <MaterialRow key={m.id} m={m} onChange={load} />)}
    </div>
  );
}

function MaterialForm({ onDone }) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [lowAt, setLowAt] = useState("");
  const [note, setNote] = useState("");
  const add = async () => {
    if (!name.trim()) return toast(t("materialNeedName"));
    await store.saveMaterial({ id: uid(), name: name.trim(), qty: +qty || 0, lowAt: +lowAt || 0, note: note.trim(), createdAt: Date.now() });
    toast(t("saved")); onDone();
  };
  return (
    <div className="card" style={{ margin: "0 0 10px", background: "var(--card-2)" }}>
      <label>{t("materialName")}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("materialNamePh")} />
      <div className="row2" style={{ marginTop: 10 }}>
        <div><label>{t("quantity")}</label><input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric" /></div>
        <div><label>{t("lowAt")}</label><input value={lowAt} onChange={(e) => setLowAt(e.target.value)} inputMode="numeric" /></div>
      </div>
      <label style={{ marginTop: 10, display: "block" }}>{t("blockNote")}</label>
      <input value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="pink full" style={{ marginTop: 12 }} onClick={add}>{t("addBtn")}</button>
    </div>
  );
}

function MaterialRow({ m, onChange }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(m.name);
  const [lowAt, setLowAt] = useState(m.lowAt || 0);
  const [note, setNote] = useState(m.note || "");
  const low = m.lowAt > 0 && (m.qty || 0) <= m.lowAt;

  const adjust = async (d) => { await store.saveMaterial({ ...m, qty: Math.max(0, (m.qty || 0) + d) }); onChange(); };
  const saveEdit = async () => { await store.saveMaterial({ ...m, name: name.trim(), lowAt: +lowAt || 0, note: note.trim() }); toast(t("saved")); onChange(); };
  const del = async () => { await store.delMaterial(m.id); onChange(); };

  const sub = [
    m.lowAt > 0 ? t("lowAt") + ": " + m.lowAt : "",
    m.note || "",
  ].filter(Boolean).join(" · ");

  return (
    <div className={"erow" + (low ? " erow-low" : "")}>
      <div className="erow-head" style={{ cursor: "default" }}>
        <div className="qtyctl">
          <button className="qbtn" onClick={() => adjust(-1)}>−</button>
          <span className="qval">{m.qty || 0}</span>
          <button className="qbtn" onClick={() => adjust(1)}>＋</button>
        </div>
        <div className="erow-info" style={{ cursor: "pointer" }} onClick={() => setOpen((v) => !v)}>
          <div className="erow-name">{m.name}{low && <span className="badge b-pending" style={{ marginInlineStart: 7 }}>{t("low")}</span>}</div>
          {sub && <div className="erow-sub">{sub}</div>}
        </div>
        <span className="erow-caret" style={{ cursor: "pointer" }} onClick={() => setOpen((v) => !v)}>{open ? "⌄" : "›"}</span>
      </div>
      {open && (
        <div className="erow-body">
          <label>{t("materialName")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <label style={{ marginTop: 10, display: "block" }}>{t("lowAt")}</label>
          <input value={lowAt} onChange={(e) => setLowAt(e.target.value)} inputMode="numeric" />
          <label style={{ marginTop: 10, display: "block" }}>{t("blockNote")}</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="acts">
            <button className="pink sm" onClick={saveEdit}>{t("save")}</button>
            <button className="danger sm" onClick={del}>{t("remove")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AvailabilityPanel({ settings, setSettings }) {
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
      <TimeOff settings={settings} setSettings={setSettings} />
    </div>
  );
}

function TimeOff({ settings, setSettings }) {
  const { lang, t } = useLang();
  const [date, setDate] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [from, setFrom] = useState("13:00");
  const [to, setTo] = useState("14:00");
  const [note, setNote] = useState("");
  const blocks = (settings.blocks || []).slice().sort((a, b) => (a.date + (a.start || "")).localeCompare(b.date + (b.start || "")));

  const add = async () => {
    if (!date) return toast(t("blockNeedDate"));
    const b = { id: uid(), date, allDay, note: note.trim(), ...(allDay ? {} : { start: from, end: to }) };
    const ns = { ...settings, blocks: [...(settings.blocks || []), b] };
    await store.saveSettings(ns); setSettings(ns); setNote(""); setDate(""); toast(t("saved"));
  };
  const remove = async (idv) => {
    const ns = { ...settings, blocks: (settings.blocks || []).filter((x) => x.id !== idv) };
    await store.saveSettings(ns); setSettings(ns);
  };

  return (
    <div className="card glass" style={{ marginTop: 14 }}>
      <div className="svcn" style={{ color: "var(--ink)", fontSize: 17, marginBottom: 10 }}>{t("timeOff")}</div>
      <label>{t("blockADate")}</label>
      <input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} />
      <div className="chips" style={{ marginTop: 10 }}>
        <div className={"chip" + (allDay ? " on" : "")} onClick={() => setAllDay(true)}><div className="cs">{t("allDay")}</div></div>
        <div className={"chip" + (!allDay ? " on" : "")} onClick={() => setAllDay(false)}><div className="cs">{t("fromT")} – {t("toT")}</div></div>
      </div>
      {!allDay && (
        <div className="row2" style={{ marginTop: 10 }}>
          <div><label>{t("fromT")}</label><input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="13:00" /></div>
          <div><label>{t("toT")}</label><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="14:00" /></div>
        </div>
      )}
      <label style={{ marginTop: 10, display: "block" }}>{t("blockNote")}</label>
      <input value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="pink full" style={{ marginTop: 12 }} onClick={add}>{t("blockBtn")}</button>

      <div style={{ marginTop: 12 }}>
        {blocks.length === 0
          ? <div className="empty" style={{ padding: "12px" }}>{t("noBlocks")}</div>
          : blocks.map((b) => (
            <div key={b.id} className="bk bk-cancelled" style={{ marginTop: 8 }}>
              <div className="top">
                <div>
                  <div className="when">{fmtDateL(b.date, lang)}</div>
                  <div className="meta">{b.allDay ? t("allDay") : b.start + " – " + b.end}{b.note ? " · " + b.note : ""}</div>
                </div>
                <button className="danger sm" onClick={() => remove(b.id)}>{t("remove")}</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function ArrangePanel({ services, settings, setSettings }) {
  const { lang, t } = useLang();
  const grps = groupStyles(services);
  const laneOrder = [...(settings.laneOrder || LANES), ...LANES.filter((l) => !(settings.laneOrder || LANES).includes(l))];

  const save = async (patch) => { const ns = { ...settings, ...patch }; await store.saveSettings(ns); setSettings(ns); };
  const moveLane = (i, dir) => {
    const arr = laneOrder.slice(); const j = i + dir; if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]]; save({ laneOrder: arr });
  };
  const laneGroups = (lane) => {
    const list = grps.filter((g) => g.lane === lane).map((g) => g.group);
    const ord = (settings.groupOrder || {})[lane] || [];
    return list.slice().sort((a, b) => { const ia = ord.indexOf(a), ib = ord.indexOf(b); return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib); });
  };
  const moveGroup = (lane, i, dir) => {
    const arr = laneGroups(lane); const j = i + dir; if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    save({ groupOrder: { ...(settings.groupOrder || {}), [lane]: arr } });
  };

  return (
    <div className="panelcol">
      <small className="note" style={{ marginBottom: 12 }}>{t("arrangeHint")}</small>
      {laneOrder.map((lane, li) => {
        const groups = laneGroups(lane);
        return (
          <div key={lane} className="arr-lane">
            <div className="arr-lane-head">
              <div className="arr-title">{laneLabel(lane, lang, "full")}</div>
              <div className="arr-moves">
                <button className="arr-btn" disabled={li === 0} onClick={() => moveLane(li, -1)}>↑</button>
                <button className="arr-btn" disabled={li === laneOrder.length - 1} onClick={() => moveLane(li, 1)}>↓</button>
              </div>
            </div>
            {groups.length === 0
              ? <div className="empty" style={{ padding: "8px" }}>—</div>
              : groups.map((g, gi) => (
                <div key={g} className="arr-item">
                  <span className="arr-name">{tName(g, lang)}</span>
                  <div className="arr-moves">
                    <button className="arr-btn" disabled={gi === 0} onClick={() => moveGroup(lane, gi, -1)}>↑</button>
                    <button className="arr-btn" disabled={gi === groups.length - 1} onClick={() => moveGroup(lane, gi, 1)}>↓</button>
                  </div>
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
}

function ServicesPanel({ services, setServices, settings }) {
  const { t } = useLang();
  const [adding, setAdding] = useState(false);
  return (
    <div className="panelcol">
      <div className="sched-top">
        <button className="pink" onClick={() => setAdding((v) => !v)}>＋ {t("addServiceTitle")}</button>
      </div>
      {adding && <AddService services={services} setServices={setServices} settings={settings} onDone={() => setAdding(false)} />}
      {services.map((s) => <ServiceRow key={s.id} s={s} setServices={setServices} settings={settings} />)}
    </div>
  );
}

function ColorEditRow({ c, t, onPatch, onRemove }) {
  const ref = useRef(null);
  const pick = async (e) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    try { onPatch({ img: await uploadImage(f) }); } catch (err) { toast("⚠︎"); }
  };
  return (
    <div className="swrow">
      <input ref={ref} type="file" accept="image/*" onChange={pick} style={{ display: "none" }} />
      <button type="button" className="sw-imgbtn" onClick={() => ref.current?.click()}
        style={c.img ? { backgroundImage: `url(${cldImg(c.img, IMG.swatch)})` } : { background: c.hex || "#333" }}>{!c.img && "＋"}</button>
      <input value={c.name} onChange={(e) => onPatch({ name: e.target.value })} placeholder={t("colorNamePh")} />
      <input className="sw-price" value={c.price || ""} onChange={(e) => onPatch({ price: +e.target.value || 0 })} placeholder={t("colorPricePh")} inputMode="numeric" />
      <button className="danger sm" onClick={onRemove}>✕</button>
    </div>
  );
}

function ColorsPanel({ settings, setSettings }) {
  const { t } = useLang();
  const [sets, setSets] = useState(() => JSON.parse(JSON.stringify(settings.colorSets || [])));

  const save = async () => {
    const clean = sets.filter((s) => s.name.trim()).map((s) => ({ ...s, name: s.name.trim(), colors: s.colors.filter((c) => c.name.trim()) }));
    const ns = { ...settings, colorSets: clean };
    await store.saveSettings(ns); setSettings(ns); setSets(JSON.parse(JSON.stringify(clean))); toast(t("saved"));
  };
  const addSet = () => setSets((s) => [...s, { id: uid(), name: "", colors: [] }]);
  const removeSet = (i) => setSets((s) => s.filter((_, j) => j !== i));
  const upd = (i, patch) => setSets((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addColor = (i) => upd(i, { colors: [...sets[i].colors, { id: uid(), name: "", hex: "#1a1a1a", img: "", price: 0 }] });
  const updColor = (i, ci, patch) => upd(i, { colors: sets[i].colors.map((c, k) => (k === ci ? { ...c, ...patch } : c)) });
  const rmColor = (i, ci) => upd(i, { colors: sets[i].colors.filter((_, k) => k !== ci) });

  return (
    <div className="panelcol">
      <div className="sched-top"><button className="pink" onClick={addSet}>＋ {t("addColorSet")}</button></div>
      <small className="note" style={{ marginBottom: 12 }}>{t("colorsHint")}</small>
      {sets.length === 0 && <div className="card"><div className="empty">{t("noColorSets")}</div></div>}
      {sets.map((set, i) => (
        <div key={set.id} className="card" style={{ background: "var(--card-2)" }}>
          <label>{t("setName")}</label>
          <input value={set.name} onChange={(e) => upd(i, { name: e.target.value })} placeholder={t("setNamePh")} />
          <div style={{ marginTop: 12 }}>
            {set.colors.map((c, ci) => (
              <ColorEditRow key={c.id} c={c} t={t} onPatch={(p) => updColor(i, ci, p)} onRemove={() => rmColor(i, ci)} />
            ))}
          </div>
          <div className="acts" style={{ marginTop: 10 }}>
            <button className="ghost sm" onClick={() => addColor(i)}>＋ {t("addColor")}</button>
            <button className="danger sm" onClick={() => removeSet(i)}>{t("remove")}</button>
          </div>
        </div>
      ))}
      {sets.length > 0 && <button className="pink full" style={{ marginTop: 8 }} onClick={save}>{t("save")}</button>}
    </div>
  );
}

function ServiceRow({ s, setServices, settings }) {
  const { lang, t } = useLang();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [lane, setLane] = useState(s.lane || "Slay Studio");
  const [group, setGroup] = useState(groupKey(s));
  const [name, setName] = useState(s.name);
  const [price, setPrice] = useState(s.price);
  const [dur, setDur] = useState(s.dur);
  const [colorSet, setColorSet] = useState(s.colorSet || "");
  const [desc, setDesc] = useState(s.description || "");
  const [homeOk, setHomeOk] = useState(!!s.homeOk);
  const [busy, setBusy] = useState(false);
  const img = s.img;

  const save = async () => {
    const origGroup = groupKey(s);
    const description = desc.trim();
    await store.saveService({ ...s, lane, group: group.trim(), name: name.trim(), price: +price, dur: +dur, colorSet, description, homeOk });
    // a style's section, color set + description apply to all its size variants together
    const all = await store.getServices();
    for (const x of all) {
      if (x.id === s.id || groupKey(x) !== origGroup) continue;
      const patch = {};
      if (x.lane !== lane) patch.lane = lane;
      if ((x.colorSet || "") !== colorSet) patch.colorSet = colorSet;
      if ((x.description || "") !== description) patch.description = description;
      if (Object.keys(patch).length) await store.saveService({ ...x, ...patch });
    }
    setServices(await store.getServices()); toast(t("saved"));
  };
  const onPhoto = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return; setBusy(true);
    try { const url = await uploadImage(file); await store.saveService({ ...s, img: url }); setServices(await store.getServices()); toast(t("photoSaved")); }
    catch (err) { toast("⚠︎"); }
    setBusy(false);
  };
  const rmPhoto = async () => { await store.saveService({ ...s, img: "" }); setServices(await store.getServices()); toast(t("photoRemoved")); };

  return (
    <div className="erow">
      <div className="erow-head" onClick={() => setOpen((v) => !v)}>
        {img
          ? <div className="thumb img" style={{ backgroundImage: `url(${cldImg(img, IMG.thumb)})`, width: 46, height: 46, flex: "0 0 46px" }} />
          : <div className="thumb" style={{ background: "var(--card-2)", width: 46, height: 46, flex: "0 0 46px", fontSize: 19 }}>📷</div>}
        <div className="erow-info">
          <div className="erow-name">{tName(s.name, lang)}</div>
          <div className="erow-sub">{tName(groupKey(s), lang)} · {s.price.toLocaleString()} {t("egp")} · {s.dur}m</div>
        </div>
        <span className="erow-caret">{open ? "⌄" : "›"}</span>
      </div>
      {open && (
        <div className="erow-body">
          <label>{t("section")}</label>
          <select value={lane} onChange={(e) => setLane(e.target.value)}>
            {LANES.map((l) => <option key={l} value={l}>{laneLabel(l, lang, "full")}</option>)}
          </select>
          <label style={{ marginTop: 10, display: "block" }}>{t("colorSet")}</label>
          <select value={colorSet} onChange={(e) => setColorSet(e.target.value)}>
            <option value="">{t("noColorsOpt")}</option>
            {(settings.colorSets || []).map((cs) => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
          </select>
          <label style={{ marginTop: 10, display: "block" }}>{t("category")}</label>
          <input value={group} onChange={(e) => setGroup(e.target.value)} />
          <label style={{ marginTop: 10, display: "block" }}>{t("styleName")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <label style={{ marginTop: 10, display: "block" }}>{t("styleDesc")}</label>
          <textarea className="ta" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("styleDescPh")} />
          <div className="row2" style={{ marginTop: 10 }}>
            <div><label>{t("priceLab")}</label><input value={price} onChange={(e) => setPrice(e.target.value)} /></div>
            <div><label>{t("minLab")}</label><input value={dur} onChange={(e) => setDur(e.target.value)} /></div>
          </div>
          <label className="switchrow" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <input type="checkbox" checked={homeOk} onChange={(e) => setHomeOk(e.target.checked)} />
            <span>🏠 {t("homeOkLabel")}</span>
          </label>
          <input ref={inputRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
          <div className="acts">
            <button className="pink sm" onClick={save}>{t("save")}</button>
            <button className="ghost sm" disabled={busy} onClick={() => inputRef.current?.click()}>{img ? t("changePhoto") : t("addPhoto")}</button>
            {img && <button className="ghost sm" disabled={busy} onClick={rmPhoto}>{t("removePhoto")}</button>}
            <button className="danger sm" onClick={async () => { if (confirm(t("removeQ", { x: tName(s.name, lang) }))) { await store.delService(s.id); setServices(await store.getServices()); } }}>{t("remove")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddService({ services, setServices, settings, onDone }) {
  const { lang, t } = useLang();
  const inputRef = useRef(null);
  const [lane, setLane] = useState("Slay Studio");
  const [group, setGroup] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [dur, setDur] = useState("");
  const [colorSet, setColorSet] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [homeOk, setHomeOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const existing = [...new Set(services.map(groupKey))];

  const onPhoto = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return; setBusy(true);
    try { setImg(await uploadImage(file)); } catch (err) { toast("⚠︎"); }
    setBusy(false);
  };
  const add = async () => {
    if (!group.trim() || !name.trim() || !price) return toast(t("catNamePrice"));
    await store.addService({ id: uid(), lane, group: group.trim(), name: name.trim(), price: +price, dur: +dur || 120, img, colorSet, description: desc.trim(), homeOk });
    setServices(await store.getServices());
    setGroup(""); setName(""); setPrice(""); setDur(""); setImg(""); setColorSet(""); setDesc(""); setHomeOk(false);
    toast(t("saved")); onDone && onDone();
  };

  return (
    <div className="card" style={{ margin: "8px 0", background: "var(--card-2)" }}>
      <div className="svcn" style={{ color: "var(--ink)", marginBottom: 8 }}>{t("addServiceTitle")}</div>
      <label>{t("category")}</label>
      <input list="ss-groups" value={group} onChange={(e) => setGroup(e.target.value)} placeholder={t("categoryPh")} />
      <datalist id="ss-groups">{existing.map((g) => <option key={g} value={g} />)}</datalist>
      <label style={{ marginTop: 10, display: "block" }}>{t("styleName")}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("styleNamePh")} />
      <label style={{ marginTop: 10, display: "block" }}>{t("styleDesc")}</label>
      <textarea className="ta" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("styleDescPh")} />
      <div className="row2" style={{ marginTop: 8 }}>
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t("pricePh")} />
        <input value={dur} onChange={(e) => setDur(e.target.value)} placeholder={t("minutesPh")} />
      </div>
      <label style={{ marginTop: 10, display: "block" }}>{t("section")}</label>
      <select value={lane} onChange={(e) => setLane(e.target.value)}>
        {LANES.map((l) => <option key={l} value={l}>{laneLabel(l, lang, "full")}</option>)}
      </select>
      <label style={{ marginTop: 10, display: "block" }}>{t("colorSet")}</label>
      <select value={colorSet} onChange={(e) => setColorSet(e.target.value)}>
        <option value="">{t("noColorsOpt")}</option>
        {(settings.colorSets || []).map((cs) => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
      </select>
      <label className="switchrow" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <input type="checkbox" checked={homeOk} onChange={(e) => setHomeOk(e.target.checked)} />
        <span>🏠 {t("homeOkLabel")}</span>
      </label>
      <input ref={inputRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
      <div className="acts" style={{ marginTop: 10, alignItems: "center" }}>
        <button className="ghost sm" disabled={busy} onClick={() => inputRef.current?.click()}>{img ? t("changePhoto") : t("addPhoto")}</button>
        {img && <div className="thumb img" style={{ backgroundImage: `url(${cldImg(img, IMG.thumb)})`, width: 40, height: 40, flex: "0 0 40px" }} />}
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
  const [adding, setAdding] = useState(false);
  const load = async () => setList(await store.listReviews());
  useEffect(() => { load(); }, []);

  const pick = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return; setBusy(true);
    try { setImg(await uploadImage(file)); } catch (err) { toast("⚠︎"); }
    setBusy(false);
  };
  const post = async () => {
    if (!img) return toast(t("reviewImgNeed"));
    await store.saveReview({ id: uid(), img, rating, createdAt: Date.now() });
    setImg(""); setRating(5); setAdding(false); load(); toast(t("saved"));
  };

  const sorted = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <>
      <div className="sched-top">
        <button className="pink" onClick={() => setAdding((v) => !v)}>＋ {t("addReview")}</button>
      </div>
      {adding && (
        <div className="card" style={{ margin: "0 0 10px", background: "var(--card-2)" }}>
          <input ref={inputRef} type="file" accept="image/*" onChange={pick} style={{ display: "none" }} />
          {img
            ? <img src={cldImg(img, IMG.review)} alt="" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)", marginBottom: 4 }} />
            : <div className="empty" style={{ padding: "18px 10px" }}><span className="big">🖼️</span>{t("reviewScreenshotHint")}</div>}
          <label style={{ marginTop: 8, display: "block" }}>{t("rating")}</label>
          <Stars value={rating} onChange={setRating} />
          <div className="acts" style={{ marginTop: 12 }}>
            <button className="ghost sm" disabled={busy} onClick={() => inputRef.current?.click()}>{img ? t("changePhoto") : t("addReviewPhoto")}</button>
            <button className="pink sm" onClick={post}>{t("postReview")}</button>
          </div>
        </div>
      )}
      {sorted.map((r) => <ReviewRow key={r.id} r={r} onDel={async () => { await store.delReview(r.id); load(); }} />)}
    </>
  );
}

function ReviewRow({ r, onDel }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <div className="erow">
      <div className="erow-head" onClick={() => setOpen((v) => !v)}>
        {r.img
          ? <div className="thumb img" style={{ backgroundImage: `url(${cldImg(r.img, IMG.thumb)})`, width: 46, height: 46, flex: "0 0 46px" }} />
          : <div className="thumb" style={{ width: 46, height: 46, flex: "0 0 46px", fontSize: 18, color: "#f0c860" }}>★</div>}
        <div className="erow-info"><Stars value={r.rating || 5} size={15} /></div>
        <span className="erow-caret">{open ? "⌄" : "›"}</span>
      </div>
      {open && (
        <div className="erow-body">
          {r.img && <img src={cldImg(r.img, IMG.review)} alt="" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)", marginTop: 12 }} />}
          {r.text && <div className="meta" style={{ marginTop: 10 }}>{r.text}</div>}
          <div className="acts"><button className="danger sm" onClick={onDel}>{t("remove")}</button></div>
        </div>
      )}
    </div>
  );
}

function StudioSettings({ settings, setSettings }) {
  const { t } = useLang();
  const [wa, setWa] = useState(settings.whatsapp);
  const [ip, setIp] = useState(settings.instapay);
  const [dp, setDp] = useState(settings.depositPct);
  const [rt, setRt] = useState(settings.rent);
  const [rw, setRw] = useState(settings.rebookWeeks ?? 6);
  const [addr, setAddr] = useState(settings.address || "");
  const [addrEn, setAddrEn] = useState(settings.addressEn || "");
  const [maps, setMaps] = useState(settings.mapsUrl || "");
  const [colorsOn, setColorsOn] = useState(!!settings.colorsEnabled);
  const [promos, setPromos] = useState(() => JSON.parse(JSON.stringify(settings.promos || [])));

  const addPromo = () => setPromos((p) => [...p, { id: uid(), code: "", pct: 10, active: true }]);
  const updPromo = (i, patch) => setPromos((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const rmPromo = (i) => setPromos((p) => p.filter((_, j) => j !== i));

  const save = async () => {
    const cleanPromos = promos
      .filter((p) => (p.code || "").trim())
      .map((p) => ({ ...p, code: p.code.trim().toUpperCase(), pct: Math.max(0, Math.min(100, +p.pct || 0)) }));
    const ns = {
      ...settings, whatsapp: wa, instapay: ip, depositPct: +dp, rent: +rt, rebookWeeks: +rw || 6,
      address: addr.trim(), addressEn: addrEn.trim(), mapsUrl: maps.trim(),
      colorsEnabled: colorsOn, promos: cleanPromos,
    };
    await store.saveSettings(ns); setSettings(ns); setPromos(JSON.parse(JSON.stringify(cleanPromos))); toast(t("saved"));
  };

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

      {/* location */}
      <label style={{ marginTop: 16, display: "block" }}>{t("studioAddress")}</label>
      <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder={t("addressPh")} />
      <label style={{ marginTop: 10, display: "block" }}>{t("studioAddressEn")}</label>
      <input value={addrEn} onChange={(e) => setAddrEn(e.target.value)} placeholder={t("addressPh")} />
      <label style={{ marginTop: 10, display: "block" }}>{t("mapsLink")}</label>
      <input value={maps} onChange={(e) => setMaps(e.target.value)} placeholder={t("mapsLinkPh")} />

      {/* colours toggle */}
      <label className="switchrow" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={colorsOn} onChange={(e) => setColorsOn(e.target.checked)} />
        <span>{t("showColors")}</span>
      </label>
      <small className="note">{t("showColorsHint")}</small>

      {/* discount codes */}
      <div className="adsub" style={{ marginTop: 18, fontWeight: 700 }}>{t("promosTitle")}</div>
      <small className="note">{t("promosHint")}</small>
      {promos.length === 0 && <div className="empty" style={{ marginTop: 8 }}>{t("noPromos")}</div>}
      {promos.map((p, i) => (
        <div key={p.id} className="promo-row" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <input value={p.code} onChange={(e) => updPromo(i, { code: e.target.value.toUpperCase() })} placeholder={t("codePh")} style={{ textTransform: "uppercase", flex: "1 1 120px" }} />
          <input value={p.pct} onChange={(e) => updPromo(i, { pct: e.target.value })} inputMode="numeric" style={{ width: 64 }} />
          <span style={{ opacity: 0.7 }}>{t("pctOffLabel")}</span>
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="checkbox" checked={!!p.active} onChange={(e) => updPromo(i, { active: e.target.checked })} />{t("activeLabel")}</label>
          <button className="danger sm" onClick={() => rmPromo(i)}>{t("remove")}</button>
        </div>
      ))}
      <button className="ghost sm" style={{ marginTop: 8 }} onClick={addPromo}>＋ {t("addPromo")}</button>

      <button className="pink full" style={{ marginTop: 16 }} onClick={save}>{t("saveSettings")}</button>
    </div>
  );
}
