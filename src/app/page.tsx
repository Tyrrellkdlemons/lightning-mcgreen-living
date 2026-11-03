import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, CarFront, Truck, HeartHandshake, Check, Compass, Wallet, ClipboardCheck } from 'lucide-react';
import { Hero } from '@/components/home/Hero';
import { PLACES, stateSlug } from '@/lib/places';
export const metadata: Metadata = { alternates: { canonical: '/' } };
const paths = [
    { href: '/rentals', title: 'Find a place', text: 'Apartments and townhomes, with the details to plan your application.', icon: Building2, label: 'Explore rentals', className: 'home-path' },
    { href: '/cars', title: 'Find your ride', text: 'Compare cars, dealer sources, and the cost beyond the sticker price.', icon: CarFront, label: 'Explore cars', className: 'car-path' },
    { href: '/work-vehicles', title: 'Get to work', text: 'Cargo vans, trucks, and practical tools for your next job.', icon: Truck, label: 'Explore work vehicles', className: 'work-path' },
];
export default function HomePage() {
    const featured = ['ca-los-angeles', 'ca-san-diego', 'ca-sacramento', 'az-phoenix', 'az-tucson', 'az-flagstaff'];
    return (<div className="discovery-home">
      <Hero />
      <div className="coverage-strip"><span><Check size={16} aria-hidden/> California & Arizona guides</span><span><Check size={16} aria-hidden/> Original Apply Engine preserved</span><span><Check size={16} aria-hidden/> Source links you can check</span></div>
      <section className="home-section" aria-labelledby="path-title">
        <div className="section-heading"><div><p className="eyebrow">YOUR NEXT CHAPTER</p><h2 id="path-title">What brings you here?</h2></div><p>One starting point for the things<br className="hidden sm:block"/> that make a move work.</p></div>
        <div className="path-grid">{paths.map(({ href, title, text, icon: Icon, label, className }, index) => <Link key={href} href={href} className={`path-card ${className}`}><div className="path-top"><span className="path-number">0{index + 1}</span><Icon size={38} strokeWidth={1.5} aria-hidden/></div><h3>{title}</h3><p>{text}</p><span className="path-link">{label}<ArrowRight size={18} aria-hidden/></span></Link>)}</div>
      </section>
      <section className="home-section" aria-labelledby="places-title">
        <div className="section-heading"><div><p className="eyebrow">COAST TO DESERT</p><h2 id="places-title">Find your corner of the West.</h2></div><Link className="text-link" href="/places">All city guides <ArrowRight size={17} aria-hidden/></Link></div>
        <div className="state-grid"><Link href="/places/california" className="state-banner california"><span className="state-code" aria-hidden>CA</span><div><p className="eyebrow">THE GOLDEN STATE</p><h3>California</h3><p>Coastal cities, inland communities, and everywhere between.</p></div><ArrowRight size={27} aria-hidden/></Link><Link href="/places/arizona" className="state-banner arizona"><span className="state-code" aria-hidden>AZ</span><div><p className="eyebrow">THE GRAND CANYON STATE</p><h3>Arizona</h3><p>Desert metros, mountain towns, and your next possibility.</p></div><ArrowRight size={27} aria-hidden/></Link></div>
        <div className="city-grid">{featured.map(id => PLACES.find(p => p.id === id)).filter((p): p is (typeof PLACES)[number] => Boolean(p)).map(p => <Link className="explore-card city-link" key={p.id} href={`/places/${stateSlug(p.state)}/${p.slug}`}><span><small>{p.region} · {p.state}</small><strong>{p.name}</strong></span><ArrowRight size={18} aria-hidden/></Link>)}</div>
        <p className="coverage-note">Guides and statewide referral resources cover both states. Published property inventory currently concentrates on Southern California; a city guide does not mean units or shelter beds are available.</p>
      </section>
      <section className="planning-band" aria-labelledby="plan-title"><div className="planning-intro"><p className="eyebrow">LESS GUESSWORK. MORE DIRECTION.</p><h2 id="plan-title">Make the next move<br />a prepared one.</h2><p>A place is only part of the picture. Give your budget and application a plan, too.</p><Link className="finder-button" href="/life-budget">Plan my life budget <ArrowRight size={17} aria-hidden/></Link></div><ol className="planning-steps">{[{ icon: Compass, title: 'Explore your options', text: 'Start with a city, then check the original property or provider source.' }, { icon: Wallet, title: 'See the full picture', text: 'Compare move-in costs, transportation, and your monthly budget.' }, { icon: ClipboardCheck, title: 'Prepare, then apply', text: 'Use the Apply Engine and check the provider’s current requirements.' }].map(({ icon: Icon, title, text }, i) => <li key={title}><span className="step-icon"><Icon size={22} aria-hidden/></span><div><small>STEP 0{i + 1}</small><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
      <section className="help-band" aria-labelledby="help-title"><HeartHandshake size={36} strokeWidth={1.5} aria-hidden/><div><p className="eyebrow">YOU DO NOT HAVE TO FIGURE IT OUT ALONE</p><h2 id="help-title">Need housing or shelter support?</h2><p>Find official housing resources and local referral services in either state.</p></div><Link href="/places#housing-help" className="text-link">Find support <ArrowRight size={18} aria-hidden/></Link></section>
    </div>);
}
