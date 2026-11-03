/**
 * Legacy Southern California helpers, retained for compatibility.
 *
 * Defaults to the bounding box documented in DATA_SOURCES.md §4 plus an
 * explicit allow-list of cities/counties. New imports use `isWithinCoverage` below for statewide CA/AZ coverage.
 */

export const SOCAL_BBOX = {
  minLat: 32.5,
  maxLat: 35.3,
  minLng: -120.0,
  maxLng: -116.0,
} as const;

export const SOCAL_COUNTIES = [
  'Los Angeles',
  'Orange',
  'San Bernardino',
  'Riverside',
  'Ventura',
  // San Diego intentionally excluded by default; flip the flag below to include.
] as const;

export const SOCAL_CITIES = [
  'Northridge',
  'Santa Ana',
  'Los Angeles',
  'Long Beach',
  'Anaheim',
  'Irvine',
  'Fullerton',
  'Garden Grove',
  'Ontario',
  'Rancho Cucamonga',
  'Fontana',
  'Pomona',
  'Pasadena',
  'Inglewood',
  'Glendale',
  'Burbank',
  'Costa Mesa',
  'Huntington Beach',
  'Riverside',
  'San Bernardino',
  'Oxnard',
  'Thousand Oaks',
  'Simi Valley',
  'Ventura',
  'Moreno Valley',
  'Corona',
  'Murrieta',
  'Temecula',
  'Lake Forest',
  'Mission Viejo',
  'Newport Beach',
  'Whittier',
  'Carson',
  'Torrance',
  'Hawthorne',
  'Santa Monica',
  'Culver City',
  'El Segundo',
  'Norwalk',
  'Downey',
  'West Covina',
  'Pico Rivera',
  'Lakewood',
  'Bellflower',
  'Compton',
  'Cerritos',
  'La Habra',
  'Brea',
  'Yorba Linda',
  'Tustin',
  'Lake Elsinore',
];

export function isWithinSoCalBbox(lat: number, lng: number): boolean {
  return (
    lat >= SOCAL_BBOX.minLat &&
    lat <= SOCAL_BBOX.maxLat &&
    lng >= SOCAL_BBOX.minLng &&
    lng <= SOCAL_BBOX.maxLng
  );
}

export function isAllowedCity(city?: string | null): boolean {
  if (!city) return false;
  const norm = city.trim().toLowerCase();
  return SOCAL_CITIES.some((c) => c.toLowerCase() === norm);
}

export function isWithinSoCal(args: {
  lat?: number;
  lng?: number;
  city?: string;
  county?: string;
}): boolean {
  const { lat, lng, city, county } = args;
  if (lat != null && lng != null) {
    if (!isWithinSoCalBbox(lat, lng)) return false;
  }
  if (city && isAllowedCity(city)) return true;
  if (county && SOCAL_COUNTIES.includes(county as (typeof SOCAL_COUNTIES)[number])) {
    return true;
  }
  // If only coords were given and they're inside the bbox, allow.
  return lat != null && lng != null && isWithinSoCalBbox(lat, lng);
}

/** California and Arizona intake. State metadata is required; a bounding box
 * alone is never evidence that a listing is in a supported state. Bounds only
 * reject plainly inconsistent coordinates; they are not boundary polygons. */
export const COVERAGE_COUNTIES = {
  CA: ['Alameda', 'Alpine', 'Amador', 'Butte', 'Calaveras', 'Colusa', 'Contra Costa', 'Del Norte', 'El Dorado', 'Fresno', 'Glenn', 'Humboldt', 'Imperial', 'Inyo', 'Kern', 'Kings', 'Lake', 'Lassen', 'Los Angeles', 'Madera', 'Marin', 'Mariposa', 'Mendocino', 'Merced', 'Modoc', 'Mono', 'Monterey', 'Napa', 'Nevada', 'Orange', 'Placer', 'Plumas', 'Riverside', 'Sacramento', 'San Benito', 'San Bernardino', 'San Diego', 'San Francisco', 'San Joaquin', 'San Luis Obispo', 'San Mateo', 'Santa Barbara', 'Santa Clara', 'Santa Cruz', 'Shasta', 'Sierra', 'Siskiyou', 'Solano', 'Sonoma', 'Stanislaus', 'Sutter', 'Tehama', 'Trinity', 'Tulare', 'Tuolumne', 'Ventura', 'Yolo', 'Yuba'],
  AZ: ['Apache', 'Cochise', 'Coconino', 'Gila', 'Graham', 'Greenlee', 'La Paz', 'Maricopa', 'Mohave', 'Navajo', 'Pima', 'Pinal', 'Santa Cruz', 'Yavapai', 'Yuma'],
} as const;
const COVERAGE_BOUNDS = {
  CA: { minLat: 32.5, maxLat: 42.01, minLng: -124.5, maxLng: -114.1 },
  AZ: { minLat: 31.3, maxLat: 37.01, minLng: -114.9, maxLng: -109.03 },
} as const;
export function isWithinCoverage(args: { state?: string; county?: string; city?: string; lat?: number; lng?: number }): boolean {
  const state = args.state?.trim().toUpperCase();
  if (state !== 'CA' && state !== 'AZ') return false;
  if (args.county) {
    const county = args.county.trim().replace(/ County$/i, '').toLowerCase();
    if (!(COVERAGE_COUNTIES[state] as readonly string[]).some((name) => name.toLowerCase() === county)) return false;
  }
  if (args.lat == null && args.lng == null) return true;
  if (args.lat == null || args.lng == null || !Number.isFinite(args.lat) || !Number.isFinite(args.lng)) return false;
  const box = COVERAGE_BOUNDS[state];
  return args.lat >= box.minLat && args.lat <= box.maxLat && args.lng >= box.minLng && args.lng <= box.maxLng;
}
