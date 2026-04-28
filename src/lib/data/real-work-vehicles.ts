import type { WorkVehicleRental } from '@/types';
import { workVehiclePhotosForListing, type PhotoSet } from './photo-sets';

/**
 * REAL-PROVIDER demo work-vehicle rentals — 12 rows across 7 real public chains:
 * U-Haul, Penske, Enterprise Truck Rental, Home Depot Truck Rental, Ryder,
 * Budget Truck (Avis), Fluid Truck.
 */

export interface WorkVehicleWithPhotos extends WorkVehicleRental {
  photos: PhotoSet;
}

const VERIFIED = '2026-04-28T01:30:00-07:00';
const meta = (url: string) => ({
  source: 'unverified' as const,
  source_url: url,
  confidence_score: 65,
  last_seen_at: VERIFIED,
  last_verified_at: VERIFIED,
  data_freshness_status: 'recent' as const,
  trust_label: 'unverified' as const,
});

interface SeedW {
  id: string;
  provider_name: string;
  legal_name: string;
  branch_address: string;
  city: string;
  county: string;
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  vehicle_type: WorkVehicleRental['vehicle_type'];
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
  mileage_fee_per_mile: number;
  included_miles_per_day: number;
  deposit: number;
  insurance_per_day_estimate: number;
  business_account_available: boolean;
  min_age: number;
  license_required: string;
  payment_required: string;
  one_way_available: boolean;
  after_hours_pickup: boolean;
  cargo_volume_cuft?: number;
  payload_lbs?: number;
}

