'use client';

import { useMemo, useState } from 'react';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { DEMO_RENTALS } from '@/lib/data/demo-rentals';
import { DEMO_VEHICLES } from '@/lib/data/demo-vehicles';
import { DEMO_WORK_VEHICLES } from '@/lib/data/demo-work-vehicles';
import { calcPaymentEstimate, usd } from '@/lib/calculators';

/**
 * Combined "Life Budget" matcher.
 *
 * User enters monthly income + budget caps for rent, car, work-vehicle, and a
 * down-payment / move-in savings figure. We surface the best combos that
 * actually add up — and warn when they don't.
 */

interface Inputs {
  income: number;
  rent_cap: number;
  car_cap: number;
  work_cap: number;
  savings: number;
  city?: string;
  job_type?: string;
}

export function LifeBudget() {
  const [i, setI] = useState<Inputs>({
    income: 7500,
    rent_cap: 2400,
    car_cap: 450,
    work_cap: 600,
    savings: 4500,
  });

  const combos = useMemo(() => buildCombos(i), [i]);
  const totalsHealthy = combos.length > 0 && combos.every((c) => c.flag === 'ok');

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <CandyCard className="lg:col-span-1">
        <h2 className="font-display text-xl font-extrabold text-chocolate-900">Your numbers</h2>
        <p className="text-xs text-chocolate-700">All client-side. Adjust freely.</p>
        <div className="mt-3 grid gap-3">
          <Field label="Gross monthly income">
            <Num value={i.income} onChange={(v) => setI({ ...i, income: v })} />
          </Field>
          <Field label="Max rent / month">
            <Num value={i.rent_cap} onChange={(v) => setI({ ...i, rent_cap: v })} />
          </Field>
          <Field label="Max car payment / month">
            <Num value={i.car_cap} onChange={(v) => setI({ ...i, car_cap: v })} />
          </Field>
          <Field label="Max work-vehicle / week">
            <Num value={i.work_cap} onChange={(v) => setI({ ...i, work_cap: v })} />
          </Field>
          <Field label="Move-in / down savings">
            <Num value={i.savings} onChange={(v) => setI({ ...i, savings: v })} />
          </Field>
        </div>
      </CandyCard>

      <div className="lg:col-span-2 space-y-4">
        <CandyCard>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold text-chocolate-900">Life Budget summary</h2>
            <Gumdrop tone={totalsHealthy ? 'ok' : 'warn'}>
              {totalsHealthy ? 'Looks workable' : 'Some combos overload your budget'}
            </Gumdrop>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3 text-sm">
            <Stat label="Income" value={usd(i.income)} />
            <Stat label="30% target rent cap" value={usd(Math.round(i.income * 0.3))} />
            <Stat label="Savings" value={usd(i.savings)} />
          </ul>
        </CandyCard>

        <ul className="grid gap-4">
          {combos.map((c, idx) => (
            <li key={idx}>
              <CandyCard>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Gumdrop tone={c.flag}>{c.label}</Gumdrop>
                  <span className="num text-sm font-bold text-chocolate-900">
                    Monthly total: {usd(c.monthly_total)} of {usd(i.income)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-chocolate-800">
                  <strong>Live:</strong> {c.rental_label}
                </p>
                {c.car_label && <p className="text-sm text-chocolate-800"><strong>Drive:</strong> {c.car_label}</p>}
                {c.work_label && <p className="text-sm text-chocolate-800"><strong>Earn:</strong> {c.work_label}</p>}
                {c.warning && (
                  <p className="mt-2 rounded-md bg-peppermint-500/10 px-2 py-1.5 text-xs text-peppermint-600">
                    ⚠ {c.warning}
                  </p>
                )}
              </CandyCard>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface Combo {
  label: string;
  flag: 'ok' | 'info' | 'warn' | 'mute';
  rental_label: string;
  car_label?: string;
  work_label?: string;
  monthly_total: number;
  warning?: string;
}

function buildCombos(i: Inputs): Combo[] {
  const out: Combo[] = [];

  // Combo A: rent + car (no work vehicle)
  for (const r of DEMO_RENTALS.filter((r) => r.min_rent <= i.rent_cap)) {
    for (const v of DEMO_VEHICLES) {
      const pay = calcPaymentEstimate({
        price: v.price,
        down_payment: Math.min(i.savings * 0.5, v.down_payment_estimate ?? v.price * 0.1),
        apr_percent: v.apr_estimate,
        term_months: v.term_months,
      });
      if (pay.monthly_payment > i.car_cap) continue;
      const monthly = r.min_rent + pay.monthly_payment;
      const overload = monthly > i.income * 0.55;
      out.push({
        label: 'Rent + Car',
        flag: overload ? 'warn' : 'ok',
        rental_label: `${r.property_name} (${r.city}) — ${usd(r.min_rent)}/mo`,
        car_label: `${v.year} ${v.make} ${v.model} — est ${usd(pay.monthly_payment)}/mo`,
        monthly_total: monthly,
        warning: overload ? 'Combined rent + car exceeds 55% of income.' : undefined,
      });
    }
  }

  // Combo B: rent + work vehicle (income-producing)
  for (const r of DEMO_RENTALS.filter((r) => r.min_rent <= i.rent_cap)) {
    for (const w of DEMO_WORK_VEHICLES) {
      const weekly = w.weekly_rate ?? (w.daily_rate ? w.daily_rate * 5 : null);
      if (!weekly || weekly > i.work_cap) continue;
      const monthlyWork = weekly * 4;
      const monthly = r.min_rent + monthlyWork;
      const overload = monthly > i.income * 0.6;
      out.push({
        label: 'Rent + Work van',
        flag: overload ? 'warn' : 'info',
        rental_label: `${r.property_name} (${r.city}) — ${usd(r.min_rent)}/mo`,
        work_label: `${w.provider_name} ${w.vehicle_type} — ${usd(weekly)}/wk`,
        monthly_total: monthly,
        warning: overload ? 'Big stack — needs the work van to actually earn.' : undefined,
      });
    }
  }

  // Top 6 by lowest total
  out.sort((a, b) => a.monthly_total - b.monthly_total);
  return out.slice(0, 6);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-chocolate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
function Num({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input type="number" inputMode="numeric" value={value}
           onChange={(e) => onChange(Number(e.target.value) || 0)}
           className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-frosting-100 px-2 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-chocolate-600">{label}</p>
      <p className="num text-sm font-bold text-chocolate-900">{value}</p>
    </div>
  );
}
