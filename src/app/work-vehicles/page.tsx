import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { WorkSearch } from '@/components/work/WorkSearch';
import { RaceHero } from '@/components/theme/RaceHero';

export const metadata: Metadata = {
  title: 'Work Vehicles',
  description: 'Find Southern California cargo vans, box trucks, and pickups for jobs and small business work.',
};

export default function WorkVehiclesPage() {
  return (
    <>
      <TopToggle />
      <RaceHero
        variant="work"
        title="Work Vehicles · Service Lane"
        subtitle="Cargo vans, box trucks, pickups, stake-bed and flatbed trucks for delivery, moving, construction, landscaping, cleaning, events, mobile detail, hauling, furniture, and side-hustle work. Real chains: U-Haul, Penske, Enterprise Truck Rental, Home Depot, Ryder, Budget Truck, Fluid Truck."
      />
      <WorkSearch />
    </>
  );
}
