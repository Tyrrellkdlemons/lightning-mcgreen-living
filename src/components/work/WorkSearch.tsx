'use client';

import { useEffect, useMemo, useState } from 'react';
import { REAL_WORK_VEHICLES } from '@/lib/data/real-work-vehicles';
import { WorkVehicleCard } from './WorkVehicleCard';
import { useWorkProfile, WorkProfilePanel } from './WorkProfilePanel';
import { Pagination, paginate } from '@/components/common/Pagination';
import { SortDropdown, type SortKey } from '@/components/common/SortDropdown';
import { scoreWorkRental } from '@/lib/scoring';

const PER_PAGE = 9;

export function WorkSearch() {
  const [profile, setProfile] = useWorkProfile();
  const [type, setType] = useState<'all' | string>('all');
  const [maxDaily, setMaxDaily] = useState<number | ''>('');
  const [businessOnly, setBusinessOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('best-fit');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => REAL_WORK_VEHICLES.filter((r) => {
    if (type !== 'all' && r.vehicle_type !== type) return false;
    if (maxDaily !== '' && r.daily_rate && r.daily_rate > Number(maxDaily)) return false;
    if (businessOnly && !r.business_account_available) return false;
    return true;
  }), [type, maxDaily, businessOnly]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'price-asc') return arr.sort((a, b) => (a.daily_rate ?? 0) - (b.daily_rate ?? 0));
    if (sort === 'price-desc') return arr.sort((a, b) => (b.daily_rate ?? 0) - (a.daily_rate ?? 0));
    if (sort === 'newest') return arr.sort((a, b) => +new Date(b.meta.last_verified_at) - +new Date(a.meta.last_verified_at));
    return arr.sort((a, b) => scoreWorkRental(b, profile).score - scoreWorkRental(a, profile).score);
  }, [filtered, sort, profile]);
  const { items: paged, pageCount } = paginate(sorted, page, PER_PAGE);

  const filterKey = `${type}|${maxDaily}|${businessOnly}|${sort}`;
  useEffect(() => { setPage(1); }, [filterKey]);

  return (
    <div className="mt-4 space-y-4">
      <WorkProfilePanel profile={profile} onChange={setProfile} />

      <div className="cookie-card flex flex-wrap items-end gap-3 p-4">
        <Field label="Vehicle type">
          <select value={type} onChange={(e) => setType(e.target.value)}
                  className="rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
            <option value="all">All</option>
            <option value="cargo-van">Cargo van</option>
            <option value="box-truck">Box truck</option>
            <option value="pickup">Pickup</option>
            <option value="stake-bed">Stake bed</option>
            <option value="flatbed">Flatbed</option>
            <option value="passenger-van">Passenger van</option>
            <option value="refrigerated">Refrigerated</option>
          </select>
        </Field>
        <Field label="Max daily rate ($)">
          <input type="number" inputMode="numeric" value={maxDaily}
                 onChange={(e) => setMaxDaily(e.target.value === '' ? '' : Number(e.target.value))}
                 className="w-32 rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
        <label className="flex items-center gap-2 text-sm font-semibold text-chocolate-800">
          <input type="checkbox" checked={businessOnly} onChange={(e) => setBusinessOnly(e.target.checked)} />
          Business account only
        </label>
        <div className="ml-auto"><SortDropdown value={sort} onChange={setSort} /></div>
      </div>

      <p className="text-xs text-chocolate-700">
        <strong>{filtered.length}</strong> result{filtered.length === 1 ? '' : 's'}
      </p>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paged.map((r) => <li key={r.id}><WorkVehicleCard rental={r} profile={profile} /></li>)}
      </ul>
      {filtered.length === 0 && <div className="cookie-card p-6 text-center text-sm text-chocolate-700">No matches with these filters.</div>}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-chocolate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
