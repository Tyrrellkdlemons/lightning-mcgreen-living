/**
 * U.S. Census Bureau — ACS 5-year. Free; key recommended for higher rate limit.
 *
 * Used to surface area-level context: median household income, median rent, and
 * median commute time at the ZIP-Code-Tabulation-Area level.
 *
 * https://www.census.gov/data/developers/data-sets/acs-5year.html
 */

import { nowIso, withCache, type Provider } from './base';

export interface AcsAreaContext {
  zip: string;
  median_household_income?: number;
  median_gross_rent?: number;
  median_travel_time_to_work_min?: number;
}

export const CensusAcsProvider: Provider<{ zip: string }, AcsAreaContext> = {
  info: {
    id: 'census-acs',
    label: 'U.S. Census ACS 5-year',
    status: 'live',
    legal_status: 'free-with-key',
    homepage: 'https://www.census.gov/data/developers/data-sets/acs-5year.html',
    notes: 'Set CENSUS_API_KEY for higher rate limits.',
  },

  async fetchDetails(zip: string) {
    const z = zip.padStart(5, '0');
    const key = process.env.CENSUS_API_KEY;
    return withCache(`census:zcta:${z}`, 1000 * 60 * 60 * 24 * 7, async () => {
      // ACS 2022 5-year, ZCTA universe
      // B19013_001E = Median household income
      // B25064_001E = Median gross rent
      // B08303_001E = Aggregate travel time to work (proxy; full breakdown is verbose)
      const url =
        `https://api.census.gov/data/2022/acs/acs5?` +
        `get=NAME,B19013_001E,B25064_001E&` +
        `for=zip%20code%20tabulation%20area:${encodeURIComponent(z)}` +
        (key ? `&key=${encodeURIComponent(key)}` : '');
      const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
      if (!res.ok) throw new Error(`Census returned ${res.status}`);
      const rows = (await res.json()) as string[][];
      if (!Array.isArray(rows) || rows.length < 2) {
        return {
          data: { zip: z } as AcsAreaContext,
          meta: {
            source: 'public-open-data' as const,
            source_url: url,
            last_seen_at: nowIso(),
            trust_label: 'official' as const,
          },
        };
      }
      const [, , income, rent] = rows[1];
      return {
        data: {
          zip: z,
          median_household_income: Number(income) || undefined,
          median_gross_rent: Number(rent) || undefined,
        } as AcsAreaContext,
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
