import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { RentalSearch } from '@/components/rentals/RentalSearch';
import { GingerbreadHero } from '@/components/theme/GingerbreadHero';

export const metadata: Metadata = { title: 'Townhomes' };

export default function TownhomesPage() {
  return (
    <>
      <TopToggle />
      <GingerbreadHero
        title="Townhomes for rent"
        subtitle="Townhouse rentals + townhome-style apartments. Filter to garage, private entrance, or yard/patio. Two stories, more space, the same screening transparency."
      />
      <RentalSearch unitTypeLock="townhouse" />
    </>
  );
}
