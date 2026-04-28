'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const ITEMS = [
  { href: '/rentals',       label: 'Rentals',  emoji: '🏠' },
  { href: '/cars',          label: 'Cars',     emoji: '🚗' },
  { href: '/work-vehicles', label: 'Work',     emoji: '🚐' },
  { href: '/saved',         label: 'Saved',    emoji: '⭐' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-gingerbread-300/60 bg-frosting-50/95 backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4 text-xs font-semibold text-chocolate-800">
        {ITEMS.map((it) => {
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
                <span aria-hidden className="text-lg">{it.emoji}</span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
