/**
 * Google Places — env-key gated. Used to discover dealers and work-vehicle
 * rental providers in approved SoCal regions when GOOGLE_PLACES_API_KEY is set.
 *
 * Without a key the adapter returns `null` and the UI renders "Provider not
 * connected — using OpenStreetMap fallback".
 */

import { nowIso, type Provider } from './base';

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  website?: string;
  phone?: string;
}

export const GooglePlacesProvider: Provider<
  { query: string; lat?: number; lng?: number; radius_m?: number },
  PlaceResult
> = {
  info: {
    id: 'google-places',
    label: 'Google Places',
    status: process.env.GOOGLE_PLACES_API_KEY ? 'live' : 'env-key-missing',
    legal_status: 'free-with-key',
    homepage: 'https://developers.google.com/maps/documentation/places/web-service/overview',
    notes: 'Set GOOGLE_PLACES_API_KEY in .env.local',
  },

  async search({ query, lat, lng, radius_m = 5000 }) {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) {
      return {
        data: [],
        meta: {
          source: 'unverified',
          source_url: 'https://developers.google.com/maps/documentation/places/web-service/search-text',
          last_seen_at: nowIso(),
          trust_label: 'unverified',
        },
      };
    }
    const params = new URLSearchParams({ query, key });
    if (lat != null && lng != null) {
      params.set('location', `${lat},${lng}`);
      params.set('radius', String(radius_m));
    }
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Places returned ${res.status}`);
    const json = (await res.json()) as { results: any[] };
    return {
      data: json.results.map((r) => ({
        place_id: r.place_id,
        name: r.name,
        formatted_address: r.formatted_address,
        lat: r.geometry?.location?.lat,
        lng: r.geometry?.location?.lng,
        rating: r.rating,
        user_ratings_total: r.user_ratings_total,
        types: r.types ?? [],
      })) as PlaceResult[],
      meta: {
        source: 'partner',
        source_url: url,
        last_seen_at: nowIso(),
        trust_label: 'partner',
      },
    };
  },
};
