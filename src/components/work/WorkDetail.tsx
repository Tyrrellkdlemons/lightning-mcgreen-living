'use client';

import { useMemo, useState } from 'react';
import type { WorkVehicleRental } from '@/types';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { WorkVan } from '@/components/theme/CookieCar';
import { FitBadge, FitExplain } from '@/components/common/FitBadge';
import { SourcePanel } from '@/components/common/SourcePanel';
import { PhotoGallery } from '@/components/common/PhotoGallery';
import type { PhotoSet } from '@/lib/data/photo-sets';
import { calcWorkRentalCost, usd } from '@/lib/calculators';
import { scoreWorkRental } from '@/lib/scoring';
import { useWorkProfile, WorkProfilePanel } from './WorkProfilePanel';

export function WorkDetailClient({ rental }: { rental: WorkVehicleRental & { photos?: PhotoSet } }) {
  const [profile, setProfile] = useWorkProfile();
  const [term, setTerm] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [units, setUnits] = useState(1);
  const [miles, setMiles] = useState(profile.mileage_estimate ?? 80);

  const cost = useMemo(
    () =>
      calcWorkRentalCost({
        term,
        units,
        daily_rate: rental.daily_rate,
        weekly_rate: rental.weekly_rate,
        monthly_rate: rental.monthly_rate,
        miles_estimate: miles,
        mileage_fee_per_mile: rental.mileage_fee_per_mile,
        included_miles_per_day: rental.included_miles_per_day,
        deposit: rental.deposit,
        insurance_per_day_estimate: rental.insurance_per_day_estimate,
      }),
    [rental, term, units, miles],
  );

  const fit = useMemo(() => scoreWorkRental(rental, { ...profile, term_pref: term }), [rental, profile, term]);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {rental.photos && (
          <CandyCard className="!p-0 overflow-hidden">
            <PhotoGallery photos={rental.photos} height={340} rounded={false} />
          </CandyCard>
        )}
        <CandyCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Gumdrop tone="mute">{rental.vehicle_type.replace('-', ' ')}</Gumdrop>
              <h1 className="mt-1 font-display text-3xl font-extrabold text-chocolate-900">{rental.provider_name}</h1>
              <p className="mt-1 text-sm text-chocolate-700">
                {rental.branch_address} · {rental.city}, CA {rental.zip}
              </p>
              <div className="mt-2"><FitBadge fit={fit} /></div>
            </div>
            <WorkVan className="h-16 w-auto" />
          </div>
        </CandyCard>

        <CandyCard>
          <h2 className="font-display text-xl font-extrabold text-chocolate-900">Cost calculator</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label="Term">
              <select value={term} onChange={(e) => setTerm(e.target.value as any)}
                      className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </Field>
            <Field label={`How many ${term === 'daily' ? 'days' : term === 'weekly' ? 'weeks' : 'months'}?`}>
              <input type="number" inputMode="numeric" min={1} value={units}
                     onChange={(e) => setUnits(Math.max(1, Number(e.target.value) || 1))}
                     className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
            </Field>
            <Field label="Estimated miles total">
              <input type="number" inputMode="numeric" value={miles}
                     onChange={(e) => setMiles(Math.max(0, Number(e.target.value) || 0))}
                     className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
            </Field>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4 text-sm">
            <Stat label="Base" value={usd(cost.base)} />
            <Stat label="Mileage fees" value={usd(cost.mileage)} />
            <Stat label="Insurance est." value={usd(cost.insurance)} />
            <Stat label="Pay now (est.)" value={usd(cost.total_pay_now)} big />
          </div>
          <p className="mt-2 text-xs text-chocolate-600">+ {usd(cost.refundable_deposit)} refundable deposit. Estimates only — verify with the provider.</p>
        </CandyCard>

        <CandyCard>
          <h2 className="font-display text-xl font-extrabold text-chocolate-900">Why this may fit</h2>
          <div className="mt-2"><FitExplain fit={fit} /></div>
        </CandyCard>

        <WorkProfilePanel profile={profile} onChange={setProfile} />
      </div>

      <aside className="space-y-4">
        <CandyCard>
          <h3 className="font-display text-lg font-extrabold text-chocolate-900">Requirements</h3>
          <ul className="mt-2 space-y-1 text-sm text-chocolate-800">
            <li className="flex justify-between"><span>Min age</span><span>{rental.min_age ?? '—'}</span></li>
            <li className="flex justify-between"><span>License</span><span>{rental.license_required ?? '—'}</span></li>
            <li className="flex justify-between"><span>Payment</span><span>{rental.payment_required ?? '—'}</span></li>
            <li className="flex justify-between"><span>One-way</span><span>{rental.one_way_available ? 'Yes' : 'No'}</span></li>
            <li className="flex justify-between"><span>After-hours pickup</span><span>{rental.after_hours_pickup ? 'Yes' : 'No'}</span></li>
            <li className="flex justify-between"><span>Business account</span><span>{rental.business_account_available ? 'Yes' : 'No'}</span></li>
            <li className="flex justify-between"><span>Cargo volume</span><span>{rental.cargo_volume_cuft ? `${rental.cargo_volume_cuft} cu ft` : '—'}</span></li>
            <li className="flex justify-between"><span>Payload</span><span>{rental.payload_lbs ? `${rental.payload_lbs} lbs` : '—'}</span></li>
          </ul>
        </CandyCard>

        <CandyCard>
          <div className="flex flex-wrap gap-2">
            <a href={rental.website} target="_blank" rel="noopener noreferrer" className="bolt-btn">Open rental provider</a>
            <a href={`tel:${rental.phone}`} className="cinnamon-btn">Call provider</a>
            <button type="button" onClick={() => copyRentalSheet(rental, profile, term, units, miles)} className="cinnamon-btn">
              Copy rental request sheet
            </button>
          </div>
          <p className="mt-2 text-xs text-chocolate-600">We never reserve on your behalf without your action.</p>
        </CandyCard>

        <SourcePanel meta={rental.meta} />

        <CandyCard>
          <h3 className="font-display text-lg font-extrabold text-chocolate-900">Disclaimers</h3>
          <ul className="mt-2 space-y-1 text-xs text-chocolate-700">
            <li>· Availability and rates can change between visits — always call to verify.</li>
            <li>· Insurance and deposit requirements vary by branch.</li>
            <li>· We are not the rental provider.</li>
          </ul>
        </CandyCard>
      </aside>
    </div>
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

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="rounded-md bg-frosting-100 px-2 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-chocolate-600">{label}</p>
      <p className={'num font-bold text-chocolate-900 ' + (big ? 'text-xl' : 'text-sm')}>{value}</p>
    </div>
  );
}

function copyRentalSheet(rental: WorkVehicleRental, profile: any, term: string, units: number, miles: number) {
  const sheet = [
    `LIGHTNING MCGREEN LIVING — RENTAL REQUEST SHEET`,
    `Provider: ${rental.provider_name}`,
    `Branch: ${rental.branch_address}, ${rental.city}, CA ${rental.zip}`,
    `Vehicle: ${rental.vehicle_type}`,
    ``,
    `Requested term: ${units} ${term === 'daily' ? 'days' : term === 'weekly' ? 'weeks' : 'months'}`,
    `Estimated miles: ${miles}`,
    ``,
    `Renter`,
    `Name: ${profile.contact?.name ?? ''}`,
    `Business: ${profile.business_name ?? ''}`,
    `Job type: ${profile.job_type ?? ''}`,
    `Insurance status: ${profile.insurance_status ?? ''}`,
    `Payment ready: ${profile.payment_ready ?? ''}`,
    `Pickup city: ${profile.pickup_city ?? ''}`,
  ].join('\n');
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(sheet).catch(() => {});
  }
}
