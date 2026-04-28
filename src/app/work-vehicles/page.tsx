import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { WorkSearch } from '@/components/work/WorkSearch';
import { Gumdrop } from '@/components/ui/Gumdrop';

export const metadata: Metadata = {
  title: 'Work Vehicles',
  description: 'Find Southern California cargo vans, box trucks, and pickups for jobs and small business work.',
};

export default function WorkVehiclesPage() {
  return (
    <>
      <TopToggle />
      <header className="mt-6">
        <Gumdrop tone="ok">Vehicle side · Rent for work</Gumdrop>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">Work vehicle rentals</h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          Cargo vans, box trucks, pickups, stake-bed and flatbed trucks for delivery, moving,
          construction, landscaping, cleaning, events, mobile detailing, hauling, furniture delivery,
          and any short-term business work.
        </p>
      </header>
      <WorkSearch />
    </>
  );
}
