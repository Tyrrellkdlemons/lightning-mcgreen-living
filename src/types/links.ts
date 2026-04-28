/**
 * Direct-link types — per the "L. EXACT LISTING + DIRECT APPLICATION /
 * FINANCE LINK REQUIREMENT" spec. Every listing now carries enough metadata
 * to point a user at the closest available real application / finance /
 * reservation page, with an honest confidence label.
 *
 * IMPORTANT (per spec):
 *   - Never invent a direct link.
 *   - Never assert a unit-level link unless the source provides one.
 *   - When only a property/dealer/provider-wide link is available, label it.
 *   - When nothing is publicly available, surface the contact page only.
 */

// -- Apartment / townhouse ---------------------------------------------------

export type ApartmentLinkType =
  | 'exact-unit-application'
  | 'exact-floorplan-application'
  | 'property-wide-application'
  | 'leasing-office-contact-only'
  | 'not-verified';

export type AppLinkConfidence = 'verified' | 'partner-feed' | 'inferred' | 'unverified';

export interface ApartmentLinkSet {
  exact_listing_url?: string;        // marketplace / listing page
  exact_unit_url?: string;           // specific unit detail page
  exact_floorplan_url?: string;      // specific floor plan page
  exact_application_url?: string;    // unit-level apply
  property_application_url?: string; // property-wide apply
  manager_application_url?: string;  // operator-wide apply
  application_link_type: ApartmentLinkType;
  application_link_confidence: AppLinkConfidence;
  application_redirect_required: boolean;
  prefill_supported: boolean;
  unit_number_public?: string;
  floor_plan_name?: string;
  available_date?: string;
  listing_status: ListingStatus;
  verification_status: VerificationStatus;
}

// -- Car / dealer / finance --------------------------------------------------

export type FinanceLinkType =
  | 'exact-vin-finance-application'
  | 'dealer-wide-finance-application'
  | 'prequalification-only'
  | 'contact-dealer-only'
  | 'not-verified';

export interface VehicleLinkSet {
  exact_vehicle_listing_url?: string;     // marketplace listing
  exact_dealer_vehicle_url?: string;      // dealer's own VDP
  exact_finance_application_url?: string; // VIN-specific finance
  dealer_credit_application_url?: string; // dealer-wide credit app
  prequalification_url?: string;
  trade_in_url?: string;
  offer_url?: string;
  finance_link_type: FinanceLinkType;
  finance_link_confidence: AppLinkConfidence;
  finance_redirect_required: boolean;
  prefill_supported: boolean;
  stock_number?: string;
  dealer_legal_entity?: string;
  dealer_license_status?: 'active' | 'inactive' | 'unknown';
  listing_status: VehicleListingStatus;
  verification_status: VerificationStatus;
}

// -- Work vehicle rental -----------------------------------------------------

export type ReservationLinkType =
  | 'exact-vehicle-class-reservation'
  | 'exact-branch-reservation'
  | 'provider-wide-search'
  | 'contact-only'
  | 'not-verified';

export interface WorkVehicleLinkSet {
  exact_branch_url?: string;
  exact_vehicle_class_url?: string;
  exact_reservation_url?: string;
  rate_url?: string;
  requirement_url?: string;
  reservation_link_type: ReservationLinkType;
  reservation_link_confidence: AppLinkConfidence;
  branch_name?: string;
  verification_status: VerificationStatus;
}

// -- Shared ------------------------------------------------------------------

export type ListingStatus =
  | 'available'
  | 'waitlist'
  | 'call-for-availability'
  | 'unavailable'
  | 'stale'
  | 'needs-verification';

export type VehicleListingStatus =
  | 'available'
  | 'pending'
  | 'sold'
  | 'call-dealer'
  | 'stale'
  | 'needs-verification';

export type VerificationStatus =
  | 'partner-api'              // came from a partner feed
  | 'official-source'           // resolved on the operator's official site
  | 'manually-verified'         // an admin clicked through and confirmed
  | 'manual-verification-needed'
  | 'stale';

// Display helpers ------------------------------------------------------------

export const APARTMENT_LINK_LABEL: Record<ApartmentLinkType, string> = {
  'exact-unit-application': 'Exact unit application',
  'exact-floorplan-application': 'Exact floorplan application',
  'property-wide-application': 'Property-wide application',
  'leasing-office-contact-only': 'Leasing office contact only',
  'not-verified': 'Not verified',
};

export const FINANCE_LINK_LABEL: Record<FinanceLinkType, string> = {
  'exact-vin-finance-application': 'Exact VIN finance application',
  'dealer-wide-finance-application': 'Dealer-wide finance application',
  'prequalification-only': 'Prequalification only',
  'contact-dealer-only': 'Contact dealer only',
  'not-verified': 'Not verified',
};

export const RESERVATION_LINK_LABEL: Record<ReservationLinkType, string> = {
  'exact-vehicle-class-reservation': 'Exact vehicle class reservation',
  'exact-branch-reservation': 'Exact branch reservation',
  'provider-wide-search': 'Provider-wide search',
  'contact-only': 'Contact only',
  'not-verified': 'Not verified',
};

export const LINK_TONE_BY_CONFIDENCE: Record<AppLinkConfidence, 'ok' | 'info' | 'warn' | 'mute'> = {
  verified: 'ok',
  'partner-feed': 'info',
  inferred: 'mute',
  unverified: 'warn',
};

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  available: 'Available',
  waitlist: 'Waitlist',
  'call-for-availability': 'Call for availability',
  unavailable: 'Unavailable',
  stale: 'Listing data stale',
  'needs-verification': 'Needs verification',
};

export const VEHICLE_STATUS_LABEL: Record<VehicleListingStatus, string> = {
  available: 'Available',
  pending: 'Sale pending',
  sold: 'Sold',
  'call-dealer': 'Call dealer',
  stale: 'Listing data stale',
  'needs-verification': 'Needs verification',
};
