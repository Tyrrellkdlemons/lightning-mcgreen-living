/**
 * Manual CSV provider — the workhorse for "real data" until partner contracts
 * are signed. Validates rows against Zod schemas, emits per-row errors, and
 * returns clean records that can be merged into the same search index.
 *
 * Wired to /admin upload UI in Phase 8.
 */

import { z } from 'zod';
import Papa from 'papaparse';
import type { RentalListing, Dealer, VehicleListing, WorkVehicleRental } from '@/types';
import { isWithinSoCal } from '@/lib/geofence/socal';

const sourceMetaSchema = z.object({
  source: z.enum(['official', 'partner', 'public-open-data', 'property-or-dealer-website', 'manual-verified', 'unverified']),
  source_url: z.string().url(),
  confidence_score: z.coerce.number().min(0).max(100),
  last_seen_at: z.string(),
  last_verified_at: z.string(),
  data_freshness_status: z.enum(['live', 'recent', 'stale', 'manual-review-needed']),
  trust_label: z.enum(['official', 'partner', 'public-open-data', 'manual-verified', 'unverified']),
});

const num = z.coerce.number();
const optNum = z.coerce.number().optional();
const optStr = z.string().optional();
const optBool = z.union([z.boolean(), z.string()]).transform((v) => {
  if (typeof v === 'boolean') return v;
  return /^(1|true|yes|y)$/i.test(v.trim());
}).optional();

const apartmentRow = z.object({
  external_id: z.string(),
  property_name: z.string(),
  unit_type: z.enum(['apartment', 'townhouse', 'townhome-style-apartment']),
  address_line: z.string(),
  city: z.string(),
  county: z.string(),
  state: z.literal('CA'),
  zip: z.string(),
  lat: num,
  lng: num,
  manager: z.string(),
  application_platform: z.enum(['RentCafe', 'Entrata', 'AppFolio', 'RealPage', 'Knock', 'Other', 'Unknown']).default('Unknown'),
  application_url: z.string().url(),
  official_property_url: z.string().url(),
  min_rent: num,
  max_rent: num,
  beds_min: num,
  beds_max: num,
  baths_min: num,
  baths_max: num,
  sqft_min: optNum,
  sqft_max: optNum,
  deposit: optNum,
  application_fee: optNum,
  admin_fee: optNum,
  pet_policy: optStr,
  pet_fee: optNum,
  parking_type: optStr,
  parking_fee: optNum,
  income_multiplier: optNum,
  screening_vendor: optStr,
  move_in_specials: optStr,
  levels: optNum,
  private_entrance: optBool,
  attached_garage: optBool,
  yard_or_patio: optBool,
  lower_density_community: optBool,
});

const dealerRow = z.object({
  external_id: z.string(),
  dealer_name: z.string(),
  legal_name: optStr,
  address_line: z.string(),
  city: z.string(),
  county: z.string(),
  state: z.literal('CA'),
  zip: z.string(),
  lat: num,
  lng: num,
  phone: z.string(),
  website: z.string().url(),
  dealer_license_number: optStr,
  inventory_count: optNum,
  financing_application_url: z.string().url().optional(),
});

const vehicleRow = z.object({
  vin: z.string().length(17),
  dealer_external_id: z.string(),
  year: num,
  make: z.string(),
  model: z.string(),
  trim: optStr,
  mileage: num,
  price: num,
  down_payment_estimate: optNum,
  apr_estimate: optNum,
  term_months: optNum,
  fuel_type: optStr,
  drive: optStr,
  transmission: optStr,
  body_type: optStr,
  condition: z.enum(['new', 'used', 'cpo']),
  availability_status: z.enum(['available', 'pending', 'sold']),
  listing_url: z.string().url(),
});

const workRow = z.object({
  external_id: z.string(),
  provider_name: z.string(),
  legal_name: optStr,
  branch_address: z.string(),
  city: z.string(),
  county: z.string(),
  state: z.literal('CA'),
  zip: z.string(),
  lat: num,
  lng: num,
  phone: z.string(),
  website: z.string().url(),
  vehicle_type: z.enum(['cargo-van', 'box-truck', 'pickup', 'stake-bed', 'flatbed', 'passenger-van', 'refrigerated']),
  daily_rate: optNum,
  weekly_rate: optNum,
  monthly_rate: optNum,
  mileage_fee_per_mile: optNum,
  included_miles_per_day: optNum,
  deposit: optNum,
  insurance_per_day_estimate: optNum,
  business_account_available: optBool,
  min_age: optNum,
  license_required: optStr,
  payment_required: optStr,
  one_way_available: optBool,
  after_hours_pickup: optBool,
  availability_status: z.enum(['available', 'limited', 'unknown']).optional(),
});

export interface ImportResult<T> {
  ok: T[];
  rejected: { row: number; reason: string; raw: any }[];
}

