/**
 * OpenStreetMap Overpass — free, public API for amenity / POI search.
 *
 * Used as a default fallback when Google Places isn't configured. We:
 * - Find nearby groceries / schools / transit / hospitals for an address
 * - Find car dealers (`shop=car`) inside the SoCal bounding box
 * - Find work-vehicle rental candidates (free-text + `amenity=car_rental`)
 *
 * Be polite — set a User-Agent and rate-limit. Cache aggressively.
 */

import { RateLimiter, nowIso, withCache, type Provider } from './base';

const ENDPOINT = 'https://overpass-api.de/api/interpreter';
const limiter = new RateLimiter(1100); // 1 req/sec is a safe ceiling

interface OverpassNode {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

async function ql(query: string): Promise<OverpassNode[]> {
  await limiter.wait();
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'lightning-mcgreen-living/0.1 (open-source app)',
    },
    body: 'data=' + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass returned ${res.status}`);
  const json = (await res.json()) as { elements: OverpassNode[] };
  return json.elements;
}

export interface NearbyAmenity {
  id: number;
  name?: string;
  kind: string;
  lat: number;
  lng: number;
  distance_m?: number;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export const OverpassProvider: Provider<
  { lat: number; lng: number; radius_m?: number },
  NearbyAmenity
> = {
  info: {
    id: 'overpass',
    label: 'OpenStreetMap Overpass',
    status: 'live',
    legal_status: 'free',
    homepage: 'https://overpass-api.de/',
  },

  async search({ lat, lng, radius_m = 1500 }) {
    const r = Math.max(100, Math.min(radius_m, 5000));
    const cacheKey = `overpass:nearby:${lat.toFixed(3)}:${lng.toFixed(3)}:${r}`;
    return withCache(cacheKey, 1000 * 60 * 60 * 6, async () => {
      const query = `
        [out:json][timeout:25];
        (
          node["shop"="supermarket"](around:${r},${lat},${lng});
          node["amenity"="school"](around:${r},${lat},${lng});
          node["amenity"="hospital"](around:${r},${lat},${lng});
          node["highway"="bus_stop"](around:${r},${lat},${lng});
          node["railway"="station"](around:${r},${lat},${lng});
          node["leisure"="fitness_centre"](around:${r},${lat},${lng});
        );
        out body 50;
      `;
      const els = await ql(query);
      const data: NearbyAmenity[] = els
        .map((e) => {
          const t = e.tags ?? {};
          let kind = 'place';
          if (t.shop === 'supermarket') kind = 'grocery';
          else if (t.amenity === 'school') kind = 'school';
          else if (t.amenity === 'hospital') kind = 'hospital';
          else if (t.highway === 'bus_stop') kind = 'transit-bus';
          else if (t.railway === 'station') kind = 'transit-rail';
          else if (t.leisure === 'fitness_centre') kind = 'gym';
          return {
            id: e.id,
            name: t.name,
            kind,
            lat: e.lat,
            lng: e.lon,
            distance_m: haversine(lat, lng, e.lat, e.lon),
          };
        })
        .sort((a, b) => (a.distance_m ?? 0) - (b.distance_m ?? 0));

      return {
        data,
        meta: {
          source: 'public-open-data' as const,
          source_url: 'https://overpass-api.de/api/interpreter',
          last_seen_at: nowIso(),
          trust_label: 'public-open-data' as const,
        },
      };
    });
  },
};

/** Find car dealers near a point. */
export async function findCarDealersNear(lat: number, lng: number, radius_m = 5000) {
  const r = Math.max(500, Math.min(radius_m, 20000));
  const key = `overpass:dealers:${lat.toFixed(3)}:${lng.toFixed(3)}:${r}`;
  return withCache(key, 1000 * 60 * 60 * 12, async () => {
    const query = `
      [out:json][timeout:25];
      (
        node["shop"="car"](around:${r},${lat},${lng});
        node["shop"="car;car_repair"](around:${r},${lat},${lng});
      );
      out body 60;
    `;
    const els = await ql(query);
    return els.map((e) => ({
      id: e.id,
      name: e.tags?.name,
      lat: e.lat,
      lng: e.lon,
      website: e.tags?.website,
      phone: e.tags?.['contact:phone'] ?? e.tags?.phone,
    }));
  });
}

/** Find work-vehicle / van rental candidates near a point. */
export async function findWorkVehicleRentalsNear(lat: number, lng: number, radius_m = 8000) {
  const r = Math.max(500, Math.min(radius_m, 20000));
  const key = `overpass:wvrent:${lat.toFixed(3)}:${lng.toFixed(3)}:${r}`;
  return withCache(key, 1000 * 60 * 60 * 12, async () => {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="car_rental"](around:${r},${lat},${lng});
        node["shop"="rental"](around:${r},${lat},${lng});
        node["rental"="van"](around:${r},${lat},${lng});
      );
      out body 60;
    `;
    const els = await ql(query);
    return els.map((e) => ({
      id: e.id,
      name: e.tags?.name,
      lat: e.lat,
      lng: e.lon,
      website: e.tags?.website,
      phone: e.tags?.['contact:phone'] ?? e.tags?.phone,
    }));
  });
}
