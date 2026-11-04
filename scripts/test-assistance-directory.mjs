import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const resources = (await Promise.all(['california', 'arizona', 'partners'].map(async name => JSON.parse(await read(`src/content/assistance_resources/${name}.json`)).resources))).flat();
const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(await read('src/lib/assistance-directory/model.ts'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, { module, exports: module.exports, URL, URLSearchParams, Intl, Date }, { timeout: 1500 });
const m = module.exports;
const allPlaces = JSON.parse(await read('src/lib/locations/places.json'));
const placeRows = Array.isArray(allPlaces) ? allPlaces : allPlaces.places;
const counties = Object.fromEntries(['CA', 'AZ'].map(state => [state, [...new Set(placeRows.filter(p => p.state === state).flatMap(p => p.counties.map(c => c.name.replace(/ County$/, ''))))]]));
const places = placeRows.map(p => ({state:p.state,name:p.name,counties:p.counties.map(c=>c.name.replace(/ County$/, ''))}));
let checks = 0;
function check(name, run) { run(); checks++; console.log('PASS ' + name); }
check('required record schema and evidence are complete', () => {
  const ids = new Set();
  const strings = ['id','name','administrator','assistance_summary','assistance_amount','assistance_type','eligibility_notes','how_to_apply','source_url','last_verified','verification_notes','supplied_date','supplied_claim','reviewed_at'];
  for (const r of resources) {
    for (const field of strings) assert.ok(typeof r[field] === 'string' && r[field].trim(), `${r.id}.${field}`);
    assert.match(r.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!ids.has(r.id), `duplicate ${r.id}`); ids.add(r.id);
    assert.ok(['CA','AZ'].includes(r.state));
    assert.ok(['down_payment','rental_assistance','both'].includes(r.category));
    assert.ok(['statewide','county','city','regional','national'].includes(r.scope));
    assert.ok(['verified','partial','unverified','closed'].includes(r.verification_status));
    assert.ok(['official','directory','guide'].includes(r.source_kind));
    for (const field of ['counties','cities','source_rows']) assert.ok(Array.isArray(r[field]) && r[field].every(v => typeof v === 'string'), `${r.id}.${field}`);
    assert.ok(r.source_rows.length > 0);
    for (const county of r.counties) assert.ok(counties[r.state].includes(county.replace(/ County$/i,'')), `${r.id}: county ${county}`);
    assert.ok(m.safeAssistanceSourceUrl(r.source_url), `${r.id}: unsafe/missing source`);
    for (const field of ['last_verified','supplied_date','reviewed_at']) {
      assert.match(r[field], /^\d{4}-\d{2}-\d{2}$/); assert.ok(Number.isFinite(Date.parse(r[field])) && Date.parse(r[field]) <= Date.now());
    }
    if (r.cost_purposes) for (const purpose of r.cost_purposes) assert.ok(Object.hasOwn(m.ASSISTANCE_PURPOSE_LABELS, purpose), `${r.id}: purpose`);
    if (r.help_kind) assert.ok(['financial_assistance','referral','deposit_alternative','paid_guarantor'].includes(r.help_kind));
    if (r.scope === 'city') assert.ok(r.cities.length);
    if (m.isPaidAssistanceResource(r)) assert.ok(r.property_participation?.includes('unconfirmed'));
  }
});
check('all supplied table rows and eleven addendum leads are mapped', () => {
  const rows = new Set(resources.flatMap(r => r.source_rows));
  // 51 CA + 41 AZ + 19 partner rows + 11 addendum leads; canonical duplicates retain aliases.
  assert.ok(rows.size >= 122);
  for (const [prefix,count] of [['CA-STATE-',8],['CA-DPA-',27],['CA-RENT-',5],['CA-LOCAL-RENT-',11],['AZ-STATE-DPA-',3],['AZ-LOCAL-DPA-',20],['AZ-STATE-RENT-',3],['AZ-LOCAL-RENT-',15],['PARTNER-DPA-',9],['PARTNER-RENT-',10],['ADDON-',11]]) {
    for (let i=1;i<=count;i++) assert.ok(rows.has(prefix+String(i).padStart(2,'0')));
  }
});
check('state, county and city matching excludes wrong jurisdictions', () => {
  const az = m.filterAssistanceResources(resources, {state:'AZ'}, counties);
  assert.ok(az.length && az.every(r => r.state === 'AZ'));
  const county = m.filterAssistanceResources(resources, {county:'Maricopa'}, counties);
  assert.ok(county.length && county.every(r => r.state === 'AZ'));
  assert.equal(m.filterAssistanceResources(resources,{state:'CA',county:'Maricopa'},counties).length,0);
  const phoenix = m.filterAssistanceResources(resources,{city:'Phoenix'},counties,places);
  assert.ok(phoenix.length && phoenix.every(r=>r.state==='AZ'));
  const queenCreek = m.filterAssistanceResources(resources,{state:'AZ',city:'Queen Creek'},counties,places);
  assert.ok(queenCreek.some(r=>r.name.includes('Home in Five')));
  assert.equal(m.filterAssistanceResources(resources,{state:'CA',city:'Phoenix'},counties,places).length,0);
  const pima = resources.find(r => r.id === 'az-tucson-pima-home-consortium');
  assert.ok(m.assistanceAppliesToPlace(pima,'AZ','Pima','Oro Valley'));
  const impact = resources.find(r => r.id === 'ca-addon-05');
  assert.ok(m.assistanceAppliesToPlace(impact,'CA','San Bernardino','Fontana'));
  assert.ok(!m.assistanceAppliesToPlace(impact,'CA','San Bernardino','Redlands'));
  assert.ok(!m.assistanceAppliesToPlace(impact,'AZ','San Bernardino','Fontana'));
  assert.ok(m.filterAssistanceResources(resources,{state:'AZ',q:'White Mountain Catholic Charities'},counties).length);
});
check('funding corrections and cost-purpose separation remain enforced', () => {
  const boa = resources.find(r => r.id === 'ca-partner-dpa-06');
  assert.ok(!m.assistanceCostPurposes(boa).includes('purchase_closing_costs'));
  for (const r of resources.filter(r => r.id.endsWith('partner-dpa-09'))) {
    assert.equal(r.verification_status,'closed'); assert.match(r.assistance_amount,/\$0/);
    assert.match(m.verificationDateLabel(r),/Closure status checked/);
  }
  for (const r of resources.filter(m.isPaidAssistanceResource)) {
    assert.equal(r.category,'rental_assistance'); assert.ok(!m.assistanceCostPurposes(r).includes('purchase_down_payment'));
  }
  const unknown=resources.find(r=>r.verification_status==='unverified');
  assert.match(m.verificationDateLabel(unknown),/not independently verified/);
});
check('safe URLs, published image keys and structured-data escaping', () => {
  for (const url of ['javascript:alert(1)','https://user:password@example.com','http://example.com','https://localhost/x']) assert.equal(m.safeAssistanceSourceUrl(url),null);
  assert.equal(m.assistanceLogoSource('images/az-phoenix/12345678-1234-4123-8123-123456789abc'),'/place-photos/az-phoenix/12345678-1234-4123-8123-123456789abc');
  for (const key of ['../../secret','https://example.com/img','images/x/../../secret','images/x/not-a-uuid']) assert.equal(m.assistanceLogoSource(key),null);
  const value={name:'</script><script>alert(1)</script>'}; const encoded=m.safeAssistanceJsonLd(value);
  assert.ok(!encoded.includes('<')); assert.deepEqual(JSON.parse(encoded),value);
});
const requireConfig = await read('public/admin/content/config.yml');
check('Decap collection targets all three real JSON files and retains review workflow', () => {
  const c=JSON.parse(requireConfig); const collection=c.collections.find(x=>x.name==='assistance_resources');
  assert.equal(c.publish_mode,'editorial_workflow'); assert.equal(collection.publish,false);
  assert.deepEqual(collection.files.map(x=>x.file),['california','arizona','partners'].map(n=>`src/content/assistance_resources/${n}.json`));
  for(const file of collection.files){const fields=file.fields[0].fields; assert.equal(file.fields[0].widget,'list');for(const name of Object.keys(resources[0]).filter(k=>k!=='image_key'))assert.ok(fields.some(f=>f.name===name),name); assert.ok(fields.some(f=>f.name==='image_key'));}
});
console.log(`PASS ${checks} assistance directory regression groups; ${resources.length} resources. Live funding, authenticated CMS and browser interaction are separate checks.`);
