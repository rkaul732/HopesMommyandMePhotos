"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SLOTS } from "../lib/slots";
import type { EventItem } from "../lib/events";
import { dateLabel, slotList, timeLabel } from "../lib/events";
import { Footer, Header, Hero } from "./site-shell";
type Person = { id: number; firstName: string; lastName: string; email: string; phone: string; createdAt: string };
type PhotoPerson = Person & { slot: number };
type CustomPerson = Person & { eventSlug: string; slotIndex: number | null };
export default function AdminDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [photos, setPhotos] = useState<PhotoPerson[]>([]);
  const [music, setMusic] = useState<Person[]>([]);
  const [custom, setCustom] = useState<CustomPerson[]>([]);
  const [selected, setSelected] = useState("mommy-and-me-photos");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { try { const [eventResponse, registrationResponse] = await Promise.all([fetch("/api/admin/events",{cache:"no-store"}),fetch("/api/admin/registrations",{cache:"no-store"})]); if (eventResponse.status === 401 || registrationResponse.status === 401) { setAuthenticated(false); return; } if (!eventResponse.ok || !registrationResponse.ok) throw new Error(); const eventData = await eventResponse.json() as {events:EventItem[]}; const data = await registrationResponse.json() as {photos:PhotoPerson[];music:Person[];custom:CustomPerson[]}; setEvents(eventData.events); setPhotos(data.photos); setMusic(data.music); setCustom(data.custom); setAuthenticated(true); setError(""); } catch { setError("Registrations are temporarily unavailable. Please refresh."); } },[]);
  useEffect(()=>{ void load(); },[load]);
  async function login(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(""); try { const response = await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})}); const data = await response.json() as {error?:string}; if (!response.ok) throw new Error(data.error || "Sign-in failed."); setPassword(""); await load(); } catch(failure) { setError(failure instanceof Error ? failure.message : "Sign-in failed."); } finally { setBusy(false); } }
  async function logout() { await fetch("/api/admin/logout",{method:"POST"}); setAuthenticated(false); setEvents([]); }
  const current = events.find(event=>event.slug === selected) || events[0];
  const rows: (Person | PhotoPerson | CustomPerson)[] = !current ? [] : current.legacyKind === "photos" ? photos : current.legacyKind === "music" ? music : custom.filter(person=>person.eventSlug === current.slug);
  const isAppointment = current?.mode === "appointment";
  const timeFor = (person: Person | PhotoPerson | CustomPerson, index: number) => current?.legacyKind === "photos" ? SLOTS[(person as PhotoPerson).slot]?.label : isAppointment ? slotList(current)[(person as CustomPerson).slotIndex ?? -1]?.label : index + 1;
  return <div className="site"><Header active="admin"/><main><Hero title={<>HOPES <em>Admin</em></>} description="View registrations for each HOPES event."/><section className="content"><div className="heading"><div><span className="eyebrow">EVENT REGISTRATIONS</span><h2>Admin dashboard</h2><p>Sign in to see the people registered for each event.</p></div>{authenticated && <button className="secondary" onClick={logout}>Sign out</button>}</div>{authenticated === false ? <form className="panel login" onSubmit={login}><h3>Admin sign in</h3><p>For authorized HOPES staff.</p><label>Email<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error && <p role="alert" className="error">{error}</p>}<button className="primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<span>→</span></button></form> : authenticated ? <><div className="admin-action-bar"><Link className="event-link" href="/admin/events">+ Create New Registration / Manage Events</Link></div><div className="panel dashboard"><div className="event-tabs" role="tablist" aria-label="Choose event">{events.map(event=><button key={event.slug} role="tab" aria-selected={current?.slug === event.slug} className={current?.slug === event.slug ? "selected" : ""} onClick={()=>setSelected(event.slug)}>{event.title} <span>{event.registered}{event.capacity !== null ? `/${event.capacity}` : ""}</span></button>)}</div><div className="dashboard-head"><div>{current ? `${dateLabel(current.date)}${current.startTime ? ` · ${timeLabel(current.startTime)}` : ""}${current.active ? "" : " · Closed"}` : "No events"}</div><button className="secondary" onClick={()=>void load()}>Refresh</button></div>{error && <p role="alert" className="error admin-error">{error}</p>}{rows.length ? <div className="table-wrap"><table><thead><tr><th>{isAppointment ? "Time" : "#"}</th><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th></tr></thead><tbody>{rows.map((person,index)=><tr key={person.id}><td>{timeFor(person,index)}</td><td><strong>{person.firstName} {person.lastName}</strong></td><td><a href={`mailto:${person.email}`}>{person.email}</a></td><td><a href={`tel:${person.phone}`}>{person.phone}</a></td><td>{new Date(person.createdAt).toLocaleString("en-US",{timeZone:"America/New_York",dateStyle:"medium",timeStyle:"short"})}</td></tr>)}</tbody></table></div> : <p className="empty">No registrations for this event yet.</p>}</div></> : <p>Loading registrations…</p>}</section></main><Footer/></div>;
}
