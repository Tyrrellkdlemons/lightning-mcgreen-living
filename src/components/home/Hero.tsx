import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, HeartHandshake, MapPin, Search, ShieldCheck } from 'lucide-react';

export function Hero() {
  return <section className="discovery-hero" aria-labelledby="hero-title">
    <div className="hero-copy">
      <p className="eyebrow"><span className="status-dot" aria-hidden /> California + Arizona</p>
      <h1 id="hero-title">A fresh start.<br />A clearer <span>way home.</span></h1>
      <p className="hero-description">A place to begin your housing search, find local support, and prepare for what comes next.</p>
      <div className="hero-actions">
        <Link href="/rentals" className="finder-button"><Building2 size={19} aria-hidden />Find a home<ArrowRight size={18} aria-hidden /></Link>
        <Link href="/help" className="hero-support-link"><HeartHandshake size={19} aria-hidden />Shelter &amp; support</Link>
      </div>
      <form action="/places" method="get" className="place-finder" role="search" aria-label="Find a city guide">
        <label><span>Explore a place</span><div className="finder-input"><MapPin size={18} aria-hidden /><input type="search" name="q" placeholder="City or region" aria-label="City or region" /></div></label>
        <label><span>State</span><select name="state" aria-label="State"><option value="">Both states</option><option value="CA">California</option><option value="AZ">Arizona</option></select></label>
        <button type="submit" className="finder-button"><Search size={18} aria-hidden /><span>Explore</span></button>
      </form>
      <div className="hero-shortcuts"><Link href="/places">Browse city guides <ArrowRight size={14} aria-hidden /></Link><Link href="/assistant">Unsure where to start? Ask Gemini <ArrowRight size={14} aria-hidden /></Link></div>
      <p className="hero-trust"><ShieldCheck size={17} aria-hidden />Research and preparation. You make the decisions.</p>
    </div>
    <div className="hero-art">
      <Image src="/backgrounds/ggb_bg_1.png" alt="" fill priority sizes="(max-width: 767px) 100vw, 48vw" className="object-cover" />
      <span className="art-label">Decorative neighborhood illustration</span>
      <Link href="/apartments/apply-engine" className="hero-pass"><span className="pass-icon"><MapPin size={22} aria-hidden /></span><span><strong>Turn research into a plan.</strong><small>Open the Apartment Apply Engine</small></span><ArrowRight size={20} aria-hidden /></Link>
    </div>
  </section>;
}
