'use client';

import { useEffect, useState } from 'react';
import type { WorkRentalProfile } from '@/types';

const KEY = 'lmgl:work-rental-profile';

export function useWorkProfile(): [WorkRentalProfile, (p: WorkRentalProfile) => void] {
  const [p, setP] = useState<WorkRentalProfile>({});
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setP(JSON.parse(raw)); } catch {}
  }, []);
  function update(next: WorkRentalProfile) {
    setP(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }
  return [p, update];
}

export function WorkProfilePanel({ profile, onChange }: { profile: WorkRentalProfile; onChange: (p: WorkRentalProfile) => void }) {
  return (
    <details className="cookie-card p-4">
      <summary className="cursor-pointer font-display text-base font-extrabold text-chocolate-900">
        Your work-vehicle rental profile (stays on this device)
      </summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Job type">
          <select value={profile.job_type ?? ''}
                  onChange={(e) => onChange({ ...profile, job_type: e.target.value as any || undefined })}
                  className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
            <option value="">—</option>
            <option value="delivery">Delivery</option>
            <option value="moving">Moving</option>
            <option value="construction">Construction</option>
            <option value="landscaping">Landscaping</option>
            <option value="cleaning">Cleaning</option>
            <option value="event">Event</option>
            <option value="mobile-detail">Mobile detail</option>
            <option value="hauling">Hauling</option>
            <option value="furniture">Furniture delivery</option>
            <option value="side-hustle">Side hustle</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Term">
          <select value={profile.term_pref ?? 'daily'}
                  onChange={(e) => onChange({ ...profile, term_pref: e.target.value as any })}
                  className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
        <Field label="Max budget for term (USD)">
          <input type="number" inputMode="numeric" value={profile.max_budget ?? ''}
                 onChange={(e) => onChange({ ...profile, max_budget: Number(e.target.value) || undefined })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Max deposit (USD)">
          <input type="number" inputMode="numeric" value={profile.max_deposit ?? ''}
                 onChange={(e) => onChange({ ...profile, max_deposit: Number(e.target.value) || undefined })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Mileage estimate">
          <input type="number" inputMode="numeric" value={profile.mileage_estimate ?? ''}
                 onChange={(e) => onChange({ ...profile, mileage_estimate: Number(e.target.value) || undefined })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Insurance status">
          <select value={profile.insurance_status ?? ''}
                  onChange={(e) => onChange({ ...profile, insurance_status: e.target.value as any || undefined })}
                  className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
            <option value="">—</option>
            <option value="have-business">Have business insurance</option>
            <option value="have-personal">Have personal insurance</option>
            <option value="need">Need rental insurance</option>
          </select>
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
