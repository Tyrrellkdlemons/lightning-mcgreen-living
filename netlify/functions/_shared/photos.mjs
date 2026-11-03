import { getStore } from '@netlify/blobs';
import { PHOTO_TARGET_MAP } from '../../../src/lib/photos/catalog.ts';

export const dependencies = {
  getStore,
  knownPlaceIds: new Set(PHOTO_TARGET_MAP.keys()),
  targets: PHOTO_TARGET_MAP,
  getSecret: () => process.env.ADMIN_SHARED_SECRET,
};
