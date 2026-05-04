import type { Metadata } from 'next';
import Link from 'next/link';
import { TopToggle } from '@/components/home/TopToggle';
import { RentalSearch } from '@/components/rentals/RentalSearch';
import { GingerbreadHero } from '@/components/theme/GingerbreadHero';

export const metadata: Metadata = { title: 'Apartments' };

export default function ApartmentsPage() {
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
        Browse all 79 ranked picks side-by-side?{' '}
        <Link href="/apartments/workbook" className="font-semibold underline decoration-lightning-500 underline-offset-2">
          Inline workbook table
        </Link>
        .{' '}
        Want townhomes too?{' '}
        <Link href="/rentals" className="underline decoration-lightning-500 underline-offset-2">See both</Link>.
      </p>
      <RentalSearch unitTypeLock="apartment" />
    </>
  );
}
