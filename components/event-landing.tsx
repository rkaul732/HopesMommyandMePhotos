"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Footer, Header, Hero } from "./site-shell";

type Counts = { photos: number | null; music: number | null };

export default function EventLanding() {
  const [counts, setCounts] = useState<Counts>({ photos: null, music: null });
  const refresh = useCallback(async () => {
    const [photos, music] = await Promise.allSettled([
      fetch("/api/availability", { cache: "no-store" }).then(async r => { if (!r.ok) throw new Error(); return (await r.json() as { fullSlots: number[] }).fullSlots.length; }),
      fetch("/api/music/availability", { cache: "no-store" }).then(async r => { if (!r.ok) throw new Error(); return (await r.json() as { registered: number }).registered; }),
    ]);
    setCounts({ photos: photos.status === "fulfilled" ? photos.value : null, music: music.status === "fulfilled" ? music.value : null });
  }, []);
  useEffect(() => {
    const update = () => { if (document.visibilityState === "visible") void refresh(); };
    void refresh();
    document.addEventListener("visibilitychange", update);
    const interval = window.setInterval(update, 30_000);
    return () => { document.removeEventListener("visibilitychange", update); window.clearInterval(interval); };
  }, [refresh]);
  return <div className="site">
    <Header active="events"/>
    <main>
      <Hero title={<>HOPES <em>Events</em></>} description="Make memories together. Choose an upcoming HOPES event and reserve your place."/>
      <section className="content">
        <div className="heading"><div><span className="eyebrow">UPCOMING EVENTS</span><h2>Choose your event</h2><p>Select an event below to see the details and register.</p></div></div>
        <div className="event-grid">
          <article className="event-card">
            <span className="event-kind">PHOTOS</span>
            <h3>Mommy &amp; Me Photos</h3>
            <p>A 15-minute photo session together. Everyone who registers will receive 3–5 photos.</p>
            <dl><div><dt>Date</dt><dd>Sunday, November 22, 2026</dd></div><div><dt>Time</dt><dd>9:00 AM – 1:00 PM</dd></div><div><dt>Place</dt><dd>Salt Bridge Farm, 1521 Silverton Road, Toms River, NJ</dd></div></dl>
            <div className="event-card-bottom"><span className={`event-count ${counts.photos === 15 ? "is-full" : ""}`}>{counts.photos === null ? "Checking availability…" : counts.photos === 15 ? "Registration full" : `${15 - counts.photos} of 15 times available`}</span><Link className="event-link" href="/mommy-and-me-photos">View event <span aria-hidden="true">→</span></Link></div>
          </article>
          <article className="event-card">
            <span className="event-kind">MUSIC</span>
            <h3>Mommy &amp; Me Music Class</h3>
            <p>Make music and enjoy time together at our HOPES Mommy &amp; Me class.</p>
            <dl><div><dt>Date</dt><dd>Wednesday, November 25, 2026</dd></div><div><dt>Time</dt><dd>9:30 AM</dd></div><div><dt>Capacity</dt><dd>10 registrations</dd></div></dl>
            <div className="event-card-bottom"><span className={`event-count ${counts.music === 10 ? "is-full" : ""}`}>{counts.music === null ? "Checking availability…" : counts.music === 10 ? "Registration full" : `${10 - counts.music} of 10 spots available`}</span><Link className="event-link" href="/mommy-and-me-music">View event <span aria-hidden="true">→</span></Link></div>
          </article>
        </div>
      </section>
    </main>
    <Footer/>
  </div>;
}
