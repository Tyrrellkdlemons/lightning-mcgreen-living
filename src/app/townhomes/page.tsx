import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { RentalSearch } from '@/components/rentals/RentalSearch';
import { GingerbreadHero } from '@/components/theme/GingerbreadHero';

export const metadata: Metadata = { title: 'Townhomes' };

export default async function TownhomesPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ state?: string; city?: string }> }) {
  const searchParams = await searchParamsPromise;

  const state = searchParams.state === 'CA' || searchParams.state === 'AZ' ? searchParams.state : undefined;
  const city = typeof searchParams.city === 'string' ? searchParams.city.trim().slice(0, 100) : undefined;
  return (
    <>
      <TopToggle />
      <GingerbreadHero
        title="Townhomes for rent"
        subtitle="Townhouse rentals + townhome-style apartments. Filter to garage, private entrance, or yard/patio. Two stories, more space, the same screening transparency."
      />
      <RentalSearch key={`${state ?? ""}:${city ?? ""}`} unitTypeLock="townhouse" initialState={state} initialCity={city} />
    </>
  );
}
