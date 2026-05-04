/**
 * Core domain types — single source of truth for the app.
 *
 * Every record carries SourceMeta. Production mode refuses to render anything
 * missing that metadata (see src/lib/compliance/guards.ts).
 */

import type { ApartmentLinkSet } from './links';

export type TrustLabel =
  | 'official'
  | 'partner'
  | 'public-open-data'
  | 'manual-verified'
  | 'unverified';

export type SourceKind =
  | 'official'
  | 'partner'
  | 'public-open-data'
  | 'property-or-dealer-website'
  | 'manual-verified'
  | 'unverified';

export type FreshnessStatus = 'live' | 'recent' | 'stale' | 'manual-review-needed';

export interface SourceMeta {
  source: SourceKind;
  source_url: string;
  confidence_score: number;       // 0–100
  last_seen_at: string;           // ISO
  last_verified_at: string;       // ISO
  data_freshness_status: FreshnessStatus;
  trust_label: TrustLabel;
}

export type ApplicationPlatform =
  | 'RentCafe'
  | 'Entrata'
  | 'AppFolio'
  | 'RealPage'
  | 'Knock'
  | 'On-Site'
  | 'G5/Knock'
  | 'Other'
  | 'Unknown';

export type RentalUnitType =
  | 'apartment'
  | 'townhouse'
  | 'townhome-style-apartment';

export interface RentalListing {
  id: string;
  external_id: string;
  property_name: string;
  unit_type: RentalUnitType;
  address_line: string;
  city: string;
  county: string;
  state: 'CA';
  zip: string;
  lat: number;
  lng: number;

  manager: string;
  owner_operator?: string;
  application_platform: ApplicationPlatform;
  application_url: string;
  official_property_url: string;
  application_route?: string;
  links?: Partial<ApartmentLinkSet>;

  min_rent: number;
  max_rent: number;
  beds_min: number;
  beds_max: number;
  baths_min: number;
  baths_max: number;
  sqft_min?: number;
  sqft_max?: number;

  deposit?: number;
  application_fee?: number;
  admin_fee?: number;
  holding_deposit?: number;
  pet_policy?: string;
  pet_fee?: number;
  parking_type?: string;
  parking_fee?: number;
  accessibility_features?: string[];
  amenities?: string[];
  income_multiplier?: number;
  screening_vendor?: string | null;
  move_in_specials?: string;
  unit_number?: string;
  floor_plan_name?: string;
  available_date?: string;
  listing_visual_note?: string;

  // Townhome-specific
  levels?: number;
  private_entrance?: boolean;
  attached_garage?: boolean;
  yard_or_patio?: boolean;
  lower_density_community?: boolean;

  meta: SourceMeta;
}

export interface Dealer {
  id: string;
  external_id: string;
  dealer_name: string;
  legal_name?: string;
  address_line: string;
  city: string;
  county: string;
  state: 'CA';
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  dealer_license_number?: string;
  inventory_count?: number;
  financing_application_url?: string;
  lender_partners?: string[];
  public_promos?: { label: string; url?: string; expires_at?: string }[];
  google_rating?: number;
  google_review_count?: number;

  meta: SourceMeta;
}

export interface VehicleListing {
  id: string;
  vin: string;
  dealer_id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  price: number;
  down_payment_estimate?: number;
  apr_estimate?: number;
  term_months?: number;
  tax_title_license_estimate?: number;
  dealer_fees_disclosed?: number;
  fuel_type?: string;
  drive?: string;
  transmission?: string;
  body_type?: string;
  condition: 'new' | 'used' | 'cpo';
  availability_status: 'available' | 'pending' | 'sold';
  listing_url: string;
  fuel_economy_mpg_combined?: number;
  safety_rating_overall?: number;
  meta: SourceMeta;
}

export type WorkVehicleType =
  | 'cargo-van'
  | 'box-truck'
  | 'pickup'
  | 'stake-bed'
  | 'flatbed'
  | 'passenger-van'
  | 'refrigerated';

export interface WorkVehicleRental {
  id: string;
  external_id: string;
  provider_name: string;
  legal_name?: string;
  branch_address: string;
  city: string;
  county: string;
  state: 'CA';
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  vehicle_type: WorkVehicleType;
  daily_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  mileage_fee_per_mile?: number;
  included_miles_per_day?: number;
  deposit?: number;
  insurance_per_day_estimate?: number;
  business_account_available?: boolean;
  min_age?: number;
  license_required?: string;
  payment_required?: string;
  one_way_available?: boolean;
  after_hours_pickup?: boolean;
  availability_status?: 'available' | 'limited' | 'unknown';
  cargo_volume_cuft?: number;
  payload_lbs?: number;
  meta: SourceMeta;
}

// Scoring -------------------------------------------------------------------

export type FitTier = 'strong-fit' | 'possible-fit' | 'stretch' | 'risky' | 'needs-verification';

export interface FitResult {
  tier: FitTier;
  score: number;       // 0–100
  reasons: string[];   // Why this may fit
  concerns: string[];  // What could hurt approval
}

// User profile (client-side only by default) --------------------------------

export interface RenterProfile {
  contact?: { name?: string; email?: string; phone?: string };
  desired_move_in?: string;
  household_size?: number;
  pets?: { dogs?: number; cats?: number; service?: boolean };
  vehicles?: number;
  gross_monthly_income?: number;
  employment?: { employer?: string; tenure_months?: number; income_proof_ready?: boolean };
  rental_history?: { years_renting?: number; evictions?: boolean; broken_leases?: boolean };
  references_ready?: boolean;
  budget?: { max_rent?: number; max_move_in?: number };
  preferred_cities?: string[];
  unit_type_pref?: 'apartment' | 'townhouse' | 'both';
  parking_needed?: boolean;
  accessibility_needs?: string[];
  documents_ready?: string[];
  notes?: string;
  // Self-selected credit range (not pulled). Used only for guidance.
  credit_range?: 'below-580' | '580-669' | '670-739' | '740+' | 'prefer-not-to-say';
}

export interface BuyerProfile {
  contact?: { name?: string; email?: string; phone?: string };
  vehicle_type_pref?: string;
  monthly_payment_target?: number;
  down_payment_available?: number;
  trade_in?: boolean;
  credit_range?: RenterProfile['credit_range'];
  employment?: RenterProfile['employment'];
  income_range?: number;
  cosigner?: boolean;
  preferred_dealer_distance?: number;
  desired_purchase_timeline?: string;
  documents_ready?: string[];
}

export interface WorkRentalProfile {
  contact?: { name?: string; email?: string; phone?: string };
  business_name?: string;
  job_type?: 'delivery' | 'moving' | 'construction' | 'landscaping' | 'cleaning' | 'event' | 'mobile-detail' | 'hauling' | 'furniture' | 'side-hustle' | 'other';
  vehicle_type_needed?: WorkVehicleType;
  start_date?: string;
  end_date?: string;
  term_pref?: 'daily' | 'weekly' | 'monthly';
  pickup_city?: string;
  max_deposit?: number;
  max_budget?: number;
  mileage_estimate?: number;
  insurance_status?: 'have-business' | 'have-personal' | 'need';
  license_ready?: boolean;
  payment_ready?: 'credit' | 'debit' | 'business-account';
  business_account_needed?: boolean;
}
