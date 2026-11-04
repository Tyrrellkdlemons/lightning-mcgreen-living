export type TourEvidence = {provider: 'youtube' | 'matterport'; url: string; title: string; officialSourceUrl: string; sourcePublishedAt?: string; embedStatus: 'supported-public-player' | 'link-only'};
export type PropertyEvidenceRecord = {
 propertyIds: string[]; name: string; state: string; propertyType?: 'Apartment' | 'Townhouse'; address?: string; officialUrl: string; galleryUrl: string;
 availability: {dataSourceUrl?: string; responseDate?: string | null; sourceUrl: string; observedAt: string; status: 'unit-observations' | 'plan-counts' | 'plan-observations' | 'unconfirmed'; summary: string; limitations: string | string[]; sampleOnly?: boolean;
 units?: {unit: string; plan: string; beds?: string | number; baths?: string | number; sqft?: string | number; availableLabel: string; availableDate?: string; sourceAvailableDate?: string; labelMethod?: string; rent?: string | number; rentBasis?: string}[];
 plans?: {plan: string; beds?: string | number; baths?: string | number; sqft?: string | number; availableUnits?: number; availableLabel?: string; sourceUrl?: string; startingRent?: string | number; rentBasis?: string}[]};
 photos?: {thumbnailUrl?: string; url: string; title: string; sourceUrl: string; observedAt: string; scope: string}[];
 tours: TourEvidence[]; photoReuse: {status: string; termsUrl?: string; note: string};
};
export const EVIDENCE_MAX_AGE_MS = 48 * 60 * 60 * 1000;
export function observationExpired(observedAt: string, now: number) {
 const observed = Date.parse(observedAt); return !Number.isFinite(observed) || observed > now || now - observed >= EVIDENCE_MAX_AGE_MS;
}
export function youtubeEmbed(tour: TourEvidence): string | null {
 if(tour.provider !== 'youtube' || tour.embedStatus !== 'supported-public-player') return null;
 try { const u = new URL(tour.url); const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : ['youtube.com','www.youtube.com'].includes(u.hostname) && u.pathname === '/watch' ? u.searchParams.get('v') : null;
 return u.protocol === 'https:' && id && /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
 } catch { return null; }
}
