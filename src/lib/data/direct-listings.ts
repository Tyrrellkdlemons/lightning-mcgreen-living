/**
 * Direct listing URL overrides — the *canonical* apartments.com / rent.com
 * property pages a renter actually lands on after the search-redirect
 * shuffle. Powers two things:
 *
 *   1. Click-through priority: when an override exists for a rank, the
 *      apply / map UI uses that URL instead of the workbook's category-
 *      level source URL (or the DuckDuckGo `!ducky` deep-link).
 *   2. Staleness signal: `npm run check:direct-listings` probes every
 *      URL in `data/direct-listings.json` and writes back a status. The
 *      UI surfaces a pill ("live", "redirected", "gone", "stale",
 *      "untested") next to the listing so the user can tell at a glance
 *      whether the unit is still on the market.
 *
 * Add a new override by editing `data/direct-listings.json` directly —
 * no code change needed. The next page render picks it up.
 */
import raw from '../../../data/direct-listings.json';

export type DirectListingStatus =
  | 'untested'
  | 'live'
  | 'redirected'
  | 'gone'
  | 'stale';

export interface DirectListingOverride {
  rank: number;
  property_name?: string;
  city?: string;
  direct_url: string;
  added_at?: string;
  last_verified_at?: string | null;
  status?: DirectListingStatus;
  status_text?: string | null;
  notes?: string;
}

interface DirectListingFile {
  version?: number;
  updated_at?: string;
  overrides: Record<string, DirectListingOverride>;
}

const FILE = raw as DirectListingFile;
export const DIRECT_LISTINGS = FILE;

/** Return the override for a given rank, or null if none. */
export function getDirectListingOverride(
  rank: number | string | undefined,
): DirectListingOverride | null {
  if (rank == null) return null;
  return FILE.overrides[String(rank)] ?? null;
}

/** UI tone for a status pill — Tailwind class strings only, no JSX. */
export function statusTone(status?: DirectListingStatus): {
  bg: string;
  text: string;
  ring: string;
  label: string;
} {
  switch (status) {
    case 'live':
      return {
        bg: 'bg-lightning-50',
        text: 'text-lightning-800',
        ring: 'ring-lightning-300',
        label: 'live',
      };
    case 'redirected':
      return {
        bg: 'bg-caramel-400/20',
        text: 'text-caramel-600',
        ring: 'ring-caramel-400',
        label: 'redirected',
      };
    case 'gone':
      return {
        bg: 'bg-peppermint-500/15',
        text: 'text-peppermint-600',
        ring: 'ring-peppermint-500/40',
        label: 'gone',
      };
    case 'stale':
      return {
        bg: 'bg-frosting-200',
        text: 'text-gingerbread-700',
        ring: 'ring-gingerbread-300',
        label: 'stale',
      };
    case 'untested':
    default:
      return {
        bg: 'bg-frosting-100',
        text: 'text-chocolate-700',
        ring: 'ring-gingerbread-200',
        label: 'untested',
      };
  }
}

/** True when the override is at least as good as the workbook fallback. */
export function isUsableOverride(o: DirectListingOverride | null): boolean {
  if (!o || !o.direct_url) return false;
  // 'gone' means the URL responded with 404/410 or "no longer available" markers — don't use it.
  if (o.status === 'gone') return false;
  return true;
}
