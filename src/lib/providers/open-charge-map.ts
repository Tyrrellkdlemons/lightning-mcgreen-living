/**
 * Open Charge Map — free EV charging POI API. Useful for the EV-buyer flow
 * (and as bonus context for "is there a charger near my apartment / dealer?").
 *
 * https://openchargemap.org/site/develop/api
 */

import { nowIso, withCache, type Provider } from './base';

export interface ChargerPoi {
  id: number;
  name?: string;
  lat: number;
  lng: number;
  num_points?: number;
  url?: string;
}

export const OpenChargeMapProvider: Provider<
  { lat: number; lng: number; radius_km?: number; limit?: number },
  ChargerPoi
> = {
  info: {
    id: 'open-charge-map',
    label: 'Open Charge Map (EV chargers)',
    status: 'live',
    legal_status: 'free',
    homepage: 'https://openchargemap.org/site/develop/api',
    notes: 'Optional API key for higher quotas (OPEN_CHARGE_MAP_KEY).',
  },

  async search({ lat, lng, radius_km = 5, limit = 25 }) {
    const params = new URLSearchParams({
      output: 'json',
      latitude: String(lat),
      longitude: String(lng),
      distance: String(radius_km),
      distanceunit: 'KM',
      maxresults: String(limit),
      countrycode: 'US',
    });
    if (process.env.OPEN_CHARGE_MAP_KEY) params.set('key', process.env.OPEN_CHARGE_MAP_KEY);
    return withCache(`ocm:${lat.toFixed(3)}:${lng.toFixed(3)}:${radius_km}`, 1000 * 60 * 60 * 12, async () => {
      const url = `https://api.openchargemap.io/v3/poi?${params}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Open Charge Map ${res.status}`);
      const json = (await res.json()) as any[];
      return {
        data: json.map((p) => ({
          id: p.ID,
          name: p.AddressInfo?.Title,
          lat: p.AddressInfo?.Latitude,
          lng: p.AddressInfo?.Longitude,
          num_points: p.NumberOfPoints,
          url: p.AddressInfo?.RelatedURL,
        })) as ChargerPoi[],
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
