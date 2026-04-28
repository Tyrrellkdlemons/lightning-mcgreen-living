/**
 * Qualification Fit Score — explainable, never opaque.
 *
 * Returns one of: strong-fit · possible-fit · stretch · risky · needs-verification.
 * Always ships with `reasons` (positive) and `concerns` (negative) so the UI
 * can render "Why this may fit" and "What could hurt approval" panels.
 *
 * IMPORTANT: this engine never uses, infers, or stores any protected
 * attribute (race, religion, national origin, familial status, sex, etc.).
 */

import type {
  RentalListing,
  VehicleListing,
  WorkVehicleRental,
  RenterProfile,
  BuyerProfile,
  WorkRentalProfile,
  FitResult,
  FitTier,
} from '@/types';

function tierFromScore(score: number): FitTier {
  if (score >= 80) return 'strong-fit';
  if (score >= 65) return 'possible-fit';
  if (score >= 50) return 'stretch';
  if (score >= 30) return 'risky';
  return 'needs-verification';
}

/** Symmetric clamp helper. */
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// ---------------------------------------------------------------------------
// Rental (apartment + townhome) scoring
// ---------------------------------------------------------------------------

export function scoreRental(listing: RentalListing, profile: RenterProfile): FitResult {
  const reasons: string[] = [];
  const concerns: string[] = [];

  // 1. Rent vs income (weight 30)
  let rentToIncome = 50;
  if (profile.gross_monthly_income && profile.gross_monthly_income > 0) {
    const ratio = listing.min_rent / profile.gross_monthly_income;
    if (ratio <= 0.30) {
      rentToIncome = 100;
      reasons.push(`Rent is ${(ratio * 100).toFixed(0)}% of your income — well within the healthy 30% guideline.`);
    } else if (ratio <= 0.35) {
      rentToIncome = 80;
      reasons.push(`Rent is ${(ratio * 100).toFixed(0)}% of your income — within stretch range.`);
    } else if (ratio <= 0.45) {
      rentToIncome = 50;
      concerns.push(`Rent is ${(ratio * 100).toFixed(0)}% of your income — above 35% may worry screening.`);
    } else {
      rentToIncome = 20;
      concerns.push(`Rent is ${(ratio * 100).toFixed(0)}% of your income — likely over the property's income requirement.`);
    }
  } else {
    concerns.push('Add your monthly income to sharpen this estimate.');
  }

  // 2. Property income multiplier check
  let multiplierFit = 70;
  if (listing.income_multiplier && profile.gross_monthly_income) {
    const required = listing.min_rent * listing.income_multiplier;
    if (profile.gross_monthly_income >= required) {
      multiplierFit = 100;
      reasons.push(`Meets the property's stated ${listing.income_multiplier}× income rule.`);
    } else {
      multiplierFit = 25;
      concerns.push(`Property typically requires ${listing.income_multiplier}× monthly rent in income.`);
    }
  }

  // 3. Move-in vs savings (weight 20)
  let moveInFit = 60;
  const estimatedMoveIn =
    listing.min_rent + (listing.deposit ?? listing.min_rent) + (listing.admin_fee ?? 0) + (listing.application_fee ?? 0);
  if (profile.budget?.max_move_in) {
    if (profile.budget.max_move_in >= estimatedMoveIn) {
      moveInFit = 100;
      reasons.push('Move-in cost is within your max move-in budget.');
    } else {
      moveInFit = 20;
      concerns.push(`Estimated move-in (~$${estimatedMoveIn.toLocaleString()}) exceeds your max move-in budget.`);
    }
  }

  // 4. Location match (weight 10)
  const locFit = profile.preferred_cities?.some((c) => c.toLowerCase() === listing.city.toLowerCase()) ? 100 : 60;
  if (locFit === 100) reasons.push(`In one of your preferred cities (${listing.city}).`);

  // 5. Pet/parking (weight 10)
  let petFit = 80;
  const wantsPets = (profile.pets?.dogs ?? 0) + (profile.pets?.cats ?? 0) > 0;
  if (wantsPets && listing.pet_policy && /no pets/i.test(listing.pet_policy)) {
    petFit = 10;
    concerns.push('Pet policy may not accept your pets.');
  } else if (wantsPets && listing.pet_policy) {
    reasons.push('Pet policy on file — verify your specific pet meets the rules.');
  }

  // 6. Application readiness (weight 10)
  const docs = profile.documents_ready ?? [];
  const required = ['ID', 'income proof', 'rental history'];
  const ready = required.filter((d) => docs.some((r) => r.toLowerCase().includes(d.toLowerCase()))).length;
  const appReady = (ready / required.length) * 100;
  if (appReady === 100) reasons.push('Application docs look ready.');
  else if (appReady >= 50) concerns.push('A few application docs still missing.');
  else concerns.push('Most application docs not yet collected.');

  // 7. Fee burden (weight 10)
  const feeBurden = (listing.application_fee ?? 0) + (listing.admin_fee ?? 0);
  const feeFit = feeBurden < 100 ? 100 : feeBurden < 250 ? 70 : 40;
  if (feeFit === 40) concerns.push(`Up-front fees ~$${feeBurden} before approval.`);

  // 8. Data freshness (weight 10)
  const fresh = listing.meta.data_freshness_status;
  const freshFit = fresh === 'live' ? 100 : fresh === 'recent' ? 80 : fresh === 'stale' ? 40 : 30;
  if (fresh === 'stale' || fresh === 'manual-review-needed') {
    concerns.push('Listing data may be stale — verify with the property.');
  }

  const score = clamp(
    rentToIncome * 0.30 +
      multiplierFit * 0.10 +
      moveInFit * 0.20 +
      locFit * 0.10 +
      petFit * 0.10 +
      appReady * 0.10 +
      feeFit * 0.05 +
      freshFit * 0.05,
  );

  return { score: Math.round(score), tier: tierFromScore(score), reasons, concerns };
}

