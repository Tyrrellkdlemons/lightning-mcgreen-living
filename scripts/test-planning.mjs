import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as nodeModule from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const read = (file) => readFile(new URL('../' + file, import.meta.url), 'utf8');
async function evaluate(file, globals, names) {
  const source = await read(file);
  const js = typeof nodeModule.stripTypeScriptTypes === 'function'
    ? nodeModule.stripTypeScriptTypes(source, { mode: 'strip' })
    : (await import('typescript')).default.transpileModule(source, { compilerOptions: { module: 99, target: 9 } }).outputText;
  const code = js.replace(/^import[\s\S]*?;\s*/gm, '').replace(/\bexport\s+(?=const|let|function|class)/g, '');
  return vm.runInNewContext(code + ';({' + names.join(',') + '});', globals, { timeout: 1500 });
}
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS ' + name); }
const { resolvePlanningItem: resolve } = await evaluate('src/components/planning/model.ts', {}, ['resolvePlanningItem']);
// Use the real committed catalog and its validation path. Photos are irrelevant
// to planning values, so their rendering is the only catalog dependency stubbed.
const cms = require('../public/admin/content/cms.js');
const raw = JSON.parse(await read('src/lib/data/editor-content.json'));
const geo = await evaluate('src/lib/geofence/socal.ts', {}, ['isWithinCoverage']);
const editor = await evaluate('src/lib/data/editor-content.ts', { raw, ...cms, ...geo }, ['EDITOR_RENTALS', 'EDITOR_DEALERS', 'EDITOR_VEHICLES', 'withEditorRecords']);
const photoStub = () => ({ urls: [], alt: 'Fixture' });
const { REAL_RENTALS } = await evaluate('src/lib/data/real-rentals.ts', { ...editor, rentalPhotos: photoStub }, ['REAL_RENTALS']);
const extras = await evaluate('src/lib/data/real-vehicles-extra.ts', {}, ['VEHICLES_EXTRA']);
const { REAL_VEHICLES, REAL_DEALERS } = await evaluate('src/lib/data/real-vehicles.ts', { ...editor, ...extras, vehiclePhotosForListing: photoStub }, ['REAL_VEHICLES', 'REAL_DEALERS']);
const { REAL_WORK_VEHICLES } = await evaluate('src/lib/data/real-work-vehicles.ts', { workVehiclePhotosForListing: photoStub }, ['REAL_WORK_VEHICLES']);
const catalog = { rentals: REAL_RENTALS, vehicles: REAL_VEHICLES, dealers: REAL_DEALERS, workVehicles: REAL_WORK_VEHICLES };
const original = JSON.stringify(catalog);
check('every committed rental resolves to its correct existing detail route', () => {
  assert.ok(catalog.rentals.length > 0);
  for (const item of catalog.rentals) {
    const result = resolve({ kind: 'rental', id: item.id }, catalog);
    assert.equal(result.title, item.property_name);
    assert.equal(result.href, '/' + (item.unit_type === 'townhouse' ? 'townhomes' : 'apartments') + '/' + encodeURIComponent(item.id));
    assert.equal(result.costLabel, 'Recorded monthly rent');
  }
});
check('every committed vehicle resolves as a purchase, not a monthly payment', () => {
  assert.ok(catalog.vehicles.length > 0);
  for (const item of catalog.vehicles) {
    const result = resolve({ kind: 'car', id: item.id }, catalog);
    assert.equal(result.href, '/cars/' + encodeURIComponent(item.id));
    assert.equal(result.costLabel, 'Recorded purchase price');
    assert.match(result.title, new RegExp(item.make));
  }
});
check('every committed work vehicle keeps separately labeled rate periods', () => {
  assert.ok(catalog.workVehicles.length > 0);
  for (const item of catalog.workVehicles) {
    const result = resolve({ kind: 'work-vehicle', id: item.id }, catalog);
    assert.equal(result.href, '/work-vehicles/' + encodeURIComponent(item.id));
    assert.equal(result.costLabel, 'Recorded daily rate');
    assert.ok(result.details.some((field) => field.label === 'Weekly rate'));
    assert.ok(result.details.some((field) => field.label === 'Monthly rate'));
  }
});
check('missing and wrong-category IDs do not silently resolve to another record', () => {
  assert.equal(resolve({ kind: 'rental', id: 'no-such-record' }, catalog), null);
  assert.equal(resolve({ kind: 'car', id: catalog.rentals[0].id }, catalog), null);
  assert.equal(resolve({ kind: 'unsupported', id: catalog.rentals[0].id }, catalog), null);
});
const work = catalog.workVehicles[0];
check('zero costs and included miles are preserved while missing rates remain unknown', () => {
  const fixture = { ...catalog, workVehicles: [{ ...work, daily_rate: undefined, weekly_rate: 0, monthly_rate: undefined, included_miles_per_day: 0, deposit: 0, mileage_fee_per_mile: 0.99 }] };
  const result = resolve({ kind: 'work-vehicle', id: work.id }, fixture);
  const details = Object.fromEntries(result.details.map((item) => [item.label, item.value]));
  assert.equal(result.cost, 'Not recorded'); assert.equal(details['Weekly rate'], '$0');
  assert.equal(details['Monthly rate'], 'Not recorded'); assert.equal(details['Deposit'], '$0');
  assert.equal(details['Included miles / day'], '0'); assert.equal(details['Per-mile fee'], '$0.99');
});
check('rental ranges and studio zero-bedroom counts stay meaningful', () => {
  const rental = { ...catalog.rentals[0], min_rent: 1200, max_rent: 1500, beds_min: 0, beds_max: 0, deposit: undefined };
  const result = resolve({ kind: 'rental', id: rental.id }, { ...catalog, rentals: [rental] });
  assert.equal(result.cost, '$1,200 – $1,500');
  assert.equal(result.details.find((item) => item.label === 'Beds').value, '0');
  assert.equal(result.details.find((item) => item.label === 'Deposit').value, 'Not recorded');
});
check('vehicle location follows the recorded dealer state and tolerates missing dealers', () => {
  const car = catalog.vehicles[0];
  const dealer = { ...catalog.dealers[0], id: car.dealer_id, city: 'Tucson', state: 'AZ' };
  assert.equal(resolve({ kind: 'car', id: car.id }, { ...catalog, dealers: [dealer] }).location, 'Tucson, AZ');
  assert.equal(resolve({ kind: 'car', id: car.id }, { ...catalog, dealers: [] }).location, 'Dealer location not recorded');
});
check('unverified records retain source dates and an explicit unverified label', () => {
  const result = resolve({ kind: 'work-vehicle', id: work.id }, catalog);
  assert.equal(result.sourceDate, work.meta.last_verified_at.slice(0, 10));
  assert.match(result.sourceNote, /unverified/);
});
check('invalid costs and invalid dates are not rendered as real amounts or verification', () => {
  const rental = { ...catalog.rentals[0], min_rent: NaN, max_rent: -1, deposit: Infinity, meta: { ...catalog.rentals[0].meta, last_verified_at: 'not-a-date' } };
  const result = resolve({ kind: 'rental', id: rental.id }, { ...catalog, rentals: [rental] });
  assert.equal(result.cost, 'Not recorded'); assert.equal(result.sourceDate, 'Not recorded');
  assert.equal(result.details.find((item) => item.label === 'Deposit').value, 'Not recorded');
});
check('detail IDs are encoded and catalog records remain unchanged', () => {
  const car = { ...catalog.vehicles[0], id: 'fixture/with?query' };
  assert.equal(resolve({ kind: 'car', id: car.id }, { ...catalog, vehicles: [car] }).href, '/cars/fixture%2Fwith%3Fquery');
  assert.equal(JSON.stringify(catalog), original);
});

