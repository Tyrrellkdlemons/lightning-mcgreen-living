import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as nodeModule from 'node:module';
import vm from 'node:vm';

const read = (name) => readFile(new URL('../' + name, import.meta.url), 'utf8');
async function evaluate(name, globals, exports) {
  const source = await read(name);
  const js = typeof nodeModule.stripTypeScriptTypes === 'function'
    ? nodeModule.stripTypeScriptTypes(source, { mode: 'strip' })
    : (await import('typescript')).default.transpileModule(source, { compilerOptions: { module: 99, target: 9 } }).outputText;
  const code = js.replace(/^import[\s\S]*?;\s*/gm, '').replace(/\bexport\s+(?=const|function)/g, '');
  return vm.runInNewContext(code + ';({' + exports.join(',') + '});', globals, { timeout: 1500 });
}
const portals = await evaluate('src/lib/links/leasing-portals.ts', {}, ['rentCafeCitySearchUrl','propertyListingDirectUrl','vehicleListingDirectUrl','workVehicleDirectUrl','pickLeasingPortal']);
const { resolveApartmentApplicationLink: resolve } = await evaluate('src/lib/links/resolver.ts', portals, ['resolveApartmentApplicationLink']);
let checks = 0;
const check = (label, fn) => { fn(); checks++; console.log('PASS ' + label); };
const rental = { property_name: 'Example property', manager: 'Example manager', city: 'Phoenix', state: 'AZ', application_platform: 'RentCafe', application_url: 'https://example.invalid/property', official_property_url: 'https://example.invalid/property' };
check('Arizona and California city searches preserve their state', () => {
  assert.equal(portals.rentCafeCitySearchUrl('Phoenix', 'AZ'), 'https://www.rentcafe.com/apartments-for-rent/phoenix-az/');
  assert.equal(portals.rentCafeCitySearchUrl('Los Angeles', 'CA'), 'https://www.rentcafe.com/apartments-for-rent/los-angeles-ca/');
  assert.equal(portals.rentCafeCitySearchUrl('Los Angeles'), portals.rentCafeCitySearchUrl('Los Angeles', 'CA'));
  assert.throws(() => portals.rentCafeCitySearchUrl('Las Vegas', 'NV'));
});
check('resolved fallback remains in Arizona and is labeled as a search', () => {
  const link = resolve(rental);
  assert.equal(link.kind, 'property-search'); assert.equal(link.confidence, 'unverified');
  assert.match(link.label, /Search/); assert.match(link.reason, /search, not a verified/);
  assert.match(link.fallback_url, /phoenix-az/);
  const url = new URL(link.url); assert.equal(url.hostname, 'duckduckgo.com');
  assert.match(url.searchParams.get('q'), /Phoenix AZ/);
});
check('catalog text cannot inject a lucky-search redirect', () => {
  const url = new URL(portals.propertyListingDirectUrl({ property: '!ducky Example', city: 'Phoenix !g', state: 'AZ', siteHost: 'rentcafe.com' }));
  assert.equal(url.searchParams.get('q').includes('!'), false);
  assert.throws(() => portals.propertyListingDirectUrl({ property: 'Example', city: 'Phoenix', siteHost: 'example.invalid/path?x=y' }));
});
check('other legacy search helpers also stay on explicit search results', () => {
  const urls = [portals.vehicleListingDirectUrl({ vin: '1TEST234567890123', siteHost: 'example.invalid' }), portals.workVehicleDirectUrl({ provider: 'Example', city: 'Phoenix', vehicle_type: 'cargo-van', siteHost: 'example.invalid' })];
  for (const href of urls) { const url = new URL(href); assert.equal(url.hostname, 'duckduckgo.com'); assert.equal(url.searchParams.get('q').includes('!'), false); }
});
check('a known exact unit application keeps priority over search and property links', () => {
  const link = resolve({ ...rental, links: { exact_application_url: 'https://example.invalid/unit/apply', exact_unit_url: 'https://example.invalid/unit', property_application_url: 'https://example.invalid/apply', application_link_type: 'exact-unit-application', application_link_confidence: 'verified' } });
  assert.equal(link.url, 'https://example.invalid/unit/apply'); assert.equal(link.kind, 'exact-unit-application'); assert.equal(link.confidence, 'verified');
});
check('source-supplied property applications keep priority over inferred search', () => {
  const link = resolve({ ...rental, links: { property_application_url: 'https://example.invalid/apply', application_link_confidence: 'verified' } });
  assert.equal(link.url, 'https://example.invalid/apply'); assert.equal(link.kind, 'property-wide-application');
});
check('in-house operator searches retain state and their separate fallback', () => {
  const link = resolve({ ...rental, manager: 'Camden', application_platform: 'Other' });
  assert.equal(link.kind, 'property-search'); assert.equal(link.fallback_url, rental.application_url);
  assert.match(new URL(link.url).searchParams.get('q'), /site:camdenliving.com.*Phoenix AZ/);
});
check('non-search operator pages are not presented as exact applications', () => {
  const link = resolve({ ...rental, application_platform: 'AppFolio' });
  assert.equal(link.url, rental.application_url); assert.equal(link.kind, 'leasing-office-contact-only'); assert.equal(link.confidence, 'unverified');
});
const searchUI = await read('src/components/search/SearchResults.tsx');
const kindsExpression = searchUI.match(/const ALL_KINDS: SearchKind\[\] = (\[[^;]+\]);/)?.[1];
check('source-library filters can initialize the actual search selector', () => {
  assert.ok(kindsExpression);
  const kinds = vm.runInNewContext(kindsExpression, {}, { timeout: 500 });
  assert.ok(kinds.includes('resource-source'));
});
console.log('PASS: ' + checks + ' link-routing checks. External applications and browser interactions NOT_RUN.');
