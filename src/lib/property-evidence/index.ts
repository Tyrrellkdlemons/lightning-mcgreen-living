import data from './records.json';
import type { PropertyEvidenceRecord } from './presentation';
export * from './presentation';
export const PROPERTY_EVIDENCE = data.records as PropertyEvidenceRecord[];
export function evidenceFor(id: string) { return PROPERTY_EVIDENCE.find(record => record.propertyIds.includes(id)); }
