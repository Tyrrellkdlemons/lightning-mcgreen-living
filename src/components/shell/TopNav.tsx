'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { Heart, Menu } from 'lucide-react';
import { LightningBolt } from '@/components/theme/LightningBolt';
import { ReduceMotionToggle } from './ReduceMotionToggle';
import { SearchBox } from './SearchBox';
const LINKS = [{ href: '/places', label: 'Explore places' }, { href: '/rentals', label: 'Rentals' }, { href: '/cars', label: 'Cars' }, { href: '/work-vehicles', label: 'Work vehicles' }, { href: '/life-budget', label: 'Life budget' }, { href: '/help', label: 'Get help' }];
export function TopNav() {
    const menu = useRef<HTMLDetailsElement>(null);
    const closeMenu = () => { if (menu.current)
        menu.current.open = false; };
    return <header className="site-header"><a href="#main-content" className="skip-link">Skip to content</a><div className="header-main"><Link href="/" className="brand-lockup"><LightningBolt className="h-9"/><span>Lightning <b>McGreen</b><small>LIVING · CALIFORNIA + ARIZONA</small></span></Link><nav className="desktop-nav" aria-label="Primary">{LINKS.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}</nav><div className="header-actions"><Link href="/saved" aria-label="Saved places and vehicles" className="saved-link"><Heart size={16} aria-hidden/><span>Saved</span></Link><details onKeyDown={(event) => { if (event.key === "Escape") { closeMenu(); menu.current?.querySelector("summary")?.focus(); } }} ref={menu} className="mobile-menu"><summary aria-label="Open navigation"><Menu size={22} aria-hidden/><span>Menu</span></summary><nav aria-label="More navigation" onClick={closeMenu}>{LINKS.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}<Link href="/properties">Property views</Link><Link href="/resources">Source library</Link><Link href="/apartments/apply-engine">Apartment Apply Engine</Link></nav></details></div></div><div className="header-search"><SearchBox /><ReduceMotionToggle /></div></header>;
}
