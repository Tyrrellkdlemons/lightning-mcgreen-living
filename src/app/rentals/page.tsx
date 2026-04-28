import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { RentalSearch } from '@/components/rentals/RentalSearch';
import { GingerbreadHero } from '@/components/theme/GingerbreadHero';

export const metadata: Metadata = {
  title: 'Apartments & Townhomes',
  description: 'Find Southern California apartments and townhomes you are more likely to qualify for.',
};

export default function RentalsPage() {
  return (
    <>
      <TopToggle />
      <GingerbreadHero
        title="Apartments & Townhomes"
        subtitle="Real SoCal operators — Greystar, Irvine Company, Essex, AvalonBay, Camden, FPI, Western National, ConAm, MG, Alliance, Decron, UDR. See exactly who you'll be applying through and how strict their screening will be."
      />
      <RentalSearch />
    </>
  );
}