// ---------------------------------------------------------------------------
// Vehicle scoring
// ---------------------------------------------------------------------------

export function scoreVehicle(vehicle: VehicleListing, profile: BuyerProfile): FitResult {
  const reasons: string[] = [];
  const concerns: string[] = [];
  let scoreSum = 0;

  // Price vs cash budget (down + finance comfort)
  let priceFit = 60;
  if (profile.monthly_payment_target && vehicle.price) {
    // Rough proxy: if a 60-mo loan at 9% with $0 down would land within 1.25x of target, OK.
    const monthlyAtZeroDown = (vehicle.price * (0.09 / 12)) / (1 - Math.pow(1 + 0.09 / 12, -60));
    if (monthlyAtZeroDown <= profile.monthly_payment_target) {
      priceFit = 100;
      reasons.push('Likely within your monthly payment target.');
    } else if (monthlyAtZeroDown <= profile.monthly_payment_target * 1.25) {
      priceFit = 70;
      concerns.push('Monthly payment may slightly exceed your target without a larger down payment.');
    } else {
      priceFit = 30;
      concerns.push('Monthly payment will likely exceed your target at typical rates.');
    }
  }
  scoreSum += priceFit * 0.30;

  // Down payment fit
  let downFit = 70;
  if (profile.down_payment_available != null && vehicle.down_payment_estimate) {
    downFit = profile.down_payment_available >= vehicle.down_payment_estimate ? 100 : 50;
    if (downFit === 50) concerns.push('Dealer\'s suggested down is more than your available cash.');
    else reasons.push('Down payment available meets dealer suggestion.');
  }
  scoreSum += downFit * 0.15;

  // Credit range guidance (self-selected)
  let creditFit = 60;
  switch (profile.credit_range) {
    case '740+':       creditFit = 100; reasons.push('Strong self-reported credit range.'); break;
    case '670-739':    creditFit = 85;  reasons.push('Good self-reported credit range.'); break;
    case '580-669':    creditFit = 60;  break;
    case 'below-580':  creditFit = 35;  concerns.push('Subprime financing may carry higher APR — call dealer to verify programs.'); break;
    default:           break;
  }
  scoreSum += creditFit * 0.15;

  // Fuel cost
  let fuelFit = 70;
  if (vehicle.fuel_economy_mpg_combined) {
    fuelFit = vehicle.fuel_economy_mpg_combined >= 30 ? 100 : vehicle.fuel_economy_mpg_combined >= 22 ? 80 : 55;
    if (fuelFit === 100) reasons.push('Fuel-efficient vehicle.');
  }
  scoreSum += fuelFit * 0.10;

  // Mileage
  const mileageFit = vehicle.mileage < 30000 ? 100 : vehicle.mileage < 70000 ? 80 : vehicle.mileage < 110000 ? 60 : 40;
  if (mileageFit <= 60) concerns.push('Higher mileage — request maintenance + accident history.');
  scoreSum += mileageFit * 0.10;

  // Dealer transparency: prefers vehicles whose listing carries strong meta
  const transparency = vehicle.meta.confidence_score;
  scoreSum += transparency * 0.10;
  if (transparency < 50) concerns.push('Lower data confidence — verify pricing and availability with the dealer.');

  // Freshness
  const fresh = vehicle.meta.data_freshness_status;
  const freshFit = fresh === 'live' ? 100 : fresh === 'recent' ? 80 : fresh === 'stale' ? 40 : 25;
  if (fresh !== 'live' && fresh !== 'recent') concerns.push('Listing may be stale — confirm availability.');
  scoreSum += freshFit * 0.10;

  const score = clamp(scoreSum);
  return { score: Math.round(score), tier: tierFromScore(score), reasons, concerns };
}

// ---------------------------------------------------------------------------
// Work vehicle rental scoring
// ---------------------------------------------------------------------------

