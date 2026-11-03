import { createGalleryHandler } from '../../src/lib/photos/server.mjs';
import { dependencies } from './_shared/photos.mjs';
export default createGalleryHandler(dependencies);
export const config = { path: '/api/place-photos/gallery' };
