import Link from 'next/link';
import { Heart } from 'lucide-react';
import { LightningBolt } from '@/components/theme/LightningBolt';
import { ReduceMotionToggle } from './ReduceMotionToggle';
import { SearchBox } from './SearchBox';

const TOP_LINKS = [
  { href: '/rentals', label: 'Rentals' },
  { href: '/cars', label: 'Cars' },
  { href: '/work-vehicles', label: 'Work' },
  { href: '/life-budget', label: 'Life Budget' },
  { href: '/assistance', label: 'Help' },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-gingerbread-300/60 bg-frosting-50/95 backdrop-blur supports-[backdrop-filter]:bg-frosting-50/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-chocolate-800"
        >
          <LightningBolt glow className="h-7" />
          <span>
            Lightning <span className="text-lightning-600">McGreen</span> Living
          </span>
        </Link>

        <div className="order-3 w-full md:order-2 md:flex-1 md:px-4">
          <SearchBox />
        </div>

        <nav aria-label="Primary" className="order-2 hidden md:order-3 lg:block">
          <ul className="flex items-center gap-1">
            {TOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-2.5 py-1.5 text-sm font-semibold text-chocolate-800 hover:bg-frosting-200"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="order-2 flex items-center gap-2 md:order-4">
          <ReduceMotionToggle />
          <Link
            href="/saved"
            className="inline-flex items-center gap-1 rounded-full border border-gingerbread-300 bg-frosting-100 px-3 py-1.5 text-xs font-semibold text-gingerbread-700 hover:bg-frosting-200"
          >
            <Heart className="h-3.5 w-3.5" aria-hidden />
            Saved
          </Link>
        </div>
      </div>
    </header>
  );
}
