'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CarFront, Heart, Home, PackageSearch, Truck } from 'lucide-react';
import { useSavedStore } from '@/lib/store/compare';

const ITEMS = [
  { href: '/homes', label: 'Homes', icon: Home },
  { href: '/apartments/apply-engine', label: 'Apply', icon: PackageSearch },
  { href: '/cars', label: 'Cars', icon: CarFront },
  { href: '/work-vehicles', label: 'Work', icon: Truck },
  { href: '/saved', label: 'Saved', icon: Heart },
];

export function isBottomNavActive(pathname: string, href: string) {
  const within = (route: string) => pathname === route || pathname.startsWith(route + '/');
  if (href === '/homes' || href === '/rentals') {
    return !within('/apartments/apply-engine') && ['/homes', '/rentals', '/apartments', '/townhomes', '/properties'].some(within);
  }
  return within(href);
}

export function BottomNav() {
  const pathname = usePathname();
  const savedCount = useSavedStore((state) => state.ids.length);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  return (
    <nav aria-label="Mobile primary" className="app-bottom-nav">
      <ul>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isBottomNavActive(pathname, item.href);
          const count = item.href === '/saved' && ready ? savedCount : 0;
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? 'page' : undefined}
                aria-label={count > 0 ? `Saved, ${count} item${count === 1 ? '' : 's'} on this device` : undefined}>
                <span className="app-tab-icon">
                  <Icon size={21} aria-hidden="true" />
                  {count > 0 && <span className="app-tab-count" aria-hidden="true">{count > 99 ? '99+' : count}</span>}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
