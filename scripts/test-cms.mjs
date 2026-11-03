import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as nodeModule from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const cms = require('../public/admin/content/cms.js');
const read = (file) => readFile(new URL('../' + file, import.meta.url), 'utf8');
const plain = (value) => JSON.parse(JSON.stringify(value));
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS ' + name); }
async function compile(file) {
  const source = await read(file);
  const code = typeof nodeModule.stripTypeScriptTypes === 'function'
    ? nodeModule.stripTypeScriptTypes(source, { mode: 'strip' })
    : (await import('typescript')).default.transpileModule(source, { compilerOptions: { module: 99, target: 9 } }).outputText;
  return code.replace(/^import[\s\S]*?;\s*/gm, '').replace(/\bexport\s+(?=const|let|function|class)/g, '');
}
async function evaluate(file, globals, names) {
  return vm.runInNewContext(await compile(file) + '\n;({' + names.join(',') + '});', globals, { timeout: 1500 });
}
const geo = await evaluate('src/lib/geofence/socal.ts', {}, ['isWithinCoverage','COVERAGE_COUNTIES']);
const places = JSON.parse(await read('src/lib/places/places.json'));
const committed = JSON.parse(await read('src/lib/data/editor-content.json'));
check('committed inventory passes the schema with empty or populated lists', () => {
  const validated = cms.validateEditorContent(committed);
  assert.equal(validated.schema_version, 1);
  for (const kind of ['rentals', 'dealers', 'vehicles']) assert.equal(validated[kind].length, committed[kind].length);
});
check('CMS county catalog matches the existing intake source', () => {
  assert.deepEqual(cms.COUNTIES, plain(geo.COVERAGE_COUNTIES));
});
check('city formatter round-trips the existing top-level array', () => {
  const formatter = cms.placesFormatter();
  assert.deepEqual(JSON.parse(formatter.toFile(formatter.fromFile(JSON.stringify(places)))), places);
});
check('new city IDs derive from state and slug; existing IDs stay stable', () => {
  const formatter = cms.placesFormatter();
  const wrapper = formatter.fromFile(JSON.stringify(places));
  wrapper.places.push({ ...places[0], id: '', slug: 'test-city', name: 'Test city' });
  assert.equal(JSON.parse(formatter.toFile(wrapper)).at(-1).id, places[0].state.toLowerCase() + '-test-city');
  wrapper.places[0].slug = 'changed-slug';
  assert.throws(() => formatter.toFile(wrapper), /ID must match/);
});
check('existing city guides cannot be removed through the formatter', () => {
  const formatter = cms.placesFormatter();
  const wrapper = formatter.fromFile(JSON.stringify(places));
  wrapper.places.pop();
  assert.throws(() => formatter.toFile(wrapper), /cannot be removed/);
});

const meta = { source: 'unverified', source_url: 'https://example.invalid/source', confidence_score: 0,
  last_seen_at: '2026-10-20T10:30:00-07:00', last_verified_at: '2026-10-20T10:30:00-07:00',
  data_freshness_status: 'manual-review-needed', trust_label: 'unverified' };
const location = { address_line: 'Synthetic fixture address', city: 'Tucson', county: 'Pima', state: 'AZ',
  zip: '85701', lat: 32.22, lng: -110.97 };
