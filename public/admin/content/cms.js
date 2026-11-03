/* Shared validators for the content editor and the site's supplemental data.
 * No credentials, network access, third-party dependencies or sample listings.
 * This file is also CommonJS so bounded Node tests exercise the exact validators.
 */
'use strict';

const COUNTIES = {
  CA: ['Alameda','Alpine','Amador','Butte','Calaveras','Colusa','Contra Costa','Del Norte','El Dorado','Fresno','Glenn','Humboldt','Imperial','Inyo','Kern','Kings','Lake','Lassen','Los Angeles','Madera','Marin','Mariposa','Mendocino','Merced','Modoc','Mono','Monterey','Napa','Nevada','Orange','Placer','Plumas','Riverside','Sacramento','San Benito','San Bernardino','San Diego','San Francisco','San Joaquin','San Luis Obispo','San Mateo','Santa Barbara','Santa Clara','Santa Cruz','Shasta','Sierra','Siskiyou','Solano','Sonoma','Stanislaus','Sutter','Tehama','Trinity','Tulare','Tuolumne','Ventura','Yolo','Yuba'],
  AZ: ['Apache','Cochise','Coconino','Gila','Graham','Greenlee','La Paz','Maricopa','Mohave','Navajo','Pima','Pinal','Santa Cruz','Yavapai','Yuma'],
};
// These coarse bounds reject inconsistent coordinates; they are not state polygons.
// test-cms.mjs checks the county lists against the existing intake module.
const BOUNDS = { CA: [32.5,42.01,-124.5,-114.1], AZ: [31.3,37.01,-114.9,-109.03] };
const LOCATION = ['address_line','city','county','state','zip','lat','lng'];
const META = ['source','source_url','confidence_score','last_seen_at','last_verified_at','data_freshness_status','trust_label'];
const RENTAL = ['external_id','property_name','unit_type',...LOCATION,'manager','application_platform','application_url','official_property_url','min_rent','max_rent','beds_min','beds_max','baths_min','baths_max','deposit','application_fee','admin_fee','parking_fee','pet_fee','pet_policy','parking_type','meta'];
const DEALER = ['external_id','dealer_name',...LOCATION,'phone','website','financing_application_url','meta'];
const VEHICLE = ['vin','dealer_external_id','year','make','model','trim','mileage','price','condition','availability_status','listing_url','body_type','fuel_type','transmission','drive','meta'];
const PLACE = ['id','slug','name','state','county','region','description','planningTips','sourceUrl','sourcePublisher','contentKind'];

