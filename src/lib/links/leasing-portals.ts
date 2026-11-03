/**
 * Search and operator-site fallbacks when a specific application is unavailable.
 * Search URLs do not prove a matching property, vacancy or application exists.
 * Known property/unit application links take priority in the resolver.
 */

import type { ApplicationPlatform, RentalListing } from '@/types';

type RentalState = RentalListing['state'];

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

/** City search pattern checked against RentCafe's Phoenix and Los Angeles pages. */
export function rentCafeCitySearchUrl(city: string, state: RentalState = 'CA'): string {
  if (state !== 'CA' && state !== 'AZ') throw new Error('Unsupported rental state');
  return `https://www.rentcafe.com/apartments-for-rent/${citySlug(city)}-${state.toLowerCase()}/`;
}

/** Legacy export name retained; the destination is an explicit search results page. */
export function propertyListingDirectUrl(args: { property: string; city: string; siteHost: string; state?: RentalState }): string {
  return listingSearchUrl(args.siteHost, `"${args.property}" ${args.city} ${args.state ?? 'CA'}`);
}

/** Search for a VIN on the named dealer domain; never an automatic redirect. */
export function vehicleListingDirectUrl(args: { vin: string; siteHost: string; year?: number; make?: string; model?: string }): string {
  return listingSearchUrl(args.siteHost, [args.vin, args.year, args.make, args.model].filter(Boolean).join(' '));
}

/** Search for a branch/class; search results are not reservation links. */
export function workVehicleDirectUrl(args: { provider: string; city: string; vehicle_type: string; siteHost: string }): string {
  return listingSearchUrl(args.siteHost, `${args.provider} ${args.city} ${args.vehicle_type}`);
}

function listingSearchUrl(siteHost: string, terms: string): string {
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,}$/i.test(siteHost)) throw new Error('Invalid search domain');
  // Remove bang syntax from catalog text so a name cannot turn a search into a redirect.
  const q = `site:${siteHost} ${terms.replace(/!/g, '')}`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
}

export interface LeasingPortalInfo {
  url: string;
  fallback_url?: string;
  platform_name: string;
  platform_owner: string;
  type: 'leasing-portal-public-search' | 'leasing-portal-operator-search' | 'operator-marketing-site' | 'property-search';
  notes: string;
}

/**
 * Offer a state-specific search or the supplied operator URL when no exact
 * application link is available. Provider metadata describes the source record;
 * it does not verify where a provider currently hosts an application.
 */
export function pickLeasingPortal(args: {
  manager: string;
  platform: ApplicationPlatform;
  city: string;
  state?: RentalState;
  operatorMarketingUrl: string;
  property_name?: string;
}): LeasingPortalInfo {
  const { manager, platform, city, state = 'CA', operatorMarketingUrl, property_name } = args;
  const m = manager.toLowerCase();

  // Search the platform named in the source record.
  if (platform === 'RentCafe') {
    const fallback = rentCafeCitySearchUrl(city, state);
    if (property_name) {
      return {
        url: propertyListingDirectUrl({ property: property_name, city, state, siteHost: 'rentcafe.com' }),
        fallback_url: fallback,
        platform_name: 'RentCafe',
        platform_owner: 'Yardi Systems',
        type: 'property-search',
        notes: `Searches the web for ${property_name} in ${city}, ${state} on RentCafe. This is a search, not a verified listing or application. The separate fallback opens RentCafe's city search.`,
      };
    }
    return {
      url: fallback,
      platform_name: 'RentCafe',
      platform_owner: 'Yardi Systems',
      type: 'leasing-portal-public-search',
      notes: `RentCafe city search for ${city}, ${state}. Confirm the property and any application link with the provider; results do not establish availability.`,
    };
  }

  // Known operator domains allow a property-name search with a separate site fallback.
  if (
    /equity\s*residential|essex|avalonbay|camden|irvine\s*company|udr|prime\s*residential|decron/i.test(m)
  ) {
    const host = inHouseHostFor(manager);
    if (property_name && host) {
      return {
        url: propertyListingDirectUrl({ property: property_name, city, state, siteHost: host }),
        fallback_url: operatorMarketingUrl,
        platform_name: `${manager} (in-house portal)`,
        platform_owner: manager,
        type: 'property-search',
        notes: `Searches the web for ${property_name} in ${city}, ${state} on ${host}. Review the results and confirm the property before using an application link. The separate fallback opens the supplied operator website.`,
      };
    }
    return {
      url: operatorMarketingUrl,
      platform_name: `${manager} (in-house portal)`,
      platform_owner: manager,
      type: 'operator-marketing-site',
      notes: `Opens the supplied ${manager} website. Find the property and confirm its current application route with the operator.`,
    };
  }

  // Entrata / AppFolio / RealPage / Knock — no public city-level search portal
  if (platform === 'Entrata') {
    return {
      url: operatorMarketingUrl,
      platform_name: 'Entrata',
      platform_owner: 'Entrata, Inc.',
      type: 'operator-marketing-site',
      notes: 'The source record names Entrata. Open the supplied operator site and confirm the property and its current application route.',
    };
  }
  if (platform === 'AppFolio') {
    return {
      url: operatorMarketingUrl,
      platform_name: 'AppFolio Online Portal',
      platform_owner: 'AppFolio',
      type: 'operator-marketing-site',
      notes: 'The source record names AppFolio. Open the supplied operator site and confirm the property and its current application route.',
    };
  }
  if (platform === 'RealPage') {
    return {
      url: operatorMarketingUrl,
      platform_name: 'RealPage / OneSite / Knock',
      platform_owner: 'RealPage',
      type: 'operator-marketing-site',
      notes: 'The source record names RealPage. Confirm the property and its current application route with the operator.',
    };
  }
  if (platform === 'Knock') {
    return {
      url: operatorMarketingUrl,
      platform_name: 'Knock CRM',
      platform_owner: 'Knock (RealPage)',
      type: 'operator-marketing-site',
      notes: 'The source record names Knock. Confirm with the operator whether the linked page handles tours, contact or an application.',
    };
  }
  if (platform === 'On-Site') {
    return {
      url: operatorMarketingUrl,
      platform_name: 'On-Site',
      platform_owner: 'On-Site.com',
      type: 'operator-marketing-site',
      notes: 'The source record names On-Site. Confirm the property and its current application route with the operator.',
    };
  }
  if (platform === 'G5/Knock') {
    return {
      url: operatorMarketingUrl,
      platform_name: 'G5 / Knock',
      platform_owner: 'G5 Marketing Cloud + Knock',
      type: 'operator-marketing-site',
      notes: 'The source record names G5 / Knock. Confirm with the operator whether the linked page handles tours, contact or an application.',
    };
  }

  return {
    url: operatorMarketingUrl,
    platform_name: 'Operator search',
    platform_owner: manager,
    type: 'operator-marketing-site',
    notes: 'Application platform not identified in the source record. Open the supplied operator website and confirm the property and any application route.',
  };
}

/** Map well-known operators to their public domain for an explicit web search. */
function inHouseHostFor(manager: string): string | undefined {
  const m = manager.toLowerCase();
  if (m.includes('equity')) return 'equityapartments.com';
  if (m.includes('essex')) return 'essexapartmenthomes.com';
  if (m.includes('avalonbay')) return 'avaloncommunities.com';
  if (m.includes('camden')) return 'camdenliving.com';
  if (m.includes('irvine company')) return 'irvinecompanyapartments.com';
  if (m.includes('udr')) return 'udr.com';
  if (m.includes('prime residential')) return 'primeresidential.com';
  if (m.includes('decron')) return 'decron.com';
  return undefined;
}
