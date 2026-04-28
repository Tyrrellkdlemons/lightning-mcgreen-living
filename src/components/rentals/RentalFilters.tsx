'use client';

import { useState } from 'react';
import { Gumdrop } from '@/components/ui/Gumdrop';

export interface RentalFilterState {
  unit_type: 'all' | 'apartment' | 'townhouse';
  city?: string;
  max_rent?: number;
  beds?: number | '';
  pets?: boolean;
  parking_garage?: boolean;
  private_entrance?: boolean;
  verified_special?: boolean;
}

const CITIES = [
  'All cities', 'Northridge', 'Santa Ana', 'Los Angeles', 'Long Beach',
  'Anaheim', 'Irvine', 'Burbank', 'Pomona', 'Pasadena', 'Glendale',
];

export function RentalFilters({
  initial,
  onChange,
}: {
  initial: RentalFilterState;
  onChange: (next: RentalFilterState) => void;
}) {
  const [state, setState] = useState<RentalFilterState>(initial);

  function update(patch: Partial<RentalFilterState>) {
    const next = { ...state, ...patch };
    setState(next);
    onChange(next);
  }

  return (
    <aside className="cookie-card sticky top-20 hidden h-fit space-y-4 p-4 lg:block lg:w-72">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-chocolate-700">Show</p>
        <div className="mt-2 grid grid-cols-3 gap-1 text-xs font-semibold">
          {(['all', 'apartment', 'townhouse'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => update({ unit_type: u })}
              className={
                'rounded-full px-2 py-1.5 ' +
                (state.unit_type === u
                  ? 'bg-lightning-500 text-chocolate-900'
                  : 'bg-frosting-200 text-chocolate-700 hover:bg-frosting-100')
              }
            >
              {u === 'all' ? 'Both' : u === 'apartment' ? 'Apts' : 'Townhomes'}
            </button>
          ))}
        </div>
      </div>

      <Field label="City">
        <select
          value={state.city ?? 'All cities'}
          onChange={(e) => update({ city: e.target.value === 'All cities' ? undefined : e.target.value })}
          className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
        >
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="Max rent">
        <input
          type="number"
          inputMode="numeric"
          placeholder="e.g. 2500"
          value={state.max_rent ?? ''}
          onChange={(e) => update({ max_rent: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
        />
      </Field>

      <Field label="Bedrooms (min)">
        <select
          value={state.beds ?? ''}
          onChange={(e) => update({ beds: e.target.value === '' ? '' : Number(e.target.value) })}
          className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
        >
          <option value="">Any</option>
          <option value="0">Studio+</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
        </select>
      </Field>

      <div className="space-y-2">
        <Toggle label="Pet friendly" value={!!state.pets} onChange={(v) => update({ pets: v })} />
        <Toggle label="Garage / covered parking" value={!!state.parking_garage} onChange={(v) => update({ parking_garage: v })} />
        <Toggle label="Private entrance (townhomes)" value={!!state.private_entrance} onChange={(v) => update({ private_entrance: v })} />
        <Toggle label="Verified specials only" value={!!state.verified_special} onChange={(v) => update({ verified_special: v })} />
      </div>

      <div className="text-[11px] leading-snug text-chocolate-600">
        <Gumdrop tone="mute">Fair Housing</Gumdrop>{' '}
        Filters never use protected characteristics.
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-chocolate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm font-semibold text-chocolate-800">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={
          'relative h-6 w-11 rounded-full transition-colors ' +
          (value ? 'bg-lightning-500' : 'bg-frosting-200')
        }
      >
        <span
          className={
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ' +
            (value ? 'translate-x-5' : '')
          }
        />
      </button>
    </label>
  );
}
