import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as nodeModule from 'node:module';

const source = await readFile(new URL('../src/lib/places/property-view.ts', import.meta.url), 'utf8');
let code;
if (typeof nodeModule.stripTypeScriptTypes === 'function') code = nodeModule.stripTypeScriptTypes(source, { mode: 'strip' });
else {
  const ts = (await import('typescript')).default;
  code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
}
const { propertyMapLinks, safeSourceUrl, workbookView, normalizePropertySource, filterWorkbookProperties, propertyPath, recordedRent } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
for (const [low, high, expected] of [[0,0,'Not recorded'],[-1,0,'Not recorded'],[null,null,'Not recorded'],[NaN,Infinity,'Not recorded'],[2500,2800,'$2,500–$2,800'],[2500,2500,'$2,500'],[0,2800,'Up to $2,800'],[2500,0,'$2,500'],[2800,2500,'Not recorded']]) assert.equal(recordedRent(low,high),expected);
const ranked = JSON.parse(await readFile(new URL('../src/lib/data/generated/workbook-ranked-listings.json', import.meta.url), 'utf8'));
const full = JSON.parse(await readFile(new URL('../src/lib/data/generated/workbook-listings-full.json', import.meta.url), 'utf8'));
assert.equal(ranked.length, 79);
assert.equal(new Set(ranked.map((item) => item.id)).size, 79);
assert.deepEqual(ranked.map((item) => item.id), full.map((item) => item.id));
const originalWorkbook = JSON.stringify(ranked);
let normalizedSearchCount = 0;
for (const listing of ranked) {
  const view = workbookView(listing);
  const links = propertyMapLinks(view);
  assert.equal(view.name, listing.property_name);
  assert.equal(view.sourceDate, listing.source_date);
  assert.ok(view.sources.length > 0, listing.id + ' retains source links');
  assert.ok(view.sources.every((source) => safeSourceUrl(source.url)));
  for (const source of view.sources) {
    const url = new URL(source.url);
    if (url.hostname === 'duckduckgo.com') {
      normalizedSearchCount++;
      assert.equal(source.kind, 'search', listing.id + ' search kind');
      assert.match(source.label, /^Search /, listing.id + ' truthful search label');
      assert.equal(url.searchParams.get('q').includes('!'), false, listing.id + ' no bang redirect');
      assert.deepEqual([...url.searchParams.keys()], ['q'], listing.id + ' only explicit search parameters');
    }
  }
  assert.equal(new Set(view.sources.map((source) => source.url)).size, view.sources.length);
  assert.ok(propertyPath(listing.id).startsWith('/properties/wb-'));
  const search = new URL(links.search);
  assert.equal(search.origin, 'https://www.google.com');
  assert.equal(search.searchParams.get('api'), '1');
  assert.ok(search.searchParams.get('query').includes(listing.property_name));
  if (links.streetView) {
    const street = new URL(links.streetView);
    assert.equal(street.searchParams.get('map_action'), 'pano');
    assert.equal(street.searchParams.has('key'), false);
  }
}
assert.equal(JSON.stringify(ranked), originalWorkbook, 'Presentation adapter must not mutate canonical workbook data');
assert.ok(normalizedSearchCount >= 300, 'Exercise inherited workbook search destinations');
for (const href of [
  'https://duckduckgo.com/?q=%21ducky+site%3Aexample.com+Property&rut=redirect',
  'https://www.google.com/search?q=Property&btnI=1',
  'https://www.bing.com/search?q=Property&go=1',
]) {
  const source = normalizePropertySource('Direct application', href, 'application');
  assert.equal(source.kind, 'search');
  assert.match(source.label, /^Search /);
  assert.deepEqual([...new URL(source.url).searchParams.keys()], ['q']);
  assert.equal(new URL(source.url).searchParams.get('q').includes('!'), false);
}
const direct = normalizePropertySource('Official unit application', 'https://example.com/apply/unit/42', 'application');
assert.deepEqual(direct, { label: 'Official unit application', url: 'https://example.com/apply/unit/42', kind: 'application' });
assert.equal(normalizePropertySource('Unsafe', 'javascript:alert(1)', 'source'), null);
const missing = ranked.filter((item) => !Number.isFinite(item.map?.lat) || !Number.isFinite(item.map?.lng));
assert.equal(missing.length, 11);
for (const listing of missing) assert.equal(propertyMapLinks(workbookView(listing)).embed, null);
for (const [lat, lng] of [[null, -118], [34, undefined], [NaN, -118], [91, -118], [34, 181], ['34', -118]]) {
  assert.equal(propertyMapLinks({ name: 'Test', lat, lng }).streetView, null);
}
const area = propertyMapLinks({ name: 'Invented-style sample', city: 'Phoenix', state: 'AZ', lat: 33.45, lng: -112.07, locationPrecision: 'area' });
assert.equal(new URL(area.embed).searchParams.has('marker'), false);
assert.equal(new URL(area.search).searchParams.get('query'), 'Phoenix, AZ');
assert.equal(propertyMapLinks({ name: 'Test', address: 'Address in source page; verify', city: 'Riverside' }).search.includes('verify'), false);
for (const unsafe of ['javascript:alert(1)', 'data:text/html,test', 'https://secret@example.com/', 'not a link', null]) assert.equal(safeSourceUrl(unsafe), null);
assert.equal(safeSourceUrl('https://example.com/gallery'), 'https://example.com/gallery');
assert.equal(filterWorkbookProperties(ranked).length, 79);
assert.equal(filterWorkbookProperties(ranked, 'no-such-property-zzzz').length, 0);
assert.ok(filterWorkbookProperties(ranked, '', 'Irvine').every((item) => item.city === 'Irvine'));
const first = ranked[0];
assert.ok(filterWorkbookProperties(ranked, first.property_name, first.city, first.fit_tier).some((item) => item.id === first.id));
console.log(`PASS: 79 property identities and source adapters; ${normalizedSearchCount} inherited search URLs normalized; 11 missing-coordinate fallbacks; unsafe links, area precision, map URL and search/filter cases.`);
