import { PLACES } from '../places';
import { WORKBOOK_RANKED_LISTINGS } from '../data/workbook-ranked-listings';
import { REAL_RENTALS } from '../data/real-rentals';
import { RESOURCE_SOURCES } from '../resources';
import { buildPhotoTargets } from './targets.mjs';
import type { PhotoTarget } from './types';

// Shared by the server-rendered editor and Functions, never constructed from a request.
export const PHOTO_TARGETS = buildPhotoTargets({
  places: PLACES, workbook: WORKBOOK_RANKED_LISTINGS, rentals: REAL_RENTALS, resources: RESOURCE_SOURCES,
}) as PhotoTarget[];
export const PHOTO_TARGET_MAP = new Map(PHOTO_TARGETS.map(target => [target.id, target]));
