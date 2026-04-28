/**
 * HUD Fair Market Rents — free, requires a HUD User token.
 *
 * https://www.huduser.gov/portal/dataset/fmr-api.html
 *
 * Used as qualification context: "Is this rent within the HUD FMR for the
 * county?". When the token isn't present, returns gracefully with a note.
 */

import { nowIso, withCache, type Provider } from './base';

export interface FmrResult {
  county_fips: string;
  fmr_0br?: number;
  fmr_1br?: number;
  fmr_2br?: number;
  fmr_3br?: number;
  fmr_4br?: number;
  year: number;
  note?: string;
}

const SOCAL_COUNTY_FIPS: Record<string, string> = {
  'Los Angeles': '06037',
  Orange: '06059',
  Riverside: '06065',
  'San Bernardino': '06071',
  Ventura: '06111',
  'San Diego': '06073',
};

export const HudFmrProvider: Provider<{ county: string; year?: number }, FmrResult> = {
  info: {
    id: 'hud-fmr',
    label: 'HUD Fair Market Rents',
    status: 'live',
    legal_status: 'free-with-key',
    homepage: 'https://www.huduser.gov/portal/dataset/fmr-api.html',
    notes: 'Set HUD_API_TOKEN to enable.',
  },

  async fetchDetails(idOrCountyYear: string) {
    const [county, yearStr] = idOrCountyYear.split('|');
    const year = Number(yearStr) || new Date().getFullYear();
    const fips = SOCAL_COUNTY_FIPS[county];
    if (!fips) throw new Error(`Unknown SoCal county: ${county}`);

    const token = process.env.HUD_API_TOKEN;
    if (!token) {
      return {
        data: {
          county_fips: fips,
          year,
          note: 'HUD_API_TOKEN not set — register free at huduser.gov to enable.',
        } as FmrResult,
        meta: {
          source: 'public-open-data' as const,
          source_url: 'https://www.huduser.gov/portal/dataset/fmr-api.html',
          last_seen_at: nowIso(),
          trust_label: 'official' as const,
        },
      };
    }

    return withCache(`hud-fmr:${fips}:${year}`, 1000 * 60 * 60 * 24 * 7, async () => {
      const url = `https://www.huduser.gov/hudapi/public/fmr/data/${fips}99999?year=${year}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 * 60 * 24 * 7 },
      });
      if (!res.ok) throw new Error(`HUD FMR returned ${res.status}`);
      const json = await res.json();
      const d = json?.data?.basicdata;
      const out: FmrResult = {
        county_fips: fips,
        year,
        fmr_0br: d?.['Efficiency'] ?? d?.['0 Bedroom'],
        fmr_1br: d?.['One-Bedroom'] ?? d?.['1 Bedroom'],
        fmr_2br: d?.['Two-Bedroom'] ?? d?.['2 Bedroom'],
        fmr_3br: d?.['Three-Bedroom'] ?? d?.['3 Bedroom'],
        fmr_4br: d?.['Four-Bedroom'] ?? d?.['4 Bedroom'],
      };
      return {
        data: out,
        meta: {
          source: 'public-open-data' as const,
          source_url: url,
          last_seen_at: nowIso(),
          trust_label: 'official' as const,
        },
      };
    });
  },
};
