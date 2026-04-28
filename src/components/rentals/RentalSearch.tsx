'use client';

import { useEffect, useMemo, useState } from 'react';
import { REAL_RENTALS, type RentalWithPhotos } from '@/lib/data/real-rentals';
import { RentalCard } from './RentalCard';
import { RentalFilters, type RentalFilterState } from './RentalFilters';
import { ProfilePanel, useRenterProfile } from './ProfilePanel';
import { Pagination, paginate } from '@/components/common/Pagination';
import { SortDropdown, type SortKey } from '@/components/common/SortDropdown';
import { scoreRental } from '@/lib/scoring';

const PER_PAGE = 9;

export function RentalSearch({ unitTypeLock }: { unitTypeLock?: 'apartment' | 'townhouse' }) {
  const [profile, setProfile] = useRenterProfile();
  const [filters, setFilters] = useState<RentalFilterState>({ unit_type: unitTypeLock ?? 'all' });
  const [sort, setSort] = useState<SortKey>('best-fit');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterRentals(REAL_RENTALS, filters, unitTypeLock), [filters, unitTypeLock]);
  const sorted = useMemo(() => sortRentals(filtered, sort, profile), [filtered, sort, profile]);
  const { items: paged, pageCount } = paginate(sorted, page, PER_PAGE);

  // reset to page 1 whenever the filters / sort / lock change
  const filterKey = JSON.stringify(filters) + sort + (unitTypeLock ?? '');
  useEffect(() => { setPage(1); }, [filterKey]);

  return (
    <div className="mt-4 flex flex-col gap-4 lg:flex-row">
      <RentalFilters initial={filters} onChange={setFilters} />
      <div className="flex-1 space-y-4">
        <ProfilePanel profile={profile} onChange={setProfile} />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-chocolate-700">
          <span>
            <strong>{filtered.length}</strong> result{filtered.length === 1 ? '' : 's'} · SoCal-only
          </span>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paged.map((r) => (
            <li key={r.id}>
              <RentalCard rental={r} profile={profile} />
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <div className="cookie-card p-6 text-center text-sm text-chocolate-700">
            No matches. Try widening your max rent or city.
          </div>
        )}
        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
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

function sortRentals(rentals: RentalWithPhotos[], sort: SortKey, profile: any): RentalWithPhotos[] {
  const arr = [...rentals];
  if (sort === 'price-asc') return arr.sort((a, b) => a.min_rent - b.min_rent);
  if (sort === 'price-desc') return arr.sort((a, b) => b.min_rent - a.min_rent);
  if (sort === 'newest')
    return arr.sort((a, b) => +new Date(b.meta.last_verified_at) - +new Date(a.meta.last_verified_at));
  // best-fit (default): rank by fit score
  return arr.sort((a, b) => scoreRental(b, profile).score - scoreRental(a, profile).score);
}

