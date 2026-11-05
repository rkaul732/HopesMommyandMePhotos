import Link from "next/link";
import type { ReactNode } from "react";

type Detail = { label: string; value: string };

export function Header({ active }: { active?: "events" | "admin" }) {
  return <header className="topbar">
    <Link href="/" aria-label="HOPES events home"><img className="brand-logo" src="/bhh-logo.png" alt="Bright Harbor Healthcare"/></Link>
    <nav aria-label="Site navigation">
      <Link className={`nav ${active === "events" ? "active" : ""}`} href="/">All events</Link>
      <Link className={`nav ${active === "admin" ? "active" : ""}`} href="/admin">Admin</Link>
    </nav>
  </header>;
}

export function Hero({ title, description, details }: { title: ReactNode; description: string; details?: Detail[] }) {
  return <section className="hero">
    <div className="hero-copy">
      <span className="eyebrow">BRIGHT HARBOR HEALTHCARE · HOPES PROGRAM</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {details && <div className="hero-info">{details.map(item => <span key={item.label}><b>{item.label}</b> {item.value}</span>)}</div>}
    </div>
    <div className="hero-image"><img src="/bright-harbor-brand.jpeg" alt="Bright Harbor Healthcare lighthouse and lavender botanical branding"/></div>
  </section>;
}

export function Footer() {
  return <footer><span>Bright Harbor Healthcare · HOPES Program</span><span>732-349-5550</span></footer>;
}
