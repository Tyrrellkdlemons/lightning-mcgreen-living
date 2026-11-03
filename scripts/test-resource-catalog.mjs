import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as nodeModule from 'node:module';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('src/lib/resources/index.ts', root), 'utf8');
const javascript = typeof nodeModule.stripTypeScriptTypes === 'function'
  ? nodeModule.stripTypeScriptTypes(source, { mode: 'strip' })
  : (await import('typescript')).default.transpileModule(source, { compilerOptions: { module: 99, target: 9 } }).outputText;
const executable = javascript.replace(/^import raw from ['"]\.\/catalog\.json['"];?\s*/m, '').replace(/\bexport\s+(?=const|function)/g, '');
const { filterResources, RESOURCE_CATEGORIES } = vm.runInNewContext(
  executable + ';({ filterResources, RESOURCE_CATEGORIES });',
  { raw: { sources: [] } },
  { timeout: 1500 },
);

const fixtures = [
  { id: 'ca', title: 'Housing counselor', publisher: 'CA provider', description: 'Housing support', state: 'CA', category: 'housing', city: 'Irvine', county: 'Orange' },
  { id: 'az', title: 'Housing counselor', publisher: 'AZ provider', description: 'Housing support', state: 'AZ', category: 'housing', city: 'Phoenix', county: 'Maricopa' },
  { id: 'federal', title: 'National housing support', publisher: 'Federal provider', description: 'Housing support', state: 'Federal', category: 'housing' },
  { id: 'both', title: 'Shared legal directory', publisher: 'Shared provider', description: 'Tenant help', state: 'CA/AZ', category: 'legal' },
];
const ids = (rows) => Array.from(rows, (row) => row.id).sort();
assert.deepEqual(ids(filterResources(fixtures, '', 'CA')), ['both', 'ca', 'federal']);
assert.deepEqual(ids(filterResources(fixtures, '', 'AZ')), ['az', 'both', 'federal']);
assert.deepEqual(ids(filterResources(fixtures, 'Maricopa', 'AZ')), ['az']);
assert.deepEqual(ids(filterResources(fixtures, '', 'AZ', 'legal')), ['both']);
assert.equal(filterResources(fixtures, 'no-such-provider-zzzz').length, 0);
assert.deepEqual(ids(filterResources(fixtures, ['Phoenix', 'ignored'])), ['az'], 'Repeated q parameters use their first value');
for (const query of [null, undefined, {}, 42]) {
  assert.deepEqual(ids(filterResources(fixtures, query)), ids(fixtures), 'Malformed query must safely behave as empty');
}
console.log('PASS: resource state, shared/federal coverage, category, county, empty and malformed/repeated query fixtures.');

const catalog = JSON.parse(await readFile(new URL('src/lib/resources/catalog.json', root), 'utf8'));
assert.equal(catalog.schemaVersion, 1);
assert.ok(Array.isArray(catalog.sources), 'Catalog sources must be an array');
assert.ok(catalog.sources.length >= 200, 'At least 200 sources are required');
const states = new Set(['CA', 'AZ', 'Federal', 'CA/AZ']);
const inspections = new Set(['metadata-reviewed', 'content-inspected']);
const sourceIds = new Set();
const sourceUrls = new Set();
const timestamp = (value, label) => {
  assert.equal(typeof value, 'string', label);
  assert.ok(/^\d{4}-\d{2}-\d{2}/.test(value) && Number.isFinite(Date.parse(value)), label);
  assert.ok(Date.parse(value) <= Date.now() + 86_400_000, label + ' cannot be future-dated');
};
const publicUrl = (value, label) => {
  assert.equal(typeof value, 'string', label);
  assert.ok(value.length > 0 && value.length <= 3000, label);
  const url = new URL(value);
  assert.ok(['https:', 'http:'].includes(url.protocol), label + ' must use HTTP(S)');
  assert.equal(url.username + url.password, '', label + ' must not contain credentials');
  assert.ok(!/^(localhost|127\.|0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)
    && !['[::1]', '[::]'].includes(url.hostname) && !url.hostname.endsWith('.local'), label + ' must be public');
  assert.ok(!Array.from(url.searchParams.keys()).some((key) => /^(api[_-]?key|access[_-]?token|client[_-]?secret|password|secret)$/i.test(key)), label + ' must not carry credentials');
  return url;
};
const canonical = (value) => {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  let pathname = url.pathname;
  while (pathname.endsWith('/')) pathname = pathname.slice(0, -1);
  return (hostname.startsWith('www.') ? hostname.slice(4) : hostname) + pathname;
};
timestamp(catalog.generatedAt, 'generatedAt');
for (const item of catalog.sources) {
  assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Route-safe source ID');
  assert.ok(!sourceIds.has(item.id), 'Duplicate ID: ' + item.id);
  sourceIds.add(item.id);
  for (const field of ['title', 'publisher', 'description']) {
    assert.equal(typeof item[field], 'string', item.id + ' ' + field);
    assert.ok(item[field].trim().length > 0, item.id + ' missing ' + field);
    assert.ok(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(item[field]), item.id + ' control characters');
  }
  publicUrl(item.url, item.id + ' source URL');
  publicUrl(item.discoveredFrom, item.id + ' provenance URL');
  const url = canonical(item.url);
  assert.ok(!sourceUrls.has(url), 'Duplicate canonical URL: ' + item.id);
  sourceUrls.add(url);
  assert.ok(states.has(item.state), item.id + ' state');
  assert.ok(Object.hasOwn(RESOURCE_CATEGORIES, item.category), item.id + ' category');
  assert.ok(inspections.has(item.inspection), item.id + ' inspection');
  timestamp(item.retrievedAt, item.id + ' retrievedAt');
  assert.ok(Date.parse(item.retrievedAt) <= Date.parse(catalog.generatedAt) + 86_400_000, item.id + ' retrieval after collection');
  for (const field of ['city', 'county']) if (item[field] != null) assert.equal(typeof item[field], 'string', item.id + ' ' + field);
  if (item.inspection === 'content-inspected') {
    assert.equal(item.retrievalScope, 'page-content', item.id + ' content provenance');
    timestamp(item.pageRetrievedAt, item.id + ' pageRetrievedAt');
    assert.ok(typeof item.contentInspectionMethod === 'string' && item.contentInspectionMethod.trim(), item.id + ' inspection method');
  } else {
    assert.equal(item.retrievalScope, 'directory-metadata', item.id + ' metadata provenance');
    assert.equal(item.pageRetrievedAt, undefined, item.id + ' must not imply a destination-page visit');
  }
  if (item.linkStatus != null) {
    assert.ok(Number.isInteger(item.linkStatus) && item.linkStatus >= 100 && item.linkStatus <= 599, item.id + ' HTTP status');
    assert.ok(item.linkCheckedAt, item.id + ' HTTP result must have an attempt timestamp');
  }
  if (item.linkCheckedAt != null) timestamp(item.linkCheckedAt, item.id + ' linkCheckedAt');
}

const summary = catalog.summary;
for (const key of ['discovered', 'deduplicated', 'included', 'contentInspected', 'linkChecked']) {
  assert.ok(Number.isInteger(summary[key]) && summary[key] >= 0, 'Summary ' + key);
}
assert.equal(summary.included, catalog.sources.length, 'Included count matches records');
assert.ok(summary.discovered >= summary.deduplicated && summary.deduplicated >= summary.included, 'Discovery/deduplication counts must be monotonic');
assert.equal(summary.contentInspected, catalog.sources.filter((item) => item.inspection === 'content-inspected').length, 'Content inspection count matches records');
assert.equal(summary.metadataOnly, catalog.sources.filter((item) => item.inspection === 'metadata-reviewed').length, 'Metadata inspection count matches records');
assert.equal(summary.linkChecked, catalog.sources.filter((item) => item.linkCheckedAt != null).length, 'Link-check count matches recorded attempts');
assert.equal(summary.linkSuccessful, catalog.sources.filter((item) => item.linkStatus >= 200 && item.linkStatus < 400).length, 'Successful link-check count matches HTTP results');
assert.equal(summary.publisherCount, new Set(catalog.sources.map((item) => item.publisher)).size, 'Publisher count matches records');

// Frozen public URL baseline independently extracted with git grep from src/ and
// docs/ at the revision below. Embedding keys keeps this regression runnable in
// shallow CI checkouts. The 269 keys include harmless template/API fragments;
// they conservatively exclude any matching source and never depend on new edits.
const BASELINE_REVISION = '5eb2e395e316a9ca69f92bf06e7fdea219615039';
const BASELINE_URL_KEYS = [
  "211arizona.org/help/housing-shelter/emergency-shelters",
  "211ca.org/find-your-local-211",
  "211oc.org",
  "allresco.com",
  "allresco.com/communities",
  "apartments.com/burbank-ca/2-bedrooms",
  "apartments.com/carson-ca/washer-dryer",
  "apartments.com/corona-ca/washer-dryer",
  "apartments.com/downey-ca/washer-dryer",
  "apartments.com/gardena-ca/washer-dryer",
  "apartments.com/hawthorne-ca/washer-dryer",
  "apartments.com/irvine-ca/luxury",
  "apartments.com/long-beach-ca/2-bedrooms",
  "apartments.com/los-alamitos-ca/pool",
  "apartments.com/marina-del-rey-ca/2-bedrooms",
  "apartments.com/marina-del-rey-ca/washer-dryer",
  "apartments.com/north-hollywood-ca/2-bedrooms",
  "apartments.com/north-hollywood-ca/pool",
  "apartments.com/northridge-ca/2-bedrooms",
  "apartments.com/northridge-ca/pool",
  "apartments.com/northridge-ca/washer-dryer",
  "apartments.com/rancho-cucamonga-ca/2-bedrooms",
  "apartments.com/rancho-cucamonga-ca/washer-dryer",
  "apartments.com/rancho-cucamonga-ontario-ca/washer-dryer",
  "apartments.com/riverside-ca/washer-dryer",
  "apartments.com/san-pedro-ca/2-bedrooms",
  "apartments.com/san-pedro-ca/washer-dryer",
  "api.census.gov/data/2022/acs/acs5",
  "api.census.gov/data/key_signup.html",
  "api.mapbox.com/v4/mapbox.satellite",
  "api.mapbox.com/v4/mapbox.satellite/$",
  "api.maptiler.com/maps/satellite/style.json",
  "api.maptiler.com/tiles/satellite-v4/$",
  "api.metro.net",
  "api.netlify.com/auth/done",
  "api.nhtsa.gov",
  "api.nhtsa.gov/Recalls/recallsByVehicle",
  "api.nhtsa.gov/SafetyRatings",
  "api.nhtsa.gov/SafetyRatings/VehicleId/$",
  "api.nhtsa.gov/SafetyRatings/modelyear/$",
  "api.nhtsa.gov/recalls/recallsByVehicle",
  "api.openchargemap.io/v3/poi",
  "api.yelp.com/v3/businesses/search",
  "appfolio.com/property-management-software/tenant-screening",
  "autonationusa.com/cars/bmw/3-series",
  "autonationusa.com/cars/bmw/x3",
  "autonationusa.com/cars/chevrolet/equinox",
  "autonationusa.com/cars/hyundai/tucson",
  "autonationusa.com/cars/nissan/altima",
  "autonationusa.com/cars/subaru/outback",
  "autonationusa.com/cars/tesla",
  "autonationusa.com/financing",
  "autonationusa.com/locations",
  "avaloncommunities.com",
  "avaloncommunities.com/california/los-angeles-apartments",
  "avaloncommunities.com/california/orange-county-apartments",
  "bar.ca.gov",
  "bar.ca.gov/services/consumer-assistance-program",
  "basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile",
  "basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  "basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  "basemaps.cartocdn.com/rastertiles/voyager/$",
  "bizfileonline.sos.ca.gov/search/business",
  "bridgedataoutput.com",
  "budgettruck.com/locations/california",
  "calcivilrights.ca.gov",
  "calcivilrights.ca.gov/complaintprocess",
  "calcivilrights.ca.gov/wp-content/uploads/sites/32/2020/02/SourceofIncomeFAQ_ENG.pdf",
  "camdenliving.com",
  "camdenliving.com/glendale-ca-apartments",
  "camdenliving.com/orange-county-apartments",
  "carmax.com/cars/honda/accord",
  "carmax.com/cars/honda/civic",
  "carmax.com/cars/kia/sorento",
  "carmax.com/cars/mazda/cx-5",
  "carmax.com/cars/toyota/camry",
  "carmax.com/cars/toyota/corolla",
  "carmax.com/cars/toyota/rav4",
  "carmax.com/cars/volkswagen/tiguan",
  "carmax.com/finance-center",
  "carmax.com/stores",
  "carvana.com/cars",
  "carvana.com/cars/ford/f-150",
  "carvana.com/cars/ford/mustang",
  "carvana.com/cars/jeep/wrangler",
  "carvana.com/cars/tesla/model-y",
  "carvana.com/cars/toyota/tacoma",
  "carvana.com/finance",
  "cdss.ca.gov/inforesources/calworks-housing-support-program",
  "census.gov/data/developers/data-sets/acs-5year.html",
  "conam.com",
  "conam.com/properties/california",
  "consumer.ftc.gov",
  "consumer.ftc.gov/articles/car-loans",
  "consumerfinance.gov",
  "consumerfinance.gov/ask-cfpb/i-cant-make-my-auto-loan-payment-what-should-i-do-en-845",
  "corelogic.com/intelligence/rental-property-solutions",
  "decapcms.org/docs/collection-file",
  "decapcms.org/docs/configuration-options",
  "decapcms.org/docs/editor-tooling",
  "decapcms.org/docs/github-backend",
  "decapcms.org/docs/manual-initialization",
  "decron.com",
  "decron.com/properties",
  "developers.google.com/maps/documentation/places/web-service/overview",
  "developers.google.com/maps/documentation/places/web-service/search-text",
  "developers.google.com/maps/documentation/streetview",
  "dfpi.ca.gov",
  "dfpi.ca.gov/file-a-complaint",
  "dmv.ca.gov/portal/vehicle-industry-services/occupational-licensing/occupational-license-lookup",
  "docs.developer.yelp.com/docs/places-intro",
  "docs.developer.yelp.com/reference/v3_business_search",
  "docs.netlify.com/build/data-and-storage/netlify-blobs",
  "docs.netlify.com/build/functions/api",
  "docs.netlify.com/build/functions/environment-variables",
  "docs.netlify.com/build/image-cdn/overview",
  "docs.netlify.com/manage/security/secure-access-to-sites/git-gateway",
  "docs.netlify.com/manage/security/secure-access-to-sites/identity/get-started",
  "docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens",
  "dpss.rivco.org",
  "dpss.rivco.org/services/housing-support-program",
  "dre.ca.gov",
  "dre.ca.gov/files/pdf/recent/2024/calresidentialtenantsright.pdf",
  "driveway.com",
  "driveway.com/cars/chevrolet/silverado-1500",
  "driveway.com/cars/jeep/grand-cherokee",
  "driveway.com/cars/mazda/mazda3",
  "driveway.com/cars/volkswagen/jetta",
  "driveway.com/financing",
  "duckduckgo.com",
  "duckduckgo.com/bangs",
  "echopark.com/financing",
  "echopark.com/inventory/honda/cr-v",
  "echopark.com/inventory/hyundai/elantra",
  "echopark.com/inventory/kia/forte",
  "echopark.com/inventory/nissan/rogue",
  "echopark.com/locations",
  "enterprisetrucks.com/truckrental/en_US/locations.html",
  "entrata.com/products/leasing-center/verification-of-income",
  "equityapartments.com",
  "equityapartments.com/los-angeles",
  "equityapartments.com/orange-county",
  "essexapartmenthomes.com",
  "essexapartmenthomes.com/california/burbank-apartments",
  "essexapartmenthomes.com/california/santa-ana-apartments",
  "essexapartmenthomes.com/california/west-hollywood-apartments",
  "example.com/apply/demo-burbank-1",
  "example.com/apply/demo-irvine-1",
  "example.com/apply/demo-longbeach-1",
  "example.com/apply/demo-northridge-1",
  "example.com/apply/demo-santaana-1",
  "example.com/dealer/anaheim",
  "example.com/dealer/anaheim/apply",
  "example.com/dealer/pomona",
  "example.com/dealer/pomona/apply",
  "example.com/demo-data-disclosure",
  "example.com/property/demo-burbank-1",
  "example.com/property/demo-irvine-1",
  "example.com/property/demo-longbeach-1",
  "example.com/property/demo-northridge-1",
  "example.com/property/demo-santaana-1",
  "example.com/vehicle/v-1",
  "example.com/vehicle/v-2",
  "example.com/vehicle/v-3",
  "example.com/wv/burbank",
  "example.com/wv/irvine",
  "example.com/wv/ontario",
  "fluidtruck.com",
  "fpimgt.com",
  "fpimgt.com/communities/california",
  "ftc.gov",
  "ftc.gov/business-guidance/resources/using-consumer-reports-what-landlords-need-know",
  "fueleconomy.gov/feg/ws",
  "fueleconomy.gov/ws/rest/vehicle/$",
  "fueleconomy.gov/ws/rest/vehicle/menu/options",
  "g5.com",
  "github.com",
  "github.com/Tyrrellkdlemons/lightning-mcgreen-living",
  "github.com/decaporg/decap-cms/blob/master/packages/decap-cms-media-library-uploadcare/src/index.js",
  "gitlab.com/LACMTA/gtfs_bus",
  "google.com/maps",
  "google.com/maps/@",
  "google.com/maps/@$",
  "google.com/maps/search",
  "greystar.com",
  "greystar.com/find-apartments",
  "hacsb.com",
  "harivco.org",
  "homedepot.com/c/truck_rental",
  "housing.lacounty.gov",
  "hud.gov/findshelter",
  "hud.gov/program_offices/fair_housing_equal_opp/online-complaint",
  "huduser.gov/hudapi/public/fmr/data/$",
  "huduser.gov/hudapi/public/register",
  "huduser.gov/portal/dataset/fmr-api.html",
  "inlandlegal.org",
  "irvinecompanyapartments.com",
  "irvinecompanyapartments.com/locations/orange-county.html",
  "knockcrm.com",
  "lacountyrentrelief.com",
  "lacountyrentrelief.com/wp-content/uploads/Landlord-Application-Guide.pdf",
  "lacountyrentrelief.com/wp-content/uploads/Program-Overview.pdf",
  "lacountyrentrelief.com/wp-content/uploads/Tenant-Application-Guide.pdf",
  "lightning-mcgreen-living.netlify.app",
  "livesolimar.com/apartments/ca/wilmington/apply",
  "livesolimar.com/apartments/ca/wilmington/floor-plans",
  "localhost",
  "localhost/api/admin/import/apartments",
  "losalamitosapartments.com",
  "lyonliving.com",
  "lyonliving.com/communities",
  "maps.googleapis.com/maps/api/place/textsearch/json",
  "maps.googleapis.com/maps/api/streetview",
  "maps.googleapis.com/maps/api/streetview/metadata",
  "metrolinktrains.com/about/gtfs",
  "mgproperties.com",
  "mgproperties.com/communities",
  "mysmartmove.com",
  "nominatim.openstreetmap.org/search",
  "nominatim.org/release-docs/latest/api/Overview",
  "ochousing.org",
  "ochousing.org/documents",
  "octa.net/about/about-octa/open-data",
  "on-site.com",
  "on-site.com/apply/property/349965/unit_number/118",
  "on-site.com/apply/property/349965/unit_number/129",
  "on-site.com/web/online_app3/349965/step/floorplan",
  "openchargemap.org/site/develop/api",
  "openstreetmap.org",
  "openstreetmap.org/copyright",
  "openstreetmap.org/export/embed.html",
  "openstreetmap.org/search",
  "operations.osmfoundation.org/policies/nominatim",
  "overpass-api.de",
  "overpass-api.de/api/interpreter",
  "pensketruckrental.com/truck-rental-locations/california/anaheim",
  "pensketruckrental.com/truck-rental-locations/california/ontario",
  "plaid.com/products/income",
  "presidioanaheim.com/floorplans",
  "primeresidential.com",
  "primeresidential.com/communities",
  "realpage.com/products/leasingdesk-screening",
  "rentcafe.com/apartments-for-rent/corona-ca/washer-dryer",
  "rentcafe.com/apartments-for-rent/us-california",
  "rentcafe.com/apartments-for-rent/us-california/$",
  "rtt.metrolinktrains.com/feed/gtfs-rt",
  "ryder.com/en-us/rent-trucks",
  "santa-ana.org/community-development/rent-stabilization",
  "sb-court.org/general-info/self-help/landlord-tenant",
  "sbcounty.gov/cdh",
  "services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile",
  "services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/$",
  "snappt.com/applicants",
  "sos.ca.gov/business-programs/bizfile/search-online",
  "stayhousedla.org",
  "udr.com",
  "udr.com/los-angeles-apartments",
  "uhaul.com/Locations/Truck-Rentals-near-Burbank-CA-91505",
  "uhaul.com/Locations/Truck-Rentals-near-Northridge-CA-91325",
  "uhaul.com/Locations/Truck-Rentals-near-Riverside-CA-92506",
  "unpkg.com/@netlify/blobs@10.7.13/dist/main.d.ts",
  "unpkg.com/maplibre-gl@4.1.0/dist/maplibre-gl.css",
  "vpic.nhtsa.dot.gov/api",
  "vpic.nhtsa.dot.gov/api/vehicles/DecodeVin",
  "vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/$",
  "w3.org/2000/svg",
  "wnpm.com",
  "wnpm.com/properties",
  "yardi.com/product/screeningworks-pro"
];
assert.equal(catalog.baselineRevision, BASELINE_REVISION);
const existingUrls = new Set(BASELINE_URL_KEYS);
const additional = Array.from(sourceUrls).filter((url) => !existingUrls.has(url)).length;
assert.ok(additional >= 200, `Need 200 additional unique URLs; found ${additional} against the frozen baseline`);
assert.equal(summary.additionalUnique, additional, 'Additional-source count must match the frozen baseline');
console.log(`PASS: ${sourceIds.size} unique route-safe sources; ${additional} additional URLs; safe source/provenance links; supported categories/states; matching counts (${summary.contentInspected} content-inspected, ${summary.linkChecked} link-checked).`);

// Independently corroborated directory defects must not return in later refreshes.
assert.ok(!catalog.sources.some(s => new URL(s.url).hostname.endsWith('notavailable.org')), 'Reject agency placeholder host');
assert.ok(!catalog.sources.some(s => s.url.includes('/apartments/az/tempe/pet-friendly')), 'Reject utility page as property');
assert.ok(!catalog.sources.some(s => s.url.includes('/apartments/az/phoenix/sentio')), 'Reject duplicate incorrect-city alias');
assert.equal(catalog.sources.find(s => s.url.includes('/apartments/az/glendale/sentio'))?.title, 'Sentio');
console.log('PASS: placeholder, utility-page and duplicate-alias regressions.');
