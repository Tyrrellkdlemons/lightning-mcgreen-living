/**
 * NHTSA vPIC — VIN decode. Free, no key, real API.
 *
 * Endpoint: https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}?format=json
 *
 * The shape of `Results` is { Variable, Value, ValueId } x ~140 rows.
 * We extract a small, useful subset.
 */

import { nowIso, withCache, type Provider } from './base';

export interface VinDecodeResult {
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  body_class?: string;
  drive_type?: string;
  fuel_type?: string;
  vehicle_type?: string;
  manufacturer?: string;
  plant_country?: string;
  raw_count: number;
}

export const NhtsaVpicProvider: Provider<{ vin: string }, VinDecodeResult> = {
  info: {
    id: 'nhtsa-vpic',
    label: 'NHTSA vPIC (VIN decode)',
    status: 'live',
    legal_status: 'free',
    homepage: 'https://vpic.nhtsa.dot.gov/api/',
  },

  async fetchDetails(vin) {
    const v = vin.trim().toUpperCase();
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) {
      throw new Error('VIN must be 17 alphanumeric characters (no I, O, Q).');
    }
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${encodeURIComponent(v)}?format=json`;
    const json = await withCache(`vpic:${v}`, 1000 * 60 * 60 * 24, async () => {
      const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
      if (!res.ok) throw new Error(`vPIC returned ${res.status}`);
      return res.json() as Promise<{ Results: { Variable: string; Value: string | null }[] }>;
    });
    const m = (key: string) => json.Results.find((r) => r.Variable === key)?.Value || undefined;
    const year = m('Model Year');
    const out: VinDecodeResult = {
      vin: v,
      year: year ? Number(year) : undefined,
      make: m('Make') || undefined,
      model: m('Model') || undefined,
      trim: m('Trim') || undefined,
      body_class: m('Body Class') || undefined,
      drive_type: m('Drive Type') || undefined,
      fuel_type: m('Fuel Type - Primary') || undefined,
      vehicle_type: m('Vehicle Type') || undefined,
      manufacturer: m('Manufacturer Name') || undefined,
      plant_country: m('Plant Country') || undefined,
      raw_count: json.Results.length,
    };
    return {
      data: out,
      meta: {
        source: 'public-open-data',
        source_url: url,
        last_seen_at: nowIso(),
        trust_label: 'official',
      },
    };
  },
};
