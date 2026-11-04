export type AssistanceState = 'CA' | 'AZ';
export type AssistanceCategory = 'down_payment' | 'rental_assistance' | 'both';
export type AssistanceScope = 'statewide' | 'county' | 'city' | 'regional' | 'national';
export type AssistancePurpose = 'purchase_down_payment' | 'purchase_closing_costs' | 'rental_deposit' | 'first_rent' | 'move_in' | 'back_rent' | 'ongoing_rent' | 'housing_navigation' | 'deposit_alternative' | 'paid_guarantor';
export type AssistanceHelpKind = 'financial_assistance' | 'referral' | 'deposit_alternative' | 'paid_guarantor';
export type AssistanceVerification = 'verified' | 'partial' | 'unverified' | 'closed';
export type AssistanceResource = {
  id: string; name: string; state: AssistanceState; scope: AssistanceScope;
  counties: string[]; cities: string[]; category: AssistanceCategory; administrator: string;
  assistance_summary: string; assistance_amount: string; assistance_type: string;
  eligibility_notes: string; how_to_apply: string; source_url: string; last_verified: string;
  cost_purposes?: AssistancePurpose[]; help_kind?: AssistanceHelpKind; property_participation?: string;
  image_key?: string; verification_status: AssistanceVerification;
  source_kind: 'official' | 'directory' | 'guide'; verification_notes: string;
  supplied_date: string; supplied_claim: string; source_rows: string[]; reviewed_at: string;
};
export type AssistanceFilters = {
  state?: AssistanceState | ''; category?: AssistanceCategory | ''; county?: string; city?: string; q?: string; purpose?: AssistancePurpose | '';
};
export type AssistancePlace = { state: AssistanceState; name: string; counties: readonly string[] };
export type AssistanceCounties = Record<AssistanceState, readonly string[]>;
export const ASSISTANCE_PAGE_SIZE = 20;
export const ASSISTANCE_DISCLAIMER = 'Programs, funding, and eligibility change frequently. This directory is for informational purposes only and is not financial or legal advice. Always confirm details with the administering agency or a HUD-approved housing counselor.';
export const ASSISTANCE_EMPTY_TEXT = 'No programs match your filters. Try removing a filter or search term.';
export const ASSISTANCE_CATEGORY_LABELS: Record<AssistanceCategory, string> = {
  down_payment: 'Down payment help', rental_assistance: 'Rent assistance', both: 'Homebuyer & rent help',
};
export const ASSISTANCE_PURPOSE_LABELS: Record<AssistancePurpose, string> = {
  purchase_down_payment: 'Purchase down payment', purchase_closing_costs: 'Purchase closing costs',
  rental_deposit: 'Rental deposit', first_rent: 'First rent payment', move_in: 'Move-in costs',
  back_rent: 'Past-due rent', ongoing_rent: 'Ongoing rent', housing_navigation: 'Housing navigation',
  deposit_alternative: 'Paid deposit alternative', paid_guarantor: 'Paid guarantor',
};
export const ASSISTANCE_STATE_LABELS: Record<AssistanceState, string> = { CA: 'California', AZ: 'Arizona' };

export function normalizeAssistanceText(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
const countyKey = (value: string) => normalizeAssistanceText(value).replace(/ county$/, '');
const cityKey = (value: string) => normalizeAssistanceText(value);
const text = (value: unknown) => typeof value === 'string' ? value.slice(0, 200) : '';
export function readAssistanceFilters(params: Pick<URLSearchParams, 'get'>): AssistanceFilters {
  const state = params.get('state')?.toUpperCase();
  const category = params.get('category');
  const purpose = params.get('purpose') ?? '';
  return {
    state: state === 'CA' || state === 'AZ' ? state : '',
    category: category === 'down_payment' || category === 'rental_assistance' || category === 'both' ? category : '',
    purpose: Object.hasOwn(ASSISTANCE_PURPOSE_LABELS, purpose) ? purpose as AssistancePurpose : '',
    county: text(params.get('county')), city: text(params.get('city')), q: text(params.get('q')),
  };
}
export function assistanceDirectoryUrl(filters: AssistanceFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.state === 'CA' || filters.state === 'AZ') params.set('state', filters.state);
  if (filters.category && Object.hasOwn(ASSISTANCE_CATEGORY_LABELS, filters.category)) params.set('category', filters.category);
  if (filters.purpose && Object.hasOwn(ASSISTANCE_PURPOSE_LABELS, filters.purpose)) params.set('purpose', filters.purpose);
  for (const key of ['county', 'city', 'q'] as const) if (text(filters[key]).trim()) params.set(key, text(filters[key]));
  return `/resources/assistance${params.size ? `?${params.toString()}` : ''}`;
}
export function assistanceDetailUrl(id: string): string { return `/resources/assistance/${encodeURIComponent(id)}`; }

