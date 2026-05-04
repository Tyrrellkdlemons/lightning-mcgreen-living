'use client';

import { useEffect, useMemo, useState } from 'react';
import { REAL_RENTALS, type RentalWithPhotos } from '@/lib/data/real-rentals';
import { RentalCard } from './RentalCard';
import { RentalFilters, type RentalFilterState } from './RentalFilters';
import { ProfilePanel, useRenterProfile } from './ProfilePanel';
import { Pagination, paginate } from '@/components/common/Pagination';
import { SortDropdown, type SortKey } from '@/components/common/SortDropdown';
import { scoreRental } from '@/lib/scoring';
import { usd } from '@/lib/calculators';
import {
  WORKBOOK_CITY_OPTIONS,
  WORKBOOK_RANKED_LISTINGS,
  workbookMapUrl,
  workbookPrimaryUrl,
  type WorkbookRankedListing,
} from '@/lib/data/workbook-ranked-listings';

const PER_PAGE = 9;

export function RentalSearch({ unitTypeLock }: { unitTypeLock?: 'apartment' | 'townhouse' }) {
  const [profile, setProfile] = useRenterProfile();
  const [filters, setFilters] = useState<RentalFilterState>({ unit_type: unitTypeLock ?? 'all' });
  const [sort, setSort] = useState<SortKey>('best-fit');
  const [page, setPage] = useState(1);
  const [workbookQuery, setWorkbookQuery] = useState('');
  const [workbookCity, setWorkbookCity] = useState('all');
  const [workbookLimit, setWorkbookLimit] = useState(10);

  const filtered = useMemo(() => filterRentals(REAL_RENTALS, filters, unitTypeLock), [filters, unitTypeLock]);
  const sorted = useMemo(() => sortRentals(filtered, sort, profile), [filtered, sort, profile]);
  const { items: paged, pageCount } = paginate(sorted, page, PER_PAGE);
  const workbookFiltered = useMemo(() => {
    const q = workbookQuery.trim().toLowerCase();
    return WORKBOOK_RANKED_LISTINGS.filter((x) => {
      if (workbookCity !== 'all' && x.city !== workbookCity) return false;
      if (!q) return true;
      const blob = [x.property_name, x.city, x.county, x.address, x.screening_vendor, x.application_platform_inferred]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }, [workbookCity, workbookQuery]);
  const workbookVisible = useMemo(() => workbookFiltered.slice(0, workbookLimit), [workbookFiltered, workbookLimit]);

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
        <p className="text-xs text-chocolate-700">
          Best-fit ranking prefers AppFolio and On-Site application portals, without excluding stricter operators.
        </p>
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

        <details className="cookie-card p-4">
          <summary className="cursor-pointer font-display text-base font-extrabold text-chocolate-900">
            Workbook Source Links ({WORKBOOK_RANKED_LISTINGS.length})
          </summary>
          <p className="mt-1 text-xs text-chocolate-700">
            Structured rows imported from your ranked workbook. This panel is collapsed by default to keep rentals clean.
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              value={workbookQuery}
              onChange={(e) => { setWorkbookQuery(e.target.value); setWorkbookLimit(10); }}
              placeholder="Search workbook listings"
              className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
            />
            <select
              value={workbookCity}
              onChange={(e) => { setWorkbookCity(e.target.value); setWorkbookLimit(10); }}
              className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="all">All workbook cities</option>
              {WORKBOOK_CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-chocolate-700">
            Showing {workbookVisible.length} of {workbookFiltered.length}
          </p>
          <ul className="mt-2 space-y-2">
            {workbookVisible.map((item) => (
              <li key={item.id} className="rounded-md bg-frosting-100 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="num text-xs font-extrabold text-chocolate-700">#{item.rank ?? 'n/a'}</span>
                  <span className="font-bold text-chocolate-900">{item.property_name}</span>
                  <span className="text-xs text-chocolate-700">{item.city ?? 'SoCal'}</span>
                  <span className="text-xs text-chocolate-700">{item.screening_difficulty_label ?? 'Verify'}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-chocolate-700">{workbookRent(item)}</span>
                  {item.application_platform_inferred && <span className="text-chocolate-700">via {item.application_platform_inferred}</span>}
                  {workbookPrimaryUrl(item) && (
                    <a
                      href={workbookPrimaryUrl(item)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-chocolate-700 underline decoration-lightning-500 underline-offset-2"
                    >
                      Direct listing
                    </a>
                  )}
                  {workbookMapUrl(item) && (
                    <a
                      href={workbookMapUrl(item)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-chocolate-700 underline decoration-lightning-500 underline-offset-2"
                    >
                      Map
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {workbookFiltered.length > workbookVisible.length && (
            <button type="button" onClick={() => setWorkbookLimit((n) => n + 10)} className="cinnamon-btn mt-3 text-sm">
              Show more
            </button>
          )}
        </details>
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
    const apartmentSide = r.unit_type === 'apartment' || r.unit_type === 'townhome-style-apartment';
    if (lock === 'apartment' && !apartmentSide) return false;
    if (lock === 'townhouse' && r.unit_type !== 'townhouse') return false;
    if (!lock) {
      if (f.unit_type === 'apartment' && !apartmentSide) return false;
      if (f.unit_type === 'townhouse' && r.unit_type !== 'townhouse') return false;
    }
    if (f.city && r.city !== f.city) return false;
    if (f.max_rent && r.min_rent > f.max_rent) return false;
    if (f.beds !== '' && f.beds != null && r.beds_max < f.beds) return false;
    if (f.pets && r.pet_policy && /no pets/i.test(r.pet_policy)) return false;
    if (f.parking_garage && !/garage|covered/i.test(r.parking_type ?? '')) return false;
    if (f.private_entrance && !r.private_entrance) return false;
    if (f.verified_special && !r.move_in_specials) return false;
    if (f.accessibility && !(r.accessibility_features && r.accessibility_features.length > 0)) return false;
    if (f.avoid_strict) {
      const stack = require('@/lib/data/screening-stacks').inferScreeningStack(r.application_platform, r.manager, r.screening_vendor);
      if (stack.strictness === 'strict' || stack.strictness === 'premium') return false;
    }
    return true;
  });
}

function sortRentals(rentals: RentalWithPhotos[], sort: SortKey, profile: any): RentalWithPhotos[] {
  const arr = [...rentals];
  if (sort === 'price-asc') return arr.sort((a, b) => a.min_rent - b.min_rent);
  if (sort === 'price-desc') return arr.sort((a, b) => b.min_rent - a.min_rent);
  if (sort === 'newest')
    return arr.sort((a, b) => +new Date(b.meta.last_verified_at) - +new Date(a.meta.last_verified_at));
  // best-fit (default): rank by fit score, then boost preferred portals.
  return arr.sort((a, b) => rankForBestFit(b, profile) - rankForBestFit(a, profile));
}

function rankForBestFit(r: RentalWithPhotos, profile: any) {
  const base = scoreRental(r, profile).score;
  const preferredPortalBoost = r.application_platform === 'On-Site' || r.application_platform === 'AppFolio' ? 10 : 0;
  const verifiedUnitBoost = r.links?.exact_application_url ? 2 : 0;
  return base + preferredPortalBoost + verifiedUnitBoost;
}

function workbookRent(item: WorkbookRankedListing) {
  if (item.rent_low == null && item.rent_high == null) return 'Rent verify';
  if (item.rent_low != null && item.rent_high != null && item.rent_low !== item.rent_high) {
    return `${usd(item.rent_low)}-${usd(item.rent_high)}`;
  }
  return usd(item.rent_low ?? item.rent_high ?? undefined);
}
