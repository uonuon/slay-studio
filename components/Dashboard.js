"use client";
import { useEffect, useState } from "react";
import { USE_FB } from "@/lib/firebase";
import { store } from "@/lib/store";
import { fmtDate, todayStr, dstr, DAY, uid, waLink, toast } from "@/lib/util";
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
      <Hero subtitle="owner dashboard" />
      {tab === "sched" && (
        <Schedule bookings={bookings} settings={settings} services={services} openAdd={openAdd} setOpenAdd={setOpenAdd} setStatus={setStatus} onAdded={refresh} />
      )}
      {tab === "money" && <Money bookings={bookings} settings={settings} />}
      {tab === "setup" && (
        <Setup services={services} settings={settings} setServices={setServices} setSettings={setSettings} />
      )}

      <div className="tabbar">
        {[["sched", "🗓️", "Schedule"], ["money", "📊", "Money"], ["setup", "⚙️", "Setup"]].map(([k, ic, lab]) => (
          <button key={k} className={"t" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
            <span className="ic">{ic}</span>{lab}
          </button>
        ))}
        <button className="t" onClick={async () => { await store.logout(); onExit(); }}>
          <span className="ic">↩︎</span>Exit
        </button>
      </div>
    </div>
  );
}

function BookingCard({ b, settings, setStatus }) {
  const dep = Math.round((b.price * settings.depositPct) / 100);
  const conf =
    "Hi " + b.clientName + " 💗 Your Slay Studio booking is confirmed:\n" + b.serviceName + "\n" +
    fmtDate(b.date) + " at " + b.start + "\nPlease send the " + dep.toLocaleString() +
    " EGP deposit to Instapay " + settings.instapay + " (account, not wallet) and a screenshot. See you ✨";
  const rem =
    "Hi " + b.clientName + " ✨ Reminder: your Slay Studio appointment is " + fmtDate(b.date) + " at " + b.start +
    " for " + b.serviceName + ". Please wash your hair before and come with a bun or braid to save time 💗";
  return (
    <div className="bk">
      <div className="top">
        <div>
          <div className="when">{fmtDate(b.date)} · {b.start}</div>
          <div className="svcn">{b.serviceName}</div>
          <div className="meta">{b.clientName} · {b.clientPhone} · {b.price.toLocaleString()} EGP</div>
        </div>
        <span className={"badge b-" + b.status}>{b.status}</span>
      </div>
      <div className="acts">
        {b.status === "pending" && <button className="pink sm" onClick={() => setStatus(b.id, "confirmed")}>✓ Deposit received</button>}
        {b.status === "confirmed" && <button className="ghost sm" onClick={() => setStatus(b.id, "done")}>Mark done</button>}
        <a className="btn wa sm" href={waLink(b.clientPhone, conf)} target="_blank" rel="noopener noreferrer">Confirm</a>
        <a className="btn ghost sm" href={waLink(b.clientPhone, rem)} target="_blank" rel="noopener noreferrer">Remind</a>
        <button className="danger sm" onClick={() => { if (confirm("Cancel this booking?")) setStatus(b.id, "cancelled"); }}>Cancel</button>
      </div>
    </div>
  );
}

function Schedule({ bookings, settings, services, openAdd, setOpenAdd, setStatus, onAdded }) {
  const today = bookings.filter((b) => b.date === todayStr() && b.status !== "cancelled").sort((x, y) => x.start.localeCompare(y.start));
  const up = bookings.filter((b) => b.date > todayStr() && b.status !== "cancelled" && b.status !== "done").sort((x, y) => (x.date + x.start).localeCompare(y.date + y.start));
  const past = bookings
    .filter((b) => b.status === "done" || b.status === "cancelled" || (b.date < todayStr() && b.status !== "confirmed"))
    .sort((x, y) => (y.date + y.start).localeCompare(x.date + x.start)).slice(0, 25);

  return (
    <>
      <button className="ghost full" style={{ margin: "8px 0" }} onClick={() => setOpenAdd(!openAdd)}>＋ Add booking / walk-in</button>
      {openAdd && <AddForm services={services} onAdded={() => { setOpenAdd(false); onAdded(); }} />}

      <h2>Today</h2>
      {today.length === 0 && <div className="card"><div className="empty"><span className="big">☕</span>No appointments today.</div></div>}
      {today.map((b) => <BookingCard key={b.id} b={b} settings={settings} setStatus={setStatus} />)}

      <h2>Upcoming</h2>
      {up.length === 0 && <div className="card"><div className="empty"><span className="big">🗓️</span>Nothing booked ahead yet — share your link!</div></div>}
      {up.map((b) => <BookingCard key={b.id} b={b} settings={settings} setStatus={setStatus} />)}

      {past.length > 0 && (
        <Collapse title={"History (" + past.length + ")"}>
          {past.map((b) => (
            <div key={b.id} className="bk" style={{ opacity: 0.8 }}>
              <div className="top">
                <div>
                  <div className="when">{fmtDate(b.date)} · {b.start}</div>
                  <div className="svcn">{b.serviceName}</div>
                  <div className="meta">{b.clientName} · {b.price.toLocaleString()} EGP</div>
                </div>
                <span className={"badge b-" + b.status}>{b.status}</span>
              </div>
            </div>
          ))}
        </Collapse>
      )}
    </>
  );
}

