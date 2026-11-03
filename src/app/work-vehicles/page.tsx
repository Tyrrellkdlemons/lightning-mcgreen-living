import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { WorkSearch } from '@/components/work/WorkSearch';
import { RaceHero } from '@/components/theme/RaceHero';

export const metadata: Metadata = {
  title: 'Work Vehicles',
  description: 'Find California and Arizona cargo vans, box trucks, and pickups for jobs and small business work.',
};

export default function WorkVehiclesPage({ searchParams }: { searchParams: { state?: string; city?: string } }) {
  const state = searchParams.state === 'CA' || searchParams.state === 'AZ' ? searchParams.state : undefined;
  const city = typeof searchParams.city === 'string' ? searchParams.city.trim().slice(0, 100) : undefined;
  return (
    <>
      <TopToggle />
      <RaceHero
        variant="work"
        title="Work Vehicles · Service Lane"
        subtitle="Cargo vans, box trucks, pickups, stake-bed and flatbed trucks for delivery, moving, construction, landscaping, cleaning, events, mobile detail, hauling, furniture, and side-hustle work. Real chains: U-Haul, Penske, Enterprise Truck Rental, Home Depot, Ryder, Budget Truck, Fluid Truck."
      />
      <WorkSearch key={`${state ?? ""}:${city ?? ""}`} initialState={state} />
    </>
  );
}
