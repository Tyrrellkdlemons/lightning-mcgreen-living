import { createHash, timingSafeEqual } from 'node:crypto';

export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const MAX_BODY_BYTES = MAX_PHOTO_BYTES + 32 * 1024;
export const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export class PhotoError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function json(value, status = 200, headers = {}) {
  return Response.json(value, { status, headers: { ...HEADERS, ...headers } });
}

export function failure(error) {
  if (error instanceof PhotoError) return json({ error: error.message }, error.status);
  // Do not expose provider exceptions, credentials, or internal storage paths.
  return json({ error: 'Photo storage is unavailable. Please try again later.' }, 503);
}

export function isPublishingConfigured(expected) {
  return typeof expected === 'string' && expected.length >= 32 && expected.length <= 512 &&
    !/change.?me|replace.?me|your[-_ ]?(admin|secret)|example|placeholder/i.test(expected);
}

export function createStatusHandler({ getSecret }) {
  return async (req) => {
    if (req.method !== 'GET') return json({ error: 'Use GET to check publishing setup.' }, 405, { Allow: 'GET' });
    try { return json({ configured: isPublishingConfigured(getSecret()) }); }
    catch { return json({ configured: false }); }
  };
}

export function authorize(req, expected) {
  if (!isPublishingConfigured(expected)) {
    throw new PhotoError(503, 'Photo publishing is not configured.');
  }
  const supplied = req.headers.get('x-admin-secret') || '';
  if (!supplied || supplied.length > 512 ||
      !timingSafeEqual(createHash('sha256').update(supplied).digest(), createHash('sha256').update(expected).digest())) {
    throw new PhotoError(401, 'The editor access key was not accepted.');
  }
  const origin = req.headers.get('origin');
  if (!origin || origin !== new URL(req.url).origin ||
      req.headers.get('sec-fetch-site') === 'cross-site') {
    throw new PhotoError(403, 'Publish photos from this site only.');
  }
}

/** Trust platform context only. An unknown context must never fall back to production. */
export function storeName(context, { write = false } = {}) {
  const deploy = context?.deploy;
  if (deploy?.context === 'production') {
    if (write && deploy.published !== true) {
      throw new PhotoError(403, 'Publish photos from the current live deployment.');
    }
    return 'place-photos-production';
  }
  if (['deploy-preview', 'branch-deploy'].includes(deploy?.context) &&
      /^[a-zA-Z0-9_-]{1,40}$/.test(deploy.id || '')) {
    return 'place-photos-preview-' + deploy.id;
  }
  if (deploy?.context === 'dev') return 'place-photos-local';
  throw new PhotoError(503, 'The photo storage environment is not configured.');
}

export async function readLimitedBody(req) {
  const declared = req.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY_BYTES)) {
    throw new PhotoError(413, 'Choose an image under 4 MB.');
  }
  if (!req.body) throw new PhotoError(400, 'Choose a photo to upload.');
  const reader = req.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new PhotoError(413, 'Choose an image under 4 MB.');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export function validateImage(bytes, claimedType) {
  if (!bytes.length || bytes.length > MAX_PHOTO_BYTES) throw new PhotoError(413, 'Choose an image under 4 MB.');
  const starts = (...prefix) => prefix.every((value, index) => bytes[index] === value);
  let actual;
  if (bytes.length >= 12 && starts(0xff, 0xd8, 0xff)) actual = 'image/jpeg';
  if (bytes.length >= 24 && starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) actual = 'image/png';
  if (bytes.length >= 16 && starts(0x52, 0x49, 0x46, 0x46) &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP' &&
      ['VP8 ', 'VP8L', 'VP8X'].includes(String.fromCharCode(...bytes.slice(12, 16)))) actual = 'image/webp';
  if (!TYPES.has(claimedType) || actual !== claimedType) {
    throw new PhotoError(415, 'Upload a JPEG, PNG, or WebP photo. The file contents must match its type.');
  }
  return actual;
}

export function validateFields(form, knownPlaceIds, targets) {
  const field = (key, max, required = false) => {
    const raw = form.get(key);
    if (typeof raw !== 'string') throw new PhotoError(400, 'Invalid ' + key + '.');
    const value = raw.trim();
    if (value.length > max || (required && !value) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) {
      throw new PhotoError(400, 'Check the ' + key + ' field.');
    }
    return value;
  };
  const placeId = field('placeId', 80, true);
  if (!knownPlaceIds.has(placeId)) throw new PhotoError(400, 'Choose a photo destination from the directory.');
  if (form.has('targetKind') && form.get('targetKind') !== targets?.get(placeId)?.kind) {
    throw new PhotoError(400, 'The photo destination type does not match this record.');
  }
  const id = field('uploadId', 36, true);
  if (!UUID.test(id)) throw new PhotoError(400, 'Invalid upload reference. Choose the photo again.');
  const sourceUrl = field('sourceUrl', 500);
  if (sourceUrl) {
    let url;
    try { url = new URL(sourceUrl); } catch { throw new PhotoError(400, 'Use a complete HTTPS source link.'); }
    if (url.protocol !== 'https:' || url.username || url.password) throw new PhotoError(400, 'Use a complete HTTPS source link.');
  }
  const rights = field('rights', 20, true);
  if (!['owned', 'permission', 'licensed'].includes(rights) || form.get('consent') !== 'yes') {
    throw new PhotoError(400, 'Confirm your permission to publish this photo.');
  }
  return {
    id: id.toLowerCase(), placeId,
    alt: field('alt', 240, true),
    caption: field('caption', 500),
    credit: field('credit', 160, true),
    sourceUrl, rights,
  };
}

