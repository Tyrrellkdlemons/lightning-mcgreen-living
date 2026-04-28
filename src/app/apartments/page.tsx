import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { RentalSearch } from '@/components/rentals/RentalSearch';

export const metadata: Metadata = { title: 'Apartments' };

export default function ApartmentsPage() {
  return (
    <>
      <TopToggle />
      <header className="mt-6">
        <h1 className="font-display text-3xl font-extrabold text-chocolate-900">Apartments</h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          Apartment-only view. Want townhomes too?{' '}
          <a href="/rentals" className="underline decoration-lightning-500 underline-offset-2">See both</a>.
        </p>
      </header>
      <RentalSearch unitTypeLock="apartment" />
    </>
  );
}
