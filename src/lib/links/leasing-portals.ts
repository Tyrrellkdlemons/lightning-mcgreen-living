/**
 * Leasing-portal URL helpers — picks the closest *actual application portal*
 * URL we can verifiably build, given an operator's typical leasing platform.
 *
 * Per docs/COMPLIANCE_NOTES.md §1: we never fabricate property-specific URLs.
 * What we DO build are public SEARCH URLs on platforms that have them:
 *   - RentCafe has a real public city search at
 *     https://www.rentcafe.com/apartments-for-rent/us-california/{city}/
 *     that lists every active property in that city + a working "Apply" CTA.
 *   - Entrata / AppFolio / RealPage / Knock do NOT have a public city search;
 *     properties live on their own subdomains. For those we fall back to the
 *     operator's own search and label it clearly.
 *
 * The resolver and the prep packet then surface a label like
 *   "Application goes through: RentCafe (Yardi)"
 * so users know exactly which platform they're about to land on.
 */

import type { ApplicationPlatform } from '@/types';

const SLUG_OVERRIDES: Record<string, string> = {
  // City names whose RentCafe slug differs from naive lower+hyphen
  'Los Angeles': 'los-angeles',
  'Long Beach': 'long-beach',
  'Newport Beach': 'newport-beach',
  'Mission Viejo': 'mission-viejo',
  'Huntington Beach': 'huntington-beach',
  'Santa Ana': 'santa-ana',
  'Costa Mesa': 'costa-mesa',
  'Garden Grove': 'garden-grove',
  'Laguna Niguel': 'laguna-niguel',
  'Rancho Cucamonga': 'rancho-cucamonga',
  'San Bernardino': 'san-bernardino',
  'Moreno Valley': 'moreno-valley',
  'Thousand Oaks': 'thousand-oaks',
  'Simi Valley': 'simi-valley',
};

function citySlug(city: string): string {
  return SLUG_OVERRIDES[city] ?? city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
}

/** Real public RentCafe city search. Lists every active leasable property + Apply CTA. */
export function rentCafeCitySearchUrl(city: string): string {
  return `https://www.rentcafe.com/apartments-for-rent/us-california/${citySlug(city)}/`;
}

export interface LeasingPortalInfo {
  url: string;
  platform_name: string;
  platform_owner: string;
  type: 'leasing-portal-public-search' | 'leasing-portal-operator-search' | 'operator-marketing-site';
  notes: string;
}

/**
 * Pick the closest actual leasing-portal URL given the operator + platform + city.
 *
 * Priority:
 *   1. RentCafe-hosted properties → real RentCafe public city search
 *   2. In-house portals (Equity / Essex / AvalonBay / Camden / Irvine Co / UDR /
 *      Prime / Decron) → operator's own city search IS the leasing portal
 *   3. Entrata / AppFolio / RealPage / Knock → operator search (no public CSP)
 */
export function pickLeasingPortal(args: {
  manager: string;
  platform: ApplicationPlatform;
  city: string;
  operatorMarketingUrl: string;
}): LeasingPortalInfo {
  const { manager, platform, city, operatorMarketingUrl } = args;
  const m = manager.toLowerCase();

  // RentCafe is the actual public leasing portal for these third-party-platform operators
  if (platform === 'RentCafe') {
    return {
      url: rentCafeCitySearchUrl(city),
      platform_name: 'RentCafe',
      platform_owner: 'Yardi Systems',
      type: 'leasing-portal-public-search',
      notes: `RentCafe (Yardi) — public city search. Pick the ${manager} property to start the application.`,
    };
  }

  // In-house portals: their main site IS the leasing portal
  if (
    /equity\s*residential|essex|avalonbay|camden|irvine\s*company|udr|prime\s*residential|decron/i.test(m)
  ) {
    return {
      url: operatorMarketingUrl,
      platform_name: `${manager} (in-house portal)`,
      platform_owner: manager,
      type: 'leasing-portal-operator-search',
      notes: `${manager} runs its own leasing portal. The link goes to their city / property search where the apply CTA lives.`,
    };
  }

  // Entrata / AppFolio / RealPage / Knock — no public city-level search portal
  if (platform === 'Entrata') {
    return {
      url: operatorMarketingUrl,
      platform_name: 'Entrata',
      platform_owner: 'Entrata, Inc.',
      type: 'operator-marketing-site',
      notes: 'Entrata does not publish a city search. Use the operator site to pick a property — clicking Apply lands on its Entrata-hosted portal.',
    };
  }
  if (platform === 'AppFolio') {
    return {
      url: operatorMarketingUrl,
      platform_name: 'AppFolio Online Portal',
      platform_owner: 'AppFolio',
      type: 'operator-marketing-site',
      notes: 'AppFolio properties live on their own subdomains. Use the operator site to pick a property — clicking Apply lands on its AppFolio Online Portal.',
    };
  }
  if (platform === 'RealPage') {
    return {
      url: operatorMarketingUrl,
      platform_name: 'RealPage / OneSite / Knock',
      platform_owner: 'RealPage',
      type: 'operator-marketing-site',
      notes: 'RealPage flows live on the operator site. Pick a property and click Apply.',
    };
  }
  if (platform === 'Knock') {
    return {
      url: operatorMarketingUrl,
      platform_name: 'Knock CRM',
      platform_owner: 'Knock (RealPage)',
      type: 'operator-marketing-site',
      notes: 'Knock handles tour scheduling and chat; the application happens on the operator site after Knock hands off.',
    };
  }

  return {
    url: operatorMarketingUrl,
    platform_name: 'Operator search',
    platform_owner: manager,
    type: 'operator-marketing-site',
    notes: 'Application platform not yet identified — use the operator site to find the property and click Apply.',
  };
}
