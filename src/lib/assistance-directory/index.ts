import california from '@/content/assistance_resources/california.json';
import arizona from '@/content/assistance_resources/arizona.json';
import partners from '@/content/assistance_resources/partners.json';
import { LOCATIONS } from '@/lib/locations';
import { assistanceAppliesToPlace, assistanceCostPurposes, type AssistancePurpose, type AssistanceResource, type AssistanceState, type AssistanceCounties } from './model';
export * from './model';

// These are committed public content collections; filtering never calls a funding or eligibility API.
export const ASSISTANCE_DIRECTORY_RESOURCES: readonly AssistanceResource[] = [
  ...california.resources, ...arizona.resources, ...partners.resources,
] as AssistanceResource[];
export const ASSISTANCE_DIRECTORY_PLACES = LOCATIONS.map(place => ({ state: place.state, name: place.name, counties: place.counties.map(county => county.name.replace(/ County$/, '')) }));
export const ASSISTANCE_DIRECTORY_COUNTIES: AssistanceCounties = {
  CA: [...new Set(LOCATIONS.filter(place => place.state === 'CA').flatMap(place => place.counties.map(county => county.name.replace(/ County$/, ''))))].sort(),
  AZ: [...new Set(LOCATIONS.filter(place => place.state === 'AZ').flatMap(place => place.counties.map(county => county.name.replace(/ County$/, ''))))].sort(),
};

/** Up to four relevant referrals, with reviewed sources first. City restrictions are never widened to a county. */
export function resourcesForPlace(state: AssistanceState, county = '', city = '', purpose?: AssistancePurpose): AssistanceResource[] {
  const rank = { verified: 0, partial: 1, unverified: 2, closed: 3 };
  return ASSISTANCE_DIRECTORY_RESOURCES.filter(resource => resource.verification_status !== 'closed'
    && assistanceAppliesToPlace(resource, state, county, city) && (!purpose || assistanceCostPurposes(resource).includes(purpose)))
    .sort((a, b) => rank[a.verification_status] - rank[b.verification_status]
      || Number(b.scope === 'city') - Number(a.scope === 'city') || a.name.localeCompare(b.name)).slice(0, 4);
}