const ROWS: SeedW[] = [
  { id: 'wv-uhaul-burbank', provider_name: 'U-Haul — Burbank area branch (chain reference)', legal_name: 'U-Haul International, Inc.', branch_address: 'San Fernando Rd corridor', city: 'Burbank', county: 'Los Angeles', zip: '91505', lat: 34.190, lng: -118.331, phone: '(800) 468-4285', website: 'https://www.uhaul.com/Locations/Truck-Rentals-near-Burbank-CA-91505/', vehicle_type: 'cargo-van', daily_rate: 19, weekly_rate: 105, monthly_rate: 380, mileage_fee_per_mile: 0.99, included_miles_per_day: 0, deposit: 100, insurance_per_day_estimate: 12, business_account_available: true, min_age: 18, license_required: 'Class C', payment_required: 'Credit or debit', one_way_available: true, after_hours_pickup: true, cargo_volume_cuft: 245, payload_lbs: 3000 },
  { id: 'wv-uhaul-northridge', provider_name: 'U-Haul — Northridge area branch (chain reference)', legal_name: 'U-Haul International, Inc.', branch_address: 'Reseda Blvd corridor', city: 'Northridge', county: 'Los Angeles', zip: '91325', lat: 34.241, lng: -118.535, phone: '(800) 468-4285', website: 'https://www.uhaul.com/Locations/Truck-Rentals-near-Northridge-CA-91325/', vehicle_type: 'box-truck', daily_rate: 39, weekly_rate: 245, monthly_rate: 890, mileage_fee_per_mile: 0.79, included_miles_per_day: 0, deposit: 150, insurance_per_day_estimate: 18, business_account_available: true, min_age: 18, license_required: 'Class C (10ft)', payment_required: 'Credit or debit', one_way_available: true, after_hours_pickup: true, cargo_volume_cuft: 402, payload_lbs: 2810 },
  { id: 'wv-penske-ontario', provider_name: 'Penske Truck Rental — Ontario (chain reference)', legal_name: 'Penske Truck Leasing Co., L.P.', branch_address: 'Vineyard Ave corridor', city: 'Ontario', county: 'San Bernardino', zip: '91761', lat: 34.041, lng: -117.642, phone: '(844) 906-3404', website: 'https://www.pensketruckrental.com/truck-rental-locations/california/ontario', vehicle_type: 'box-truck', daily_rate: 139, weekly_rate: 819, monthly_rate: 2950, mileage_fee_per_mile: 0.79, included_miles_per_day: 60, deposit: 350, insurance_per_day_estimate: 28, business_account_available: true, min_age: 18, license_required: 'Class C (16ft)', payment_required: 'Credit', one_way_available: true, after_hours_pickup: true, cargo_volume_cuft: 800, payload_lbs: 6000 },
  { id: 'wv-penske-anaheim', provider_name: 'Penske Truck Rental — Anaheim (chain reference)', legal_name: 'Penske Truck Leasing Co., L.P.', branch_address: 'Anaheim Auto Center area', city: 'Anaheim', county: 'Orange', zip: '92806', lat: 33.847, lng: -117.872, phone: '(844) 906-3404', website: 'https://www.pensketruckrental.com/truck-rental-locations/california/anaheim', vehicle_type: 'box-truck', daily_rate: 149, weekly_rate: 869, monthly_rate: 3050, mileage_fee_per_mile: 0.79, included_miles_per_day: 60, deposit: 350, insurance_per_day_estimate: 28, business_account_available: true, min_age: 18, license_required: 'Class C (22ft)', payment_required: 'Credit', one_way_available: true, after_hours_pickup: true, cargo_volume_cuft: 1200, payload_lbs: 9000 },
  { id: 'wv-enterprise-irvine', provider_name: 'Enterprise Truck Rental — Irvine area (chain reference)', legal_name: 'Enterprise Holdings, Inc.', branch_address: 'Sand Canyon Ave corridor', city: 'Irvine', county: 'Orange', zip: '92618', lat: 33.671, lng: -117.756, phone: '(866) 386-9550', website: 'https://www.enterprisetrucks.com/truckrental/en_US/locations.html', vehicle_type: 'pickup', daily_rate: 89, weekly_rate: 519, monthly_rate: 1850, mileage_fee_per_mile: 0.29, included_miles_per_day: 100, deposit: 200, insurance_per_day_estimate: 18, business_account_available: true, min_age: 21, license_required: 'Class C', payment_required: 'Credit or debit', one_way_available: false, after_hours_pickup: false, payload_lbs: 1500 },
  { id: 'wv-enterprise-santaana', provider_name: 'Enterprise Truck Rental — Santa Ana area (chain reference)', legal_name: 'Enterprise Holdings, Inc.', branch_address: 'McFadden Ave corridor', city: 'Santa Ana', county: 'Orange', zip: '92704', lat: 33.728, lng: -117.890, phone: '(866) 386-9550', website: 'https://www.enterprisetrucks.com/truckrental/en_US/locations.html', vehicle_type: 'cargo-van', daily_rate: 79, weekly_rate: 469, monthly_rate: 1650, mileage_fee_per_mile: 0.29, included_miles_per_day: 100, deposit: 200, insurance_per_day_estimate: 18, business_account_available: true, min_age: 21, license_required: 'Class C', payment_required: 'Credit or debit', one_way_available: false, after_hours_pickup: false, cargo_volume_cuft: 250, payload_lbs: 3000 },
  { id: 'wv-homedepot-northridge', provider_name: 'Home Depot Truck Rental — Northridge area (chain reference)', legal_name: 'The Home Depot, Inc.', branch_address: 'Roscoe Blvd Home Depot store', city: 'Northridge', county: 'Los Angeles', zip: '91324', lat: 34.221, lng: -118.527, phone: '(818) 998-3201', website: 'https://www.homedepot.com/c/truck_rental', vehicle_type: 'flatbed', daily_rate: 129, weekly_rate: 749, monthly_rate: 2450, mileage_fee_per_mile: 0.69, included_miles_per_day: 60, deposit: 150, insurance_per_day_estimate: 15, business_account_available: false, min_age: 21, license_required: 'Class C', payment_required: 'Credit', one_way_available: false, after_hours_pickup: false, payload_lbs: 3000 },
  { id: 'wv-homedepot-pasadena', provider_name: 'Home Depot Truck Rental — Pasadena area (chain reference)', legal_name: 'The Home Depot, Inc.', branch_address: 'E Foothill Blvd Home Depot store', city: 'Pasadena', county: 'Los Angeles', zip: '91107', lat: 34.158, lng: -118.082, phone: '(626) 351-2901', website: 'https://www.homedepot.com/c/truck_rental', vehicle_type: 'pickup', daily_rate: 19, weekly_rate: 110, monthly_rate: 380, mileage_fee_per_mile: 1.29, included_miles_per_day: 0, deposit: 100, insurance_per_day_estimate: 12, business_account_available: false, min_age: 21, license_required: 'Class C', payment_required: 'Credit', one_way_available: false, after_hours_pickup: false, payload_lbs: 1500 },
  { id: 'wv-ryder-fontana', provider_name: 'Ryder Commercial — Fontana (chain reference)', legal_name: 'Ryder System, Inc.', branch_address: 'Slover Ave corridor', city: 'Fontana', county: 'San Bernardino', zip: '92335', lat: 34.092, lng: -117.435, phone: '(800) 793-3765', website: 'https://www.ryder.com/en-us/rent-trucks', vehicle_type: 'box-truck', daily_rate: 175, weekly_rate: 985, monthly_rate: 3450, mileage_fee_per_mile: 0.65, included_miles_per_day: 75, deposit: 400, insurance_per_day_estimate: 32, business_account_available: true, min_age: 22, license_required: 'Class C (26ft)', payment_required: 'Business credit', one_way_available: true, after_hours_pickup: true, cargo_volume_cuft: 1500, payload_lbs: 12000 },
  { id: 'wv-budget-longbeach', provider_name: 'Budget Truck Rental — Long Beach (chain reference)', legal_name: 'Avis Budget Group, Inc.', branch_address: 'E Anaheim St corridor', city: 'Long Beach', county: 'Los Angeles', zip: '90804', lat: 33.785, lng: -118.156, phone: '(800) 462-8343', website: 'https://www.budgettruck.com/locations/california', vehicle_type: 'box-truck', daily_rate: 99, weekly_rate: 579, monthly_rate: 2050, mileage_fee_per_mile: 0.99, included_miles_per_day: 0, deposit: 150, insurance_per_day_estimate: 22, business_account_available: true, min_age: 18, license_required: 'Class C (12ft)', payment_required: 'Credit or debit', one_way_available: true, after_hours_pickup: false, cargo_volume_cuft: 600, payload_lbs: 4400 },
  { id: 'wv-fluid-la', provider_name: 'Fluid Truck — Los Angeles area (chain reference)', legal_name: 'Fluid Market, Inc.', branch_address: 'Multiple pickup zones', city: 'Los Angeles', county: 'Los Angeles', zip: '90001', lat: 33.974, lng: -118.249, phone: '(303) 519-2233', website: 'https://www.fluidtruck.com/', vehicle_type: 'cargo-van', daily_rate: 79, weekly_rate: 489, monthly_rate: 1750, mileage_fee_per_mile: 0.39, included_miles_per_day: 50, deposit: 0, insurance_per_day_estimate: 14, business_account_available: true, min_age: 21, license_required: 'Class C', payment_required: 'Credit', one_way_available: false, after_hours_pickup: true, cargo_volume_cuft: 250, payload_lbs: 3000 },
  { id: 'wv-uhaul-riverside', provider_name: 'U-Haul — Riverside area branch (chain reference)', legal_name: 'U-Haul International, Inc.', branch_address: 'Magnolia Ave corridor', city: 'Riverside', county: 'Riverside', zip: '92506', lat: 33.953, lng: -117.396, phone: '(800) 468-4285', website: 'https://www.uhaul.com/Locations/Truck-Rentals-near-Riverside-CA-92506/', vehicle_type: 'cargo-van', daily_rate: 19, weekly_rate: 105, monthly_rate: 380, mileage_fee_per_mile: 0.99, included_miles_per_day: 0, deposit: 100, insurance_per_day_estimate: 12, business_account_available: true, min_age: 18, license_required: 'Class C', payment_required: 'Credit or debit', one_way_available: true, after_hours_pickup: true, cargo_volume_cuft: 245, payload_lbs: 3000 },
];

export const REAL_WORK_VEHICLES: WorkVehicleWithPhotos[] = ROWS.map((r) => ({
  ...r,
  external_id: r.id,
  state: 'CA' as const,
  availability_status: 'available' as const,
  meta: meta(r.website),
  photos: workVehiclePhotosForListing({
    id: r.id,
    vehicle_type: r.vehicle_type,
    lat: r.lat,
    lng: r.lng,
    city: r.city,
    provider_name: r.provider_name,
  } as any),
}));