function AddForm({ services, onAdded }) {
  const [svId, setSvId] = useState(services[0]?.id || "");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const add = async () => {
    const s = services.find((x) => x.id === svId);
    if (!s) return;
    if (!/^\d{1,2}:\d{2}$/.test(time.trim())) return toast("Time like 14:00");
    const b = {
      id: uid(), serviceId: s.id, serviceName: s.name, price: s.price, dur: s.dur,
      date, start: time.trim(), clientName: name.trim() || "Walk-in", clientPhone: phone.trim(),
      status: "confirmed", createdAt: Date.now(),
    };
    await store.createBooking(b);
    toast("Added");
    onAdded();
  };

  return (
    <div className="card glass">
      <label>Service</label>
      <select value={svId} onChange={(e) => setSvId(e.target.value)}>
        {services.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.price}</option>)}
      </select>
      <div className="row2" style={{ marginTop: 10 }}>
        <div><label>Date</label><input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label>Time</label><input value={time} onChange={(e) => setTime(e.target.value)} placeholder="14:00" /></div>
      </div>
      <label style={{ marginTop: 10, display: "block" }}>Client name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <label style={{ marginTop: 10, display: "block" }}>Phone</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
      <button className="pink full" style={{ marginTop: 12 }} onClick={add}>Add booking</button>
      <small className="note">For walk-ins or phone bookings. Also blocks that time online.</small>
    </div>
  );
}

function Money({ bookings, settings }) {
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
      <h2>This month</h2>
      <div className="tiles">
        <div className="tile"><div className="num">{(rev / 1000).toFixed(1)}k</div><div className="lab">EGP confirmed</div></div>
        <div className="tile"><div className="num">{conf.length}</div><div className="lab">bookings</div></div>
        <div className="tile"><div className="num">{wk.length}</div><div className="lab">this week</div></div>
      </div>
      <div className="card glass">
        <div className="meta" style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)" }}>
          <span>vs rent {settings.rent.toLocaleString()}</span><span style={{ color: "#fff" }}>{pct}%</span>
        </div>
        <div className="bar"><i style={{ width: pct + "%" }} /></div>
        <small className="note">
          {pct >= 100
            ? "Rent covered for the month 🎉 everything beyond this is profit before materials."
            : "About " + Math.max(0, Math.ceil((settings.rent - rev) / 1800)) + " more bookings covers this month’s rent."}
        </small>
      </div>
      {pend > 0 && (
        <div className="card"><div className="meta" style={{ color: "var(--warn)" }}>⏳ {pend} booking(s) waiting on a deposit — confirm them in Schedule.</div></div>
      )}
    </>
  );
}

