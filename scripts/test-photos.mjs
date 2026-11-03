import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as nodeModule from 'node:module';
import vm from 'node:vm';
import { buildPhotoTargets, filterPhotoTargets } from '../src/lib/photos/targets.mjs';
import {
  authorize, storeName, readLimitedBody, validateImage, validateFields,
  createUploadHandler, createGalleryHandler, createPhotoHandler, createStatusHandler, MAX_BODY_BYTES,
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

// Exercise actual catalogs and editorial validation; only photo URL rendering is stubbed.
const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
async function evaluate(file, globals, names) {
  const source = await read(file);
  const js = typeof nodeModule.stripTypeScriptTypes === 'function'
    ? nodeModule.stripTypeScriptTypes(source, { mode: 'strip' })
    : (await import('typescript')).default.transpileModule(source, { compilerOptions: { module: 99, target: 9 } }).outputText;
  const code = js.replace(/^import[\s\S]*?;\s*/gm, '').replace(/\bexport\s+(?=const|let|function|class)/g, '');
  return vm.runInNewContext(code + ';({' + names.join(',') + '});', globals, { timeout: 1500 });
}
const cms = createRequire(import.meta.url)('../public/admin/content/cms.js');
const raw = JSON.parse(await read('src/lib/data/editor-content.json'));
const geo = await evaluate('src/lib/geofence/socal.ts', {}, ['isWithinCoverage']);
const editor = await evaluate('src/lib/data/editor-content.ts', { raw, ...cms, ...geo }, ['EDITOR_RENTALS', 'withEditorRecords']);
const { REAL_RENTALS } = await evaluate('src/lib/data/real-rentals.ts', { ...editor, rentalPhotos: () => ({ urls: [], alt: 'Fixture' }) }, ['REAL_RENTALS']);
const catalogInput = {
  places: cms.validatePlaces(JSON.parse(await read('src/lib/places/places.json'))),
  workbook: JSON.parse(await read('src/lib/data/generated/workbook-ranked-listings.json')),
  rentals: REAL_RENTALS,
  resources: JSON.parse(await read('src/lib/resources/catalog.json')).sources,
};
const originalCatalog = JSON.stringify(catalogInput);
const targets = buildPhotoTargets(catalogInput);
const targetMap = new Map(targets.map(target => [target.id, target]));
function targetStorage() { return Object.assign(fakeStorage(), { targets: targetMap, knownPlaceIds: new Set(targetMap.keys()) }); }
function targetFields(target, id = randomUUID()) {
  const form = fields(id); form.set('placeId', target.id); form.set('targetKind', target.kind); return form;
}
test('canonical target catalog covers every supported record once without source mutation', () => {
  const expected = [...catalogInput.places, ...catalogInput.workbook, ...catalogInput.rentals,
    ...catalogInput.resources.filter(item => item.category === 'property' && ['CA', 'AZ'].includes(item.state))];
  assert.equal(targets.length, expected.length); assert.equal(targetMap.size, expected.length);
  assert.deepEqual(new Set(targets.map(target => target.id)), new Set(expected.map(item => item.id)));
  for (const target of targets) {
    assert.match(target.href, /^\/(places|properties|apartments|townhomes|resources)\/[a-z0-9_/-]+$/);
    assert.ok(['CA', 'AZ'].includes(target.state));
  }
  assert.equal(JSON.stringify(catalogInput), originalCatalog);
  console.log('Photo targets: ' + targets.length + ' (' + ['city', 'workbook', 'rental', 'property-source'].map(kind => kind + '=' + targets.filter(t => t.kind === kind).length).join(', ') + ')');
});
test('colliding or unsafe IDs fail closed instead of selecting an ambiguous destination', () => {
  assert.throws(() => buildPhotoTargets({ ...catalogInput, workbook: [{ ...catalogInput.workbook[0], id: catalogInput.places[0].id }] }), /duplicate/);
  assert.throws(() => buildPhotoTargets({ places: [{ ...catalogInput.places[0], id: '../private' }] }), /Invalid/);
});
test('city and rental targets keep existing detail routes and truthful area precision', () => {
  for (const place of catalogInput.places) {
    assert.equal(targetMap.get(place.id).href, '/places/' + (place.state === 'CA' ? 'california' : 'arizona') + '/' + place.slug);
    assert.equal(targetMap.get(place.id).contextOnly, true);
  }
  for (const rental of catalogInput.rentals) {
    const target = targetMap.get(rental.id);
    assert.equal(target.href, '/' + (rental.unit_type === 'townhouse' ? 'townhomes' : 'apartments') + '/' + rental.id);
    assert.equal(target.contextOnly, !rental.meta || rental.meta.source === 'unverified' || rental.meta.trust_label === 'unverified');
  }
  assert.ok(targets.some(target => target.kind === 'rental' && target.contextOnly));
  assert.ok(targets.some(target => target.kind === 'rental' && !target.contextOnly));
});
test('destination search supports exact IDs and state names without dropping records', () => {
  assert.equal(filterPhotoTargets(targets, '  ').length, targets.length);
  for (const target of targets) assert.ok(filterPhotoTargets(targets, target.id).some(match => match.id === target.id));
  assert.ok(filterPhotoTargets(targets, 'arizona').length > 0);
  assert.ok(filterPhotoTargets(targets, 'arizona').every(target => target.state === 'AZ'));
  assert.equal(filterPhotoTargets(targets, 'no-such-fixture-destination').length, 0);
});
test('public setup status reveals only configuration, never credentials', async () => {
  const req = new Request('https://site.example/api/place-photos/status');
  for (const value of [undefined, '', 'short', 'replace-me-with-your-admin-secret-123456789', secret]) {
    const response = await createStatusHandler({ getSecret: () => value })(req);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { configured: value === secret });
  }
  assert.deepEqual(await (await createStatusHandler({ getSecret: () => { throw new Error(secret); } })(req)).json(), { configured: false });
  assert.equal((await createStatusHandler({ getSecret: () => secret })(new Request(req.url, { method: 'POST' }))).status, 405);
});
test('each target kind publishes and serves only its own photos with server-derived labels', async () => {
  const storage = targetStorage(); const photos = [];
  const representatives = ['city', 'workbook', 'rental', 'property-source'].map(kind => targets.find(target => target.kind === kind));
  for (const target of representatives) {
    const form = targetFields(target); form.set('targetLabel', 'Untrusted request label');
    const response = await createUploadHandler(storage)(request(form), production);
    assert.equal(response.status, 201);
    const { photo } = await response.json(); assert.deepEqual(photo.target, target); photos.push(photo);
    const gallery = await (await createGalleryHandler(storage)(new Request('https://site.example/gallery?placeId=' + target.id), production)).json();
    assert.deepEqual(gallery.target, target); assert.equal(gallery.photos.length, 1); assert.equal(gallery.photos[0].placeId, target.id);
    const image = await createPhotoHandler(storage)(new Request('https://site.example' + photo.url), { ...production, params: { placeId: target.id, photoId: photo.id } });
    assert.deepEqual(new Uint8Array(await image.arrayBuffer()), png);
  }
  assert.equal((await createPhotoHandler(storage)(new Request('https://site.example/photo'), { ...production, params: { placeId: representatives[1].id, photoId: photos[0].id } })).status, 404);
});
test('credentials, cross-site requests and conflicting target kinds reject before property storage', async () => {
  const storage = targetStorage(); const target = targets.find(target => target.kind === 'workbook');
  const upload = createUploadHandler(storage);
  assert.equal((await upload(request(targetFields(target), { 'x-admin-secret': 'wrong' }), production)).status, 401);
  assert.equal((await upload(request(targetFields(target), { 'sec-fetch-site': 'cross-site' }), production)).status, 403);
  const mismatch = targetFields(target); mismatch.set('targetKind', 'city');
  assert.equal((await upload(request(mismatch), production)).status, 400); assert.equal(storage.calls, 0);
});
test('legacy city retry stays identical after adding server-derived target metadata', async () => {
  const storage = fakeStorage(); const id = randomUUID();
  assert.equal((await createUploadHandler(storage)(request(fields(id)), production)).status, 201);
  storage.targets = targetMap;
  const response = await createUploadHandler(storage)(request(fields(id)), production);
  assert.equal(response.status, 200); assert.equal((await response.json()).photo.target.kind, 'city');
  assert.equal(storage.stores.get('place-photos-production').size, 2);
});
test('property retries repair interrupted publication while preserving content and preview isolation', async () => {
  const storage = targetStorage(); const target = targets.find(target => target.kind === 'property-source');
  const upload = createUploadHandler(storage); const id = randomUUID();
  storage.failNextPublication();
  assert.equal((await upload(request(targetFields(target, id)), preview)).status, 503);
  assert.equal((await upload(request(targetFields(target, id)), preview)).status, 200);
  const changed = targetFields(target, id); changed.set('caption', 'Changed');
  assert.equal((await upload(request(changed), preview)).status, 409);
  const gallery = createGalleryHandler(storage);
  assert.equal((await (await gallery(new Request('https://site.example/gallery?placeId=' + target.id), preview)).json()).photos.length, 1);
  assert.equal((await (await gallery(new Request('https://site.example/gallery?placeId=' + target.id), production)).json()).photos.length, 0);
});

