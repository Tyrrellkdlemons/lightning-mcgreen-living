import { getStore } from '@netlify/blobs';
import places from '../../../src/lib/places/places.json' with { type: 'json' };

export const dependencies = {
  getStore,
  knownPlaceIds: new Set(places.map((place) => place.id)),
  getSecret: () => process.env.ADMIN_SHARED_SECRET,
};
