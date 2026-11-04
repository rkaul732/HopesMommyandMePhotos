"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { SLOTS } from "../lib/slots";

type Person = { id: number; slot: number; firstName: string; lastName: string; email: string; phone: string; createdAt: string };
export default function Home() {
  const [page, setPage] = useState<"register" | "admin">("register");
  const [full, setFull] = useState<number[]>([]);
  const [slot, setSlot] = useState<number | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState<number | null>(null);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [adminError, setAdminError] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [available, setAvailable] = useState(false);
  const refresh = useCallback(async () => {
    try { const r = await fetch("/api/availability", { cache: "no-store" }); if (!r.ok) throw new Error(); setFull(((await r.json()) as { fullSlots: number[] }).fullSlots); setAvailable(true); }
    catch { setAvailable(false); setError("Times are temporarily unavailable. Please refresh and try again."); }
  }, []);
  const refreshAdmin = useCallback(async () => {
    try { const r = await fetch("/api/admin/registrations", { cache: "no-store" }); if (r.status === 401) { setPeople(null); return; } if (!r.ok) throw new Error(); setPeople(((await r.json()) as { registrations: Person[] }).registrations); setAdminError(""); }
    catch { setAdminError("Could not load registrations. Please try again."); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { if (page === "admin") void refreshAdmin(); }, [page, refreshAdmin]);
  async function register(e: FormEvent) {
    e.preventDefault(); if (slot === null) { setError("Please choose a photo time."); return; }
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slot }) });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) { setError(data.error ?? "Please try again."); await refresh(); return; }
      setComplete(slot); setFull(current => [...current, slot]); setForm({ firstName: "", lastName: "", email: "", phone: "" });
    } catch { setError("Could not submit your registration. Please try again."); }
    finally { setBusy(false); }
  }
  async function signIn(e: FormEvent) {
    e.preventDefault(); setAdminBusy(true); setAdminError("");
    try { const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(login) }); const data = (await r.json()) as { error?: string }; if (!r.ok) { setAdminError(data.error ?? "Could not sign in."); return; } setLogin({ ...login, password: "" }); await refreshAdmin(); }
    catch { setAdminError("Could not sign in. Please try again."); }
    finally { setAdminBusy(false); }
  }
  async function signOut() { await fetch("/api/admin/logout", { method: "POST" }); setPeople(null); }
  return <div className="site">
    <header className="topbar"><div className="wordmark"><span className="star">✦</span><span>BRIGHT HARBOR<small>HEALTHCARE</small></span></div><nav aria-label="Site navigation"><button className={page === "register" ? "nav active" : "nav"} onClick={() => setPage("register")}>Registration</button><button className={page === "admin" ? "nav active" : "nav"} onClick={() => setPage("admin")}>Admin</button></nav></header>
    <main><section className="hero"><div className="hero-copy"><span className="eyebrow">BRIGHT HARBOR HEALTHCARE · HOPES PROGRAM</span><h1>Mommy <em>&</em> Me<br/>Photo Day</h1><p>A beautiful moment together deserves to be remembered. Reserve your time for a Mommy & Me photo session.</p><div className="hero-info"><span><b>DATE</b> To be announced</span><span><b>TIME</b> 9:00 AM – 1:00 PM</span></div></div><div className="hero-image"><img src="/bright-harbor-brand.jpeg" alt="Bright Harbor Healthcare lighthouse and lavender botanical branding"/></div></section>
    {page === "register" ? <section className="content"><div className="heading"><div><span className="eyebrow">SAVE YOUR SPOT</span><h2>Reserve your photo session</h2><p>Choose one available time, then enter your contact information. Each appointment is reserved for one registration.</p></div><span className="availability"><i/>{15 - full.length} of 15 times available</span></div>
      {complete !== null ? <div className="success" role="status"><span>✓</span><div><h3>You’re registered!</h3><p>Your photo time is <strong>{SLOTS[complete].label}</strong>. Please save this time for your records.</p><button className="link-button" onClick={() => { setComplete(null); setSlot(null); }}>Register another person</button></div></div> : <div className="cards"><div className="panel"><div className="panel-heading"><span className="number">01</span><div><h3>Select a time</h3><p>All times are Eastern Time</p></div></div><div className="times" role="group" aria-label="Photo appointment times">{SLOTS.map(item => <button key={item.id} type="button" disabled={full.includes(item.id) || !available} aria-pressed={slot === item.id} className={`time ${slot === item.id ? "selected" : ""} ${full.includes(item.id) ? "full" : ""}`} onClick={() => setSlot(item.id)}><b>{item.startLabel}</b><small>{full.includes(item.id) ? "Full" : slot === item.id ? "Selected" : "Available"}</small></button>)}</div><p className="hint">Appointments are 16 minutes long. A reserved time is marked full immediately.</p></div>
      <form className="panel form" onSubmit={register}><div className="panel-heading"><span className="number">02</span><div><h3>Your details</h3><p>We’ll use these to identify your registration</p></div></div><div className="two-fields"><label>First name<input required maxLength={80} autoComplete="given-name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="First name"/></label><label>Last name<input required maxLength={80} autoComplete="family-name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Last name"/></label></div><label>Email address<input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com"/></label><label>Phone number<input required type="tel" maxLength={25} autoComplete="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(732) 555-0123"/></label><div className="summary"><span>YOUR PHOTO TIME</span><strong>{slot === null ? "Please select a time" : SLOTS[slot].label}</strong></div>{error && <p className="error" role="alert">{error}</p>}<button className="primary" disabled={busy || slot === null || !available}>{busy ? "Reserving…" : "Complete registration"} <span>→</span></button><p className="privacy">Your information is visible only to authorized HOPES program admins.</p></form></div>}
    </section> : <section className="content"><div className="heading"><div><span className="eyebrow">HOPES PROGRAM</span><h2>Admin dashboard</h2><p>View registrations and appointment times.</p></div>{people && <button className="secondary" onClick={signOut}>Sign out</button>}</div>{people === null ? <form className="login panel" onSubmit={signIn}><h3>Admin sign in</h3><p>For Tonya Molhem and Rebecca Kaul</p><label>Email address<input required type="email" autoComplete="username" value={login.email} onChange={e => setLogin({ ...login, email: e.target.value })} placeholder="name@brightharbor.org"/></label><label>Password<input required type="password" autoComplete="current-password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} placeholder="Password"/></label>{adminError && <p className="error" role="alert">{adminError}</p>}<button className="primary" disabled={adminBusy}>{adminBusy ? "Signing in…" : "Sign in"} <span>→</span></button></form> : <div className="panel dashboard"><div className="dashboard-head"><span><strong>{people.length} / 15</strong> sessions reserved</span><button className="link-button" onClick={refreshAdmin}>Refresh list</button></div><div className="table-wrap"><table><thead><tr><th>Time</th><th>First name</th><th>Last name</th><th>Email</th><th>Phone</th><th>Registered</th></tr></thead><tbody>{people.map(row => <tr key={row.id}><td><strong>{SLOTS[row.slot]?.startLabel}</strong></td><td>{row.firstName}</td><td>{row.lastName}</td><td><a href={`mailto:${row.email}`}>{row.email}</a></td><td><a href={`tel:${row.phone}`}>{row.phone}</a></td><td>{new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td></tr>)}</tbody></table>{people.length === 0 && <p className="empty">No registrations yet. They’ll appear here when someone reserves a time.</p>}</div></div>}</section>}
    </main><footer><span>Bright Harbor Healthcare · HOPES Program</span><span>732-349-5550</span></footer>
  </div>;
}
