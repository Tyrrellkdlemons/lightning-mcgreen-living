import type { Metadata } from 'next';
import Link from 'next/link';
import { TopToggle } from '@/components/home/TopToggle';
import { RentalSearch } from '@/components/rentals/RentalSearch';
import { GingerbreadHero } from '@/components/theme/GingerbreadHero';
import { WorkbookTable } from '@/components/rentals/WorkbookTable';
import { WORKBOOK_FULL_LISTINGS } from '@/lib/data/workbook-listings-full';

export const metadata: Metadata = {
  title: 'Apartments & Townhomes',
  description: 'Find Southern California apartments and townhomes you are more likely to qualify for.',
};

export default function RentalsPage() {
  const total = WORKBOOK_FULL_LISTINGS.length;
  return (
    <>
      <TopToggle />
      <GingerbreadHero
        title="Apartments & Townhomes"
        subtitle="Real SoCal operators — Greystar, Irvine Company, Essex, AvalonBay, Camden, FPI, Western National, ConAm, MG, Alliance, Decron, UDR. See exactly who you'll be applying through and how strict their screening will be."
      />
      <RentalSearch />

      <section className="mt-10">
        <header className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gingerbread-600">
            Workbook · {total} ranked picks · sortable + searchable
          </p>
          <h2 className="font-display text-2xl font-extrabold text-chocolate-900">
            All workbook listings (1–{total})
          </h2>
          <p className="mt-1 max-w-3xl text-xs text-chocolate-700">
            Inline view of every spreadsheet listing — match %, fit tier, amenity dots,
            screening difficulty, plus one-tap Apply (direct URL when verified).{' '}
            <Link
              href="/apartments/apply-engine"
              className="font-semibold underline decoration-lightning-500 underline-offset-2"
            >
              Apply Engine
            </Link>
            {' · '}
            <Link
              href="/apartments/workbook"
              className="font-semibold underline decoration-lightning-500 underline-offset-2"
            >
              Dedicated workbook view
            </Link>
          </p>
        </header>
        <WorkbookTable />
      </section>
    </>
  );
}
