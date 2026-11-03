'use client';
import {useKeyedPage} from '@/lib/client/state';

import { useMemo, useState } from 'react';
import { REAL_VEHICLES, REAL_DEALERS } from '@/lib/data/real-vehicles';
import { CarCard } from './CarCard';
import { BuyerProfilePanel, useBuyerProfile } from './BuyerProfilePanel';
import { Pagination, paginate } from '@/components/common/Pagination';
import { SortDropdown, type SortKey } from '@/components/common/SortDropdown';
import { scoreVehicle } from '@/lib/scoring';

const PER_PAGE = 9;

interface FilterState {
  state?: 'CA' | 'AZ';
  body?: string;
  max_price?: number;
  max_monthly?: number;
  fuel?: string;
  condition?: 'all' | 'new' | 'used' | 'cpo';
}

export function CarSearch({ initialState }: { initialState?: 'CA' | 'AZ' }) {
  const [profile, setProfile] = useBuyerProfile();
  const [filters, setFilters] = useState<FilterState>({ condition: 'all', state: initialState });
  const [sort, setSort] = useState<SortKey>('best-fit');
  const [page, setPage] = useKeyedPage(JSON.stringify(filters) + sort);

  const dealers = useMemo(() => Object.fromEntries(REAL_DEALERS.map((d) => [d.id, d])), []);
  const filtered = useMemo(() => REAL_VEHICLES.filter((v) => {
    if (filters.state && dealers[v.dealer_id]?.state !== filters.state) return false;
    if (filters.body && v.body_type !== filters.body) return false;
    if (filters.max_price && v.price > filters.max_price) return false;
    if (filters.fuel && v.fuel_type !== filters.fuel) return false;
    if (filters.condition && filters.condition !== 'all' && v.condition !== filters.condition) return false;
    return true;
  }), [filters, dealers]);
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'price-asc') return arr.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return arr.sort((a, b) => b.price - a.price);
    if (sort === 'newest') return arr.sort((a, b) => +new Date(b.meta.last_verified_at) - +new Date(a.meta.last_verified_at));
    return arr.sort((a, b) => scoreVehicle(b, profile).score - scoreVehicle(a, profile).score);
  }, [filtered, sort, profile]);
  const { items: paged, pageCount } = paginate(sorted, page, PER_PAGE);


  return (
    <div className="mt-4 min-w-0 space-y-4 [&_input]:min-w-0 [&_input]:max-w-full [&_select]:min-w-0 [&_select]:max-w-full">
      <BuyerProfilePanel profile={profile} onChange={setProfile} />

      <div className="cookie-card flex min-w-0 flex-wrap items-end gap-3 p-4">
        <Field label="State">
          <select className="rounded-md border border-gingerbread-300 bg-white px-2 py-2 text-sm" value={filters.state ?? ''} onChange={(e) => setFilters({ ...filters, state: (e.target.value || undefined) as 'CA' | 'AZ' | undefined })}>
            <option value="">California + Arizona</option><option value="CA">California</option><option value="AZ">Arizona</option>
          </select>
        </Field>
        <Field label="Body type">
          <select className="rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
                  value={filters.body ?? ''} onChange={(e) => setFilters({ ...filters, body: e.target.value || undefined })}>
            <option value="">Any</option>
            <option>Sedan</option><option>SUV</option><option>Pickup</option><option>Hatchback</option><option>Coupe</option>
          </select>
        </Field>
        <Field label="Max price">
          <input type="number" inputMode="numeric" className="w-32 rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
                 value={filters.max_price ?? ''} onChange={(e) => setFilters({ ...filters, max_price: Number(e.target.value) || undefined })} />
        </Field>
        <Field label="Fuel">
          <select className="rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
                  value={filters.fuel ?? ''} onChange={(e) => setFilters({ ...filters, fuel: e.target.value || undefined })}>
            <option value="">Any</option>
            <option>Gasoline</option><option>Hybrid</option><option>Electric</option><option>Diesel</option>
          </select>
        </Field>
        <Field label="Condition">
          <select className="rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
                  value={filters.condition} onChange={(e) => setFilters({ ...filters, condition: e.target.value as any })}>
            <option value="all">All</option><option value="new">New</option><option value="used">Used</option><option value="cpo">CPO</option>
          </select>
        </Field>
        <div className="ml-auto min-w-0 max-w-full"><SortDropdown value={sort} onChange={setSort} className="min-w-0 flex-wrap" /></div>
      </div>

      <p className="text-xs text-chocolate-700">
        <strong>{filtered.length}</strong> result{filtered.length === 1 ? '' : 's'}
      </p>

      <ul className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paged.map((v) => (
          <li className="min-w-0" key={v.id}><CarCard vehicle={v} dealer={dealers[v.dealer_id]} profile={profile} /></li>
        ))}
      </ul>
      {filtered.length === 0 && <div className="cookie-card p-6 text-center text-sm text-chocolate-700"><p>No listed vehicles match these filters. Inventory coverage varies by area; verify availability directly with a dealer.</p><button type="button" className="cinnamon-btn mt-3" onClick={() => setFilters({ condition: 'all' })}>Clear filters</button></div>}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0 max-w-full">
      <span className="block text-xs font-bold uppercase tracking-wider text-chocolate-700">{label}</span>
      <div className="mt-1 min-w-0">{children}</div>
    </label>
  );
}
