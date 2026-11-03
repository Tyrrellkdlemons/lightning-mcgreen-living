import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';
import { test } from 'node:test';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const moduleUrl = new URL('../src/lib/locations/index.ts', import.meta.url);
const source = readFileSync(moduleUrl, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  fileName: fileURLToPath(moduleUrl), reportDiagnostics: true,
});
assert.equal(compiled.diagnostics?.filter((item) => item.category === ts.DiagnosticCategory.Error).length, 0);
const exported = { exports: {} };
runInThisContext(`(function(require,module,exports){${compiled.outputText}\n})`, { filename: fileURLToPath(moduleUrl) })(createRequire(moduleUrl), exported, exported.exports);
const { LOCATIONS, LOCATION_METADATA, searchLocations, getLocation, resolveLocation, normalizeLocationText } = exported.exports;

test('exact frozen 2026 official counts, including all incorporated and Census-designated places', () => {
  assert.equal(LOCATIONS.length, 2089);
  assert.equal(LOCATION_METADATA.total, 2089);
  for (const [state, expected] of Object.entries({ CA: { total: 1622, city: 462, town: 21, cdp: 1139, incorporated: 483 }, AZ: { total: 467, city: 46, town: 46, cdp: 375, incorporated: 92 } })) {
    const rows = LOCATIONS.filter((place) => place.state === state);
    assert.deepEqual(LOCATION_METADATA.states[state], expected);
    assert.equal(rows.length, expected.total);
    for (const type of ['city', 'town', 'cdp']) assert.equal(rows.filter((place) => place.type === type).length, expected[type]);
  }
});

test('stable route-safe identifiers retain leading-zero GEOIDs and never collapse duplicate names', () => {
  assert.equal(new Set(LOCATIONS.map((place) => place.id)).size, 2089);
  assert.equal(new Set(LOCATIONS.map((place) => place.geoid)).size, 2089);
  for (const place of LOCATIONS) {
    assert.match(place.geoid, /^(04|06)\d{5}$/);
    assert.equal(place.id, `${place.state.toLowerCase()}-${place.geoid}`);
    assert.equal(place.stateFips, place.state === 'CA' ? '06' : '04');
    assert.equal(place.geoid.slice(0, 2), place.stateFips);
    assert.equal(place.sourceYear, 2026);
    assert.ok(LOCATION_METADATA.sources[place.sourceId]);
    assert.ok(LOCATION_METADATA.sources[place.countySourceId]);
  }
});

test('every place retains a valid internal point and at least one same-state county', () => {
  const counties = new Set();
  for (const place of LOCATIONS) {
    assert.ok(Number.isFinite(place.internalPoint.lat) && place.internalPoint.lat >= 31 && place.internalPoint.lat <= 43);
    assert.ok(Number.isFinite(place.internalPoint.lng) && place.internalPoint.lng >= -125 && place.internalPoint.lng <= -109);
    assert.equal(Object.hasOwn(place, 'centroid'), false);
    assert.ok(place.counties.length >= 1);
    assert.equal(new Set(place.counties.map((county) => county.geoid)).size, place.counties.length);
    for (const county of place.counties) {
      assert.match(county.geoid, /^(04|06)\d{3}$/);
      assert.equal(county.geoid.slice(0, 2), place.stateFips);
      assert.match(county.name, / County$/);
      counties.add(county.geoid);
    }
  }
  assert.equal(counties.size, 73);
});

test('major cities, a small Arizona town, and updated legal designations resolve exactly', () => {
  for (const [name, state, id, type] of [
    ['Los Angeles', 'CA', 'ca-0644000', 'city'], ['Phoenix', 'AZ', 'az-0455000', 'city'],
    ['Fredonia', 'AZ', 'az-0425720', 'town'], ['Duncan', 'AZ', 'az-0420750', 'town'],
    ['San Tan Valley', 'AZ', 'az-0464210', 'town'], ['Mountain House', 'CA', 'ca-0649582', 'city'],
  ]) {
    const result = resolveLocation(name, state);
    assert.equal(result.status, 'matched'); assert.equal(result.matches[0].id, id); assert.equal(result.matches[0].type, type);
    assert.equal(getLocation(id), result.matches[0]);
  }
});

