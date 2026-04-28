'use client';

import type { VehicleListing } from '@/types';
import { CarCard } from './CarCard';
import { useBuyerProfile } from './BuyerProfilePanel';

export function DealerInventory({ vehicles }: { vehicles: VehicleListing[] }) {
  const [profile] = useBuyerProfile();
  return (
    <ul className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((v) => (
        <li key={v.id}><CarCard vehicle={v} profile={profile} /></li>
      ))}
    </ul>
  );
}