function fail(label, message) { throw new Error(label + ': ' + message); }
function object(value, label, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(label, 'expected an object');
  for (const key of Object.keys(value)) if (!keys.includes(key)) fail(label, 'unsupported field ' + key);
}
function textField(value, label, min = 1, max = 500) {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) fail(label, 'enter text (' + min + '-' + max + ' characters)');
}
function choice(value, values, label) { if (!values.includes(value)) fail(label, 'choose one of ' + values.join(', ')); }
function numberField(value, label, min, max, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) fail(label, 'enter a valid number between ' + min + ' and ' + max);
}
function httpsUrl(value, label) {
  textField(value, label, 8, 2000);
  let url;
  try { url = new URL(value); } catch { fail(label, 'enter a complete HTTPS URL'); }
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) fail(label, 'use HTTPS without embedded credentials');
}
function slug(value, label) {
  textField(value, label, 1, 100);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) fail(label, 'use lowercase letters, numbers and single hyphens');
}
function list(value, label, max = 500) {
  if (!Array.isArray(value) || value.length > max) fail(label, 'expected a list with at most ' + max + ' items');
}
function unique(values, label) {
  if (new Set(values).size !== values.length) fail(label, 'duplicate identifiers are not allowed');
}
function countyState(row, label) {
  choice(row.state, ['CA','AZ'], label + '.state');
  textField(row.county, label + '.county', 1, 100);
  const county = row.county.trim().replace(/ County$/i, '').toLowerCase();
  if (!COUNTIES[row.state].some((name) => name.toLowerCase() === county)) fail(label, 'county does not belong to the selected state');
}
function location(row, label) {
  countyState(row, label);
  for (const key of ['address_line','city']) textField(row[key], label + '.' + key);
  textField(row.zip, label + '.zip', 5, 10);
  if (!/^\d{5}(?:-\d{4})?$/.test(row.zip)) fail(label + '.zip', 'enter a US ZIP code');
  const [minLat,maxLat,minLng,maxLng] = BOUNDS[row.state];
  numberField(row.lat, label + '.lat', minLat, maxLat);
  numberField(row.lng, label + '.lng', minLng, maxLng);
}
function metadata(meta, label) {
  object(meta, label, META);
  choice(meta.source, ['official','partner','public-open-data','property-or-dealer-website','manual-verified','unverified'], label + '.source');
  choice(meta.trust_label, ['official','partner','public-open-data','manual-verified','unverified'], label + '.trust_label');
  choice(meta.data_freshness_status, ['live','recent','stale','manual-review-needed'], label + '.data_freshness_status');
  httpsUrl(meta.source_url, label + '.source_url');
  numberField(meta.confidence_score, label + '.confidence_score', 0, 100, true);
  for (const key of ['last_seen_at','last_verified_at']) {
    const value = meta[key];
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value)) || Date.parse(value) > Date.now() + 300000) fail(label + '.' + key, 'enter the actual past observation time, including timezone');
  }
  if (meta.source === 'unverified' && meta.trust_label !== 'unverified') fail(label, 'an unverified source cannot carry a verified trust label');
}
function validateEditorContent(value) {
  object(value, 'inventory', ['schema_version','rentals','dealers','vehicles']);
  // Empty optional CMS widgets are omitted from the committed domain records.
  value = JSON.parse(JSON.stringify(value));
  if (value.schema_version !== 1) fail('inventory', 'unsupported schema version');
  for (const key of ['rentals','dealers','vehicles']) list(value[key], key);
  for (const [kind, fields] of [
    ['rentals', ['deposit','application_fee','admin_fee','parking_fee','pet_fee','pet_policy','parking_type']],
    ['dealers', ['financing_application_url']],
    ['vehicles', ['trim','body_type','fuel_type','transmission','drive']],
  ]) {
    for (const row of value[kind]) if (row && typeof row === 'object') {
      for (const field of fields) if (row[field] == null || row[field] === '') delete row[field];
    }
  }
  value.rentals.forEach((row, i) => {
    const label = 'rentals[' + i + ']';
    object(row, label, RENTAL);
    slug(row.external_id, label + '.external_id');
    for (const key of ['property_name','manager']) textField(row[key], label + '.' + key);
    location(row, label);
    choice(row.unit_type, ['apartment','townhouse','townhome-style-apartment'], label + '.unit_type');
    choice(row.application_platform, ['RentCafe','Entrata','AppFolio','RealPage','Knock','On-Site','G5/Knock','Other','Unknown'], label + '.application_platform');
    for (const key of ['application_url','official_property_url']) httpsUrl(row[key], label + '.' + key);
    for (const key of ['min_rent','max_rent']) numberField(row[key], label + '.' + key, 1, 100000);
    for (const key of ['beds_min','beds_max']) numberField(row[key], label + '.' + key, 0, 30, true);
    for (const key of ['baths_min','baths_max']) numberField(row[key], label + '.' + key, 0, 30);
    for (const [min,max] of [['min_rent','max_rent'],['beds_min','beds_max'],['baths_min','baths_max']]) if (row[min] > row[max]) fail(label, min + ' must not exceed ' + max);
    for (const key of ['deposit','application_fee','admin_fee','parking_fee','pet_fee']) if (row[key] != null) numberField(row[key], label + '.' + key, 0, 100000);
    for (const key of ['pet_policy','parking_type']) if (row[key] != null && row[key] !== '') textField(row[key], label + '.' + key);
    metadata(row.meta, label + '.meta');
  });
  value.dealers.forEach((row, i) => {
    const label = 'dealers[' + i + ']';
    object(row, label, DEALER);
    slug(row.external_id, label + '.external_id');
    textField(row.dealer_name, label + '.dealer_name');
    location(row, label);
    textField(row.phone, label + '.phone', 7, 60);
    httpsUrl(row.website, label + '.website');
    if (row.financing_application_url != null) httpsUrl(row.financing_application_url, label + '.financing_application_url');
    metadata(row.meta, label + '.meta');
  });
  const dealers = new Set(value.dealers.map((row) => row.external_id));
  value.vehicles.forEach((row, i) => {
    const label = 'vehicles[' + i + ']';
    object(row, label, VEHICLE);
    if (typeof row.vin !== 'string' || !/^[A-HJ-NPR-Z0-9]{17}$/.test(row.vin)) fail(label + '.vin', 'enter a 17-character uppercase VIN without I, O or Q');
    slug(row.dealer_external_id, label + '.dealer_external_id');
    if (!dealers.has(row.dealer_external_id)) fail(label, 'dealer_external_id must match a dealer in this inventory file');
    numberField(row.year, label + '.year', 1886, new Date().getUTCFullYear() + 2, true);
    for (const key of ['make','model']) textField(row[key], label + '.' + key, 1, 100);
    for (const key of ['trim','body_type','fuel_type','transmission','drive']) if (row[key] != null && row[key] !== '') textField(row[key], label + '.' + key, 1, 100);
    numberField(row.mileage, label + '.mileage', 0, 2000000, true);
    numberField(row.price, label + '.price', 1, 10000000);
    choice(row.condition, ['new','used','cpo'], label + '.condition');
    choice(row.availability_status, ['available','pending','sold'], label + '.availability_status');
    httpsUrl(row.listing_url, label + '.listing_url');
    metadata(row.meta, label + '.meta');
  });
  unique(value.rentals.map((row) => row.external_id), 'rentals');
  unique(value.dealers.map((row) => row.external_id), 'dealers');
  unique(value.vehicles.map((row) => row.vin), 'vehicles');
  return value;
}
function validatePlaces(value, fillNewIds = false) {
  list(value, 'places', 2000);
  if (!value.length) fail('places', 'keep at least one guide');
  const result = value.map((place, i) => {
    const label = 'places[' + i + ']';
    object(place, label, PLACE);
    textField(place.county, label + '.county', 1, 150);
    // A city such as Sedona can span two counties; a listing still has one.
    for (const county of place.county.split('/')) countyState({ ...place, county }, label);
    slug(place.slug, label + '.slug');
    const expected = place.state.toLowerCase() + '-' + place.slug;
    const id = fillNewIds && !place.id ? expected : place.id;
    if (id !== expected) fail(label, 'ID must match state + slug; existing city URLs must stay stable');
    for (const key of ['name','region','sourcePublisher']) textField(place[key], label + '.' + key, 1, 150);
    textField(place.description, label + '.description', 51, 2000);
    list(place.planningTips, label + '.planningTips', 12);
    if (place.planningTips.length < 2) fail(label, 'add at least two planning tips');
    place.planningTips.forEach((tip) => textField(tip, label + '.planningTips', 1, 500));
    httpsUrl(place.sourceUrl, label + '.sourceUrl');
    if (place.contentKind !== 'planning-guide') fail(label, 'city content must remain a planning guide');
    return { ...place, id };
  });
  unique(result.map((place) => place.id), 'places');
  return result;
}
function placesFormatter() {
  let originalIds = [];
  return {
    fromFile: (text) => {
      const places = validatePlaces(JSON.parse(text));
      originalIds = places.map((place) => place.id);
      return { places };
    },
    toFile: (value) => {
      const places = validatePlaces(value.places, true);
      const ids = new Set(places.map((place) => place.id));
      if (originalIds.some((id) => !ids.has(id))) fail('places', 'existing city guides cannot be removed or renamed here');
      return JSON.stringify(places, null, 2) + '\n';
    },
  };
}
const inventoryFormatter = {
  fromFile: (text) => validateEditorContent(JSON.parse(text)),
  toFile: (value) => JSON.stringify(validateEditorContent(value), null, 2) + '\n',
};

