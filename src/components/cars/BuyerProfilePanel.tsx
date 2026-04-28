'use client';

import { useEffect, useState } from 'react';
import type { BuyerProfile } from '@/types';

const KEY = 'lmgl:buyer-profile';

export function useBuyerProfile(): [BuyerProfile, (p: BuyerProfile) => void] {
  const [p, setP] = useState<BuyerProfile>({});
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setP(JSON.parse(raw)); } catch {}
  }, []);
  function update(next: BuyerProfile) {
    setP(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }
  return [p, update];
}

export function BuyerProfilePanel({ profile, onChange }: { profile: BuyerProfile; onChange: (p: BuyerProfile) => void }) {
  return (
    <details className="cookie-card p-4">
      <summary className="cursor-pointer font-display text-base font-extrabold text-chocolate-900">
        Your buyer profile (stays on this device)
      </summary>
      <p className="mt-1 text-xs text-chocolate-700">
        Used only to score fit. Credit range is self-selected — we never pull credit.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Monthly payment target (USD)">
          <input type="number" inputMode="numeric" value={profile.monthly_payment_target ?? ''}
                 onChange={(e) => onChange({ ...profile, monthly_payment_target: Number(e.target.value) || undefined })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Down payment available (USD)">
          <input type="number" inputMode="numeric" value={profile.down_payment_available ?? ''}
                 onChange={(e) => onChange({ ...profile, down_payment_available: Number(e.target.value) || undefined })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
        <Field label="Self-selected credit range">
          <select value={profile.credit_range ?? 'prefer-not-to-say'}
                  onChange={(e) => onChange({ ...profile, credit_range: e.target.value as BuyerProfile['credit_range'] })}
                  className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
            <option value="prefer-not-to-say">Prefer not to say</option>
            <option value="below-580">Below 580</option>
            <option value="580-669">580–669</option>
            <option value="670-739">670–739</option>
            <option value="740+">740+</option>
          </select>
        </Field>
        <Field label="Co-signer?">
          <select value={profile.cosigner ? 'yes' : 'no'}
                  onChange={(e) => onChange({ ...profile, cosigner: e.target.value === 'yes' })}
                  className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
            <option value="no">No</option>
            <option value="yes">Yes</option>
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
