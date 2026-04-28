'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { OPERATOR_PROFILES, TIER_LABEL, TIER_TONE, findOperatorProfile, type Tier } from '@/lib/data/operator-profiles';
import { REAL_RENTALS } from '@/lib/data/real-rentals';
import { inferScreeningStack, STRICTNESS_LABEL, STRICTNESS_TONE } from '@/lib/data/screening-stacks';

const ALL_TIERS: (Tier | 'all')[] = ['all', 'luxury', 'upscale', 'mid-market', 'value', 'mixed'];

export function OperatorIndex() {
  const [tier, setTier] = useState<Tier | 'all'>('all');
  const [platform, setPlatform] = useState<string>('all');
  const [county, setCounty] = useState<string>('all');

  const operators = useMemo(() => {
    return OPERATOR_PROFILES.filter((p) => tier === 'all' || p.typical_tier === tier)
      .filter((p) => platform === 'all' || p.typical_platform === platform)
      .map((p) => {
        const listings = REAL_RENTALS.filter(
          (r) => p.match.test(r.manager) && (county === 'all' || r.county === county),
        );
        return { profile: p, listings };
      })
      .filter((g) => g.listings.length > 0 || (county === 'all' && tier === 'all' && platform === 'all'));
  }, [tier, platform, county]);

  const counties = useMemo(() => {
    const s = new Set(REAL_RENTALS.map((r) => r.county));
    return Array.from(s).sort();
  }, []);

  return (
    <>
      <header className="mt-6">
        <Gumdrop tone="info">Operator index</Gumdrop>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">
          Apartments &amp; Townhomes — Who manages what, and how
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-chocolate-700">
          Every apartment + townhome listing on Lightning McGreen Living is
          tagged to a real public Southern California management company.
          This page is the cross-reference: pick an operator to see their
          properties in our index, what leasing platform they use, what
          screening vendors are likely on file, and where their typical
          product sits on the tier ladder.
        </p>
        <p className="mt-2 max-w-3xl text-xs text-chocolate-700">
          <strong className="text-chocolate-900">Honest about labels:</strong>{' '}
          Tier labels (luxury / upscale / mid-market / value / mixed) reflect
          each operator&apos;s <em>publicly known portfolio positioning</em>,
          not invented per-unit claims. A specific unit at any given property
          may differ in finish level, renovation history, or amenities —
          confirm on the operator&apos;s site.
        </p>
      </header>

      <div className="mt-4 flex flex-wrap items-end gap-3 cookie-card p-4">
        <Field label="Tier">
          <select value={tier} onChange={(e) => setTier(e.target.value as any)}
                  className="rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
            {ALL_TIERS.map((t) => <option key={t} value={t}>{t === 'all' ? 'All tiers' : TIER_LABEL[t as Tier]}</option>)}
          </select>
        </Field>
        <Field label="Platform">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                  className="rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
            <option value="all">All platforms</option>
            <option value="RentCafe">RentCafe (Yardi)</option>
            <option value="Entrata">Entrata</option>
            <option value="AppFolio">AppFolio</option>
            <option value="RealPage">RealPage</option>
            <option value="Knock">Knock</option>
            <option value="In-house portal">In-house portal</option>
          </select>
        </Field>
        <Field label="County">
          <select value={county} onChange={(e) => setCounty(e.target.value)}
                  className="rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
            <option value="all">All counties</option>
            {counties.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <span className="ml-auto text-xs text-chocolate-700">
          <strong>{operators.length}</strong> operator{operators.length === 1 ? '' : 's'} ·{' '}
          <strong>{operators.reduce((n, g) => n + g.listings.length, 0)}</strong> listing{operators.reduce((n, g) => n + g.listings.length, 0) === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="mt-5 grid gap-4 lg:grid-cols-2">
        {operators.map(({ profile, listings }) => (
          <li key={profile.name}>
            <CandyCard className="h-full">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-extrabold text-chocolate-900">{profile.name}</h2>
                    <Gumdrop tone={TIER_TONE[profile.typical_tier]}>{TIER_LABEL[profile.typical_tier]}</Gumdrop>
                    <Gumdrop tone="mute">{profile.kind}</Gumdrop>
                  </div>
                  <p className="mt-1 text-xs text-chocolate-700">
                    HQ: {profile.headquarters ?? '—'}
                    {profile.units_reported && <> · {profile.units_reported}</>}
                  </p>
                </div>
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                   className="text-xs font-bold text-lightning-700 underline decoration-lightning-500 underline-offset-2">
                  Site ↗
                </a>
              </div>

              {profile.tier_notes && (
                <p className="mt-2 rounded-md bg-frosting-100 p-2 text-xs text-chocolate-800">
                  {profile.tier_notes}
                </p>
              )}

              <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                <div>
                  <dt className="font-bold uppercase tracking-wider text-chocolate-700">Leasing platform</dt>
                  <dd className="mt-0.5 text-chocolate-900">{profile.typical_platform}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wider text-chocolate-700">Screening vendors</dt>
                  <dd className="mt-0.5 text-chocolate-900">{profile.typical_screening.join(' + ')}</dd>
                </div>
              </dl>

              <p className="mt-3 text-xs text-chocolate-800">
                <strong>What to expect:</strong> {profile.what_to_expect}
              </p>

              {listings.length > 0 && (
                <div className="mt-3 border-t border-gingerbread-300/40 pt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-chocolate-700">
                    {listings.length} listing{listings.length === 1 ? '' : 's'} in our index
                  </p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {listings.map((r) => {
                      const stack = inferScreeningStack(r.application_platform, r.manager, r.screening_vendor);
                      return (
                        <li key={r.id} className="flex items-center gap-2">
                          <Link href={r.unit_type === 'apartment' ? `/apartments/${r.id}` : `/townhomes/${r.id}`}
                                className="flex-1 truncate font-semibold text-chocolate-900 underline decoration-lightning-500 underline-offset-2">
                            {r.property_name}
                          </Link>
                          <Gumdrop tone="mute">{r.city}</Gumdrop>
                          <Gumdrop tone={STRICTNESS_TONE[stack.strictness]} title={stack.notes}>
                            {STRICTNESS_LABEL[stack.strictness]}
                          </Gumdrop>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </CandyCard>
          </li>
        ))}
      </ul>

      {operators.length === 0 && (
        <CandyCard className="mt-6 text-center text-sm text-chocolate-700">
          No operators match those filters. Widen the tier or pick a different county.
        </CandyCard>
      )}

      <CandyCard className="mt-6">
        <h2 className="font-display text-lg font-extrabold text-chocolate-900">How to read this</h2>
        <ul className="mt-2 space-y-1 text-sm text-chocolate-800">
          <li><strong>Tier:</strong> Operator's typical SoCal positioning. NOT a per-unit claim.</li>
          <li><strong>Renovated / refurbished status:</strong> a unit-level attribute we cannot assert without a verified feed. Confirm on the property page or ask the leasing office.</li>
          <li><strong>Leasing platform:</strong> what powers the apply flow. RentCafe = Yardi-hosted, Entrata = own portal with PreciseID, AppFolio = own portal with CoreLogic-backed screening, RealPage = LeasingDesk, In-house = operator's own site.</li>
          <li><strong>Screening vendors:</strong> what's likely scanning your documents. <Link href="/rentals" className="underline decoration-lightning-500 underline-offset-2">Each rental detail page</Link> shows a red/orange/yellow/green flag explaining how strict that stack is.</li>
        </ul>
      </CandyCard>
    </>
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
