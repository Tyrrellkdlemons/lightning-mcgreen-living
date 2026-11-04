import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, CarFront, Truck, HeartHandshake, Check, Compass, Wallet, ClipboardCheck, MessageCircle } from 'lucide-react';
import { Hero } from '@/components/home/Hero';
import { PLACES, stateSlug } from '@/lib/places';

export const metadata: Metadata = { alternates: { canonical: '/' } };
const paths = [
  { href: '/homes', title: 'Find a home', text: 'Search every California and Arizona Census city. Explore rentals and homes for sale with dated source evidence.', icon: Building2, label: 'Rent or buy by city', className: 'home-path' },
  { href: '/help', title: 'Shelter & support', text: 'Find local referrals and practical help staying housed. Confirm intake with the provider.', icon: HeartHandshake, label: 'Find my next step', className: 'support-path' },
  { href: '/places', title: 'Explore places', text: 'Get to know California and Arizona cities, with local context and useful source links.', icon: Compass, label: 'Choose a city', className: 'places-path' },
  { href: '/assistant', title: 'Ask Gemini', text: 'Ask a general housing question and follow the sources. Keep personal details out.', icon: MessageCircle, label: 'Start a question', className: 'assistant-path' },
];
const tools = [
  { href: '/cars', title: 'Find your ride', text: 'Cars, dealer sources and ownership costs', icon: CarFront },
  { href: '/work-vehicles', title: 'Get to work', text: 'Vans, trucks and work-vehicle planning', icon: Truck },
  { href: '/life-budget', title: 'Plan the full budget', text: 'Housing and transportation together', icon: Wallet },
];
const steps = [
  { icon: Compass, title: 'Explore a possibility', text: 'Open a city or property page. Check the original source and when its information was recorded.', href: '/properties', label: 'Open property research' },
  { icon: Wallet, title: 'Compare the full costs', text: 'Plan for rent, move-in costs and transportation using figures you confirm with the provider.', href: '/life-budget', label: 'Try the life budget' },
  { icon: ClipboardCheck, title: 'Prepare your next step', text: 'Gather questions, request current screening criteria, and use the provider’s confirmed application.', href: '/apartments/apply-engine', label: 'Open the Apply Engine' },
];