function Setup({ services, settings, setServices, setSettings }) {
  const [days, setDays] = useState([...settings.workDays]);
  const [open, setOpen] = useState(settings.openTime);
  const [close, setClose] = useState(settings.closeTime);
  const [step, setStep] = useState(settings.slotStep);

  const saveAvail = async () => {
    const ns = { ...settings, workDays: [...days].sort(), openTime: open, closeTime: close, slotStep: +step };
    await store.saveSettings(ns); setSettings(ns); toast("Saved");
  };

  return (
    <>
      <h2>Availability</h2>
      <div className="card glass">
        <label>Working days</label>
        <div className="days">
          {DAY.map((d, i) => (
            <div key={d} className={"day" + (days.includes(i) ? " on" : "")}
              onClick={() => setDays((ds) => ds.includes(i) ? ds.filter((x) => x !== i) : [...ds, i])}>{d}</div>
          ))}
        </div>
        <div className="row2" style={{ marginTop: 12 }}>
          <div><label>Open</label><input value={open} onChange={(e) => setOpen(e.target.value)} /></div>
          <div><label>Close</label><input value={close} onChange={(e) => setClose(e.target.value)} /></div>
        </div>
        <label style={{ marginTop: 10, display: "block" }}>Slot step (min)</label>
        <input value={step} onChange={(e) => setStep(e.target.value)} />
        <button className="pink full" style={{ marginTop: 12 }} onClick={saveAvail}>Save availability</button>
      </div>

      <Collapse title="Services & prices">
        {services.map((s) => (
          <ServiceRow key={s.id} s={s} setServices={setServices} />
        ))}
        <AddService setServices={setServices} />
      </Collapse>

      <Collapse title="Studio settings">
        <StudioSettings settings={settings} setSettings={setSettings} />
      </Collapse>
    </>
  );
}

function ServiceRow({ s, setServices }) {
  const [price, setPrice] = useState(s.price);
  const [dur, setDur] = useState(s.dur);
  return (
    <div className="card" style={{ margin: "8px 0", background: "var(--card-2)" }}>
      <div className="svcn" style={{ color: "#fff", marginBottom: 8 }}>{s.name}</div>
      <div className="row2">
        <div><label>Price</label><input value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><label>Min</label><input value={dur} onChange={(e) => setDur(e.target.value)} /></div>
      </div>
      <div className="acts">
        <button className="pink sm" onClick={async () => { await store.saveService({ ...s, price: +price, dur: +dur }); setServices(await store.getServices()); toast("Saved"); }}>Save</button>
        <button className="danger sm" onClick={async () => { if (confirm("Remove " + s.name + "?")) { await store.delService(s.id); setServices(await store.getServices()); } }}>Remove</button>
      </div>
    </div>
  );
}

function AddService({ setServices }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [dur, setDur] = useState("");
  const [lane, setLane] = useState("Slay Studio");
  return (
    <div className="card" style={{ margin: "8px 0", background: "var(--card-2)" }}>
      <div className="svcn" style={{ color: "#fff", marginBottom: 8 }}>Add a service</div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Fulani braids · Large)" />
      <div className="row2" style={{ marginTop: 8 }}>
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
        <input value={dur} onChange={(e) => setDur(e.target.value)} placeholder="Minutes" />
      </div>
      <select style={{ marginTop: 8 }} value={lane} onChange={(e) => setLane(e.target.value)}>
        <option>Slay Studio</option><option>Little Slays</option><option>Signature</option>
      </select>
      <button className="pink full" style={{ marginTop: 10 }} onClick={async () => {
        if (!name || !price) return toast("Name & price needed");
        await store.addService({ id: uid(), lane, name, price: +price, dur: +dur || 120 });
        setServices(await store.getServices());
        setName(""); setPrice(""); setDur("");
      }}>Add</button>
    </div>
  );
}

function StudioSettings({ settings, setSettings }) {
  const [wa, setWa] = useState(settings.whatsapp);
  const [ip, setIp] = useState(settings.instapay);
  const [dp, setDp] = useState(settings.depositPct);
  const [rt, setRt] = useState(settings.rent);
  return (
    <div>
      <label>WhatsApp (country code, no +)</label>
      <input value={wa} onChange={(e) => setWa(e.target.value)} />
      <label style={{ marginTop: 10, display: "block" }}>Instapay number</label>
      <input value={ip} onChange={(e) => setIp(e.target.value)} />
      <div className="row2" style={{ marginTop: 10 }}>
        <div><label>Deposit %</label><input value={dp} onChange={(e) => setDp(e.target.value)} /></div>
        <div><label>Monthly rent</label><input value={rt} onChange={(e) => setRt(e.target.value)} /></div>
      </div>
      <button className="pink full" style={{ marginTop: 12 }} onClick={async () => {
        const ns = { ...settings, whatsapp: wa, instapay: ip, depositPct: +dp, rent: +rt };
        await store.saveSettings(ns); setSettings(ns); toast("Saved");
      }}>Save settings</button>
    </div>
  );
}
