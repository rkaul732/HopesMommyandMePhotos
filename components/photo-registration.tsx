"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SLOTS } from "../lib/slots";
import { Footer, Header, Hero } from "./site-shell";

export default function PhotoRegistration() {
  const [full, setFull] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [slot, setSlot] = useState<number | null>(null);
  const [fields, setFields] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try { const response = await fetch("/api/availability", { cache: "no-store" }); if (!response.ok) throw new Error(); const data = await response.json() as { fullSlots: number[]; active: boolean }; setFull(data.fullSlots); setActive(data.active); setReady(true); }
    catch { setError("Availability is temporarily unavailable. Please try again shortly."); setReady(false); }
  }, []);
  useEffect(() => { void refresh(); const focus = () => void refresh(); window.addEventListener("focus", focus); const timer = window.setInterval(refresh, 30000); return () => { window.removeEventListener("focus", focus); window.clearInterval(timer); }; }, [refresh]);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!active || slot === null || full.includes(slot)) return;
    setBusy(true); setError("");
    try { const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, slot }) }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error || "Registration failed."); setDone(true); void refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Registration failed."); void refresh(); }
    finally { setBusy(false); }
  }
  const chosen = SLOTS.find(item => item.id === slot);
  return <div className="site"><Header/><main>
    <Hero title={<>Mommy &amp; Me <em>Photos</em></>} description="Reserve a photo session together with our HOPES program. Everyone who registers will receive 3–5 photos." details={[{label:"DATE",value:"Sunday, November 22, 2026"},{label:"TIME",value:"9:00 AM – 1:00 PM"}]}/>
    <section className="content"><Link className="back-link" href="/">← All events</Link><div className="heading"><div><span className="eyebrow">PHOTO REGISTRATION</span><h2>Reserve your session</h2><p>Salt Bridge Farm · 1521 Silverton Road, Toms River, NJ</p></div><span className={`availability ${ready && !active ? "is-full" : ""}`}><i/> {ready ? active ? `${15-full.length} times available` : "Registration closed" : "Checking availability"}</span></div>
      {done ? <div className="success"><span>✓</span><div><h3>You’re registered!</h3><p>Your Mommy &amp; Me photo session is {chosen?.label} on Sunday, November 22, 2026 at Salt Bridge Farm, 1521 Silverton Road, Toms River, NJ. You’ll receive 3–5 photos.</p><Link href="/">View all events</Link></div></div> : ready && !active ? <div className="panel"><h3>Registration is closed</h3><p>This event is no longer accepting registrations.</p></div> : <div className="cards"><section className="panel"><div className="panel-heading"><span className="number">1</span><div><h3>Choose a time</h3><p>Each photo session is 15 minutes.</p></div></div><div className="times">{SLOTS.map(item => <button type="button" key={item.id} className={`time ${full.includes(item.id) ? "full" : slot === item.id ? "selected" : ""}`} disabled={!ready || !active || full.includes(item.id) || busy} onClick={() => { setSlot(item.id); setError(""); }}><b>{item.label}</b><small>{full.includes(item.id) ? "Full" : slot === item.id ? "Selected" : "Available"}</small></button>)}</div><p className="hint">Full sessions cannot be selected. Availability updates automatically.</p></section>
      <section className="panel"><div className="panel-heading"><span className="number">2</span><div><h3>Your information</h3><p>Enter the contact details for your registration.</p></div></div><form className="form" onSubmit={submit}><div className="two-fields"><label>First name<input required maxLength={80} autoComplete="given-name" value={fields.firstName} onChange={e=>setFields({...fields,firstName:e.target.value})}/></label><label>Last name<input required maxLength={80} autoComplete="family-name" value={fields.lastName} onChange={e=>setFields({...fields,lastName:e.target.value})}/></label></div><label>Email<input required type="email" autoComplete="email" value={fields.email} onChange={e=>setFields({...fields,email:e.target.value})}/></label><label>Phone number<input required type="tel" autoComplete="tel" value={fields.phone} onChange={e=>setFields({...fields,phone:e.target.value})}/></label><div className="summary"><span>YOUR PHOTO SESSION</span><strong>{chosen?.label ?? "Choose an available time"} · November 22, 2026</strong></div>{error && <p role="alert" className="error">{error}</p>}<button className="primary" disabled={!ready || !active || slot === null || full.includes(slot) || busy}>{busy ? "Registering…" : "Complete registration"}<span>→</span></button><p className="privacy">One registration per photo timeslot.</p></form></section></div>}
    </section></main><Footer/></div>;
}
