'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CarFront, Heart, Home, PackageSearch, Truck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ITEMS = [
  { href: '/rentals', label: 'Rentals', icon: Home },
  { href: '/apartments/apply-engine', label: 'Apply', icon: PackageSearch },
  { href: '/cars', label: 'Cars', icon: CarFront },
  { href: '/work-vehicles', label: 'Work', icon: Truck },
  { href: '/saved', label: 'Saved', icon: Heart },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-gingerbread-300/60 bg-frosting-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5 text-[11px] font-semibold text-chocolate-800">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href || pathname.startsWith(it.href + '/');
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-0.5',
                  active && 'text-lightning-700',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
