/**
 * Provider adapter pattern.
 *
 * Every external integration implements `Provider<TQuery, TResult>` so the
 * search/aggregation layer can fan out, normalize, cache, and rate-limit
 * uniformly. Stubs throw `ProviderRequiresContractError` from the compliance
 * module — never silently fall through.
 */

import type { SourceMeta } from '@/types';

export type ProviderStatus =
  | 'live'
  | 'env-key-missing'
  | 'partner-required'
  | 'paid-required'
  | 'unavailable';

export interface ProviderInfo {
  id: string;                     // e.g. 'nhtsa-vpic'
  label: string;                  // human label
  status: ProviderStatus;
  homepage?: string;
  legal_status: 'free' | 'free-with-key' | 'partner' | 'paid';
  notes?: string;
}

export interface ProviderResult<T> {
  data: T;
  meta: Pick<SourceMeta, 'source' | 'source_url' | 'last_seen_at' | 'trust_label'>;
}

export interface Provider<TQuery, TResult> {
  info: ProviderInfo;
  search?(q: TQuery): Promise<ProviderResult<TResult[]>>;
  fetchDetails?(id: string): Promise<ProviderResult<TResult>>;
}

// Simple in-memory cache (per process). Swap with Redis/Upstash in production.
const memoryCache = new Map<string, { value: unknown; expires: number }>();

export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = memoryCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await fn();
  memoryCache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export class RateLimiter {
  private last = 0;
  constructor(private intervalMs: number) {}
  async wait(): Promise<void> {
    const wait = Math.max(0, this.last + this.intervalMs - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.last = Date.now();
  }
}

export const nowIso = () => new Date().toISOString();
