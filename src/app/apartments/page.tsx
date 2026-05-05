import type { Metadata } from 'next';
import Link from 'next/link';
import { TopToggle } from '@/components/home/TopToggle';
import { RentalSearch } from '@/components/rentals/RentalSearch';
import { GingerbreadHero } from '@/components/theme/GingerbreadHero';
import { WorkbookTable } from '@/components/rentals/WorkbookTable';
import { WORKBOOK_FULL_LISTINGS } from '@/lib/data/workbook-listings-full';

export const metadata: Metadata = { title: 'Apartments' };

export default function ApartmentsPage() {
  const total = WORKBOOK_FULL_LISTINGS.length;
  return (
    <>
      <TopToggle />
      <GingerbreadHero
        title="Apartments only"
        subtitle="Apartment-only view across Greystar, Equity Residential, Essex, AvalonBay, Camden, FPI, UDR, Decron, Prime Residential, and more."
      />
      <p className="mt-3 text-xs text-chocolate-700">
        Need the fastest official route?{' '}
        <Link href="/apartments/apply-engine" className="font-semibold underline decoration-lightning-500 underline-offset-2">
          Open the Auto Apartment Apply Engine
        </Link>
        .{' '}
        Want townhomes too?{' '}
        <Link href="/rentals" className="underline decoration-lightning-500 underline-offset-2">See both</Link>.
      </p>

      <RentalSearch unitTypeLock="apartment" />

      <section className="mt-10">
        <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gingerbread-600">
              Ranked workbook · {total} listings · same details, sortable + searchable
            </p>
            <h2 className="font-display text-2xl font-extrabold text-chocolate-900">
              All workbook picks (1–{total})
            </h2>
            <p className="mt-1 max-w-3xl text-xs text-chocolate-700">
              Every spreadsheet listing inline: match %, fit tier, rent, washer/dryer · AC · pool · spa,
              safety, screening difficulty, and a one-tap Apply that prefers the canonical property
              page when a direct URL has been verified. Tap any rank to open its full research panel.{' '}
              <Link
                href="/apartments/workbook"
                className="font-semibold underline decoration-lightning-500 underline-offset-2"
              >
                Open the dedicated workbook view
              </Link>
              .
            </p>
          </div>
        </header>
        <WorkbookTable />
      </section>
    </>
  );
}
