/**
 * California Secretary of State — bizfile (entity name + status lookup).
 *
 * The bizfile portal does not expose a free public REST API and its ToS
 * does not permit automated scraping. We do two things here:
 *
 *   1. Generate a deep-link to the public search UI for any entity name
 *      so users (and admins doing manual verification) land on the right page.
 *   2. Provide a typed result shape so when an admin enters a verified
 *      result manually in /admin, it lands in the same canonical record.
 *
 * This adapter therefore reports `manual-verify-only` and never auto-fetches.
 *
 * Homepage: https://www.sos.ca.gov/business-programs/bizfile/search-online
 */

import { nowIso, type Provider } from './base';

export interface CaSosEntityResult {
  entity_name: string;
  entity_number?: string;
  status?: 'active' | 'suspended' | 'cancelled' | 'unknown';
  filing_type?: string;
  agent?: string;
  addresses?: string[];
  filed_date?: string;
  source_lookup_url: string;
}

export const CaSosProvider: Provider<{ name: string }, CaSosEntityResult> = {
  info: {
    id: 'ca-sos-bizfile',
    label: 'California Secretary of State bizfile (manual verify)',
    status: 'env-key-missing', // surfaced as "manual link only" in /data-sources
    legal_status: 'free',
    homepage: 'https://www.sos.ca.gov/business-programs/bizfile/search-online',
    notes: 'No public REST API. We deep-link the search UI; admins paste verified rows in /admin.',
  },

  async search({ name }) {
    const url = `https://bizfileonline.sos.ca.gov/search/business?searchType=Entity&searchTerm=${encodeURIComponent(name)}`;
    return {
      data: [{
        entity_name: name,
        source_lookup_url: url,
      }],
      meta: {
        source: 'public-open-data',
        source_url: url,
        last_seen_at: nowIso(),
        trust_label: 'unverified',
      },
    };
  },
};

/** Helper used by detail pages to render a "Verify LLC ↗" link. */
export function caSosLookupUrl(entityName: string): string {
  return `https://bizfileonline.sos.ca.gov/search/business?searchType=Entity&searchTerm=${encodeURIComponent(entityName)}`;
}
