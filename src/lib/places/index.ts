import raw from './places.json';

export type StateCode = 'CA' | 'AZ';
export interface Place {
  id: string; slug: string; name: string; state: StateCode; county: string;
  region: string; description: string; planningTips: string[];
  sourceUrl: string; sourcePublisher: string; contentKind: string;
}
export const PLACES = raw as Place[];
export const STATES = {
  CA: { name: 'California', slug: 'california', description: 'From the North Coast to San Diego, find a starting point for your next move.', resourceUrl: 'https://211ca.org/find-your-local-211/', resourceName: 'Find your local California 211' },
  AZ: { name: 'Arizona', slug: 'arizona', description: 'From Northern Arizona to the southern border, explore your next place to call home.', resourceUrl: 'https://211arizona.org/help/housing-shelter/emergency-shelters/', resourceName: '211 Arizona housing and shelter help' },
} as const;
export function stateSlug(state: StateCode) { return STATES[state].slug; }
export function stateCode(slug: string): StateCode | undefined {
  return slug === 'california' ? 'CA' : slug === 'arizona' ? 'AZ' : undefined;
}
export function getPlace(state: string, city: string) {
  const code = stateCode(state);
  return PLACES.find((place) => place.state === code && place.slug === city);
}
export function placeUrl(place: Place) { return `/places/${stateSlug(place.state)}/${place.slug}`; }
