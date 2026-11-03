import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as nodeModule from 'node:module';

// Exercise the actual dependency-free intake module. Node 22+ can strip types;
// Node 20 uses the repository's existing TypeScript development dependency.
const source = await readFile(new URL('../src/lib/geofence/socal.ts', import.meta.url), 'utf8');
let code;
if (typeof nodeModule.stripTypeScriptTypes === 'function') {
  code = nodeModule.stripTypeScriptTypes(source, { mode: 'strip' });
} else {
  const ts = (await import('typescript')).default;
  code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
}
const { isWithinCoverage, COVERAGE_COUNTIES } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const tests = [
  ['San Diego included', { state: 'CA', county: 'San Diego', lat: 32.72, lng: -117.16 }, true],
  ['Northern California included', { state: 'CA', county: 'Humboldt', lat: 40.8, lng: -124.16 }, true],
  ['Phoenix included', { state: 'AZ', county: 'Maricopa', lat: 33.45, lng: -112.07 }, true],
  ['Tucson included', { state: 'AZ', county: 'Pima', lat: 32.22, lng: -110.97 }, true],
  ['State normalization', { state: ' az ', county: 'Yuma County' }, true],
  ['Nevada rejected inside combined rectangle', { state: 'NV', lat: 36.17, lng: -115.14 }, false],
  ['Coordinates without state rejected', { lat: 33.45, lng: -112.07 }, false],
  ['City without state rejected', { city: 'Phoenix' }, false],
  ['Unsupported state cannot use CA county', { state: 'NV', county: 'Los Angeles' }, false],
  ['Wrong-state county rejected', { state: 'CA', county: 'Maricopa' }, false],
  ['Missing coordinate pair rejected', { state: 'CA', lat: 34 }, false],
  ['Nonfinite coordinate rejected', { state: 'AZ', lat: NaN, lng: -112 }, false],
  ['Impossible state coordinates rejected', { state: 'AZ', lat: 45, lng: -112 }, false],
];
for (const [name, input, expected] of tests) assert.equal(isWithinCoverage(input), expected, name);
assert.equal(COVERAGE_COUNTIES.CA.length, 58);
assert.equal(COVERAGE_COUNTIES.AZ.length, 15);
for (const state of ['CA', 'AZ']) for (const county of COVERAGE_COUNTIES[state]) assert.equal(isWithinCoverage({ state, county }), true, `${state}: ${county}`);
const places = JSON.parse(await readFile(new URL('../src/lib/places/places.json', import.meta.url), 'utf8'));
assert.equal(new Set(places.map((place) => place.id)).size, places.length, 'IDs must be unique');
for (const state of ['CA', 'AZ']) assert.ok(places.filter((place) => place.state === state).length >= 10, `${state} needs at least 10 guides`);
for (const place of places) {
  assert.ok(['CA', 'AZ'].includes(place.state));
  assert.match(place.slug, /^[a-z]+(?:-[a-z]+)*$/);
  assert.equal(place.id, `${place.state.toLowerCase()}-${place.slug}`);
  assert.ok(place.description.length > 50 && place.planningTips.length >= 2);
  assert.equal(new URL(place.sourceUrl).protocol, 'https:');
  assert.equal(place.contentKind, 'planning-guide');
  assert.equal(place.availability, undefined, 'City guides must not invent availability');
}
const workbook = JSON.parse(await readFile(new URL('../src/lib/data/generated/workbook-ranked-listings.json', import.meta.url), 'utf8'));
assert.equal(workbook.length, 79, 'Preserve ranked workbook');
assert.deepEqual(workbook.map((item) => item.rank).sort((a, b) => a - b), Array.from({ length: 79 }, (_, index) => index + 1));
console.log(`PASS: ${tests.length} intake edge cases, all 73 counties, ${places.length} city records, and 79 workbook ranks.`);
