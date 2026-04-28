'use client';

import { useState } from 'react';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

interface VinResult {
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
}

export function VinDecoderPanel({ initialVin }: { initialVin?: string }) {
  const [vin, setVin] = useState(initialVin ?? '');
  const [result, setResult] = useState<VinResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/vin/${encodeURIComponent(vin.trim().toUpperCase())}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setResult(json.data);
    } catch (e: any) {
      setError(e.message ?? 'Could not decode VIN');
    } finally {
      setLoading(false);
    }
  }

  return (
    <CandyCard>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-extrabold text-chocolate-900">VIN decoder</h2>
        <Gumdrop tone="info">NHTSA vPIC · public · no key</Gumdrop>
      </div>
      <p className="text-xs text-chocolate-700">17-character VIN (no I, O, or Q).</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          maxLength={17}
          className="flex-1 rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm uppercase tracking-widest font-mono"
          placeholder="1HGCM82633A004352"
        />
        <button
          type="button"
          onClick={decode}
          disabled={loading || vin.length !== 17}
          className="bolt-btn disabled:opacity-50"
        >
          {loading ? 'Decoding…' : 'Decode'}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-peppermint-500/15 px-3 py-2 text-xs text-peppermint-600">{error}</p>
      )}
      {result && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-chocolate-800">
          {([
            ['Year', result.year], ['Make', result.make], ['Model', result.model], ['Trim', result.trim],
            ['Body class', result.body_class], ['Drive', result.drive_type],
            ['Fuel type', result.fuel_type], ['Vehicle type', result.vehicle_type],
            ['Manufacturer', result.manufacturer], ['Plant country', result.plant_country],
          ] as const).map(([k, v]) => (
            <li key={k} className="flex justify-between rounded bg-frosting-100 px-2 py-1">
              <span className="text-xs font-semibold text-chocolate-600">{k}</span>
              <span className="text-sm font-bold">{v ?? '—'}</span>
            </li>
          ))}
        </ul>
      )}
    </CandyCard>
  );
}
