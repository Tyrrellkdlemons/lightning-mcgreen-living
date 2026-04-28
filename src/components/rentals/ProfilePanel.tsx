'use client';

import { useEffect, useState } from 'react';
import type { RenterProfile } from '@/types';

const STORAGE_KEY = 'lmgl:renter-profile';

export function useRenterProfile(): [RenterProfile, (p: RenterProfile) => void] {
  const [profile, setProfile] = useState<RenterProfile>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);
  function update(p: RenterProfile) {
    setProfile(p);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
  }
  return [profile, update];
}

export function ProfilePanel({
  profile,
  onChange,
}: {
  profile: RenterProfile;
  onChange: (p: RenterProfile) => void;
}) {
  return (
    <details className="cookie-card p-4">
      <summary className="cursor-pointer font-display text-base font-extrabold text-chocolate-900">
        Your renter profile (stays on this device)
      </summary>
      <p className="mt-1 text-xs text-chocolate-700">
        Used only to personalize fit scores. Never sent off-device unless you save it to an account.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Gross monthly income (USD)">
          <input type="number" inputMode="numeric" value={profile.gross_monthly_income ?? ''}
                 onChange={(e) => onChange({ ...profile, gross_monthly_income: e.target.value ? Number(e.target.value) : undefined })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Max move-in cost (USD)">
          <input type="number" inputMode="numeric" value={profile.budget?.max_move_in ?? ''}
                 onChange={(e) => onChange({ ...profile, budget: { ...profile.budget, max_move_in: e.target.value ? Number(e.target.value) : undefined } })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Preferred unit">
          <select value={profile.unit_type_pref ?? 'both'}
                  onChange={(e) => onChange({ ...profile, unit_type_pref: e.target.value as RenterProfile['unit_type_pref'] })}
                  className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
            <option value="both">Both</option>
            <option value="apartment">Apartments</option>
            <option value="townhouse">Townhomes</option>
          </select>
        </Field>
        <Field label="Pets (dogs)">
          <input type="number" inputMode="numeric" min={0} value={profile.pets?.dogs ?? ''}
                 onChange={(e) => onChange({ ...profile, pets: { ...profile.pets, dogs: e.target.value ? Number(e.target.value) : undefined } })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Pets (cats)">
          <input type="number" inputMode="numeric" min={0} value={profile.pets?.cats ?? ''}
                 onChange={(e) => onChange({ ...profile, pets: { ...profile.pets, cats: e.target.value ? Number(e.target.value) : undefined } })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Documents ready (comma-sep)">
          <input value={(profile.documents_ready ?? []).join(', ')}
                 onChange={(e) => onChange({ ...profile, documents_ready: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                 placeholder="ID, income proof, rental history"
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
      </div>
    </details>
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