const fixture = { schema_version: 1,
  rentals: [{ external_id: 'fixture-rental', property_name: 'Fixture only', unit_type: 'apartment', ...location,
    manager: 'Fixture manager', application_platform: 'Unknown', application_url: 'https://example.invalid/apply',
    official_property_url: 'https://example.invalid/property', min_rent: 1000, max_rent: 1200,
    beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 1, meta }],
  dealers: [{ external_id: 'fixture-dealer', dealer_name: 'Fixture dealer', ...location,
    phone: '555-0100', website: 'https://example.invalid/dealer', meta }],
  vehicles: [{ vin: '1TEST234567890123', dealer_external_id: 'fixture-dealer', year: 2020, make: 'Fixture',
    model: 'Only', mileage: 100, price: 10000, condition: 'used', availability_status: 'pending',
    listing_url: 'https://example.invalid/vehicle', meta }],
};
check('valid CA/AZ supplemental inventory passes', () => assert.deepEqual(cms.validateEditorContent(fixture), fixture));
const rejected = [
  ['unsupported state', (x) => { x.rentals[0].state = 'NV'; }],
  ['wrong-state county', (x) => { x.rentals[0].county = 'Los Angeles'; }],
  ['coordinates outside state', (x) => { x.rentals[0].lng = -122; }],
  ['negative rent', (x) => { x.rentals[0].min_rent = -1; }],
  ['reversed rent range', (x) => { x.rentals[0].min_rent = 2000; }],
  ['numeric strings', (x) => { x.rentals[0].min_rent = '1000'; }],
  ['duplicate rental references', (x) => { x.rentals.push(x.rentals[0]); }],
  ['duplicate VINs', (x) => { x.vehicles.push(x.vehicles[0]); }],
  ['unknown dealer', (x) => { x.vehicles[0].dealer_external_id = 'missing'; }],
  ['unsafe link scheme', (x) => { x.vehicles[0].listing_url = 'javascript:alert(1)'; }],
  ['credentialed URL', (x) => { x.dealers[0].website = 'https://user:secret@example.invalid'; }],
  ['missing provenance', (x) => { delete x.vehicles[0].meta; }],
  ['invented verification date', (x) => { x.vehicles[0].meta.last_verified_at = '2099-01-01T00:00:00Z'; }],
  ['unverified source with verified trust', (x) => { x.vehicles[0].meta.trust_label = 'official'; }],
  ['unsupported fields', (x) => { x.vehicles[0].private_notes = 'not allowed'; }],
  ['invalid VIN', (x) => { x.vehicles[0].vin = 'I'.repeat(17); }],
  ['wrong optional URL type', (x) => { x.dealers[0].financing_application_url = false; }],
];
for (const [name, mutate] of rejected) check('reject ' + name, () => {
  const copy = structuredClone(fixture); mutate(copy);
  assert.throws(() => cms.validateEditorContent(copy));
});
check('empty optional widgets become omitted fields, not unknown fees of zero', () => {
  const copy = structuredClone(fixture);
  copy.rentals[0].deposit = null;
  copy.dealers[0].financing_application_url = '';
  const normalized = cms.validateEditorContent(copy);
  assert.equal('deposit' in normalized.rentals[0], false);
  assert.equal('financing_application_url' in normalized.dealers[0], false);
});
check('supplements cannot overwrite existing identifiers', () => {
  assert.throws(() => cms.appendUnique([{ vin: 'same' }], [{ vin: 'same' }], 'vin', 'Vehicles'), /already exists/);
});

