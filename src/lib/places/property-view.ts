import type { WorkbookRankedListing } from '@/lib/data/workbook-ranked-listings';

export interface PropertyViewSource {
  label: string;
  url: string;
  kind: 'property' | 'floor-plan' | 'listing' | 'search' | 'application' | 'source';
}

export interface PropertyViewData {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string;
  lat?: number | null;
  lng?: number | null;
  locationPrecision?: 'recorded' | 'area';
  sourceDate?: string | null;
  sources?: PropertyViewSource[];
}

export function safeSourceUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 3000) return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.toString() : null;
  } catch { return null; }
}

export function validCoordinates(lat: unknown, lng: unknown): boolean {
  return typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function propertyMapLinks(view: PropertyViewData) {
  const address = view.address && !/unknown|verify|source page|tbd/i.test(view.address) ? view.address : '';
  // An area example must not be searched as if its editorial name were a real building.
  const query = [view.locationPrecision === 'area' ? '' : view.name, address, view.city, view.state].filter(Boolean).join(', ');
  const search = new URL('https://www.google.com/maps/search/');
  search.searchParams.set('api', '1');
  search.searchParams.set('query', query || view.name);
  if (!validCoordinates(view.lat, view.lng)) return { search: search.toString(), streetView: null, osm: null, embed: null };
  const lat = view.lat as number;
  const lng = view.lng as number;
  const streetView = new URL('https://www.google.com/maps/@');
  streetView.searchParams.set('api', '1');
  streetView.searchParams.set('map_action', 'pano');
  streetView.searchParams.set('viewpoint', `${lat},${lng}`);
  const embed = new URL('https://www.openstreetmap.org/export/embed.html');
  const radius = view.locationPrecision === 'area' ? 0.025 : 0.008;
  const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));
  embed.searchParams.set('bbox', [clamp(lng - radius, 180), clamp(lat - radius, 90), clamp(lng + radius, 180), clamp(lat + radius, 90)].join(','));
  embed.searchParams.set('layer', 'mapnik');
  // Approximate area examples deliberately have no property pin.
  if (view.locationPrecision !== 'area') embed.searchParams.set('marker', `${lat},${lng}`);
  return {
    search: search.toString(), streetView: streetView.toString(),
    osm: `https://www.openstreetmap.org/#map=${view.locationPrecision === 'area' ? 13 : 16}/${lat}/${lng}`,
    embed: embed.toString(),
  };
}


/** Convert recognized search destinations into explicit results pages, never lucky redirects. */
export function normalizePropertySource(label: string, value: unknown, kind: PropertyViewSource['kind']): PropertyViewSource | null {
  const safe = safeSourceUrl(value);
  if (!safe) return null;
  const url = new URL(safe);
  const host = url.hostname.toLowerCase();
  const engine = ['duckduckgo.com', 'www.duckduckgo.com', 'html.duckduckgo.com', 'lite.duckduckgo.com'].includes(host)
    ? 'https://duckduckgo.com/'
    : ['google.com', 'www.google.com'].includes(host) && url.pathname === '/search'
      ? 'https://www.google.com/search'
      : ['bing.com', 'www.bing.com'].includes(host) && url.pathname === '/search'
        ? 'https://www.bing.com/search'
        : null;
  if (!engine) return { label, url: safe, kind };
  // Rebuild with only q: drop lucky/redirect parameters and all bang commands.
  const query = (url.searchParams.get('q') || '')
    .replace(/(?:^|\s)![^\s]+/g, ' ').replace(/!/g, '').replace(/\s+/g, ' ').trim();
  const search = new URL(engine);
  search.searchParams.set('q', query);
  const domain = query.match(/\bsite:([a-z0-9.-]+\.[a-z]{2,})/i)?.[1];
  return { label: domain ? `Search ${domain} for this property` : 'Search the web for property sources', url: search.toString(), kind: 'search' };
}

export function workbookView(listing: WorkbookRankedListing): PropertyViewData {
  const sources: PropertyViewSource[] = [];
  const add = (label: string, url: unknown, kind: PropertyViewSource['kind']) => {
    const source = normalizePropertySource(label, url, kind);
    if (source && !sources.some((existing) => existing.url === source.url)) sources.push(source);
  };
  add('Recorded floor-plan source', listing.links.floor_plan_url || listing.links.floor_plan_link, 'floor-plan');
  add('Recorded listing source', listing.direct_links?.direct_listing_url, 'listing');
  add('Property search from workbook', listing.direct_links?.official_property_search_url, 'search');
  add('Leasing source from workbook', listing.links.leasing_url || listing.links.leasing_site, 'property');
  for (const source of listing.source_links || []) {
    const kind = source.kind === 'official-search' ? 'search' : source.kind === 'deep-apply' ? 'application' : source.kind === 'deep-listing' || source.kind === 'marketplace' ? 'listing' : 'source';
    add(source.label, source.url, kind);
  }
  add('Original research source', listing.links.source_url_clickable || listing.links.source_url, 'source');
  add('Listing source from workbook', listing.links.best_listing_url || listing.links.direct_unit_link, 'listing');
  return {
    name: listing.property_name, address: listing.address, city: listing.city, state: 'CA',
    lat: listing.map?.lat, lng: listing.map?.lng, locationPrecision: 'recorded',
    sourceDate: listing.source_date, sources,
  };
}

export function propertyPath(id: string): string { return `/properties/${encodeURIComponent(id)}`; }

export function filterWorkbookProperties<T extends Pick<WorkbookRankedListing, 'property_name' | 'city' | 'county' | 'address' | 'fit_tier' | 'rank'>>(listings: T[], query = '', city = '', tier = ''): T[] {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return listings.filter((listing) => (!city || listing.city === city) && (!tier || listing.fit_tier === tier)
    && words.every((word) => `${listing.property_name} ${listing.city || ''} ${listing.county || ''} ${listing.address || ''} ${listing.rank ?? ''}`.toLocaleLowerCase().includes(word)));
}

export function recordedRent(low?: number | null, high?: number | null): string {
  const format = (value: number) => `$${value.toLocaleString('en-US')}`;
  // Nonpositive workbook sentinels are missing data, never a free-rent offer.
  const validLow = typeof low === 'number' && Number.isFinite(low) && low > 0;
  const validHigh = typeof high === 'number' && Number.isFinite(high) && high > 0;
  if (validLow && validHigh && high < low) return 'Not recorded';
  if (validLow) return validHigh && high !== low ? `${format(low)}–${format(high)}` : format(low);
  if (validHigh) return `Up to ${format(high)}`;
  return 'Not recorded';
}
