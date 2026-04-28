import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { RentalSearch } from '@/components/rentals/RentalSearch';
import { Gumdrop } from '@/components/ui/Gumdrop';

export const metadata: Metadata = {
  title: 'Apartments & Townhomes',
  description: 'Find Southern California apartments and townhomes you are more likely to qualify for.',
};

export default function RentalsPage() {
  return (
    <>
      <TopToggle />
      <header className="mt-6">
        <Gumdrop tone="ok">Rental side</Gumdrop>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">
          Apartments &amp; Townhomes
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          Toggle apartments / townhomes / both in the filters. Every listing
          shows the application platform, manager, and fee transparency.
        </p>
      </header>
      <RentalSearch />
    </>
  );
}
