import type { Metadata } from 'next';
import Link from 'next/link';
import { TopToggle } from '@/components/home/TopToggle';
import { RentalSearch } from '@/components/rentals/RentalSearch';
import { GingerbreadHero } from '@/components/theme/GingerbreadHero';
import { WorkbookTable } from '@/components/rentals/WorkbookTable';
import { WORKBOOK_FULL_LISTINGS } from '@/lib/data/workbook-listings-full';

export const metadata: Metadata = {
  title: 'Apartments & Townhomes',
  description: 'Explore recorded rental research, compare costs and prepare questions for property providers.',
};

export default async function RentalsPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ state?: string; city?: string }> }) {
  const searchParams = await searchParamsPromise;

  const state = searchParams.state === 'CA' || searchParams.state === 'AZ' ? searchParams.state : undefined;
  const city = typeof searchParams.city === 'string' ? searchParams.city.trim().slice(0, 100) : undefined;
  const total = WORKBOOK_FULL_LISTINGS.length;
  return (
    <>
      <TopToggle />
      <GingerbreadHero
        title="Apartments & Townhomes"
        subtitle="Explore recorded Southern California rental and operator research. Compare the details, then confirm current availability, costs and screening requirements directly with the provider."
      />
      <RentalSearch key={`${state ?? ""}:${city ?? ""}`} initialState={state} initialCity={city} />

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
            screening difficulty, plus recorded source and map links.{' '}
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
