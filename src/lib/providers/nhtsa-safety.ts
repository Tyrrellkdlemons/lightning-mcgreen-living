/**
 * NHTSA Safety Ratings — free, public.
 *
 * https://api.nhtsa.gov/SafetyRatings/{...}
 * https://api.nhtsa.gov/Recalls/recallsByVehicle?make=...&model=...&modelYear=...
 *
 * Adds an authoritative safety + recall overlay to every vehicle detail page.
 */

import { nowIso, withCache, type Provider } from './base';

export interface SafetyResult {
  overall?: number;
  overall_front?: number;
  overall_side?: number;
  rollover?: number;
  source_url: string;
}

export const NhtsaSafetyProvider: Provider<{ year: number; make: string; model: string }, SafetyResult> = {
  info: {
    id: 'nhtsa-safety',
    label: 'NHTSA Safety Ratings + Recalls',
    status: 'live',
    legal_status: 'free',
    homepage: 'https://api.nhtsa.gov/',
  },

  async search({ year, make, model }) {
    const key = `nhtsa-safety:${year}:${make}:${model}`;
    return withCache(key, 1000 * 60 * 60 * 24 * 7, async () => {
      const browseUrl = `https://api.nhtsa.gov/SafetyRatings/modelyear/${year}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}`;
      const res = await fetch(browseUrl);
      if (!res.ok) throw new Error(`NHTSA returned ${res.status}`);
      const browse = (await res.json()) as { Results: { VehicleId: number; VehicleDescription: string }[] };
      const data: SafetyResult[] = [];
      const first = browse.Results?.[0];
      if (first?.VehicleId) {
        const ratingUrl = `https://api.nhtsa.gov/SafetyRatings/VehicleId/${first.VehicleId}`;
        const rres = await fetch(ratingUrl);
        if (rres.ok) {
          const rj = (await rres.json()) as { Results: any[] };
          const r = rj.Results?.[0];
          if (r) {
            data.push({
              overall: r.OverallRating ? Number(r.OverallRating) : undefined,
              overall_front: r.OverallFrontCrashRating ? Number(r.OverallFrontCrashRating) : undefined,
              overall_side: r.OverallSideCrashRating ? Number(r.OverallSideCrashRating) : undefined,
              rollover: r.RolloverRating ? Number(r.RolloverRating) : undefined,
              source_url: ratingUrl,
            });
          }
        }
      }
      return {
        data,
        meta: {
          source: 'public-open-data' as const,
          source_url: browseUrl,
          last_seen_at: nowIso(),
          trust_label: 'official' as const,
        },
      };
    });
  },
};

export async function nhtsaRecallsByVehicle(year: number, make: string, model: string) {
  const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NHTSA recalls ${res.status}`);
  return (await res.json()) as { results?: any[]; Count?: number };
}
