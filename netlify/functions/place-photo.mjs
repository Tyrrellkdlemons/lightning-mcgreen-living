import { createPhotoHandler } from '../../src/lib/photos/server.mjs';
import { dependencies } from './_shared/photos.mjs';
export default createPhotoHandler(dependencies);
export const config = { path: '/place-photos/:placeId/:photoId' };
