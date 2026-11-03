import { evidenceFor } from '@/lib/property-evidence';
import { PropertyEvidenceView } from './PropertyEvidenceView';
export function PropertyEvidence({ propertyId }: { propertyId: string }) {
 const record = evidenceFor(propertyId);
 return record ? <PropertyEvidenceView key={propertyId} propertyId={propertyId} record={record} /> : null;
}
