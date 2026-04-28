'use client';

import { useMemo, useState } from 'react';
import { REAL_VEHICLES as DEMO_VEHICLES, REAL_DEALERS as DEMO_DEALERS } from '@/lib/data/real-vehicles';
import { CarCard } from './CarCard';
import { BuyerProfilePanel, useBuyerProfile } from './BuyerProfilePanel';
import { Gumdrop } from '@/components/ui/Gumdrop';

interface FilterState {
  body?: string;
  max_price?: number;
  max_monthly?: number;
  fuel?: string;
  condition?: 'all' | 'new' | 'used' | 'cpo';
}

export function CarSearch() {
  const [profile, setProfile] = useBuyerProfile();
  const [filters, setFilters] = useState<FilterState>({ condition: 'all' });

  const dealers = useMemo(() => Object.fromEntries(DEMO_DEALERS.map((d) => [d.id, d])), []);
  const results = useMemo(() => {
    return DEMO_VEHICLES.filter((v) => {
      if (filters.body && v.body_type !== filters.body) return false;
      if (filters.max_price && v.price > filters.max_price) return false;
      if (filters.fuel && v.fuel_type !== filters.fuel) return false;
      if (filters.condition && filters.condition !== 'all' && v.condition !== filters.condition) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="mt-4 space-y-4">
      <BuyerProfilePanel profile={profile} onChange={setProfile} />

      <div className="cookie-card flex flex-wrap items-end gap-3 p-4">
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
        <Gumdrop tone="mute">SoCal-only · sample data</Gumdrop>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((v) => (
          <li key={v.id}><CarCard vehicle={v} dealer={dealers[v.dealer_id]} profile={profile} /></li>
        ))}
      </ul>
      {results.length === 0 && <div className="cookie-card p-6 text-center text-sm text-chocolate-700">No vehicles match these filters.</div>}
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
