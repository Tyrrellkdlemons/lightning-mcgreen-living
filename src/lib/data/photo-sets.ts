/**
 * Topic-matching photo sets — generated, not random.
 *
 * Returns 3 slides per listing that actually match what the listing IS:
 *   1. Topic-aware SVG illustration (apartment building / townhome row /
 *      vehicle / work-vehicle silhouette in brand-aware color)
 *   2. Static neighborhood map tile from CARTO/OSM showing the real
 *      location
 *   3. A second SVG variant (different sky / time-of-day)
 *
 * No random Lorem Picsum photos. CC0 because we wrote the SVGs; OSM/CARTO
 * tiles carry the attribution shown in `MapPanel`.
 */

import { apartmentBuildingVariants, townhomeRowVariants, vehicleVariants, workVehicleVariants } from '@/lib/assets/svg-illustrations';
import { neighborhoodTile } from '@/lib/assets/static-osm-tile';
import type { RentalListing, VehicleListing, WorkVehicleRental } from '@/types';

export interface PhotoSet {
  /** 3 stable URLs (data-URL SVG or CARTO/OSM tile). */
  urls: [string, string, string];
  alt: string;
  credit_label: string;
  credit_url: string;
}

const CREDIT_SVG = {
  label: 'Original illustration · CC0',
  url: 'https://github.com/Tyrrellkdlemons/lightning-mcgreen-living',
};
const CREDIT_OSM = {
  label: '© OpenStreetMap contributors © CARTO',
  url: 'https://www.openstreetmap.org/copyright',
};

// ---------------------------------------------------------------------------
// Apartment / townhome
// ---------------------------------------------------------------------------

export function apartmentPhotos(seed: string, ctx?: { lat?: number; lng?: number; property_name?: string; city?: string }): PhotoSet {
  const variants = apartmentBuildingVariants(seed);
  const tile =
    ctx?.lat != null && ctx?.lng != null
      ? neighborhoodTile(ctx.lat, ctx.lng, 14).url
      : variants[1];
  return {
    urls: [variants[0], tile, variants[2]],
    alt: ctx?.property_name
      ? `${ctx.property_name} — apartment building illustration + neighborhood map (${ctx.city ?? 'SoCal'})`
      : 'Apartment building · illustration + neighborhood map',
    credit_label: ctx?.lat != null ? `${CREDIT_SVG.label} · ${CREDIT_OSM.label}` : CREDIT_SVG.label,
    credit_url: CREDIT_OSM.url,
  };
}

export function townhomePhotos(seed: string, ctx?: { lat?: number; lng?: number; property_name?: string; city?: string }): PhotoSet {
  const variants = townhomeRowVariants(seed);
  const tile =
    ctx?.lat != null && ctx?.lng != null
      ? neighborhoodTile(ctx.lat, ctx.lng, 14).url
      : variants[1];
  return {
    urls: [variants[0], tile, variants[2]],
    alt: ctx?.property_name
      ? `${ctx.property_name} — townhome row illustration + neighborhood map (${ctx.city ?? 'SoCal'})`
      : 'Townhome row · illustration + neighborhood map',
    credit_label: ctx?.lat != null ? `${CREDIT_SVG.label} · ${CREDIT_OSM.label}` : CREDIT_SVG.label,
    credit_url: CREDIT_OSM.url,
  };
}

// Convenience builder used by real-rentals.ts
export function rentalPhotos(rental: Pick<RentalListing, 'id' | 'unit_type' | 'property_name' | 'city' | 'lat' | 'lng'>): PhotoSet {
  const ctx = { lat: rental.lat, lng: rental.lng, property_name: rental.property_name, city: rental.city };
  return rental.unit_type === 'apartment'
    ? apartmentPhotos(rental.id, ctx)
    : townhomePhotos(rental.id, ctx);
}

// ---------------------------------------------------------------------------
// Cars
// ---------------------------------------------------------------------------

export function vehiclePhotos(args: {
  seed: string;
  make?: string;
  model?: string;
  body_type?: string;
  fuel_type?: string;
  dealer_lat?: number;
  dealer_lng?: number;
  dealer_city?: string;
}): PhotoSet {
  const variants = vehicleVariants({
    seed: args.seed,
    make: args.make,
    body_type: args.body_type,
    fuel_type: args.fuel_type,
  });
  const tile =
    args.dealer_lat != null && args.dealer_lng != null
      ? neighborhoodTile(args.dealer_lat, args.dealer_lng, 14).url
      : variants[1];
  return {
    urls: [variants[0], tile, variants[2]],
    alt: args.make
      ? `${args.make} ${args.model ?? ''} · stylized ${args.body_type ?? 'vehicle'} illustration + dealer neighborhood map (${args.dealer_city ?? 'SoCal'})`
      : 'Vehicle · illustration + dealer neighborhood map',
    credit_label: args.dealer_lat != null ? `${CREDIT_SVG.label} · ${CREDIT_OSM.label}` : CREDIT_SVG.label,
    credit_url: CREDIT_OSM.url,
  };
}

// Convenience builder used by real-vehicles.ts
export function vehiclePhotosForListing(
  v: Pick<VehicleListing, 'id' | 'make' | 'model' | 'body_type' | 'fuel_type'>,
  dealer?: { city?: string; lat?: number; lng?: number },
): PhotoSet {
  return vehiclePhotos({
    seed: v.id,
    make: v.make,
    model: v.model,
    body_type: v.body_type,
    fuel_type: v.fuel_type,
    dealer_lat: dealer?.lat,
    dealer_lng: dealer?.lng,
    dealer_city: dealer?.city,
  });
}

// ---------------------------------------------------------------------------
// Work vehicles
// ---------------------------------------------------------------------------

export function workVehiclePhotos(args: {
  seed: string;
  vehicle_type: WorkVehicleRental['vehicle_type'];
  branch_lat?: number;
  branch_lng?: number;
  branch_city?: string;
  provider_name?: string;
}): PhotoSet {
  const variants = workVehicleVariants({ seed: args.seed, vehicle_type: args.vehicle_type });
  const tile =
    args.branch_lat != null && args.branch_lng != null
      ? neighborhoodTile(args.branch_lat, args.branch_lng, 14).url
      : variants[1];
  return {
    urls: [variants[0], tile, variants[2]],
    alt: args.provider_name
      ? `${args.provider_name} · ${args.vehicle_type.replace('-', ' ')} illustration + branch neighborhood map (${args.branch_city ?? 'SoCal'})`
      : `${args.vehicle_type.replace('-', ' ')} · illustration + branch map`,
    credit_label: args.branch_lat != null ? `${CREDIT_SVG.label} · ${CREDIT_OSM.label}` : CREDIT_SVG.label,
    credit_url: CREDIT_OSM.url,
  };
}

// Convenience builder used by real-work-vehicles.ts
export function workVehiclePhotosForListing(
  w: Pick<WorkVehicleRental, 'id' | 'vehicle_type' | 'lat' | 'lng' | 'city' | 'provider_name'>,
): PhotoSet {
  return workVehiclePhotos({
    seed: w.id,
    vehicle_type: w.vehicle_type,
    branch_lat: w.lat,
    branch_lng: w.lng,
    branch_city: w.city,
    provider_name: w.provider_name,
  });
}
