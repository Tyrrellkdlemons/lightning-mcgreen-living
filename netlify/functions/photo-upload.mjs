import { createUploadHandler } from '../../src/lib/photos/server.mjs';
import { dependencies } from './_shared/photos.mjs';
export default createUploadHandler(dependencies);
export const config = { path: '/api/place-photos/upload' };
