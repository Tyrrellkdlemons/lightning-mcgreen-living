import type { Dealer, RentalListing, SourceMeta, VehicleListing, WorkVehicleRental } from '@/types';
import type { CompareKind } from '@/lib/store/compare';

export interface PlanningSelection { kind: CompareKind; id: string }
export interface PlanningCatalog {
  rentals: readonly RentalListing[];
  vehicles: readonly VehicleListing[];
  workVehicles: readonly WorkVehicleRental[];
  dealers: readonly Dealer[];
}
export interface PlanningRecord extends PlanningSelection {
  title: string;
  href: string;
  category: string;
  location: string;
  costLabel: string;
  cost: string;
  details: { label: string; value: string }[];
  sourceDate: string;
  sourceNote: string;
}

export const PLANNING_GROUPS: { kind: CompareKind; title: string; note: string }[] = [
  { kind: 'rental', title: 'Housing rentals', note: 'Monthly rent is separate from deposits, fees and utilities.' },
  { kind: 'car', title: 'Vehicle purchases', note: 'Purchase prices are not monthly payments. Taxes, financing and other charges may add to the cost.' },
  { kind: 'work-vehicle', title: 'Work-vehicle rentals', note: 'Daily, weekly and monthly rates are separate quotes. Mileage, fuel, insurance and other charges may apply.' },
];

function numeric(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value) && value >= 0; }
function money(value: unknown): string { return numeric(value) ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }) : 'Not recorded'; }
function amount(value: unknown, suffix = ''): string { return numeric(value) ? `${value.toLocaleString('en-US')}${suffix}` : 'Not recorded'; }
function range(low: unknown, high: unknown, format: (value: unknown) => string): string {
  if (numeric(low)) return numeric(high) && high !== low ? `${format(low)} – ${format(high)}` : format(low);
  return numeric(high) ? `Up to ${format(high)}` : 'Not recorded';
}
function sourceFields(meta: SourceMeta) {
  const date = meta.last_verified_at || meta.last_seen_at;
  return {
    sourceDate: date && /^\d{4}-\d{2}-\d{2}/.test(date) && Number.isFinite(Date.parse(date)) ? date.slice(0, 10) : 'Not recorded',
    sourceNote: meta.source === 'unverified' || meta.trust_label === 'unverified' ? 'Example / unverified source' : 'Recorded source; confirm current details',
  };
}

/** Resolve by both kind and ID. Unknown selections stay removable in the UI. */
export function resolvePlanningItem(selection: PlanningSelection, catalog: PlanningCatalog): PlanningRecord | null {
  const { kind, id } = selection;
  if (kind === 'rental') {
    const record = catalog.rentals.find((item) => item.id === id);
    if (!record) return null;
    return {
      kind, id, title: record.property_name,
      href: `/${record.unit_type === 'townhouse' ? 'townhomes' : 'apartments'}/${encodeURIComponent(id)}`,
      category: record.unit_type === 'townhouse' ? 'Townhouse rental' : record.unit_type === 'townhome-style-apartment' ? 'Townhome-style apartment' : 'Apartment rental',
      location: `${record.city}, ${record.state}`, costLabel: 'Recorded monthly rent', cost: range(record.min_rent, record.max_rent, money),
      details: [
        { label: 'Beds', value: range(record.beds_min, record.beds_max, amount) },
        { label: 'Baths', value: range(record.baths_min, record.baths_max, amount) },
        { label: 'Deposit', value: money(record.deposit) },
        { label: 'Application fee', value: money(record.application_fee) },
        { label: 'Manager', value: record.manager || 'Not recorded' },
      ], ...sourceFields(record.meta),
    };
  }
  if (kind === 'car') {
    const record = catalog.vehicles.find((item) => item.id === id);
    if (!record) return null;
    const dealer = catalog.dealers.find((item) => item.id === record.dealer_id);
    return {
      kind, id, title: [record.year, record.make, record.model, record.trim].filter(Boolean).join(' '),
      href: `/cars/${encodeURIComponent(id)}`, category: 'Vehicle purchase',
      location: dealer ? `${dealer.city}, ${dealer.state}` : 'Dealer location not recorded',
      costLabel: 'Recorded purchase price', cost: money(record.price),
      details: [
        { label: 'Mileage', value: amount(record.mileage, ' miles') },
        { label: 'Condition', value: record.condition === 'cpo' ? 'Certified pre-owned' : record.condition === 'new' ? 'New' : 'Used' },
        { label: 'Fuel', value: record.fuel_type || 'Not recorded' },
        { label: 'Estimated down payment', value: money(record.down_payment_estimate) },
        { label: 'Dealer', value: dealer?.dealer_name || 'Not recorded' },
      ], ...sourceFields(record.meta),
    };
  }
  if (kind === 'work-vehicle') {
    const record = catalog.workVehicles.find((item) => item.id === id);
    if (!record) return null;
    return {
      kind, id, title: `${record.provider_name} · ${record.vehicle_type.replace(/-/g, ' ')}`,
      href: `/work-vehicles/${encodeURIComponent(id)}`, category: 'Work-vehicle rental',
      location: `${record.city}, ${record.state}`, costLabel: 'Recorded daily rate', cost: money(record.daily_rate),
      details: [
        { label: 'Weekly rate', value: money(record.weekly_rate) },
        { label: 'Monthly rate', value: money(record.monthly_rate) },
        { label: 'Per-mile fee', value: money(record.mileage_fee_per_mile) },
        { label: 'Included miles / day', value: amount(record.included_miles_per_day) },
        { label: 'Deposit', value: money(record.deposit) },
      ], ...sourceFields(record.meta),
    };
  }
  return null;
}
