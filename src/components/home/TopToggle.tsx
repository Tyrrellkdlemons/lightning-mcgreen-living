'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const ITEMS = [
  { href: '/rentals',       label: 'Apartments & Townhomes' },
  { href: '/cars',          label: 'Cars' },
  { href: '/work-vehicles', label: 'Work Vehicles' },
  { href: '/life-budget',   label: 'Compare Life Budget' },
];

/** Big top toggle that appears under the hero on the homepage and rentals/cars/work pages. */
export function TopToggle() {
  const pathname = usePathname();
  return (
    <nav aria-label="Section toggle" className="mt-6 overflow-x-auto thin-scroll">
      <ul className="mx-auto inline-flex w-full min-w-max items-center gap-1 rounded-full border-2 border-gingerbread-300 bg-frosting-100 p-1 sm:w-auto">
        {ITEMS.map((it) => {
          const active =
            pathname === it.href ||
            pathname.startsWith(it.href + '/') ||
            (it.href === '/rentals' && (pathname.startsWith('/apartments') || pathname.startsWith('/townhomes')));
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm',
                  active
                    ? 'bg-lightning-500 text-chocolate-900 shadow-sm'
                    : 'text-chocolate-700 hover:bg-frosting-200',
                )}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
