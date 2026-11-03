'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { REAL_RENTALS } from '@/lib/data/real-rentals';

export interface RentalFilterState {
  unit_type: 'all' | 'apartment' | 'townhouse';
  city?: string;
  state?: 'CA' | 'AZ';
  max_rent?: number;
  beds?: number | '';
  pets?: boolean;
  parking_garage?: boolean;
  private_entrance?: boolean;
  verified_special?: boolean;
  accessibility?: boolean;
  avoid_strict?: boolean;
}

export const RENTAL_FEATURE_FILTERS = [
  { key: 'pets', label: 'Pets allowed in recorded policy', chip: 'Pets allowed' },
  { key: 'parking_garage', label: 'Garage or covered parking recorded', chip: 'Garage / covered parking' },
  { key: 'private_entrance', label: 'Private entrance recorded', chip: 'Private entrance' },
  { key: 'verified_special', label: 'Special offer details recorded', chip: 'Recorded special' },
  { key: 'accessibility', label: 'Accessibility details recorded', chip: 'Accessibility details' },
  { key: 'avoid_strict', label: 'Hide higher screening estimates', chip: 'Hide higher screening estimates' },
] as const;

const CONTROL = 'min-h-[44px] min-w-0 w-full rounded-lg border border-gingerbread-300 bg-white px-3 py-2 text-base text-chocolate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate-800';

// Counts describe stored records for the selected state/type, not vacancies.
function buildCityOptions(state: RentalFilterState['state'], unitType: RentalFilterState['unit_type']) {
  const byCounty = new Map<string, Map<string, number>>();
  for (const r of REAL_RENTALS) {
    if (state && r.state !== state) continue;
    if (unitType === 'apartment' && r.unit_type !== 'apartment' && r.unit_type !== 'townhome-style-apartment') continue;
    if (unitType === 'townhouse' && r.unit_type !== 'townhouse') continue;
    const group = `${r.county} County, ${r.state}`;
    if (!byCounty.has(group)) byCounty.set(group, new Map());
    const cities = byCounty.get(group)!;
    cities.set(r.city, (cities.get(r.city) ?? 0) + 1);
  }
  return Array.from(byCounty.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([county, cities]) => ({
    county,
    cities: Array.from(cities.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([city, count]) => ({ city, count })),
  }));
}

