import data from './records.json';
export type TourEvidence = {provider: 'youtube' | 'matterport'; url: string; title: string; officialSourceUrl: string; sourcePublishedAt?: string; embedStatus: 'supported-public-player' | 'link-only'};
export type PropertyEvidenceRecord = {
 propertyIds: string[]; name: string; state: string; address?: string; officialUrl: string; galleryUrl: string;
 availability: {sourceUrl: string; observedAt: string; status: 'unit-observations' | 'plan-counts' | 'unconfirmed'; summary: string; limitations: string | string[]; sampleOnly?: boolean;
 units?: {unit: string; plan: string; beds?: string | number; baths?: string | number; sqft?: string | number; availableLabel: string; rent?: string | number; rentBasis?: string}[];
 plans?: {plan: string; beds?: string | number; baths?: string | number; sqft?: string | number; availableUnits: number; startingRent?: string | number; rentBasis?: string}[]};
 tours: TourEvidence[]; photoReuse: {status: string; termsUrl?: string; note: string};
};
export const PROPERTY_EVIDENCE = data.records as PropertyEvidenceRecord[];
export const EVIDENCE_MAX_AGE_MS = 48 * 60 * 60 * 1000;
export function evidenceFor(id: string) { return PROPERTY_EVIDENCE.find(record => record.propertyIds.includes(id)); }
export function observationExpired(observedAt: string, now: number) {
 const observed = Date.parse(observedAt); return !Number.isFinite(observed) || observed > now || now - observed >= EVIDENCE_MAX_AGE_MS;
}
export function youtubeEmbed(tour: TourEvidence): string | null {
 if(tour.provider !== 'youtube' || tour.embedStatus !== 'supported-public-player') return null;
 try { const u = new URL(tour.url); const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : ['youtube.com','www.youtube.com'].includes(u.hostname) && u.pathname === '/watch' ? u.searchParams.get('v') : null;
 return u.protocol === 'https:' && id && /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
 } catch { return null; }
}
