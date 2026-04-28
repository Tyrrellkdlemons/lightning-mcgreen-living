/**
 * California DMV — Occupational License lookup.
 *
 * Public lookup at:
 *   https://www.dmv.ca.gov/portal/vehicle-industry-services/occupational-licensing/occupational-license-lookup/
 *
 * The page is a JS-rendered form without a public REST endpoint. We model this
 * as a verified-link adapter: deep-link to the lookup, surface the dealer's
 * license number when one is on file in our record, and let users open the
 * official UI to confirm "active" status. Admins can manually mark a dealer
 * `dealer_license_status: 'active'` after they verify.
 *
 * Per docs/COMPLIANCE_NOTES.md §9, "verified dealer" badges only appear once
 * the lookup has been confirmed manually.
 */

import { nowIso, type Provider } from './base';

export interface CaDmvOlResult {
  license_number?: string;
  license_status?: 'active' | 'inactive' | 'unknown';
  source_lookup_url: string;
}

export const CaDmvOlProvider: Provider<{ license?: string }, CaDmvOlResult> = {
  info: {
    id: 'ca-dmv-ol',
    label: 'California DMV Occupational License Lookup',
    status: 'env-key-missing',
    legal_status: 'free',
    homepage: 'https://www.dmv.ca.gov/portal/vehicle-industry-services/occupational-licensing/occupational-license-lookup/',
    notes: 'No public REST API. We deep-link the lookup form for manual verification.',
  },

  async fetchDetails(license: string) {
    const url = caDmvOlLookupUrl(license);
    return {
      data: { license_number: license, license_status: 'unknown', source_lookup_url: url } as CaDmvOlResult,
      meta: {
        source: 'public-open-data',
        source_url: url,
        last_seen_at: nowIso(),
        trust_label: 'unverified',
      },
    };
  },
};

/** Deep-link helper used by the dealer detail page. */
export function caDmvOlLookupUrl(license?: string): string {
  const base = 'https://www.dmv.ca.gov/portal/vehicle-industry-services/occupational-licensing/occupational-license-lookup/';
  return license ? `${base}?licenseNumber=${encodeURIComponent(license)}` : base;
}