const adapterGlobals = { raw: fixture, ...cms, isWithinCoverage: geo.isWithinCoverage };
const integrated = await evaluate('src/lib/data/editor-content.ts', adapterGlobals, ['EDITOR_RENTALS','EDITOR_DEALERS','EDITOR_VEHICLES','withEditorRecords']);
const photoStub = () => ({ urls: ['illustration','context','illustration'], alt: 'Test fallback', credit_label: 'Fixture', credit_url: 'https://example.invalid' });
const rentals = await evaluate('src/lib/data/real-rentals.ts', { ...integrated, rentalPhotos: photoStub }, ['BASE_RENTALS','REAL_RENTALS']);
const extras = await evaluate('src/lib/data/real-vehicles-extra.ts', {}, ['VEHICLES_EXTRA']);
const vehicles = await evaluate('src/lib/data/real-vehicles.ts', { ...integrated, ...extras, vehiclePhotosForListing: photoStub }, ['BASE_DEALERS','BASE_VEHICLES','REAL_DEALERS','REAL_VEHICLES']);
check('actual rental export appends a validated record while preserving original rows', () => {
  assert.equal(rentals.REAL_RENTALS.length, rentals.BASE_RENTALS.length + 1);
  assert.deepEqual(plain(rentals.REAL_RENTALS.slice(0, -1)), plain(rentals.BASE_RENTALS));
  assert.equal(rentals.REAL_RENTALS.at(-1).id, 'cms-rental-fixture-rental');
  assert.equal(rentals.REAL_RENTALS.at(-1).state, 'AZ');
  assert.ok(rentals.REAL_RENTALS.at(-1).photos);
});
check('actual vehicle export preserves original inventory and resolves the supplemental dealer', () => {
  assert.deepEqual(plain(vehicles.REAL_VEHICLES.slice(0, -1)), plain(vehicles.BASE_VEHICLES));
  assert.deepEqual(plain(vehicles.REAL_DEALERS.slice(0, -1)), plain(vehicles.BASE_DEALERS));
  const added = vehicles.REAL_VEHICLES.at(-1);
  const dealer = vehicles.REAL_DEALERS.find((item) => item.id === added.dealer_id);
  assert.equal(dealer.external_id, 'fixture-dealer');
  assert.equal(dealer.state, 'AZ');
  assert.equal(added.availability_status, 'pending');
});
check('actual adapter retains validated geographic fields', () => {
  assert.equal(geo.isWithinCoverage(integrated.EDITOR_RENTALS[0]), true);
});

const badAdapterInput = structuredClone(fixture);
badAdapterInput.rentals[0].county = 'Los Angeles';
await assert.rejects(evaluate('src/lib/data/editor-content.ts',
  { ...adapterGlobals, raw: badAdapterInput }, ['EDITOR_RENTALS']), /county does not belong/);
checks++; console.log('PASS actual adapter rejects invalid content before rendering');

const config = JSON.parse(await read('public/admin/content/config.yml')); // JSON is valid YAML.
check('CMS writes real files using review drafts and no publishing control', () => {
  assert.equal(config.backend.name, 'github');
  assert.equal(config.publish_mode, 'editorial_workflow');
  for (const collection of config.collections) assert.equal(collection.publish, false);
  assert.deepEqual(config.collections.flatMap((item) => item.files.map((file) => file.file)),
    ['src/lib/places/places.json','src/lib/data/editor-content.json']);
  assert.equal(config.media_library.name, 'managed-place-photos');
});
const formats = new Map();
let media;
let initialized = 0;
let ready;
const browser = { CMS: {
  registerCustomFormat: (name, extension, formatter) => formats.set(name, formatter),
  registerMediaLibrary: (library) => { media = library; },
  init: () => { initialized++; },
} };
const browserContext = { URL, window: browser, document: {
  currentScript: { getAttribute: () => 'true' },
  addEventListener: (name, callback) => { ready = callback; },
  getElementById: () => ({ textContent: '' }),
} };
const browserLocation = { href: 'https://example.invalid/admin/content/' };
Object.defineProperty(browserContext, 'location', { value: browserLocation, writable: false, configurable: false });
vm.runInNewContext(await read('public/admin/content/cms.js'), browserContext, { timeout: 1500 });
check('editor helpers do not redeclare or overwrite browser globals', () => {
  assert.equal(browserContext.location, browserLocation);
  assert.equal(browserContext.validateEditorContent, undefined);
});
ready();
check('browser bootstrap registers real formatters and disables Git media uploads', () => {
  assert.equal(browser.CMS_MANUAL_INIT, true);
  assert.equal(initialized, 1);
  assert.ok(formats.has('places-array') && formats.has('inventory-json'));
  assert.equal(media.init().enableStandalone(), false);
  assert.throws(() => media.init().show(), /admin\/photos/);
});
console.log('PASS: ' + checks + ' content-editor checks. OAuth, real browser and remote publishing NOT_RUN.');
