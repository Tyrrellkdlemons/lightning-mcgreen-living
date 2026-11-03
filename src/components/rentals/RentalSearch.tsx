'use client';
import {useKeyedPage} from '@/lib/client/state';
import {useHydrated} from '@/lib/client/state';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { SlidersHorizontal, Columns2 } from 'lucide-react';
import { useCompareStore } from '@/lib/store/compare';
import { REAL_RENTALS, type RentalWithPhotos } from '@/lib/data/real-rentals';
import { RentalCard } from './RentalCard';
import { RentalFilters, RENTAL_FEATURE_FILTERS, type RentalFilterState } from './RentalFilters';
import { ProfilePanel, useRenterProfile } from './ProfilePanel';
import { Pagination, paginate } from '@/components/common/Pagination';
import type { SortKey } from '@/components/common/SortDropdown';
import { scoreRental } from '@/lib/scoring';
import { usd } from '@/lib/calculators';
import { recordedRent } from '@/lib/places/property-view';
import type { RenterProfile } from '@/types';
import { inferScreeningStack } from '@/lib/data/screening-stacks';
import {
  WORKBOOK_CITY_OPTIONS,
  WORKBOOK_RANKED_LISTINGS,
  workbookMapUrl,
  type WorkbookRankedListing,
} from '@/lib/data/workbook-ranked-listings';

const PER_PAGE = 9;