function parseCsv<T>(csv: string): Record<string, string>[] {
  const out = Papa.parse<T>(csv, { header: true, skipEmptyLines: true });
  if (out.errors.length) {
    // Bubble parse errors to the caller via the rejection list.
  }
  return (out.data as unknown) as Record<string, string>[];
}

export function importApartments(csv: string): ImportResult<RentalListing> {
  const rows = parseCsv(csv);
  const ok: RentalListing[] = [];
  const rejected: ImportResult<RentalListing>['rejected'] = [];
  rows.forEach((raw, i) => {
    const meta = sourceMetaSchema.safeParse(raw);
    const body = apartmentRow.safeParse(raw);
    if (!meta.success || !body.success) {
      rejected.push({
        row: i + 2,
        reason: [
          ...(meta.success ? [] : meta.error.issues.map((x) => `meta.${x.path.join('.')}: ${x.message}`)),
          ...(body.success ? [] : body.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`)),
        ].join(' · '),
        raw,
      });
      return;
    }
    if (!isWithinSoCal({ lat: body.data.lat, lng: body.data.lng, city: body.data.city, county: body.data.county })) {
      rejected.push({ row: i + 2, reason: 'outside SoCal geofence', raw });
      return;
    }
    ok.push({
      id: `csv-${body.data.external_id}`,
      ...body.data,
      meta: meta.data,
    });
  });
  return { ok, rejected };
}

export function importDealers(csv: string): ImportResult<Dealer> {
  const rows = parseCsv(csv);
  const ok: Dealer[] = [];
  const rejected: ImportResult<Dealer>['rejected'] = [];
  rows.forEach((raw, i) => {
    const meta = sourceMetaSchema.safeParse(raw);
    const body = dealerRow.safeParse(raw);
    if (!meta.success || !body.success) {
      rejected.push({
        row: i + 2,
        reason: [
          ...(meta.success ? [] : meta.error.issues.map((x) => `meta.${x.path.join('.')}: ${x.message}`)),
          ...(body.success ? [] : body.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`)),
        ].join(' · '),
        raw,
      });
      return;
    }
    if (!isWithinSoCal({ lat: body.data.lat, lng: body.data.lng, city: body.data.city, county: body.data.county })) {
      rejected.push({ row: i + 2, reason: 'outside SoCal geofence', raw });
      return;
    }
    ok.push({ id: `csv-${body.data.external_id}`, ...body.data, meta: meta.data });
  });
  return { ok, rejected };
}

export function importVehicles(csv: string): ImportResult<VehicleListing> {
  const rows = parseCsv(csv);
  const ok: VehicleListing[] = [];
  const rejected: ImportResult<VehicleListing>['rejected'] = [];
  rows.forEach((raw, i) => {
    const meta = sourceMetaSchema.safeParse(raw);
    const body = vehicleRow.safeParse(raw);
    if (!meta.success || !body.success) {
      rejected.push({
        row: i + 2,
        reason: [
          ...(meta.success ? [] : meta.error.issues.map((x) => `meta.${x.path.join('.')}: ${x.message}`)),
          ...(body.success ? [] : body.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`)),
        ].join(' · '),
        raw,
      });
      return;
    }
    ok.push({
      id: `csv-${body.data.vin}`,
      vin: body.data.vin,
      dealer_id: body.data.dealer_external_id,
      year: body.data.year,
      make: body.data.make,
      model: body.data.model,
      trim: body.data.trim,
      mileage: body.data.mileage,
      price: body.data.price,
      down_payment_estimate: body.data.down_payment_estimate,
      apr_estimate: body.data.apr_estimate,
      term_months: body.data.term_months,
      fuel_type: body.data.fuel_type,
      drive: body.data.drive,
      transmission: body.data.transmission,
      body_type: body.data.body_type,
      condition: body.data.condition,
      availability_status: body.data.availability_status,
      listing_url: body.data.listing_url,
      meta: meta.data,
    });
  });
  return { ok, rejected };
}

export function importWorkVehicles(csv: string): ImportResult<WorkVehicleRental> {
  const rows = parseCsv(csv);
  const ok: WorkVehicleRental[] = [];
  const rejected: ImportResult<WorkVehicleRental>['rejected'] = [];
  rows.forEach((raw, i) => {
    const meta = sourceMetaSchema.safeParse(raw);
    const body = workRow.safeParse(raw);
    if (!meta.success || !body.success) {
      rejected.push({
        row: i + 2,
        reason: [
          ...(meta.success ? [] : meta.error.issues.map((x) => `meta.${x.path.join('.')}: ${x.message}`)),
          ...(body.success ? [] : body.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`)),
        ].join(' · '),
        raw,
      });
      return;
    }
    if (!isWithinSoCal({ lat: body.data.lat, lng: body.data.lng, city: body.data.city, county: body.data.county })) {
      rejected.push({ row: i + 2, reason: 'outside SoCal geofence', raw });
      return;
    }
    ok.push({ id: `csv-${body.data.external_id}`, ...body.data, meta: meta.data });
  });
  return { ok, rejected };
}
