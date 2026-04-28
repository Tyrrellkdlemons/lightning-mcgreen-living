'use client';

import { useMemo, useState } from 'react';
import { REAL_RENTALS, type RentalWithPhotos } from '@/lib/data/real-rentals';
import { RentalCard } from './RentalCard';
import { RentalFilters, type RentalFilterState } from './RentalFilters';
import { ProfilePanel, useRenterProfile } from './ProfilePanel';

export function RentalSearch({ unitTypeLock }: { unitTypeLock?: 'apartment' | 'townhouse' }) {
  const [profile, setProfile] = useRenterProfile();
  const [filters, setFilters] = useState<RentalFilterState>({
    unit_type: unitTypeLock ?? 'all',
  });

  const results = useMemo(() => filterRentals(REAL_RENTALS, filters, unitTypeLock), [filters, unitTypeLock]);

  return (
    <div className="mt-4 flex flex-col gap-4 lg:flex-row">
      <RentalFilters initial={filters} onChange={setFilters} />
      <div className="flex-1 space-y-4">
        <ProfilePanel profile={profile} onChange={setProfile} />
        <div className="flex items-center justify-between text-sm text-chocolate-700">
          <span><strong>{results.length}</strong> result{results.length === 1 ? '' : 's'}</span>
          <span className="text-xs">SoCal-only · sorted by best fit</span>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((r) => (
            <li key={r.id}>
              <RentalCard rental={r} profile={profile} />
            </li>
          ))}
        </ul>
        {results.length === 0 && (
          <div className="cookie-card p-6 text-center text-sm text-chocolate-700">
            No matches with these filters. Try widening your max rent or city.
          </div>
        )}
      </div>
    </div>
  );
}

function filterRentals(
  rentals: RentalWithPhotos[],
  f: RentalFilterState,
  lock?: 'apartment' | 'townhouse',
): RentalWithPhotos[] {
  return rentals.filter((r) => {
    if (lock === 'apartment' && r.unit_type !== 'apartment') return false;
    if (lock === 'townhouse' && r.unit_type === 'apartment') return false;
    if (!lock) {
      if (f.unit_type === 'apartment' && r.unit_type !== 'apartment') return false;
      if (f.unit_type === 'townhouse' && r.unit_type === 'apartment') return false;
    }
    if (f.city && r.city !== f.city) return false;
    if (f.max_rent && r.min_rent > f.max_rent) return false;
    if (f.beds !== '' && f.beds != null && r.beds_max < f.beds) return false;
    if (f.pets && r.pet_policy && /no pets/i.test(r.pet_policy)) return false;
    if (f.parking_garage && !/garage|covered/i.test(r.parking_type ?? '')) return false;
    if (f.private_entrance && !r.private_entrance) return false;
    if (f.verified_special && !r.move_in_specials) return false;
    return true;
  });
}