export function scoreWorkRental(rental: WorkVehicleRental, profile: WorkRentalProfile): FitResult {
  const reasons: string[] = [];
  const concerns: string[] = [];

  // Rate vs budget
  let rateFit = 60;
  const term = profile.term_pref ?? 'daily';
  const rate = term === 'daily' ? rental.daily_rate : term === 'weekly' ? rental.weekly_rate : rental.monthly_rate;
  if (profile.max_budget && rate) {
    rateFit = rate <= profile.max_budget ? 100 : rate <= profile.max_budget * 1.25 ? 65 : 25;
    if (rateFit === 100) reasons.push(`Rate is within your ${term} budget.`);
    else if (rateFit === 25) concerns.push(`Rate exceeds your ${term} budget by more than 25%.`);
  }

  // Deposit vs savings
  let depositFit = 70;
  if (profile.max_deposit != null && rental.deposit != null) {
    depositFit = rental.deposit <= profile.max_deposit ? 100 : 30;
    if (depositFit === 100) reasons.push('Deposit fits your max deposit.');
    else concerns.push('Deposit exceeds your max — may need a card pre-auth.');
  }

  // Vehicle-to-job match
  const jobMatch = matchVehicleToJob(rental.vehicle_type, profile.job_type);
  const jobFit = jobMatch ? 100 : 55;
  if (jobMatch) reasons.push(jobMatch);

  // Insurance requirement fit
  let insuranceFit = 70;
  if (profile.insurance_status === 'have-business') {
    insuranceFit = 100;
    reasons.push('You have business insurance — typically faster checkout.');
  } else if (profile.insurance_status === 'need') {
    insuranceFit = 50;
    concerns.push('You may need to purchase rental insurance at the counter.');
  }

  // Business account
  let bizFit = 80;
  if (profile.business_account_needed) {
    bizFit = rental.business_account_available ? 100 : 35;
    if (bizFit === 35) concerns.push('Provider may not offer a business account — call to verify.');
  }

  // Mileage cost fit
  let mileageFit = 80;
  if (profile.mileage_estimate && rental.mileage_fee_per_mile != null && rental.included_miles_per_day != null) {
    const days = profile.term_pref === 'weekly' ? 7 : profile.term_pref === 'monthly' ? 30 : 1;
    const included = rental.included_miles_per_day * days;
    if (profile.mileage_estimate <= included) {
      mileageFit = 100;
      reasons.push('Estimated mileage is within the included miles.');
    } else {
      mileageFit = 55;
      const overMiles = profile.mileage_estimate - included;
      const overCost = overMiles * rental.mileage_fee_per_mile;
      concerns.push(`~${overMiles} miles over included — adds ~$${overCost.toFixed(2)}.`);
    }
  }

  // Freshness
  const fresh = rental.meta.data_freshness_status;
  const freshFit = fresh === 'live' ? 100 : fresh === 'recent' ? 80 : 40;
  if (fresh !== 'live') concerns.push('Verify availability before driving to the branch.');

  const score = clamp(
    rateFit * 0.25 +
      depositFit * 0.10 +
      jobFit * 0.15 +
      insuranceFit * 0.10 +
      bizFit * 0.10 +
      mileageFit * 0.15 +
      freshFit * 0.15,
  );

  return { score: Math.round(score), tier: tierFromScore(score), reasons, concerns };
}

function matchVehicleToJob(
  v: WorkVehicleRental['vehicle_type'],
  job: WorkRentalProfile['job_type'],
): string | null {
  if (!job) return null;
  const map: Partial<Record<NonNullable<WorkRentalProfile['job_type']>, WorkVehicleRental['vehicle_type'][]>> = {
    delivery:        ['cargo-van', 'box-truck'],
    moving:          ['box-truck', 'cargo-van', 'pickup'],
    construction:    ['pickup', 'stake-bed', 'flatbed'],
    landscaping:     ['pickup', 'stake-bed'],
    cleaning:        ['cargo-van', 'pickup'],
    event:           ['cargo-van', 'box-truck', 'passenger-van'],
    'mobile-detail': ['cargo-van', 'pickup'],
    hauling:         ['box-truck', 'flatbed', 'pickup'],
    furniture:       ['box-truck', 'cargo-van'],
    'side-hustle':   ['cargo-van', 'pickup'],
  };
  const ok = map[job]?.includes(v);
  return ok ? `${humanVehicle(v)} is a strong fit for ${humanJob(job)}.` : null;
}

function humanVehicle(v: WorkVehicleRental['vehicle_type']) {
  return v.replace('-', ' ');
}
function humanJob(j: NonNullable<WorkRentalProfile['job_type']>) {
  return j.replace('-', ' ');
}

// Display label for a tier
export const FIT_LABEL: Record<FitTier, string> = {
  'strong-fit': 'Strong Fit',
  'possible-fit': 'Possible Fit',
  stretch: 'Stretch',
  risky: 'Risky',
  'needs-verification': 'Needs Verification',
};

export const FIT_TONE: Record<FitTier, 'ok' | 'info' | 'warn' | 'mute'> = {
  'strong-fit': 'ok',
  'possible-fit': 'info',
  stretch: 'mute',
  risky: 'warn',
  'needs-verification': 'mute',
};
