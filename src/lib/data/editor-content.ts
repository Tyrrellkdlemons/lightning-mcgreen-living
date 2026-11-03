import raw from './editor-content.json';
import type { Dealer, RentalListing, VehicleListing } from '@/types';
import { isWithinCoverage } from '@/lib/geofence/socal';
import { validateEditorContent, appendUnique } from '../../../public/admin/content/cms';

// The browser editor, Node fixtures and this render path use the same validators.
interface EditorContent {
  schema_version: 1;
  rentals: Omit<RentalListing, 'id'>[];
  dealers: Omit<Dealer, 'id'>[];
  vehicles: (Omit<VehicleListing, 'id' | 'dealer_id'> & { dealer_external_id: string })[];
}
const content = validateEditorContent(raw) as EditorContent;
for (const row of [...content.rentals, ...content.dealers]) {
  if (!isWithinCoverage(row)) throw new Error('Editor content outside California/Arizona coverage: ' + row.external_id);
}

export const EDITOR_RENTALS: RentalListing[] = content.rentals.map((row) => ({
  ...row, id: 'cms-rental-' + row.external_id,
}));
export const EDITOR_DEALERS: Dealer[] = content.dealers.map((row) => ({
  ...row, id: 'cms-dealer-' + row.external_id,
}));
export const EDITOR_VEHICLES: VehicleListing[] = content.vehicles.map(({ dealer_external_id, ...row }) => ({
  ...row, id: 'cms-vehicle-' + row.vin.toLowerCase(), dealer_id: 'cms-dealer-' + dealer_external_id,
}));

// Reject collisions instead of overwriting original inventory.
export function withEditorRecords<T>(base: T[], added: T[], key: keyof T, label: string): T[] {
  return appendUnique(base, added, key, label) as T[];
}
