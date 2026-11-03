import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import {
  authorize, storeName, readLimitedBody, validateImage, validateFields,
  createUploadHandler, createGalleryHandler, createPhotoHandler, MAX_BODY_BYTES,
} from '../src/lib/photos/server.mjs';

const secret = 'fixture-' + 'b7c8e9f0'.repeat(5);
const production = { deploy: { context: 'production', id: 'prod-id', published: true } };
const preview = { deploy: { context: 'deploy-preview', id: 'preview-id', published: false } };
const png = new Uint8Array(30);
png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const knownPlaceIds = new Set(['ca-los-angeles', 'az-phoenix']);
function fields(id = randomUUID()) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    uploadId: id, placeId: 'ca-los-angeles', alt: 'A public garden', caption: 'Garden in Los Angeles',
    credit: 'Fixture photographer', sourceUrl: 'https://example.com/photo', rights: 'owned', consent: 'yes',
  })) form.set(key, value);
  form.set('photo', new Blob([png], { type: 'image/png' }), 'garden.png');
  return form;
}
function request(form = fields(), overrides = {}) {
  return new Request('https://site.example/api/place-photos/upload', {
    method: 'POST', body: form,
    headers: { origin: 'https://site.example', 'x-admin-secret': secret, ...overrides },
  });
}
function fakeStorage() {
  const stores = new Map();
  let calls = 0;
  let failPublish = false;
  return {
    knownPlaceIds, getSecret: () => secret,
    get calls() { return calls; },
    stores,
    failNextPublication() { failPublish = true; },
    getStore({ name }) {
      calls += 1;
      if (!stores.has(name)) stores.set(name, new Map());
      const values = stores.get(name);
      return {
        async set(key, data, options = {}) {
          if (options.onlyIfNew && values.has(key)) return { modified: false };
          values.set(key, { data, metadata: options.metadata || {} }); return { modified: true };
        },
        async setJSON(key, data, options = {}) {
          if (failPublish) { failPublish = false; throw new Error('fixture interruption'); }
          if (options.onlyIfNew && values.has(key)) return { modified: false };
          values.set(key, { data: structuredClone(data), metadata: {} }); return { modified: true };
        },
        async getMetadata(key) {
          const found = values.get(key); return found ? { metadata: found.metadata, etag: 'fixture' } : null;
        },
        async get(key) { return values.get(key)?.data ?? null; },
        async *list({ prefix }) {
          yield { blobs: [...values.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key })) };
        },
      };
    },
  };
}

