import Link from 'next/link';
import { LightningBolt } from '@/components/theme/LightningBolt';
import { ReduceMotionToggle } from './ReduceMotionToggle';

const TOP_LINKS = [
  { href: '/rentals', label: 'Apartments & Townhomes' },
  { href: '/cars', label: 'Cars' },
  { href: '/work-vehicles', label: 'Work Vehicles' },
  { href: '/life-budget', label: 'Compare Life Budget' },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-gingerbread-300/60 bg-frosting-50/95 backdrop-blur supports-[backdrop-filter]:bg-frosting-50/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-chocolate-800"
        >
          <LightningBolt glow className="h-7" />
          <span>
            Lightning <span className="text-lightning-600">McGreen</span> Living
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {TOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-3 py-1.5 text-sm font-semibold text-chocolate-800 hover:bg-frosting-200"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ReduceMotionToggle />
          <Link
            href="/saved"
            className="rounded-full border border-gingerbread-300 bg-frosting-100 px-3 py-1.5 text-xs font-semibold text-gingerbread-700 hover:bg-frosting-200"
          >
            Saved
          </Link>
        </div>
      </div>
    </header>
  );
}
