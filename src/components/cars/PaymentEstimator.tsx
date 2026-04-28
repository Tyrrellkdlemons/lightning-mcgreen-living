'use client';

import { useState, useMemo } from 'react';
import { calcPaymentEstimate, calcRequiredDownForMonthly, calcTotalMonthlyCarCost, usd } from '@/lib/calculators';
import { CandyCard } from '@/components/ui/CandyCard';

export function PaymentEstimator({
  initialPrice,
  initialDown = 2500,
  initialApr = 8.99,
  initialTerm = 60,
  mpg,
}: {
  initialPrice: number;
  initialDown?: number;
  initialApr?: number;
  initialTerm?: number;
  mpg?: number;
}) {
  const [price, setPrice] = useState(initialPrice);
  const [down, setDown] = useState(initialDown);
  const [apr, setApr] = useState(initialApr);
  const [term, setTerm] = useState(initialTerm);
  const [target, setTarget] = useState(0);
  const [milesPerMonth, setMilesPerMonth] = useState(1000);

  const est = useMemo(
    () => calcPaymentEstimate({ price, down_payment: down, apr_percent: apr, term_months: term }),
    [price, down, apr, term],
  );
  const requiredDown = useMemo(
    () => target > 0 ? calcRequiredDownForMonthly({ price, target_monthly: target, apr_percent: apr, term_months: term }) : null,
    [price, apr, term, target],
  );
  const total = useMemo(
    () => calcTotalMonthlyCarCost({ monthly_payment: est.monthly_payment, miles_per_month: milesPerMonth, mpg }),
    [est.monthly_payment, milesPerMonth, mpg],
  );

  return (
    <CandyCard>
      <h2 className="font-display text-xl font-extrabold text-chocolate-900">Payment estimator</h2>
      <p className="text-xs text-chocolate-700">Quick math — not a loan offer. Final terms come from the lender.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <Field label="Price"><Num value={price} onChange={setPrice} /></Field>
        <Field label="Down"><Num value={down} onChange={setDown} /></Field>
        <Field label="APR %"><Num value={apr} onChange={setApr} step={0.01} /></Field>
        <Field label="Term (mo)"><Num value={term} onChange={setTerm} /></Field>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm">
        <Stat label="Monthly payment" value={usd(est.monthly_payment)} big />
        <Stat label="Total interest" value={usd(est.total_interest)} />
        <Stat label="Total paid over term" value={usd(est.total_paid_over_term)} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Field label="Target monthly (USD)"><Num value={target} onChange={setTarget} /></Field>
        <Field label="Miles / month"><Num value={milesPerMonth} onChange={setMilesPerMonth} /></Field>
        {requiredDown != null && <Stat label="Required down for target" value={usd(requiredDown)} />}
      </div>
      <div className="mt-3 text-sm text-chocolate-700">
        Estimated total monthly cost (payment + fuel + insurance placeholder):{' '}
        <strong className="num text-chocolate-900">{usd(total)}</strong>
      </div>
    </CandyCard>
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
function Num({ value, onChange, step }: { value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step ?? 1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
    />
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