// Exercise the existing store logic without touching browser storage. This
// intentionally does not claim to verify real persistence or React hydration.
function create() { return (initializer) => {
  let state;
  const get = () => state;
  const set = (partial) => { state = { ...state, ...partial }; };
  state = initializer(set, get);
  return { getState: get };
}; }
const stores = await evaluate('src/lib/store/compare.ts', { create, persist: (initializer) => initializer }, ['useCompareStore', 'useSavedStore']);
check('actual compare store keeps its eight-item cap and rejects duplicate selections', () => {
  const store = stores.useCompareStore;
  for (let i = 0; i < 10; i++) store.getState().add('rental', 'fixture-' + i);
  assert.equal(store.getState().items.length, 8);
  store.getState().add('rental', 'fixture-0'); assert.equal(store.getState().items.length, 8);
  store.getState().remove('rental', 'fixture-0'); store.getState().add('car', 'fixture-8');
  assert.equal(store.getState().items.length, 8); assert.equal(store.getState().has('car', 'fixture-8'), true);
});
check('missing saved records remain removable and compare removals preserve saved selections', () => {
  const saved = stores.useSavedStore; const compare = stores.useCompareStore;
  saved.getState().toggle('rental', 'missing-record');
  assert.equal(resolve(saved.getState().ids[0], catalog), null);
  compare.getState().clear(); compare.getState().add('rental', 'missing-record'); compare.getState().remove('rental', 'missing-record');
  assert.equal(saved.getState().has('rental', 'missing-record'), true);
  saved.getState().toggle('rental', 'missing-record'); assert.equal(saved.getState().ids.length, 0);
});
console.log(`PASS: ${checks} planning checks using ${catalog.rentals.length} rentals, ${catalog.vehicles.length} vehicles and ${catalog.workVehicles.length} work vehicles. Browser persistence and hydration NOT_RUN.`);