test('cross-state and same-state ambiguity stays explicit', () => {
  assert.equal(resolveLocation('Glendale').status, 'ambiguous');
  assert.equal(resolveLocation('Glendale', 'CA').matches[0].id, 'ca-0630000');
  assert.equal(resolveLocation('Glendale', 'AZ').matches[0].id, 'az-0427820');
  assert.equal(resolveLocation('Strawberry', 'CA').status, 'ambiguous');
  assert.equal(resolveLocation('Strawberry', 'CA').matches.length, 2);
  assert.equal(resolveLocation('Cottonwood', 'AZ').status, 'ambiguous');
  assert.equal(searchLocations({ query: 'Strawberry', state: 'CA', county: 'Marin' }).items[0].id, 'ca-0675315');
  assert.equal(searchLocations({ query: 'Strawberry', state: 'CA', county: 'Tuolumne' }).items[0].id, 'ca-0675322');
});

test('multi-county places can be found through either county', () => {
  for (const [name, counties] of [['Sedona', ['Coconino', 'Yavapai']], ['Apache Junction', ['Maricopa', 'Pinal']]]) {
    const place = resolveLocation(name, 'AZ').matches[0];
    assert.equal(place.counties.length, 2);
    for (const county of counties) assert.ok(searchLocations({ query: name, state: 'AZ', county }).items.includes(place));
  }
  const code = searchLocations({ state: 'CA', county: '06059', pageSize: 200 });
  assert.deepEqual(code, searchLocations({ state: 'California', county: 'Orange County', pageSize: 200 }));
});

test('diacritics, punctuation and official parenthetical aliases are searchable without invented names', () => {
  assert.equal(normalizeLocationText('  La Cañada—Flintridge  '), 'la canada flintridge');
  assert.equal(resolveLocation('La Canada Flintridge', 'CA').matches[0].id, 'ca-0639003');
  assert.equal(resolveLocation('Pinon Hills', 'CA').matches[0].name, 'Piñon Hills');
  assert.equal(resolveLocation('Ventura', 'CA').matches[0].name, 'San Buenaventura (Ventura)');
  assert.equal(resolveLocation('Paso Robles', 'CA').status, 'matched');
  assert.equal(resolveLocation('Big Park', 'AZ').status, 'matched');
  assert.equal(resolveLocation('Los Angeles city', 'CA').status, 'matched');
  assert.equal(resolveLocation('a made-up city', 'CA').status, 'not-found');
});

test('state, county, and type filters intersect; invalid jurisdictions never broaden results', () => {
  for (const state of ['NV', 'zz', {}, 42, '!!!']) {
    assert.equal(searchLocations({ state }).total, 0);
    assert.equal(resolveLocation('Phoenix', state).status, 'not-found');
  }
  for (const county of ['unknown county', '06059', {}]) assert.equal(searchLocations({ state: 'AZ', county }).total, 0);
  for (const type of ['village', '!!!', 1]) assert.equal(searchLocations({ type }).total, 0);
  assert.equal(searchLocations({ state: 'AZ', type: 'town' }).total, 46);
  assert.equal(searchLocations({ state: 'CA', type: 'cdp' }).total, 1139);
  assert.ok(searchLocations({ query: 'Phoenix AZ' }).items.some((place) => place.id === 'az-0455000'));
});

test('URL array parameters use the first scalar and cannot throw', () => {
  assert.equal(searchLocations({ state: ['AZ', 'CA'], query: ['Phoenix', 'Los Angeles'] }).items[0].id, 'az-0455000');
  assert.equal(searchLocations({ state: [null, 'CA'] }).total, 2089);
  assert.equal(searchLocations({ query: { toString() { throw new Error('must not coerce objects'); } } }).total, 2089);
  assert.equal(getLocation(['CA-0644000', 'az-0455000']).id, 'ca-0644000');
  assert.equal(getLocation(null), undefined);
});

