"use client";
import { fmtDate, waLink } from "@/lib/util";

export default function Confirm({ booking, settings, onHome }) {
  const b = booking;
  const dep = Math.round((b.price * settings.depositPct) / 100);
  const msg =
    "Hi Slay Studio ✨ I just booked online:\n" + b.serviceName + "\n" +
    fmtDate(b.date) + " at " + b.start + "\nName: " + b.clientName +
    "\nSending the " + dep.toLocaleString() + " EGP deposit now 💗";

  return (
    <>
      <div className="check">
        <svg viewBox="0 0 36 36"><path d="M9 18.5l6 6 12-13" /></svg>
      </div>
      <h2 style={{ textAlign: "center" }}>You’re almost booked</h2>

      <div className="card glass">
        <div className="summary" style={{ border: "none", background: "none", padding: 0 }}>
          <div>
            <div className="when">{fmtDate(b.date)} · {b.start}</div>
            <div className="svcn">{b.serviceName} · {b.clientName}</div>
          </div>
          <div className="amt">{b.price.toLocaleString()}</div>
        </div>
      </div>

      <div className="card deposit">
        <div className="eyebrow">Lock your slot</div>
        <p>
          Send a <b>{dep.toLocaleString()} EGP</b> deposit (50%) to Instapay <b>{settings.instapay}</b> —
          choose <b>account</b>, not wallet — then send the screenshot on WhatsApp.
        </p>
      </div>

      <a className="btn wa full glass" style={{ marginTop: 14 }} href={waLink(settings.whatsapp, msg)} target="_blank" rel="noopener noreferrer">
        Send my booking on WhatsApp
      </a>
      <button className="ghost full" style={{ marginTop: 9 }} onClick={onHome}>Back to styles</button>
    </>
  );
}
