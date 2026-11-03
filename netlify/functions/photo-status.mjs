import { createStatusHandler } from '../../src/lib/photos/server.mjs';

export default createStatusHandler({ getSecret: () => process.env.ADMIN_SHARED_SECRET });
export const config = { path: '/api/place-photos/status' };