export function RentalSearch({ unitTypeLock, initialState, initialCity }: { unitTypeLock?: 'apartment' | 'townhouse'; initialState?: 'CA' | 'AZ'; initialCity?: string }) {
  const [profile, setProfile] = useRenterProfile();
  const [filters, setFilters] = useState<RentalFilterState>({ unit_type: unitTypeLock ?? 'all', state: initialState, city: initialCity });
  const [sort, setSort] = useState<SortKey>('best-fit');
  const [page, setPage] = useKeyedPage(JSON.stringify(filters) + sort + (unitTypeLock ?? ''));
  const [workbookQuery, setWorkbookQuery] = useState('');
  const [workbookCity, setWorkbookCity] = useState('all');
  const [workbookLimit, setWorkbookLimit] = useState(10);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const ready = useHydrated();
  const compareCount = useCompareStore((state) => state.items.length);
  const filterToggle = useRef<HTMLButtonElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  function showResults() {
    setFiltersOpen(false);
    requestAnimationFrame(() => {
      resultsHeading.current?.focus({ preventScroll: true });
      resultsHeading.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }

  const filtered = useMemo(() => filterRentals(REAL_RENTALS, filters, unitTypeLock), [filters, unitTypeLock]);
  const sorted = useMemo(() => sortRentals(filtered, sort, profile), [filtered, sort, profile]);
  const safePage = Math.min(page, Math.max(1, Math.ceil(sorted.length / PER_PAGE)));
  const { items: paged, pageCount } = paginate(sorted, safePage, PER_PAGE);
  const activeFilters = rentalFilterChips(filters, unitTypeLock);
  const locationCount = useMemo(() => filterRentals(REAL_RENTALS, { unit_type: filters.unit_type, state: filters.state, city: filters.city }, unitTypeLock).length, [filters.unit_type, filters.state, filters.city, unitTypeLock]);
  const locationLabel = [filters.city, filters.state === 'AZ' ? 'Arizona' : filters.state === 'CA' ? 'California' : 'California + Arizona'].filter(Boolean).join(', ');
  const hasPreferences = filters.max_rent != null || (filters.beds !== '' && filters.beds != null) || RENTAL_FEATURE_FILTERS.some(({ key }) => filters[key]);
  const placeHref = filters.state === 'AZ' ? '/places/arizona' : filters.state === 'CA' ? '/places/california' : '/places';
  const resourceHref = `/resources?category=property${filters.state ? `&state=${filters.state}` : ''}`;
  function resetFilters() { setFilters({ unit_type: unitTypeLock ?? 'all' }); }
  function removeFilter(key: keyof RentalFilterState) {
    if (key === 'state') setFilters({ ...filters, state: undefined, city: undefined });
    else if (key === 'unit_type') setFilters({ ...filters, unit_type: unitTypeLock ?? 'all' });
    else setFilters({ ...filters, [key]: undefined });
  }
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

  return (
    <div className="rental-discovery">
      <div className="rental-search-toolbar" role="group" aria-label="Rental search tools">
        <div className="rental-toolbar-count"><strong className="num">{filtered.length}</strong><span>matching records</span></div>
        <button ref={filterToggle} type="button" className="rental-filter-toggle" aria-expanded={filtersOpen} aria-controls="rental-filter-panel"
          onClick={() => setFiltersOpen((open) => !open)}>
          <SlidersHorizontal size={18} aria-hidden="true" />
          {filtersOpen ? 'Close filters' : 'Filters'}{activeFilters.length > 0 && <span className="rental-filter-count">{activeFilters.length}</span>}
        </button>
        <Link href="/compare" className="rental-compare-shortcut" aria-label={ready ? `Compare ${compareCount} items on this device` : 'Compare items'}>
          <Columns2 size={18} aria-hidden="true" /><span>Compare{ready && compareCount > 0 ? ` (${compareCount})` : ''}</span>
        </Link>
      </div>
      <div className="rental-search-layout">
      <div id="rental-filter-panel" className="rental-filter-panel" data-open={filtersOpen}
        onKeyDown={(event) => { if (event.key === 'Escape' && filtersOpen) { setFiltersOpen(false); if (filterToggle.current?.getClientRects().length) filterToggle.current.focus(); } }}>
        <RentalFilters initial={filters} onChange={setFilters} unitTypeLock={unitTypeLock} activeCount={activeFilters.length} onReset={resetFilters} onDone={showResults} resultCount={filtered.length} />
      </div>
      <div className="min-w-0 flex-1 space-y-4">
        <section id="rental-results" aria-labelledby="rental-results-heading" className="cookie-card scroll-mt-28 space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-chocolate-700">{locationLabel}</p>
              <h2 ref={resultsHeading} tabIndex={-1} id="rental-results-heading" className="mt-1 font-display text-2xl font-extrabold text-chocolate-900">Rental records</h2>
              <p role="status" aria-live="polite" aria-atomic="true" className="mt-1 text-sm text-chocolate-700">
                <strong className="num">{filtered.length}</strong> matching record{filtered.length === 1 ? '' : 's'}
                {filtered.length > 0 && <> · showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)}</>}
              </p>
            </div>
            <label className="block min-w-0 w-full text-xs font-bold text-chocolate-700 sm:w-auto">
              Sort records
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="mt-1 min-h-[44px] min-w-0 w-full rounded-lg border border-gingerbread-300 bg-white px-3 py-2 text-base text-chocolate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                <option value="best-fit">Best fit</option>
                <option value="price-asc">Recorded rent: low to high</option>
                <option value="price-desc">Recorded rent: high to low</option>
                <option value="newest">Most recently recorded</option>
              </select>
            </label>
          </div>
          {activeFilters.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold text-chocolate-700">{activeFilters.length} active filter{activeFilters.length === 1 ? '' : 's'} · tap to remove</p>
              <ul aria-label="Active rental filters" className="flex flex-wrap gap-2">
                {activeFilters.map(({ key, label }) => <li key={key} className="min-w-0 max-w-full"><button type="button" aria-label={`Remove ${label} filter`} onClick={() => removeFilter(key)} className="inline-flex min-h-[44px] max-w-full items-center gap-2 rounded-full border border-gingerbread-300 bg-frosting-100 px-3 py-2 text-left text-sm font-semibold text-chocolate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"><span className="break-words">{label}</span><span aria-hidden="true" className="text-lg">×</span></button></li>)}
                <li><button type="button" onClick={resetFilters} className="min-h-[44px] rounded-lg px-3 text-sm font-semibold text-chocolate-700 underline underline-offset-4">Clear all filters</button></li>
              </ul>
            </div>
          ) : <p className="text-sm text-chocolate-700">Choose a city, budget or home type to narrow the records.</p>}
          <div className="border-t border-gingerbread-200 pt-3 text-xs leading-relaxed text-chocolate-700">
            <p>These are recorded listings and operator examples, not a live vacancy feed. Confirm current rent, availability and requirements with the provider.</p>
            <p className="mt-1">{sort === 'best-fit' ? 'Best fit uses your optional renter profile and favors AppFolio / On-Site portals. It is a comparison aid, not an approval prediction.' : sort === 'newest' ? 'Sorted by the stored record date, not the date a home became available.' : 'Sorted by recorded starting rent. Unknown rents appear last; fees and current quotes may differ.'}</p>
          </div>
        </section>
        <div className="[&_summary]:min-h-[44px] [&_input]:min-h-[44px] [&_select]:min-h-[44px] [&_input]:min-w-0 [&_select]:min-w-0">
          <ProfilePanel profile={profile} onChange={setProfile} />
        </div>
        {filtered.length > 0 ? (
          <ul aria-label="Matching rental records" className="rental-card-grid">
            {paged.map((r) => <li key={r.id} className="min-w-0"><RentalCard rental={r} profile={profile} /></li>)}
          </ul>
        ) : (
          <section className="cookie-card space-y-3 p-5 text-sm leading-relaxed text-chocolate-700 sm:p-6" aria-labelledby="rental-empty-heading">
            <h3 id="rental-empty-heading" className="font-display text-xl font-extrabold text-chocolate-900">{locationCount === 0 ? 'No stored rental records for this area and home type' : 'No records match all of these filters'}</h3>
            <p>{locationCount === 0 ? 'An empty directory result does not mean there are no homes in this area. City guides and property sources can help you continue.' : `${locationCount} record${locationCount === 1 ? '' : 's'} match your location and home type. Try a higher budget, fewer bedrooms or fewer feature requirements. Records with missing details are excluded when a filter needs those details.`}</p>
            <div className="flex flex-wrap gap-2">
              {hasPreferences && locationCount > 0 && <button type="button" className="bolt-btn min-h-[44px]" onClick={() => setFilters({ unit_type: filters.unit_type, state: filters.state, city: filters.city })}>Keep location, clear other filters</button>}
              {activeFilters.length > 0 && <button type="button" className="cinnamon-btn min-h-[44px]" onClick={resetFilters}>Clear all filters</button>}
              <Link href={placeHref} className="cinnamon-btn min-h-[44px]">Explore city guides</Link>
              <Link href={resourceHref} className="cinnamon-btn min-h-[44px]">Browse property sources</Link>
            </div>
          </section>
        )}
        <div className="[&_nav]:flex-wrap [&_button]:min-h-[44px] [&_button]:min-w-[44px]">
          <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
        </div>

        <details className="cookie-card p-4">
          <summary className="min-h-[44px] cursor-pointer py-2 font-display text-base font-extrabold text-chocolate-900 focus-visible:outline focus-visible:outline-2">
            Workbook Source Links ({WORKBOOK_RANKED_LISTINGS.length})
          </summary>
          <p className="mt-1 text-xs text-chocolate-700">
            Historical workbook records, searched separately from the rental filters above. Prices and screening notes need confirmation with the provider.
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              aria-label="Search workbook properties"
              value={workbookQuery}
              onChange={(e) => { setWorkbookQuery(e.target.value); setWorkbookLimit(10); }}
              placeholder="Search workbook listings"
              className="min-h-[44px] min-w-0 w-full rounded-lg border border-gingerbread-300 bg-white px-3 py-2 text-base text-chocolate-900"
            />
            <select
              aria-label="Workbook city"
              value={workbookCity}
              onChange={(e) => { setWorkbookCity(e.target.value); setWorkbookLimit(10); }}
              className="min-h-[44px] min-w-0 w-full rounded-lg border border-gingerbread-300 bg-white px-3 py-2 text-base text-chocolate-900"
            >
              <option value="all">All workbook cities</option>
              {WORKBOOK_CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-chocolate-700">
            Showing {workbookVisible.length} of {workbookFiltered.length} workbook records
          </p>
          {workbookFiltered.length === 0 && <div className="mt-3 rounded-lg bg-frosting-100 p-3 text-sm text-chocolate-700"><p>No workbook records match that search. Try another city or a shorter property name.</p><button type="button" className="mt-2 min-h-[44px] rounded-lg px-2 font-semibold underline underline-offset-4" onClick={() => { setWorkbookQuery(''); setWorkbookCity('all'); setWorkbookLimit(10); }}>Reset workbook search</button></div>}
          <ul className="mt-2 space-y-2">
            {workbookVisible.map((item) => (
              <li key={item.id} className="rounded-md bg-frosting-100 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="num text-xs font-extrabold text-chocolate-700">#{item.rank ?? 'n/a'}</span>
                  <span className="font-bold text-chocolate-900">{item.property_name}</span>
                  <span className="text-xs text-chocolate-700">{item.city ?? 'City not recorded'}</span>
                  <span className="text-xs text-chocolate-700">{item.screening_difficulty_label ?? 'Verify'}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-chocolate-700">Recorded rent: {workbookRent(item)}</span>
                  <span className="text-chocolate-700">Source date: {item.source_date ?? 'not recorded'}</span>
                  {item.application_platform_inferred && <span className="text-chocolate-700">via {item.application_platform_inferred}</span>}
                  <Link
                    href={`/properties/${item.id}`}
                    className="inline-flex min-h-[44px] items-center font-semibold text-chocolate-700 underline decoration-lightning-500 underline-offset-2"
                  >
                    Property view &amp; source links
                  </Link>
                  {workbookMapUrl(item) && (
                    <a
                      href={workbookMapUrl(item)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center font-semibold text-chocolate-700 underline decoration-lightning-500 underline-offset-2"
                    >
                      Map
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {workbookFiltered.length > workbookVisible.length && (
            <button type="button" onClick={() => setWorkbookLimit((n) => n + 10)} className="cinnamon-btn mt-3 min-h-[44px] text-sm">
              Show more
            </button>
          )}
        </details>
      </div>
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
    if (f.state && r.state !== f.state) return false;
    if (f.city && r.city.toLowerCase() !== f.city.toLowerCase()) return false;
    if (f.max_rent != null && (!knownRent(r.min_rent) || r.min_rent > f.max_rent)) return false;
    if (f.beds !== '' && f.beds != null && (!Number.isFinite(r.beds_max) || r.beds_max == null || r.beds_max < f.beds)) return false;
    if (f.pets && !recordedPetPermission(r.pet_policy)) return false;
    if (f.parking_garage && !recordedCoveredParking(r.parking_type)) return false;
    if (f.private_entrance && r.private_entrance !== true) return false;
    if (f.verified_special && !recordedDetail(r.move_in_specials)) return false;
    if (f.accessibility && !r.accessibility_features?.some(recordedDetail)) return false;
    if (f.avoid_strict) {
      const stack = inferScreeningStack(r.application_platform, r.manager, r.screening_vendor);
      if (stack.strictness === 'strict' || stack.strictness === 'premium') return false;
    }
    return true;
  });
}

function sortRentals(rentals: RentalWithPhotos[], sort: SortKey, profile: RenterProfile): RentalWithPhotos[] {
  const arr = [...rentals];
  const byName = (a: RentalWithPhotos, b: RentalWithPhotos) => a.property_name.localeCompare(b.property_name) || a.id.localeCompare(b.id);
  if (sort === 'price-asc' || sort === 'price-desc') return arr.sort((a, b) => {
    const aKnown = knownRent(a.min_rent), bKnown = knownRent(b.min_rent);
    if (!aKnown || !bKnown) return Number(bKnown) - Number(aKnown) || byName(a, b);
    return (sort === 'price-asc' ? a.min_rent - b.min_rent : b.min_rent - a.min_rent) || byName(a, b);
  });
  if (sort === 'newest') return arr.sort((a, b) => {
    const aDate = Date.parse(a.meta.last_verified_at), bDate = Date.parse(b.meta.last_verified_at);
    const aKnown = Number.isFinite(aDate), bKnown = Number.isFinite(bDate);
    if (!aKnown || !bKnown) return Number(bKnown) - Number(aKnown) || byName(a, b);
    return bDate - aDate || byName(a, b);
  });
  // Preserve the existing best-fit scoring and preferred-portal boost.
  return arr.sort((a, b) => rankForBestFit(b, profile) - rankForBestFit(a, profile));
}

function knownRent(value: number | null | undefined): value is number { return typeof value === 'number' && Number.isFinite(value) && value > 0; }

function recordedDetail(value?: string): boolean {
  const detail = value?.trim();
  if (!detail) return false;
  // Free-text records need conservative handling: placeholders and explicit
  // absence cannot become a positive feature merely because text is present.
  if (/\b(?:unknown|unspecified|unconfirmed|unavailable|tbd|n\/a)\b|\bnot\s+(?:specified|recorded|published|available|provided|confirmed|known|offered|accessible)\b/i.test(detail)) return false;
  if (/^(?:none|verify|contact|ask|see current)\b|\bno\s+(?:specials?|offers?|discounts?|accessibility|accessible|details?|information|features?)\b/i.test(detail)) return false;
  return true;
}

function recordedPetPermission(value?: string): boolean {
  if (!recordedDetail(value)) return false;
  const policy = value!;
  if (/\bno\s+(?:pets?|cats?|dogs?)\b|\bpet[- ]free\b|\b(?:pets?|cats?|dogs?)\b[^.;]{0,40}\b(?:not|aren['’]t|isn['’]t)\s+(?:allowed|permitted|welcome)\b|\b(?:prohibited|forbidden|disallowed)\b/i.test(policy)) return false;
  return /\bpet[- ]friendly\b|\bpets? (?:allowed|welcome)\b|\b(?:cats?|dogs?)\b.*\b(?:ok|allowed|welcome|only)\b|\b(?:max(?:imum)?|up to)\s+\d+\s+pets?\b/i.test(policy);
}

function recordedCoveredParking(value?: string): boolean {
  if (!recordedDetail(value)) return false;
  const parking = value!;
  if (/\bno\s+(?:garages?|covered)\b|\b(?:garages?|covered(?: parking)?)\b[^.;]{0,30}\b(?:not|isn['’]t|aren['’]t)\s+(?:available|provided|included|offered)\b/i.test(parking)) return false;
  return /\bgarages?\b|\bcovered\b/i.test(parking);
}

function rentalFilterChips(filters: RentalFilterState, lock?: 'apartment' | 'townhouse') {
  const chips: { key: keyof RentalFilterState; label: string }[] = [];
  if (!lock && filters.unit_type !== 'all') chips.push({ key: 'unit_type', label: filters.unit_type === 'apartment' ? 'Apartments' : 'Townhomes' });
  if (filters.state) chips.push({ key: 'state', label: filters.state === 'AZ' ? 'Arizona' : 'California' });
  if (filters.city) chips.push({ key: 'city', label: filters.city });
  if (filters.max_rent != null) chips.push({ key: 'max_rent', label: `Up to ${usd(filters.max_rent)} / month` });
  if (filters.beds !== '' && filters.beds != null) chips.push({ key: 'beds', label: filters.beds === 0 ? 'Studio or larger' : `${filters.beds}+ bedrooms` });
  for (const { key, chip } of RENTAL_FEATURE_FILTERS) if (filters[key]) chips.push({ key, label: chip });
  return chips;
}

function rankForBestFit(r: RentalWithPhotos, profile: RenterProfile) {
  const base = scoreRental(r, profile).score;
  const preferredPortalBoost = r.application_platform === 'On-Site' || r.application_platform === 'AppFolio' ? 10 : 0;
  const verifiedUnitBoost = r.links?.exact_application_url ? 2 : 0;
  return base + preferredPortalBoost + verifiedUnitBoost;
}

function workbookRent(item: WorkbookRankedListing) {
  return recordedRent(item.rent_low, item.rent_high);
}