export function RentalFilters({ initial: state, onChange, unitTypeLock, activeCount = 0, onReset }: {
  initial: RentalFilterState;
  onChange: (next: RentalFilterState) => void;
  unitTypeLock?: 'apartment' | 'townhouse';
  activeCount?: number;
  onReset: () => void;
}) {
  const cityGroups = useMemo(() => buildCityOptions(state.state, unitTypeLock ?? state.unit_type), [state.state, state.unit_type, unitTypeLock]);
  const totalCities = cityGroups.reduce((n, group) => n + group.cities.length, 0);
  const featureCount = RENTAL_FEATURE_FILTERS.filter(({ key }) => state[key]).length;
  const selectedCityListed = cityGroups.some((group) => group.cities.some(({ city }) => city.toLowerCase() === state.city?.toLowerCase()));
  const selectedCity = cityGroups.flatMap((group) => group.cities).find(({ city }) => city.toLowerCase() === state.city?.toLowerCase())?.city ?? state.city;

  function update(patch: Partial<RentalFilterState>) { onChange({ ...state, ...patch }); }

  return (
    <aside aria-label="Filter rental records" className="cookie-card min-w-0 h-fit space-y-4 p-4 lg:w-72 lg:shrink-0">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-extrabold text-chocolate-900">Find your fit</h2>
        <button type="button" disabled={activeCount === 0} onClick={onReset} className="min-h-[44px] rounded-lg px-3 text-sm font-semibold text-chocolate-800 underline underline-offset-4 disabled:opacity-40 focus-visible:outline focus-visible:outline-2">Reset</button>
      </div>
      {unitTypeLock ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-chocolate-700">
          <span className="font-bold">{unitTypeLock === 'apartment' ? 'Apartments' : 'Townhomes'} only</span>
          <Link href="/rentals" className="inline-flex min-h-[44px] items-center underline underline-offset-4">Browse both types</Link>
        </div>
      ) : (
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-wider text-chocolate-700">Home type</legend>
          <div className="mt-2 grid grid-cols-3 gap-1 text-xs font-semibold">
            {(['all', 'apartment', 'townhouse'] as const).map((type) => (
              <button key={type} type="button" onClick={() => update({ unit_type: type })} aria-pressed={state.unit_type === type}
                className={'min-h-[44px] min-w-0 rounded-lg px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' + (state.unit_type === type ? 'bg-lightning-500 text-chocolate-900' : 'bg-frosting-200 text-chocolate-800 hover:bg-frosting-100')}>
                {type === 'all' ? 'Both' : type === 'apartment' ? 'Apartments' : 'Townhomes'}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <Field label="State">
          <select value={state.state ?? ''} onChange={(e) => update({ state: (e.target.value || undefined) as RentalFilterState['state'], city: undefined })} className={CONTROL}>
            <option value="">California + Arizona</option><option value="CA">California</option><option value="AZ">Arizona</option>
          </select>
        </Field>
        <Field label="City">
          <select value={selectedCity ?? '__ALL__'} onChange={(e) => update({ city: e.target.value === '__ALL__' ? undefined : e.target.value })} className={CONTROL} aria-describedby="rental-city-hint">
            <option value="__ALL__">All cities ({totalCities} recorded)</option>
            {state.city && !selectedCityListed && <option value={state.city}>{state.city} (no matching records)</option>}
            {cityGroups.map((group) => <optgroup key={group.county} label={group.county}>{group.cities.map(({ city, count }) => <option key={city} value={city}>{city} ({count})</option>)}</optgroup>)}
          </select>
        </Field>
      </div>
      <p id="rental-city-hint" className="text-xs leading-relaxed text-chocolate-700">City counts are stored records before budget and feature filters, not available homes.</p>
      <div className="grid min-w-0 grid-cols-2 gap-3">
        <Field label="Max rent / month">
          <input type="number" inputMode="numeric" min={0} step="any" placeholder="Any budget" value={state.max_rent ?? ''}
            onChange={(e) => update({ max_rent: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })} className={CONTROL} />
        </Field>
        <Field label="Min bedrooms">
          <select value={state.beds ?? ''} onChange={(e) => update({ beds: e.target.value === '' ? '' : Number(e.target.value) })} className={CONTROL}>
            <option value="">Any</option><option value="0">Studio+</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option>
          </select>
        </Field>
      </div>
      <details className="rounded-xl border border-gingerbread-200 bg-frosting-50 px-3">
        <summary className="min-h-[44px] cursor-pointer py-3 text-sm font-bold text-chocolate-900 focus-visible:outline focus-visible:outline-2">More filters{featureCount > 0 ? ` (${featureCount} selected)` : ''}</summary>
        <div className="space-y-1 border-t border-gingerbread-200 pb-3 pt-2">
          {RENTAL_FEATURE_FILTERS.map(({ key, label }) => <Toggle key={key} label={label} value={!!state[key]} onChange={(value) => update({ [key]: value })} />)}
          <p className="pt-2 text-xs leading-relaxed text-chocolate-700">Feature filters exclude missing details. Confirm pet restrictions, accessibility and any offer with the provider. Screening estimates do not determine eligibility.</p>
        </div>
      </details>
      <a href="#rental-results" className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-chocolate-800 px-3 text-sm font-bold text-white lg:hidden">See matching records</a>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block min-w-0"><span className="text-xs font-bold text-chocolate-700">{label}</span><div className="mt-1 min-w-0">{children}</div></label>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}
      className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg py-2 text-left text-sm text-chocolate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
      <span className="min-w-0">{label}</span>
      <span aria-hidden="true" className={'relative h-6 w-11 shrink-0 rounded-full transition-colors ' + (value ? 'bg-chocolate-800' : 'bg-gingerbread-300')}>
        <span className={'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ' + (value ? 'translate-x-5' : '')} />
      </span>
    </button>
  );
}