export default function HomePage() {
  const featured = ['ca-los-angeles', 'ca-san-diego', 'ca-sacramento', 'az-phoenix', 'az-tucson', 'az-flagstaff'];
  return <div className="discovery-home">
    <Hero />
    <div className="coverage-strip"><span><Check size={16} aria-hidden />California &amp; Arizona guides</span><span><Check size={16} aria-hidden />Practical planning tools</span><span><Check size={16} aria-hidden />Sources you can check</span></div>

    <section className="home-section home-start" aria-labelledby="path-title">
      <div className="section-heading"><div><p className="eyebrow">Start with what you need</p><h2 id="path-title">One next step is enough.</h2></div><p>Choose a path.<br />You can explore the rest anytime.</p></div>
      <div className="path-grid">{paths.map(({ href, title, text, icon: Icon, label, className }, index) =>
        <Link key={href} href={href} className={'path-card ' + className}><div className="path-top"><span className="path-number">0{index + 1}</span><span className="path-icon"><Icon size={26} strokeWidth={1.7} aria-hidden /></span></div><h3>{title}</h3><p>{text}</p><span className="path-link">{label}<ArrowRight size={18} aria-hidden /></span></Link>
      )}</div>
      <div className="home-utilities" aria-label="Transport and budgeting tools">{tools.map(({ href, title, text, icon: Icon }) =>
        <Link key={href} href={href} className="utility-link"><Icon size={24} strokeWidth={1.7} aria-hidden /><span><strong>{title}</strong><small>{text}</small></span><ArrowRight size={17} aria-hidden /></Link>
      )}</div>
    </section>

    <section className="help-band" aria-labelledby="assistance-callout"><Wallet size={36} strokeWidth={1.5} aria-hidden /><div><p className="eyebrow">Plan your housing costs</p><h2 id="assistance-callout">Need help with a down payment or rent?</h2><p>We’ve mapped programs across California and Arizona. Compare funding status, service areas and sources, then confirm with the administrator.</p></div><Link href="/resources/assistance" className="text-link">Explore assistance<ArrowRight size={18} aria-hidden /></Link></section>

    <section className="planning-band" aria-labelledby="plan-title">
      <div className="planning-intro"><p className="eyebrow">A little guidance for your first visit</p><h2 id="plan-title">From looking<br />to moving forward.</h2><p>Use this site to research and prepare. Properties and service providers confirm availability, eligibility and final terms.</p><Link href="/help" className="text-link">Help me choose a next step<ArrowRight size={17} aria-hidden /></Link></div>
      <ol className="planning-steps">{steps.map(({ icon: Icon, title, text, href, label }, index) => <li key={title}><span className="step-icon"><Icon size={22} aria-hidden /></span><div><small>Step 0{index + 1}</small><h3>{title}</h3><p>{text}</p><Link href={href}>{label}<ArrowRight size={15} aria-hidden /></Link></div></li>)}</ol>
    </section>

    <section className="home-section" aria-labelledby="places-title">
      <div className="section-heading"><div><p className="eyebrow">Coast to desert</p><h2 id="places-title">Find your corner of the West.</h2></div><Link className="text-link" href="/places">All city guides<ArrowRight size={17} aria-hidden /></Link></div>
      <div className="state-grid">
        <Link href="/places/california" className="state-banner california"><span className="state-code" aria-hidden>CA</span><div><p className="eyebrow">The Golden State</p><h3>California</h3><p>Coastal cities, inland communities, and places between.</p></div><ArrowRight size={27} aria-hidden /></Link>
        <Link href="/places/arizona" className="state-banner arizona"><span className="state-code" aria-hidden>AZ</span><div><p className="eyebrow">The Grand Canyon State</p><h3>Arizona</h3><p>Desert metros, mountain towns, and new possibilities.</p></div><ArrowRight size={27} aria-hidden /></Link>
      </div>
      <div className="city-grid">{featured.map(id => PLACES.find(place => place.id === id)).filter((place): place is (typeof PLACES)[number] => Boolean(place)).map(place =>
        <Link className="explore-card city-link" key={place.id} href={'/places/' + stateSlug(place.state) + '/' + place.slug}><span><small>{place.region} · {place.state}</small><strong>{place.name}</strong></span><ArrowRight size={18} aria-hidden /></Link>
      )}</div>
      <p className="coverage-note">Guides and statewide referral resources cover both states. Published rental planning records concentrate on Southern California. A city guide does not establish available units or shelter beds.</p>
    </section>

    <section className="home-section" aria-labelledby="research-title">
      <div className="section-heading"><div><p className="eyebrow">Look a little closer</p><h2 id="research-title">Keep the source in sight.</h2></div><p>Recorded details and original links<br />help you ask better questions.</p></div>
      <div className="state-grid">
        <Link className="explore-card research-link" href="/properties"><span className="research-icon"><Building2 size={28} aria-hidden /></span><h3>79 property research pages</h3><p>The original workbook, with individual pages, map context, source links and questions to ask.</p><span className="text-link">Explore the workbook<ArrowRight size={17} aria-hidden /></span></Link>
        <Link className="explore-card research-link" href="/resources"><span className="research-icon"><Compass size={28} aria-hidden /></span><h3>Housing &amp; help sources</h3><p>Search property providers, housing counselors and practical support by state and need.</p><span className="text-link">Find a source<ArrowRight size={17} aria-hidden /></span></Link>
      </div>
    </section>

    <section className="help-band" aria-labelledby="help-title"><HeartHandshake size={36} strokeWidth={1.5} aria-hidden /><div><p className="eyebrow">Support starts with a conversation</p><h2 id="help-title">Need help with housing today?</h2><p>Find housing and shelter referral services, then ask about current intake and next steps.</p></div><Link href="/help" className="text-link">Find support<ArrowRight size={18} aria-hidden /></Link></section>
  </div>;
}