export function publicPhoto(record, target) {
  return {
    id: record.id, placeId: record.placeId, alt: record.alt, caption: record.caption,
    credit: record.credit, sourceUrl: record.sourceUrl, rights: record.rights,
    createdAt: record.createdAt,
    url: '/place-photos/' + record.placeId + '/' + record.id,
    ...(target ? { target } : {}),
  };
}

export function createUploadHandler({ getStore, knownPlaceIds, targets, getSecret }) {
  return async (req, context) => {
    if (req.method !== 'POST') return json({ error: 'Use POST to publish a photo.' }, 405, { Allow: 'POST' });
    try {
      authorize(req, getSecret());
      const name = storeName(context, { write: true });
      const type = req.headers.get('content-type') || '';
      if (!type.toLowerCase().startsWith('multipart/form-data;')) throw new PhotoError(415, 'Submit the photo upload form.');
      const body = await readLimitedBody(req);
      let form;
      try { form = await new Response(body, { headers: { 'content-type': type } }).formData(); }
      catch { throw new PhotoError(400, 'The upload form could not be read.'); }
      const fields = validateFields(form, knownPlaceIds, targets);
      const file = form.get('photo');
      if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') throw new PhotoError(400, 'Choose a photo to upload.');
      const bytes = new Uint8Array(await file.arrayBuffer());
      const contentType = validateImage(bytes, file.type);
      const digest = createHash('sha256').update(JSON.stringify(fields)).update(bytes).digest('hex');
      const store = getStore({ name, consistency: 'strong' });
      const imageKey = 'images/' + fields.placeId + '/' + fields.id;
      const recordKey = 'published/' + fields.placeId + '/' + fields.id;
      const now = new Date().toISOString();
      const write = await store.set(imageKey, bytes.buffer, {
        onlyIfNew: true, metadata: { contentType, digest, createdAt: now },
      });
      const stored = await store.getMetadata(imageKey, { consistency: 'strong' });
      if (!stored || stored.metadata.digest !== digest) {
        throw new PhotoError(409, 'This upload reference belongs to another photo. Choose the file again.');
      }
      const record = { ...fields, contentType, createdAt: stored.metadata.createdAt };
      // A retry repairs an interrupted publication; it cannot overwrite an existing image or record.
      await store.setJSON(recordKey, record, { onlyIfNew: true });
      const published = await store.get(recordKey, { type: 'json', consistency: 'strong' });
      if (!published || published.id !== fields.id) throw new PhotoError(503, 'Publication could not be confirmed. Retry this upload.');
      return json({ photo: publicPhoto(published, targets?.get(fields.placeId)), duplicate: !write.modified, environment: context.deploy.context }, write.modified ? 201 : 200);
    } catch (error) { return failure(error); }
  };
}

export function createGalleryHandler({ getStore, knownPlaceIds, targets }) {
  return async (req, context) => {
    if (req.method !== 'GET') return json({ error: 'Use GET to view photos.' }, 405, { Allow: 'GET' });
    try {
      const query = new URL(req.url).searchParams;
      const placeId = query.get('placeId') || '';
      const pageIndex = Number(query.get('page') || '0');
      if (!Number.isSafeInteger(pageIndex) || pageIndex < 0 || pageIndex > 999) throw new PhotoError(400, 'Invalid gallery page.');
      if (!knownPlaceIds.has(placeId)) throw new PhotoError(404, 'Photo destination not found.');
      const store = getStore({ name: storeName(context), consistency: 'strong' });
      const keys = [];
      let truncated = false;
      let skipped = 0;
      const offset = pageIndex * 48;
      // Enumerate keys only as far as this page; read at most 48 metadata records.
      outer: for await (const page of store.list({ prefix: 'published/' + placeId + '/', paginate: true })) {
        for (const blob of page.blobs) {
          if (skipped++ < offset) continue;
          if (keys.length === 48) { truncated = true; break outer; }
          keys.push(blob.key);
        }
      }
      const records = await Promise.all(keys.map((key) => store.get(key, { type: 'json' })));
      const photos = records.filter((record) => record && record.placeId === placeId && UUID.test(record.id))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(record => publicPhoto(record, targets?.get(placeId)));
      return json({ photos, truncated, page: pageIndex, target: targets?.get(placeId), environment: context.deploy.context });
    } catch (error) { return failure(error); }
  };
}

export function createPhotoHandler({ getStore, knownPlaceIds }) {
  return async (req, context) => {
    if (!['GET', 'HEAD'].includes(req.method)) return json({ error: 'Use GET to view a photo.' }, 405, { Allow: 'GET, HEAD' });
    try {
      const { placeId, photoId } = context.params || {};
      if (!knownPlaceIds.has(placeId) || !UUID.test(photoId || '')) throw new PhotoError(404, 'Photo not found.');
      const store = getStore({ name: storeName(context), consistency: 'strong' });
      const record = await store.get('published/' + placeId + '/' + photoId, { type: 'json' });
      if (!record || record.id !== photoId || record.placeId !== placeId || !TYPES.has(record.contentType)) {
        throw new PhotoError(404, 'Photo not found.');
      }
      const image = await store.get('images/' + placeId + '/' + photoId, { type: 'arrayBuffer' });
      if (!image) throw new PhotoError(404, 'Photo not found.');
      return new Response(req.method === 'HEAD' ? null : image, {
        headers: {
          'Content-Type': record.contentType, 'Content-Length': String(image.byteLength),
          'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'; sandbox", 'Cross-Origin-Resource-Policy': 'same-origin',
        },
      });
    } catch (error) { return failure(error); }
  };
}
