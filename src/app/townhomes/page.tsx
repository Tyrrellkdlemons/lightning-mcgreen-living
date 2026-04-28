import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { RentalSearch } from '@/components/rentals/RentalSearch';

export const metadata: Metadata = { title: 'Townhomes' };

export default function TownhomesPage() {
  return (
    <>
      <TopToggle />
      <header className="mt-6">
        <h1 className="font-display text-3xl font-extrabold text-chocolate-900">Townhomes for rent</h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          Townhouse rentals and townhome-style apartment units. Garage, private
          entrance, and yard/patio filters available.
        </p>
      </header>
      <RentalSearch unitTypeLock="townhouse" />
    </>
  );
}
