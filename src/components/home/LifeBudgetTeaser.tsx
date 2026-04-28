import Link from 'next/link';
import { LightningBolt } from '@/components/theme/LightningBolt';
import { Gumdrop } from '@/components/ui/Gumdrop';

/** Compact preview of the Life Budget mode. */
export function LifeBudgetTeaser() {
  return (
    <section className="mt-10">
      <div className="cookie-card relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <Gumdrop tone="ok">Combined view</Gumdrop>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-chocolate-900">
              Compare Life Budget
            </h2>
            <p className="mt-2 text-sm text-chocolate-700">
              Plug in monthly income, rent budget, car budget, and work-vehicle
              budget. We surface apartment + car + work-vehicle combos that
              actually add up — and we warn you when they don&apos;t.
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-chocolate-800 sm:grid-cols-4">
              <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Rent + car</li>
              <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Rent + work van</li>
              <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Live + drive + earn</li>
              <li className="rounded-full bg-frosting-200 px-2 py-1 text-center">Stress warnings</li>
            </ul>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <LightningBolt glow className="h-10" />
            <Link href="/life-budget" className="bolt-btn">
              Open Life Budget
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
