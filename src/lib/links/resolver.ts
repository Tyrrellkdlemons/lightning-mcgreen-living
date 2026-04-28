/**
 * LinkResolver — picks the best available real application / finance /
 * reservation link for a given listing, in the priority order spelled out
 * in the L spec.
 *
 * Returns a `ResolvedLink` with the URL, the link type, the confidence
 * label, a human-readable reason, and a flag for whether redirect is
 * required. Never invents a URL — if nothing is publicly available the
 * resolver returns `kind: 'not-verified'` so the UI shows the "contact
 * the property" fallback.
 */

import type {
  ApartmentLinkSet, ApartmentLinkType,
  VehicleLinkSet, FinanceLinkType,
  WorkVehicleLinkSet, ReservationLinkType,
  AppLinkConfidence,
} from '@/types/links';
import type { RentalListing, VehicleListing, Dealer, WorkVehicleRental } from '@/types';

export interface ResolvedLink<T extends string = string> {
  url: string | null;
  kind: T;
  confidence: AppLinkConfidence;
  label: string;
  redirect_required: boolean;
  reason: string;
}

// ---------------------------------------------------------------------------
// Apartment / townhouse
// ---------------------------------------------------------------------------

/**
 * Priority order (per spec):
 *   1. Partner/API-provided unit application link
 *   2. Official property website unit/floorplan apply link
 *   3. Property manager application page
 *   4. Marketplace listing page
 *   5. Leasing office contact page
 *   6. Manual verification needed
 */
export function resolveApartmentApplicationLink(
  rental: RentalListing & { links?: Partial<ApartmentLinkSet>; application_url?: string; official_property_url?: string },
): ResolvedLink<ApartmentLinkType> {
  const L = rental.links ?? {};
  if (L.exact_application_url && L.application_link_type === 'exact-unit-application') {
    return ok(L.exact_application_url, 'exact-unit-application', L.application_link_confidence ?? 'partner-feed', 'Partner feed gave a unit-level application link.');
  }
  if (L.exact_unit_url) {
    return ok(L.exact_unit_url, 'exact-unit-application', 'inferred', 'Property site has a unit detail page; the apply CTA on that page is the closest known unit-level link.');
  }
  if (L.exact_floorplan_url) {
    return ok(L.exact_floorplan_url, 'exact-floorplan-application', 'inferred', 'Property site has a floorplan-level apply flow — narrower than property-wide, broader than unit-level.');
  }
  if (L.property_application_url || rental.application_url) {
    return ok(L.property_application_url ?? rental.application_url!, 'property-wide-application', 'inferred', 'Operator publishes a property-wide application — your specific unit is selected inside the official flow.');
  }
  if (L.manager_application_url || rental.official_property_url) {
    return ok(L.manager_application_url ?? rental.official_property_url!, 'leasing-office-contact-only', 'inferred', 'No application URL publicly verified. The official property site is the next step — contact the leasing office from there.');
  }
  return notVerified<ApartmentLinkType>('not-verified', 'Application link not publicly verified yet — use property contact or official website.');
}

// ---------------------------------------------------------------------------
// Car / dealer
// ---------------------------------------------------------------------------

/**
 * Priority order (per spec):
 *   1. Partner/API-provided VIN-specific finance link
 *   2. Official dealer vehicle detail page finance CTA
 *   3. Dealer-wide credit application page
 *   4. Dealer prequalification page
 *   5. Marketplace vehicle listing page
 *   6. Dealer contact page
 *   7. Manual verification needed
 */
export function resolveVehicleFinanceLink(
  vehicle: VehicleListing & { links?: Partial<VehicleLinkSet>; listing_url?: string },
  dealer: Dealer | undefined,
): ResolvedLink<FinanceLinkType> {
  const L = vehicle.links ?? {};
  if (L.exact_finance_application_url && L.finance_link_type === 'exact-vin-finance-application') {
    return ok(L.exact_finance_application_url, 'exact-vin-finance-application', L.finance_link_confidence ?? 'partner-feed', 'Partner feed gave a VIN-specific finance link.');
  }
  if (L.exact_dealer_vehicle_url) {
    return ok(L.exact_dealer_vehicle_url, 'exact-vin-finance-application', 'inferred', "Dealer's own vehicle detail page; the finance CTA on that page is the closest VIN-specific link.");
  }
  if (L.dealer_credit_application_url || dealer?.financing_application_url) {
    return ok(L.dealer_credit_application_url ?? dealer!.financing_application_url!, 'dealer-wide-finance-application', 'inferred', 'Dealer-wide credit application. Specific VIN selected inside the official flow.');
  }
  if (L.prequalification_url) {
    return ok(L.prequalification_url, 'prequalification-only', 'inferred', 'Prequalification only — soft-pull check, not the final finance application.');
  }
  if (L.exact_vehicle_listing_url || vehicle.listing_url) {
    return ok(L.exact_vehicle_listing_url ?? vehicle.listing_url!, 'contact-dealer-only', 'inferred', 'Marketplace listing; finance happens on the dealer side after contact.');
  }
  if (dealer?.website) {
    return ok(dealer.website, 'contact-dealer-only', 'inferred', 'No publicly verified finance link — start at the dealer site and contact them.');
  }
  return notVerified<FinanceLinkType>('not-verified', 'Finance link not publicly verified yet — contact dealer or use official dealer website.');
}

// ---------------------------------------------------------------------------
// Work vehicle rental
// ---------------------------------------------------------------------------

/**
 * Priority order (per spec):
 *   1. Official provider reservation page
 *   2. Exact local branch page
 *   3. Exact vehicle class page
 *   4. Google Places provider listing
 *   5. Manual admin verification
 */
export function resolveWorkRentalReservationLink(
  rental: WorkVehicleRental & { links?: Partial<WorkVehicleLinkSet> },
): ResolvedLink<ReservationLinkType> {
  const L = rental.links ?? {};
  if (L.exact_reservation_url) {
    return ok(L.exact_reservation_url, 'exact-vehicle-class-reservation', L.reservation_link_confidence ?? 'partner-feed', 'Provider gave a reservation link for this vehicle class at this branch.');
  }
  if (L.exact_vehicle_class_url) {
    return ok(L.exact_vehicle_class_url, 'exact-vehicle-class-reservation', 'inferred', "Provider's vehicle-class page; reserve from the CTA there.");
  }
  if (L.exact_branch_url) {
    return ok(L.exact_branch_url, 'exact-branch-reservation', 'inferred', "Branch-specific page; pick the vehicle on the provider's flow.");
  }
  if (rental.website) {
    return ok(rental.website, 'provider-wide-search', 'inferred', 'Provider-wide search; pick a branch + vehicle on the official site.');
  }
  return notVerified<ReservationLinkType>('not-verified', 'Reservation link not publicly verified yet — call the provider.');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ok<T extends string>(url: string, kind: T, confidence: AppLinkConfidence, reason: string): ResolvedLink<T> {
  return {
    url,
    kind,
    confidence,
    label: kind.replace(/-/g, ' '),
    redirect_required: true,
    reason,
  };
}

function notVerified<T extends string>(kind: T, reason: string): ResolvedLink<T> {
  return {
    url: null,
    kind,
    confidence: 'unverified',
    label: 'Not verified',
    redirect_required: false,
    reason,
  };
}