/** Unknown, non-HTTPS and credential-bearing URLs are never made clickable. No source URL is fetched by this helper. */
export function safeAssistanceSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.')) return null;
    if (/^(localhost|127\.|0\.)/i.test(url.hostname) || /\.(local|internal)$/i.test(url.hostname)) return null;
    return url.href;
  } catch { return null; }
}
export function sourceLinkLabel(resource: AssistanceResource): string {
  if (resource.source_kind === 'directory') return 'Open referral directory';
  if (resource.source_kind === 'guide') return 'Read source guide';
  return resource.verification_status === 'unverified' ? 'Open supplied source' : 'Open administrator source';
}
export function sourceKindLabel(resource: AssistanceResource): string {
  return resource.source_kind === 'official' ? 'Administrator / official source' : resource.source_kind === 'directory' ? 'Referral directory' : 'Reference guide';
}
export function assistanceScopeLabel(resource: AssistanceResource): string {
  const state = ASSISTANCE_STATE_LABELS[resource.state];
  if (resource.scope === 'national') return 'National resource';
  if (resource.scope === 'statewide') return `${state} statewide`;
  if (resource.scope === 'city') return resource.cities.length ? `${resource.cities.join(', ')} only` : 'City-restricted service area';
  const counties = resource.counties.map(name => / county$/i.test(name) ? name : `${name} County`).join(', ');
  return counties || (resource.cities.length ? resource.cities.join(', ') : `${state} regional resource`);
}
export function isCityRestricted(resource: AssistanceResource): boolean {
  return resource.scope === 'city' || (resource.cities.length > 0 && resource.scope === 'regional');
}
export function assistanceAppliesToPlace(resource: AssistanceResource, state: AssistanceState, county = '', city = ''): boolean {
  if (resource.state !== state) return false;
  if (resource.scope === 'national') return true;
  if (resource.scope === 'statewide') return true;
  if (isCityRestricted(resource)) return !!city && resource.cities.some(name => cityKey(name) === cityKey(city));
  return !!county && resource.counties.some(name => countyKey(name) === countyKey(county));
}
export function assistanceCostPurposes(resource: AssistanceResource): AssistancePurpose[] {
  if (resource.cost_purposes?.length) return resource.cost_purposes.filter(purpose => Object.hasOwn(ASSISTANCE_PURPOSE_LABELS, purpose));
  return resource.category === 'down_payment' ? ['purchase_down_payment'] : resource.category === 'both' ? ['purchase_down_payment', 'housing_navigation'] : ['housing_navigation'];
}
export function isPaidAssistanceResource(resource: AssistanceResource): boolean {
  return resource.help_kind === 'deposit_alternative' || resource.help_kind === 'paid_guarantor'
    || resource.cost_purposes?.some(purpose => purpose === 'deposit_alternative' || purpose === 'paid_guarantor') === true;
}
export function propertyParticipationLabel(resource: AssistanceResource): string | null {
  return resource.property_participation || (isPaidAssistanceResource(resource) ? 'Property participation unconfirmed \u2014 ask management' : null);
}
export function filterAssistanceResources(resources: readonly AssistanceResource[], filters: AssistanceFilters, counties?: AssistanceCounties, places?: readonly AssistancePlace[]): AssistanceResource[] {
  const county = countyKey(filters.county ?? '');
  const city = cityKey(filters.city ?? '');
  const words = normalizeAssistanceText(filters.q ?? '').split(' ').filter(Boolean);
  const countyStates = county ? (['CA', 'AZ'] as const).filter(state =>
    (counties?.[state] ?? resources.filter(resource => resource.state === state).flatMap(resource => resource.counties))
      .some(name => countyKey(name) === county)) : [];
  const cityPlaces = city && places ? places.filter(place => cityKey(place.name) === city
    && (!filters.state || place.state === filters.state) && (!county || place.counties.some(name => countyKey(name) === county))) : [];
  if (city && places && !cityPlaces.length) return [];
  return resources.filter(resource => {
    if (city && places && !cityPlaces.some(place => place.state === resource.state)) return false;
    if (filters.state && resource.state !== filters.state) return false;
    if (county && !countyStates.includes(resource.state)) return false;
    if (filters.category && resource.category !== filters.category && resource.category !== 'both') return false;
    if (filters.purpose && !assistanceCostPurposes(resource).includes(filters.purpose)) return false;
    const broad = resource.scope === 'statewide' || resource.scope === 'national';
    if (county && !broad && !resource.counties.some(name => countyKey(name) === county)) return false;
    if (city && isCityRestricted(resource) && !resource.cities.some(name => cityKey(name) === city)) return false;
    // Without a county, do not suggest an unrelated county/regional program from a city query alone.
    if (city && !broad && !isCityRestricted(resource)) {
      if (places && !cityPlaces.some(place => place.state === resource.state && place.counties.some(name => resource.counties.some(area => countyKey(area) === countyKey(name))))) return false;
      if (!places && !county) return false;
    }
    const haystack = normalizeAssistanceText([resource.name, resource.administrator, resource.assistance_summary,
      resource.assistance_type, resource.supplied_claim, ASSISTANCE_CATEGORY_LABELS[resource.category], resource.state,
      ASSISTANCE_STATE_LABELS[resource.state], ...resource.counties, ...resource.cities].join(' '));
    return words.every(word => haystack.includes(word));
  });
}
export function assistanceDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Date not recorded';
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.valueOf()) ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date) : 'Date not recorded';
}
export function verificationLabel(resource: AssistanceResource): string {
  return { verified: 'Source checked', partial: 'Partly checked', unverified: 'Not independently verified', closed: 'Closed / unavailable' }[resource.verification_status];
}
export function verificationDateLabel(resource: AssistanceResource): string {
  if (resource.verification_status === 'closed') return `Closure status checked ${assistanceDate(resource.last_verified)}`;
  if (resource.verification_status === 'verified' || resource.verification_status === 'partial') return `Content checked ${assistanceDate(resource.last_verified)}`;
  return `Supplied date: ${assistanceDate(resource.supplied_date || resource.last_verified)}; not independently verified`;
}
export function latestAssistanceContentCheck(resources: readonly AssistanceResource[]): string | null {
  return resources.filter(resource => resource.verification_status !== 'unverified')
    .map(resource => resource.last_verified).filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort().at(-1) ?? null;
}
/** Escape HTML parser delimiters as well as JavaScript line separators in JSON-LD. */
export function safeAssistanceJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** Only published images served by the existing protected Blobs image route are eligible. */
export function assistanceLogoSource(imageKey?: string): string | null {
  const match = /^images\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i.exec(imageKey ?? '');
  return match ? `/place-photos/${match[1]}/${match[2]}` : null;
}