/** Supplements append only; never silently replace an existing record. */
function appendUnique(base, extra, key, label) {
  const known = new Set(base.map((item) => item[key]));
  for (const item of extra) {
    if (known.has(item[key])) fail(label, 'identifier already exists: ' + item[key]);
    known.add(item[key]);
  }
  return [...base, ...extra];
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateEditorContent, validatePlaces, placesFormatter, inventoryFormatter, appendUnique, COUNTIES };
}

// Only the explicit standalone editor script initializes Decap. Importing these
// validators into the Next.js app never opens or initializes a CMS.
if (typeof window !== 'undefined' && document.currentScript && document.currentScript.getAttribute('data-content-editor') === 'true') {
  window.CMS_MANUAL_INIT = true;
  document.addEventListener('DOMContentLoaded', () => {
    const status = document.getElementById('editor-status');
    if (!window.CMS) {
      if (status) status.textContent = 'The editor could not load. Check your connection and reload; your content has not changed.';
      return;
    }
    window.CMS.registerCustomFormat('places-array', 'json', placesFormatter());
    window.CMS.registerCustomFormat('inventory-json', 'json', inventoryFormatter);
    // Official media-library extension contract: no standalone Git media writes.
    // The separate photo manager handles Blobs uploads and rights metadata.
    window.CMS.registerMediaLibrary({
      name: 'managed-place-photos',
      init: () => ({
        enableStandalone: () => false,
        show: () => { throw new Error('Use /admin/photos to publish place photos.'); },
      }),
    });
    window.CMS.init();
    if (status) status.textContent = 'GitHub sign-in requires a configured OAuth provider. Save drafts here, then review and merge their pull requests on GitHub. Use Photo manager for images.';
  }, { once: true });
}