test('authentication fails closed for absent, short and default configuration', () => {
  for (const value of [undefined, '', 'short', 'replace-me-with-your-admin-secret-123456789']) {
    assert.throws(() => authorize(request(), value), (error) => error.status === 503);
  }
});
test('bad credentials and cross-origin requests fail before storage', async () => {
  const storage = fakeStorage();
  const upload = createUploadHandler(storage);
  assert.equal((await upload(request(fields(), { 'x-admin-secret': 'wrong' }), production)).status, 401);
  assert.equal((await upload(request(fields(), { origin: 'https://attacker.example' }), production)).status, 403);
  const missingOrigin = request(); missingOrigin.headers.delete('origin');
  assert.equal((await upload(missingOrigin, production)).status, 403);
  assert.equal(storage.calls, 0);
});
test('production and preview storage are separate and unknown context fails closed', () => {
  assert.equal(storeName(production), 'place-photos-production');
  assert.equal(storeName(preview), 'place-photos-preview-preview-id');
  assert.notEqual(storeName(preview), storeName({ deploy: { context: 'branch-deploy', id: 'other' } }));
  assert.throws(() => storeName({}), (error) => error.status === 503);
  assert.throws(() => storeName({ deploy: { context: 'deploy-preview' } }), (error) => error.status === 503);
  assert.throws(() => storeName({ deploy: { context: 'production', published: false } }, { write: true }), (error) => error.status === 403);
});
test('body limit rejects a declared oversize request without reading the stream', async () => {
  const req = request(); req.headers.set('content-length', String(MAX_BODY_BYTES + 1));
  await assert.rejects(readLimitedBody(req), (error) => error.status === 413);
});
test('body limit also rejects oversized chunked input without content-length', async () => {
  const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(MAX_BODY_BYTES + 1)); controller.close(); } });
  const req = new Request('https://site.example', { method: 'POST', body, duplex: 'half' });
  await assert.rejects(readLimitedBody(req), (error) => error.status === 413);
});
test('image contents must match a supported MIME signature', () => {
  assert.equal(validateImage(png, 'image/png'), 'image/png');
  assert.throws(() => validateImage(png, 'image/jpeg'), (error) => error.status === 415);
  assert.throws(() => validateImage(new TextEncoder().encode('<svg><script>alert(1)</script></svg>'), 'image/png'));
  assert.throws(() => validateImage(png, 'image/svg+xml'));
});
test('only known places and safe credit URLs are publishable', () => {
  const form = fields();
  assert.equal(validateFields(form, knownPlaceIds).placeId, 'ca-los-angeles');
  form.set('placeId', '../private'); assert.throws(() => validateFields(form, knownPlaceIds));
  form.set('placeId', 'az-phoenix'); form.set('sourceUrl', 'javascript:alert(1)');
  assert.throws(() => validateFields(form, knownPlaceIds));
  form.set('sourceUrl', 'https://user:password@example.com/photo'); assert.throws(() => validateFields(form, knownPlaceIds));
});
test('publication requires alt text, credit and explicit sharing consent', () => {
  for (const key of ['alt', 'credit', 'consent']) {
    const form = fields(); form.set(key, ''); assert.throws(() => validateFields(form, knownPlaceIds));
  }
});
test('upload, gallery and stable image read complete with matching bytes', async () => {
  const storage = fakeStorage();
  const response = await createUploadHandler(storage)(request(), production);
  assert.equal(response.status, 201);
  const { photo } = await response.json();
  assert.equal(photo.credit, 'Fixture photographer');
  assert.equal(photo.url, '/place-photos/ca-los-angeles/' + photo.id);
  const gallery = await createGalleryHandler(storage)(new Request('https://site.example/api/place-photos/gallery?placeId=ca-los-angeles'), production);
  assert.equal((await gallery.json()).photos.length, 1);
  const image = await createPhotoHandler(storage)(new Request('https://site.example' + photo.url), { ...production, params: { placeId: 'ca-los-angeles', photoId: photo.id } });
  assert.equal(image.status, 200); assert.equal(image.headers.get('content-type'), 'image/png');
  assert.deepEqual(new Uint8Array(await image.arrayBuffer()), png);
  assert.equal(image.headers.get('x-content-type-options'), 'nosniff');
});
test('retry of identical request creates exactly one image and record', async () => {
  const storage = fakeStorage(); const upload = createUploadHandler(storage); const id = randomUUID();
  assert.equal((await upload(request(fields(id)), production)).status, 201);
  const retry = await upload(request(fields(id)), production);
  assert.equal(retry.status, 200); assert.equal((await retry.json()).duplicate, true);
  assert.equal(storage.stores.get('place-photos-production').size, 2);
});
test('reusing a reference with changed metadata is a conflict, never an overwrite', async () => {
  const storage = fakeStorage(); const upload = createUploadHandler(storage); const id = randomUUID();
  await upload(request(fields(id)), production);
  const form = fields(id); form.set('caption', 'Changed caption');
  assert.equal((await upload(request(form), production)).status, 409);
  assert.equal(storage.stores.get('place-photos-production').get('published/ca-los-angeles/' + id).data.caption, 'Garden in Los Angeles');
});
test('retry repairs publication interrupted after image storage', async () => {
  const storage = fakeStorage(); const upload = createUploadHandler(storage); const id = randomUUID();
  storage.failNextPublication();
  assert.equal((await upload(request(fields(id)), production)).status, 503);
  const before = await createPhotoHandler(storage)(new Request('https://site.example/photo'), { ...production, params: { placeId: 'ca-los-angeles', photoId: id } });
  assert.equal(before.status, 404);
  assert.equal((await upload(request(fields(id)), production)).status, 200);
  assert.equal(storage.stores.get('place-photos-production').size, 2);
});
test('preview uploads never appear in the production gallery', async () => {
  const storage = fakeStorage();
  await createUploadHandler(storage)(request(), preview);
  const url = new Request('https://site.example/api/place-photos/gallery?placeId=ca-los-angeles');
  assert.equal((await (await createGalleryHandler(storage)(url, production)).json()).photos.length, 0);
  assert.equal((await (await createGalleryHandler(storage)(url, preview)).json()).photos.length, 1);
});
test('read endpoints reject arbitrary keys, unknown cities and unsupported methods', async () => {
  const storage = fakeStorage(); const gallery = createGalleryHandler(storage); const image = createPhotoHandler(storage);
  assert.equal((await gallery(new Request('https://site.example/api/place-photos/gallery?placeId=unknown'), production)).status, 404);
  assert.equal((await image(new Request('https://site.example/photo'), { ...production, params: { placeId: 'ca-los-angeles', photoId: '../secrets' } })).status, 404);
  assert.equal((await createUploadHandler(storage)(new Request('https://site.example/upload'), production)).status, 405);
  assert.equal((await gallery(new Request('https://site.example/gallery', { method: 'POST' }), production)).status, 405);
});
test('unexpected storage failures are sanitized and not cached', async () => {
  const storage = { ...fakeStorage(), getStore() { throw new Error('provider credential detail'); } };
  const response = await createUploadHandler(storage)(request(), production);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(JSON.stringify(await response.json()).includes('credential'), false);
});

test('gallery pagination makes every published photo reachable after 48 records', async () => {
  const storage = fakeStorage();
  const upload = createUploadHandler(storage);
  const expected = new Set();
  for (let i = 0; i < 51; i++) {
    const id = randomUUID(); expected.add(id);
    assert.equal((await upload(request(fields(id)), preview)).status, 201);
  }
  const gallery = createGalleryHandler(storage);
  const first = await (await gallery(new Request('https://site.example/api/place-photos/gallery?placeId=ca-los-angeles'), preview)).json();
  const second = await (await gallery(new Request('https://site.example/api/place-photos/gallery?placeId=ca-los-angeles&page=1'), preview)).json();
  assert.equal(first.photos.length, 48); assert.equal(first.truncated, true);
  assert.equal(second.photos.length, 3); assert.equal(second.truncated, false);
  assert.deepEqual(new Set([...first.photos, ...second.photos].map(photo => photo.id)), expected);
  assert.equal((await gallery(new Request('https://site.example/api/place-photos/gallery?placeId=ca-los-angeles&page=-1'), preview)).status, 400);
});
