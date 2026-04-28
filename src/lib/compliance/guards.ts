import { isProduction } from '@/lib/config';
import type { SourceMeta } from '@/types';

/**
 * Compliance guards. The single chokepoint for "is this listing publishable?".
 */

export class ProviderRequiresContractError extends Error {
  constructor(provider: string) {
    super(
      `${provider} requires a partner contract or paid plan. ` +
        `Configure the env key in .env.local once approved. ` +
        `See docs/API_CONNECTOR_STATUS.md.`,
    );
    this.name = 'ProviderRequiresContractError';
  }
}

const REQUIRED_KEYS = [
  'source',
  'source_url',
  'last_seen_at',
  'last_verified_at',
  'data_freshness_status',
  'trust_label',
  'confidence_score',
] as const;

export function hasFullSourceMeta(meta: Partial<SourceMeta> | undefined): meta is SourceMeta {
  if (!meta) return false;
  return REQUIRED_KEYS.every((k) => (meta as any)[k] != null);
}

/**
 * Filter listings down to those publishable in the current mode.
 * - Production: every listing must have full SourceMeta.
 * - Demo: anything goes, but a banner is displayed by `<DemoBanner>`.
 */
export function publishable<T extends { meta?: Partial<SourceMeta> }>(items: T[]): T[] {
  if (!isProduction()) return items;
  return items.filter((it) => hasFullSourceMeta(it.meta));
}

/**
 * Reject text that mentions Fair-Housing protected classes from filter inputs.
 * Used to scrub free-text search to avoid steering claims.
 */
const PROTECTED_TERMS = [
  'race', 'racial', 'ethnicity', 'religion', 'jewish', 'muslim', 'christian',
  'national origin', 'immigrant', 'lgbt', 'gay', 'transgender', 'disabled',
  'family', 'kids', 'children', 'singles only', 'no kids',
];

export function isFairHousingSafe(query: string): boolean {
  const q = query.toLowerCase();
  return !PROTECTED_TERMS.some((t) => q.includes(t));
}