// Run the actual editor component with a small lifecycle harness. No DOM, image
// decoder, remote request, credential, or file write is used by these fixtures.
let editorCode;
async function photoEditorHarness() {
  if (!editorCode) {
    const require = createRequire(import.meta.url);
    let ts;
    try { ts = require(process.env.TYPESCRIPT_PATH || 'typescript'); }
    catch { ts = require('C:/Users/TKDL/AppData/Roaming/npm/node_modules/typescript/lib/typescript.js'); }
    const source = await read('src/components/photos/PhotoManager.tsx');
    const result = ts.transpileModule(source, { fileName: 'PhotoManager.tsx', reportDiagnostics: true, compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
    } });
    assert.equal(result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
    editorCode = result.outputText;
  }
  const slots = [], pendingBitmaps = [], closedBitmaps = [], created = [], revoked = [];
  const window = new EventTarget();
  const timers = new Set();
  let cursor = 0, tree, mounted = true, nextTimer = 0, ignoredStateUpdates = 0;
  let pendingEffects = [];
  const jsx = (type, props) => ({ type, props: props || {} });
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, next => {
        if (!mounted) { ignoredStateUpdates++; return; }
        slots[index].value = typeof next === 'function' ? next(slots[index].value) : next;
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { ref: { current: initial } };
      return slots[index].ref;
    },
    useEffect(effect, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || !deps || deps.length !== previous.deps?.length || deps.some((v, i) => !Object.is(v, previous.deps[i]))) {
        slots[index] = { deps, cleanup: previous?.cleanup };
        pendingEffects.push(() => { slots[index].cleanup?.(); slots[index].cleanup = effect(); });
      }
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(editorCode, {
    module, exports: module.exports, window, Blob, AbortController,
    URL: {
      createObjectURL(blob) { assert.ok(blob instanceof Blob); const url = 'blob:fixture-' + (created.length + 1); created.push(url); return url; },
      revokeObjectURL(url) { revoked.push(url); },
    },
    createImageBitmap(file) { return new Promise(resolve => pendingBitmaps.push({ file, resolve })); },
    document: { createElement(tag) {
      assert.equal(tag, 'canvas');
      return { width: 0, height: 0, getContext: () => ({ drawImage() {} }), toBlob: callback => callback(new Blob([png], { type: 'image/webp' })) };
    } },
    fetch: async (url) => { assert.equal(url, '/api/place-photos/status'); return { ok: true, json: async () => ({ configured: true }) }; },
    setTimeout: () => { const id = ++nextTimer; timers.add(id); return id; },
    clearTimeout: id => timers.delete(id),
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
      if (name === 'next/image') return { default: 'img' };
      if (name === 'next/link') return { default: 'a' };
      if (name === 'lucide-react') return new Proxy({}, { get: (_, key) => key });
      if (name === '@/lib/photos/targets.mjs') return { filterPhotoTargets };
      if (name === './PlaceGallery') return { PlaceGallery: 'gallery' };
      throw new Error('Unexpected editor import: ' + name);
    },
  }, { timeout: 1500 });
  function nodes(node, predicate) {
    if (Array.isArray(node)) return node.flatMap(item => nodes(item, predicate));
    if (!node || typeof node !== 'object') return [];
    return [...(predicate(node) ? [node] : []), ...nodes(node.props.children, predicate)];
  }
  function text(node) {
    if (Array.isArray(node)) return node.map(text).join(' ');
    return node && typeof node === 'object' ? text(node.props.children) : node == null || node === false ? '' : String(node);
  }
  function render() {
    assert.ok(mounted);
    cursor = 0; pendingEffects = [];
    tree = module.exports.PhotoManager({ targets: [targets[0]] });
    for (const commit of pendingEffects) commit();
    return tree;
  }
  const settle = () => new Promise(resolve => setImmediate(resolve));
  render(); await settle(); render();
  return {
    created, revoked, closedBitmaps,
    isPreparing: () => text(tree).includes('Preparing your photograph...'),
    preview: () => nodes(tree, node => node.type === 'img' && node.props.alt === 'Preview of the photograph selected for publication')[0]?.props.src,
    select(file) {
      nodes(tree, node => node.type === 'input' && node.props.type === 'file')[0].props.onChange({ target: { files: file ? [file] : [] } });
      render();
    },
    async finish(index) {
      const pending = pendingBitmaps[index]; assert.ok(pending, 'Selected image has a pending decoder');
      pending.resolve({ width: 64, height: 48, close: () => closedBitmaps.push(index) });
      await settle();
      if (mounted) render();
    },
    pagehide() { window.dispatchEvent(new Event('pagehide')); render(); },
    unmount() {
      for (const slot of slots) slot.cleanup?.();
      mounted = false;
      assert.equal(timers.size, 0, 'Unmount cancels setup timers');
    },
    ignoredUpdates: () => ignoredStateUpdates,
  };
}
const imageSelection = label => ({ name: label + '.png', type: 'image/png', size: png.length });

