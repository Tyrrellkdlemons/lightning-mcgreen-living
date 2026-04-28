'use client';

import { useMemo, useState } from 'react';
import { REAL_WORK_VEHICLES as DEMO_WORK_VEHICLES } from '@/lib/data/real-work-vehicles';
import { WorkVehicleCard } from './WorkVehicleCard';
import { useWorkProfile, WorkProfilePanel } from './WorkProfilePanel';
import { Gumdrop } from '@/components/ui/Gumdrop';

export function WorkSearch() {
  const [profile, setProfile] = useWorkProfile();
  const [type, setType] = useState<'all' | string>('all');
  const [maxDaily, setMaxDaily] = useState<number | ''>('');
  const [businessOnly, setBusinessOnly] = useState(false);

  const results = useMemo(() => DEMO_WORK_VEHICLES.filter((r) => {
    if (type !== 'all' && r.vehicle_type !== type) return false;
    if (maxDaily !== '' && r.daily_rate && r.daily_rate > Number(maxDaily)) return false;
    if (businessOnly && !r.business_account_available) return false;
    return true;
  }), [type, maxDaily, businessOnly]);

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
        <Gumdrop tone="mute">SoCal-only · sample data</Gumdrop>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((r) => <li key={r.id}><WorkVehicleCard rental={r} profile={profile} /></li>)}
      </ul>
      {results.length === 0 && <div className="cookie-card p-6 text-center text-sm text-chocolate-700">No matches with these filters.</div>}
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
