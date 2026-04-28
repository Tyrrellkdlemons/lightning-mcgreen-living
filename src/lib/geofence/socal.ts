/**
 * Southern California geofence.
 *
 * Defaults to the bounding box documented in DATA_SOURCES.md §4 plus an
 * explicit allow-list of cities/counties. `isWithinSoCal` is the single
 * gate every provider and search uses before returning results.
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