test('photo preparation completing after unmount cannot allocate a leaked preview URL', async () => {
  const editor = await photoEditorHarness();
  editor.select(imageSelection('pending'));
  assert.equal(editor.isPreparing(), true);
  editor.unmount();
  await editor.finish(0);
  assert.equal(editor.created.length, 0);
  assert.equal(editor.ignoredUpdates(), 0, 'Cancelled work does not update an unmounted editor');
  assert.deepEqual(editor.closedBitmaps, [0], 'Image decoder resources still close');
});

test('photo preparation completing after pagehide is cancelled and the editor can recover', async () => {
  const editor = await photoEditorHarness();
  try {
    editor.select(imageSelection('hidden'));
    editor.pagehide();
    await editor.finish(0);
    assert.equal(editor.created.length, 0);
    assert.equal(editor.isPreparing(), false, 'A restored page must not remain stuck preparing a cancelled photo');
    editor.select(imageSelection('resumed'));
    await editor.finish(1);
    assert.equal(editor.preview(), editor.created[0]);
    assert.equal(editor.created.length, 1);
  } finally { editor.unmount(); }
  assert.deepEqual(editor.revoked, editor.created);
});

test('superseded photo selection cannot replace the latest preview and clearing revokes its URL', async () => {
  const editor = await photoEditorHarness();
  try {
    editor.select(imageSelection('first'));
    editor.select(imageSelection('second'));
    await editor.finish(0);
    assert.equal(editor.created.length, 0);
    assert.equal(editor.isPreparing(), true);
    await editor.finish(1);
    assert.equal(editor.created.length, 1);
    assert.equal(editor.preview(), editor.created[0]);
    assert.equal(editor.isPreparing(), false);
    editor.select(undefined);
    assert.equal(editor.preview(), undefined);
    assert.deepEqual(editor.revoked, editor.created);
  } finally { editor.unmount(); }
});

test('replacing and unmounting prepared photographs revokes each object URL once', async () => {
  const editor = await photoEditorHarness();
  editor.select(imageSelection('first')); await editor.finish(0);
  editor.select(imageSelection('second')); await editor.finish(1);
  assert.deepEqual(editor.revoked, [editor.created[0]]);
  editor.unmount();
  assert.equal(editor.created.length, 2);
  assert.deepEqual(editor.revoked, editor.created);
});
