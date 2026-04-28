/**
 * FuelEconomy.gov — free, public API. XML by default, supports JSON via Accept header.
 *
 * We use it to look up MPG / annual fuel cost estimates by year/make/model.
 *
 * Docs: https://www.fueleconomy.gov/feg/ws/
 */

import { nowIso, withCache, type Provider } from './base';

export interface FuelLookup {
  year: number;
  make: string;
  model: string;
}

export interface FuelEconomyResult {
  vehicle_id?: number;
  combined_mpg?: number;
  city_mpg?: number;
  highway_mpg?: number;
  annual_fuel_cost_usd?: number;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`FuelEconomy.gov returned ${res.status}`);
  return res.json() as Promise<T>;
}

export const FuelEconomyProvider: Provider<FuelLookup, FuelEconomyResult> = {
  info: {
    id: 'fuel-economy',
    label: 'FuelEconomy.gov',
    status: 'live',
    legal_status: 'free',
    homepage: 'https://www.fueleconomy.gov/feg/ws/',
  },

  async fetchDetails(idOrYearMakeModel: string) {
    const parts = idOrYearMakeModel.split('|');
    if (parts.length !== 3) throw new Error('Pass year|make|model');
    const [yearStr, make, model] = parts;
    const year = Number(yearStr);

    return withCache(
      `fueleconomy:${year}-${make}-${model}`,
      1000 * 60 * 60 * 24,
      async () => {
        // Step 1: list options
        const optsUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
        const opts = await getJson<{ menuItem: { value: string; text: string } | { value: string; text: string }[] }>(optsUrl);
        const items = Array.isArray(opts.menuItem) ? opts.menuItem : opts.menuItem ? [opts.menuItem] : [];
        if (items.length === 0) {
          return {
            data: { year, make, model } as FuelEconomyResult,
            meta: {
              source: 'public-open-data' as const,
              source_url: optsUrl,
              last_seen_at: nowIso(),
              trust_label: 'official' as const,
            },
          };
        }
        // Step 2: pick first variant; fetch detail
        const id = Number(items[0].value);
        const detailUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/${id}`;
        const detail = await getJson<any>(detailUrl);
        const out: FuelEconomyResult = {
          vehicle_id: id,
          city_mpg: Number(detail.city08) || undefined,
          highway_mpg: Number(detail.highway08) || undefined,
          combined_mpg: Number(detail.comb08) || undefined,
          annual_fuel_cost_usd: Number(detail.fuelCost08) || undefined,
        };
        return {
          data: out,
          meta: {
            source: 'public-open-data' as const,
            source_url: detailUrl,
            last_seen_at: nowIso(),
            trust_label: 'official' as const,
          },
        };
      },
    );
  },
};
