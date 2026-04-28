/**
 * All calculators are pure, allocation-friendly, and never network-bound.
 * Inputs and outputs are USD (numbers, not strings).
 */

export interface MoveInCostInput {
  rent: number;
  deposit?: number;
  first_month?: boolean;
  last_month?: boolean;
  admin_fee?: number;
  application_fee?: number;
  pet_fee?: number;
  parking_fee?: number;
  other_fees?: number;
}

export interface MoveInCostBreakdown {
  total: number;
  lines: { label: string; amount: number }[];
}

export function calcMoveInCost(input: MoveInCostInput): MoveInCostBreakdown {
  const lines: { label: string; amount: number }[] = [];
  if (input.first_month !== false) lines.push({ label: "First month's rent", amount: input.rent });
  if (input.last_month) lines.push({ label: "Last month's rent", amount: input.rent });
  if (input.deposit) lines.push({ label: 'Security deposit', amount: input.deposit });
  if (input.admin_fee) lines.push({ label: 'Admin fee', amount: input.admin_fee });
  if (input.application_fee) lines.push({ label: 'Application fee', amount: input.application_fee });
  if (input.pet_fee) lines.push({ label: 'Pet fee', amount: input.pet_fee });
  if (input.parking_fee) lines.push({ label: 'Parking fee (1st mo)', amount: input.parking_fee });
  if (input.other_fees) lines.push({ label: 'Other fees', amount: input.other_fees });
  return { total: lines.reduce((s, l) => s + l.amount, 0), lines };
}

/** Recommended max rent: 30% (healthy) and 35% (stretch) of gross monthly income. */
export function calcAffordability(grossMonthlyIncome: number) {
  return {
    healthy_max_rent: Math.round(grossMonthlyIncome * 0.30),
    stretch_max_rent: Math.round(grossMonthlyIncome * 0.35),
  };
}

/** Required gross monthly income at the property's stated multiplier. */
export function calcRequiredIncome(rent: number, multiplier = 3) {
  return Math.round(rent * multiplier);
}

// ---------------------------------------------------------------------------
// Vehicle financing
// ---------------------------------------------------------------------------

export interface PaymentEstimateInput {
  price: number;
  down_payment?: number;
  apr_percent?: number;        // e.g., 8.99
  term_months?: number;        // e.g., 60
  tax_title_license?: number;
  dealer_fees?: number;
  trade_in_value?: number;
}

export interface PaymentEstimate {
  amount_financed: number;
  monthly_payment: number;
  total_paid_over_term: number;
  total_interest: number;
}

export function calcPaymentEstimate(input: PaymentEstimateInput): PaymentEstimate {
  const apr = (input.apr_percent ?? 9) / 100;
  const r = apr / 12;
  const n = input.term_months ?? 60;
  const trade = input.trade_in_value ?? 0;
  const fees = (input.tax_title_license ?? 0) + (input.dealer_fees ?? 0);
  const principal = Math.max(0, input.price + fees - trade - (input.down_payment ?? 0));
  const monthly = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
  const total = monthly * n;
  return {
    amount_financed: Math.round(principal),
    monthly_payment: Math.round(monthly),
    total_paid_over_term: Math.round(total),
    total_interest: Math.round(total - principal),
  };
}

/** Required down payment for a target monthly payment. */
export function calcRequiredDownForMonthly(input: {
  price: number;
  target_monthly: number;
  apr_percent?: number;
  term_months?: number;
}) {
  const apr = (input.apr_percent ?? 9) / 100;
  const r = apr / 12;
  const n = input.term_months ?? 60;
  // Solve P from M = P * r / (1 - (1+r)^-n)
  const principalThatGivesTarget =
    r === 0
      ? input.target_monthly * n
      : (input.target_monthly * (1 - Math.pow(1 + r, -n))) / r;
  return Math.max(0, Math.round(input.price - principalThatGivesTarget));
}

/** Total monthly cost: payment + estimated fuel + insurance placeholder. */
export function calcTotalMonthlyCarCost(input: {
  monthly_payment: number;
  miles_per_month?: number;
  mpg?: number;
  fuel_price_per_gallon?: number;
  insurance_per_month?: number;
}) {
  const miles = input.miles_per_month ?? 1000;
  const mpg = input.mpg ?? 28;
  const gas = input.fuel_price_per_gallon ?? 4.85; // typical SoCal placeholder
  const fuel = (miles / mpg) * gas;
  return Math.round(input.monthly_payment + fuel + (input.insurance_per_month ?? 145));
}

// ---------------------------------------------------------------------------
// Work-vehicle rental
// ---------------------------------------------------------------------------

export interface WorkRentalCostInput {
  daily_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  term: 'daily' | 'weekly' | 'monthly';
  units: number;                          // days / weeks / months
  miles_estimate?: number;
  mileage_fee_per_mile?: number;
  included_miles_per_day?: number;
  deposit?: number;
  insurance_per_day_estimate?: number;
}

export interface WorkRentalCost {
  base: number;
  mileage: number;
  insurance: number;
  deposit: number;
  total_pay_now: number;     // base + mileage + insurance (deposit refundable)
  refundable_deposit: number;
}

export function calcWorkRentalCost(input: WorkRentalCostInput): WorkRentalCost {
  let base = 0;
  let totalDays = input.units;
  if (input.term === 'daily' && input.daily_rate)  base = input.daily_rate * input.units;
  if (input.term === 'weekly' && input.weekly_rate) {
    base = input.weekly_rate * input.units;
    totalDays = input.units * 7;
  }
  if (input.term === 'monthly' && input.monthly_rate) {
    base = input.monthly_rate * input.units;
    totalDays = input.units * 30;
  }
  const includedMiles = (input.included_miles_per_day ?? 0) * totalDays;
  const overMiles = Math.max(0, (input.miles_estimate ?? 0) - includedMiles);
  const mileage = overMiles * (input.mileage_fee_per_mile ?? 0);
  const insurance = totalDays * (input.insurance_per_day_estimate ?? 0);
  return {
    base: Math.round(base),
    mileage: Math.round(mileage),
    insurance: Math.round(insurance),
    deposit: Math.round(input.deposit ?? 0),
    total_pay_now: Math.round(base + mileage + insurance),
    refundable_deposit: Math.round(input.deposit ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const usd = (n?: number) =>
  n == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const usdCents = (n?: number) =>
  n == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
