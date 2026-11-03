import { PROPERTY_EVIDENCE, observationExpired } from '@/lib/property-evidence';
import { RESOURCE_SOURCES } from '@/lib/resources';
import { WORKBOOK_RANKED_LISTINGS } from '@/lib/data/workbook-ranked-listings';
import { REAL_RENTALS } from '@/lib/data/real-rentals';
import { LOCATIONS, normalizeLocationText, type LocationRecord } from '@/lib/locations';
import saleData from './sale-observations.json';

export type HomeIntent = 'rent' | 'buy';
export type HomePhoto = { url: string; title: string; sourceUrl: string; visuallyReviewed?: boolean };
export type HomeListing = {
  id: string; name: string; intent: HomeIntent; city: string; state: string; address: string;
  propertyType: string; beds?: number; baths?: number; sqft?: number; price?: number; priceLabel: string;
  observedAt: string; availabilityLabel: string; datedEvidence: boolean; advertisedNow: boolean;
  detailHref: string; sourceUrl: string; publisher: string; photos: HomePhoto[]; unit?: string; plan?: string;
};
export type HomeFilters = { intent?: string; state?: string; city?: string; county?: string; q?: string; type?: string; beds?: string; max?: string; evidence?: string; photos?: string; sort?: string };
const number = (v: unknown) => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(String(v).replace(/[$,]/g, '').split(/[–—]/)[0]);
  return Number.isFinite(n) ? n : undefined;
};
const identity = (value: string) => normalizeLocationText(value).replace(/\s+(city|town|cdp)$/, '');
export const SALE_OBSERVATIONS = saleData.records as HomeListing[];
export function rentalObservations(): HomeListing[] {
  return PROPERTY_EVIDENCE.flatMap(record => {
    const canonicalId = record.propertyIds[0];
    const source = RESOURCE_SOURCES.find(s => record.propertyIds.includes(s.id));
    const workbook = WORKBOOK_RANKED_LISTINGS.find(s => record.propertyIds.includes(s.id));
    const rental = REAL_RENTALS.find(s => record.propertyIds.includes(s.id));
    const city = source?.city || workbook?.city || rental?.city || '';
    const detailHref = canonicalId.startsWith('resource-') ? `/resources/${canonicalId}` : canonicalId.startsWith('wb-') ? `/properties/${canonicalId}` : rental?.unit_type === 'townhouse' ? `/townhomes/${canonicalId}` : `/apartments/${canonicalId}`;
    const rows = record.availability.units?.length ? record.availability.units : record.availability.plans?.length ? record.availability.plans.map(p => ({...p,unit:undefined,rent:p.startingRent,availableLabel:p.availableLabel??'Plan inventory observed'})) : [undefined];
    return rows.map(unit => ({
      id: `${canonicalId}${unit ? `:${unit.unit ?? `plan-${unit.plan}`}` : ''}`, name: record.name, intent: 'rent' as const,
      city, state: record.state, address: record.address ?? `${city}, ${record.state}`,
      propertyType: rental?.unit_type === 'townhouse' ? 'Townhouse' : rental ? 'Apartment' : 'Rental community',
      beds: number(unit?.beds), baths: number(unit?.baths), sqft: number(unit?.sqft), price: number(unit?.rent),
      priceLabel: unit?.rent ? `${unit.rent} / month` : 'Ask for current rent',
      observedAt: record.availability.observedAt,
      availabilityLabel: unit?.availableLabel ?? 'Unit availability unconfirmed',
      datedEvidence: !!unit, advertisedNow: !!unit && /^(available|available now|now|immediate)$/i.test(unit.availableLabel.trim()),
      detailHref, sourceUrl: record.availability.sourceUrl, publisher: source?.publisher || record.name, unit: unit?.unit, plan: unit?.plan,
      photos: (record.photos ?? []).filter(p => p.thumbnailUrl).map(p => ({url: p.thumbnailUrl!, title: p.title, sourceUrl:p.sourceUrl, visuallyReviewed:true})),
    }));
  });
}
export function filterHomes(listings: HomeListing[], f: HomeFilters, now = Date.now()): HomeListing[] {
  const city = LOCATIONS.find(p => p.id === f.city);
  if (f.city && !city) return [];
  const beds = number(f.beds), max = number(f.max);
  const placesInCounty = f.county ? new Set(LOCATIONS.filter(p => (!f.state || p.state === f.state) && p.counties.some(c => c.geoid === f.county)).map(p => `${p.state}:${identity(p.name)}`)) : null;
  const rows = listings.filter(r => r.intent === (f.intent === 'buy' ? 'buy' : 'rent')
    && (!f.state || r.state === f.state)
    && (!city || (r.state === city.state && identity(r.city) === identity(city.name)))
    && (!placesInCounty || placesInCounty.has(`${r.state}:${identity(r.city)}`))
    && (city || !f.q || identity(`${r.name} ${r.city} ${r.address}`).includes(identity(f.q)))
    && (!f.type || r.propertyType === f.type)
    && (beds === undefined || (r.beds !== undefined && r.beds >= beds))
    && (max === undefined || (r.price !== undefined && r.price <= max))
    && (f.evidence !== 'recent' || (r.datedEvidence && !observationExpired(r.observedAt, now)))
    && (f.evidence !== 'now' || (r.advertisedNow && !observationExpired(r.observedAt, now)))
    && (f.photos !== 'yes' || r.photos.length > 0));
  return rows.sort((a,b) => f.sort === 'price-low' ? (a.price ?? Infinity)-(b.price ?? Infinity) : f.sort === 'price-high' ? (b.price ?? -Infinity)-(a.price ?? -Infinity) : Date.parse(b.observedAt)-Date.parse(a.observedAt) || a.name.localeCompare(b.name));
}
export function cityProviderLinks(place: LocationRecord, intent: HomeIntent) {
  const term = `${place.name}, ${place.state}`;
  const slug = `${place.name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${place.state.toLowerCase()}`;
  return [
    {label: intent === 'buy' ? 'Realtor.com city sale search' : 'Apartments.com city rental search', url: intent === 'buy' ? `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(place.name.replace(/ /g,'-'))}_${place.state}` : `https://www.apartments.com/${slug}/`},
    {label: intent === 'buy' ? 'HomePath property finder' : 'Search rental providers on Maps', url: intent === 'buy' ? 'https://homepath.fanniemae.com/property-finder' : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`apartments for rent ${term}`)}`},
    {label:'Explore this city on Maps',url:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(term)}`},
  ];
}
