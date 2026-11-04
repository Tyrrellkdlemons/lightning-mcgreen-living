'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Heart, Menu } from 'lucide-react';
import { LightningBolt } from '@/components/theme/LightningBolt';
import { ReduceMotionToggle } from './ReduceMotionToggle';
import { SearchBox } from './SearchBox';

const PRIMARY = [
  { href: '/homes', label: 'Find a home', sections: ['/homes', '/rentals', '/apartments', '/townhomes', '/properties', '/operators'] },
  { href: '/help', label: 'Shelter & support', sections: ['/help', '/assistance'] },
  { href: '/resources/assistance', label: 'Assistance', sections: ['/resources/assistance'] },
  { href: '/places', label: 'Explore places', sections: ['/places'] },
  { href: '/assistant', label: 'Ask Gemini', sections: ['/assistant'] },
];
const MORE = [
  { href: '/rentals', label: 'Rental planning & comparison' },
  { href: '/properties', label: 'Property research' },
  { href: '/resources', label: 'Source library' },
  { href: '/apartments/apply-engine', label: 'Apartment Apply Engine' },
  { href: '/cars', label: 'Cars' },
  { href: '/work-vehicles', label: 'Work vehicles' },
  { href: '/life-budget', label: 'Life budget' },
  { href: '/compare', label: 'Compare options' },
];

export function TopNav() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const active = (path: string) => pathname === path || pathname?.startsWith(path + '/');
  const closeMenu = () => { if (menu.current) menu.current.open = false; };
  useEffect(() => { if (menu.current) menu.current.open = false; }, [pathname]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && menu.current && !menu.current.contains(event.target)) menu.current.open = false;
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  return <header className="site-header">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="header-main">
      <Link href="/" className="brand-lockup" aria-label="Lightning McGreen Living home">
        <LightningBolt className="h-9" />
        <span>Lightning <b>McGreen</b><small>Living <span className="brand-region">· California + Arizona</span></small></span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary">{PRIMARY.map(link =>
        <Link key={link.href} href={link.href} aria-current={link.sections.some(active) ? 'page' : undefined}>{link.label}</Link>
      )}</nav>
      <div className="header-actions">
        <Link href="/saved" aria-label="Saved places and vehicles" aria-current={active('/saved') ? 'page' : undefined} className="saved-link"><Heart size={17} aria-hidden /><span>Saved</span></Link>
        <details ref={menu} className="mobile-menu" onKeyDown={event => {
          if (event.key === 'Escape') { closeMenu(); menu.current?.querySelector('summary')?.focus(); }
        }}>
          <summary aria-label="Navigation menu"><Menu className="menu-mobile-icon" size={20} aria-hidden /><span className="menu-mobile-label">Menu</span><span className="menu-desktop-label">More</span><ChevronDown className="menu-chevron" size={16} aria-hidden /></summary>
          <nav aria-label="Additional navigation" onClick={event => { if ((event.target as HTMLElement).closest('a')) closeMenu(); }}>
            <div className="menu-primary"><p className="menu-group-label">Start here</p>{PRIMARY.map(link => <Link key={link.href} href={link.href} aria-current={link.sections.some(active) ? 'page' : undefined}>{link.label}</Link>)}</div>
            <p className="menu-group-label">Research &amp; planning</p>
            {MORE.map(link => <Link key={link.href} href={link.href} aria-current={active(link.href) ? 'page' : undefined}>{link.label}</Link>)}
          </nav>
        </details>
      </div>
    </div>
    <div className="header-search"><SearchBox /><ReduceMotionToggle /></div>
  </header>;
}
