import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Search, ShieldCheck } from 'lucide-react';
export function Hero() {
    return (<section className="discovery-hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot"/> CALIFORNIA + ARIZONA</p>
        <h1 id="hero-title">A fresh start.<br />A sweeter <span>way home.</span></h1>
        <p className="hero-description">Find your next place, plan the move, and keep life moving. Real resources. Clear next steps. All in one place.</p>
        <form action="/places" method="get" className="place-finder" role="search" aria-label="Find a city guide">
          <label><span>Where to?</span><div className="finder-input"><MapPin size={18} aria-hidden/><input type="search" name="q" placeholder="City or region" aria-label="City or region"/></div></label>
          <label><span>State</span><select name="state" aria-label="State"><option value="">Both states</option><option value="CA">California</option><option value="AZ">Arizona</option></select></label>
          <button type="submit" className="finder-button"><Search size={19} aria-hidden/><span>Explore</span></button>
        </form>
        <div className="hero-shortcuts"><span>Start somewhere:</span><Link href="/places/california/los-angeles">Los Angeles</Link><Link href="/places/arizona/phoenix">Phoenix</Link><Link href="/places/california/san-diego">San Diego</Link></div>
        <p className="hero-trust"><ShieldCheck size={16} aria-hidden/> No approval promises. You stay in control.</p>
      </div>
      <div className="hero-art">
        <Image src="/backgrounds/ggb_bg_1.png" alt="Illustrated gingerbread neighborhood with green lightning and winding roads" fill priority sizes="(max-width: 767px) 100vw, 48vw" className="object-cover"/>
        <span className="art-label">A little imagination. A practical next step.</span>
        <Link href="/apartments/apply-engine" className="hero-pass"><span className="pass-icon"><MapPin size={22} aria-hidden/></span><span><strong>Your move starts here</strong><small>Open the Apartment Apply Engine</small></span><ArrowRight size={20} aria-hidden/></Link>
      </div>
    </section>);
}
