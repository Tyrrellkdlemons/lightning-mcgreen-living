import type { Metadata } from 'next';
import Link from 'next/link';
import { TopToggle } from '@/components/home/TopToggle';
import { WorkbookTable } from '@/components/rentals/WorkbookTable';
import { ListingResearchPanel } from '@/components/rentals/ListingResearchPanel';
import { WORKBOOK_FULL_LISTINGS } from '@/lib/data/workbook-listings-full';

export const metadata: Metadata = {
  title: 'Apartment Workbook (1–79) — inline view',
  description:
    'The full ranked apartment workbook rendered inline: search, sort, filter, and apply with one tap. No spreadsheet app required.',
};

export default function WorkbookPage() {
  const featured = WORKBOOK_FULL_LISTINGS.slice(0, 3);
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-2 sm:px-6">
      <TopToggle />
      <header className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gingerbread-600">
          Workbook · 79 ranked listings · sourced 2026-05-02
        </p>
        <h1 className="text-2xl font-bold text-chocolate-900 sm:text-3xl">
          Apartment Workbook — inline view
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-chocolate-700">
          Every listing from your spreadsheet is shown here without ambiguity:
          match %, fit tier, rent range, amenity dots (washer/dryer · AC · pool ·
          spa), safety, screening difficulty, and one-tap apply / map links.
          Tap any rank to open its full research panel below.{' '}
          <Link
            href="/apartments/apply-engine"
            className="underline decoration-lightning-500 underline-offset-2"
          >
            Apply Engine
          </Link>
          {' · '}
          <Link
            href="/apartments"
            className="underline decoration-lightning-500 underline-offset-2"
          >
            Apartments
          </Link>
        </p>
      </header>

      <WorkbookTable />

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {featured.map((x) => (
          <ListingResearchPanel key={x.id} rank={x.rank} />
        ))}
      </section>
    </main>
  );
}
