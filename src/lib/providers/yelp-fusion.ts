/**
 * Yelp Fusion — review/reputation source.
 *
 * Free trial + paid plans. Used as a *secondary* reputation overlay only:
 * we never store full review text; we only display rating, review_count, and
 * a deep link to the Yelp page (per Yelp's Display Requirements + caching
 * rules referenced in docs/DATA_SOURCES.md).
 *
 * The adapter degrades gracefully when YELP_API_KEY is not set.
 */

import { nowIso, type Provider } from './base';

export interface YelpBusinessSummary {
  id: string;
  name: string;
  rating?: number;
  review_count?: number;
  url: string;
}

export const YelpFusionProvider: Provider<
  { term: string; lat?: number; lng?: number; location?: string; limit?: number },
  YelpBusinessSummary
> = {
  info: {
    id: 'yelp-fusion',
    label: 'Yelp Fusion (reviews · secondary)',
    status: process.env.YELP_API_KEY ? 'live' : 'env-key-missing',
    legal_status: 'free-with-key',
    homepage: 'https://docs.developer.yelp.com/docs/places-intro',
    notes: 'Set YELP_API_KEY. We display rating/count + link only — no stored review text.',
  },

  async search({ term, lat, lng, location, limit = 5 }) {
    const key = process.env.YELP_API_KEY;
    if (!key) {
      return {
        data: [],
        meta: {
          source: 'unverified',
          source_url: 'https://docs.developer.yelp.com/reference/v3_business_search',
          last_seen_at: nowIso(),
          trust_label: 'unverified',
        },
      };
    }
    const params = new URLSearchParams({ term, limit: String(limit) });
    if (lat != null && lng != null) {
      params.set('latitude', String(lat));
      params.set('longitude', String(lng));
    } else if (location) {
      params.set('location', location);
    }
    const url = `https://api.yelp.com/v3/businesses/search?${params}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`Yelp returned ${res.status}`);
    const json = (await res.json()) as { businesses: any[] };
    return {
      data: json.businesses.map((b) => ({
        id: b.id,
        name: b.name,
        rating: b.rating,
        review_count: b.review_count,
        url: b.url,
      })),
      meta: {
        source: 'partner',
        source_url: url,
        last_seen_at: nowIso(),
        trust_label: 'partner',
      },
    };
  },
};