test('all records remain reachable through deterministic pagination', () => {
  const first = searchLocations({ pageSize: 37 });
  const ids = [];
  for (let page = 1; page <= first.pageCount; page++) {
    const result = searchLocations({ pageSize: 37, page });
    assert.equal(result.total, 2089); assert.equal(result.page, page);
    assert.ok(result.items.length <= 37);
    ids.push(...result.items.map((place) => place.id));
  }
  assert.equal(ids.length, 2089); assert.equal(new Set(ids).size, 2089);
  assert.deepEqual([...ids].sort(), LOCATIONS.map((place) => place.id).sort());
  assert.deepEqual(searchLocations({ page: 1 }), searchLocations({ page: 1 }));
  assert.equal(searchLocations({ page: 999999, pageSize: 37 }).page, first.pageCount);
  assert.equal(searchLocations({ query: 'no-such-place-zzzz' }).pageCount, 0);
  for (const pageSize of [-1, null, {}, Infinity, 'bad']) assert.equal(searchLocations({ pageSize }).pageSize, 50);
  assert.equal(searchLocations({ pageSize: 1000000 }).pageSize, 200);
});

test('exact-name ranking does not discard the rest of matching geography', () => {
  const result = searchLocations({ query: 'Orange', state: 'CA', pageSize: 200 });
  assert.equal(result.items[0].name, 'Orange');
  assert.ok(result.total > 1);
  assert.ok(result.items.some((place) => place.name === 'Orange Park Acres'));
});

test('county vintage is transparent, with all 13 new CDPs supplemented from 2026 polygons', () => {
  const fresh = LOCATIONS.filter((place) => place.countySourceYear === 2026);
  assert.equal(fresh.length, 13);
  assert.ok(fresh.every((place) => place.state === 'CA' && place.type === 'cdp'));
  assert.equal(LOCATIONS.filter((place) => place.countySourceYear === 2020).length, 2076);
  assert.equal(resolveLocation('Gualala', 'CA').matches[0].counties[0].name, 'Mendocino County');
  assert.equal(resolveLocation('El Modena', 'CA').matches[0].counties[0].name, 'Orange County');
  assert.match(LOCATION_METADATA.countyLimitation, /not all been reverified/);
});

test('locations and nested geographic fields cannot be mutated by consumers', () => {
  assert.throws(() => LOCATIONS.push({}), TypeError);
  const place = getLocation('ca-0644000');
  assert.throws(() => { place.internalPoint.lat = 0; }, TypeError);
  assert.throws(() => { place.counties[0].name = 'Wrong County'; }, TypeError);
  assert.throws(() => { place.aliases.push('Invented'); }, TypeError);
});

test('raw official Gazetteer snapshots independently match every included GEOID when evidence is present', () => {
  for (const [state, fips] of [['CA', '06'], ['AZ', '04']]) {
    const file = new URL(`../.revamp-evidence/all-city-corpus/gazetteer-2026-${fips}.txt`, import.meta.url);
    if (!existsSync(file)) continue; // Public runtime + CI require no ignored research downloads.
    const bytes = readFileSync(file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), LOCATION_METADATA.sources[`gazetteer-2026-${state.toLowerCase()}`].sha256);
    const lines = bytes.toString('utf8').trim().split(/\r?\n/);
    const headers = lines.shift().split('|');
    const official = lines.map((line) => Object.fromEntries(line.split('|').map((value, i) => [headers[i], value])));
    assert.deepEqual(official.map((row) => row.GEOID).sort(), LOCATIONS.filter((place) => place.state === state).map((place) => place.geoid).sort());
    for (const row of official) {
      const place = getLocation(`${state.toLowerCase()}-${row.GEOID}`);
      assert.equal(place.officialName, row.NAME);
      assert.equal(place.internalPoint.lat, Number(row.INTPTLAT));
      assert.equal(place.internalPoint.lng, Number(row.INTPTLONG));
    }
  }
});
