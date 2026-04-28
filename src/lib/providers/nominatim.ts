/**
 * OpenStreetMap Nominatim — free geocoding.
 *
 * Public OSMF instance hard-limits to 1 req/sec and requires a UA + valid
 * app identifier (per https://operations.osmfoundation.org/policies/nominatim/).
 * For volume, host your own. We treat this as fallback to Google Maps geocoding.
 */

import { RateLimiter, nowIso, withCache, type Provider } from './base';

const limiter = new RateLimiter(1100);

export interface GeocodeResult {
  display_name: string;
  lat: number;
  lng: number;
  type?: string;
}

export const NominatimProvider: Provider<{ q: string }, GeocodeResult> = {
  info: {
    id: 'nominatim',
    label: 'OpenStreetMap Nominatim (geocoding)',
    status: 'live',
    legal_status: 'free',
    homepage: 'https://nominatim.org/release-docs/latest/api/Overview/',
    notes: 'Public instance: 1 rps, attribution required, valid User-Agent required.',
  },

  async search({ q }) {
    const key = `nominatim:${q}`;
    return withCache(key, 1000 * 60 * 60 * 24, async () => {
      await limiter.wait();
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=5&countrycodes=us`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'lightning-mcgreen-living/0.1 (open-source app)',
          'Accept-Language': 'en-US,en',
        },
      });
      if (!res.ok) throw new Error(`Nominatim returned ${res.status}`);
      const json = (await res.json()) as any[];
      return {
        data: json.map((j) => ({
          display_name: j.display_name,
          lat: Number(j.lat),
          lng: Number(j.lon),
          type: j.type,
        })),
        meta: {
          source: 'public-open-data' as const,
          source_url: url,
          last_seen_at: nowIso(),
          trust_label: 'public-open-data' as const,
        },
      };
    });
  },
};
