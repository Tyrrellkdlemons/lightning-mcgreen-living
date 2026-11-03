import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as nodeModule from 'node:module';
import vm from 'node:vm';

const source = await readFile(new URL('../src/lib/data/assistance.ts', import.meta.url), 'utf8');
const js = typeof nodeModule.stripTypeScriptTypes === 'function'
  ? nodeModule.stripTypeScriptTypes(source, { mode: 'strip' })
  : (await import('typescript')).default.transpileModule(source, { compilerOptions: { module: 99, target: 9 } }).outputText;
const code = js.replace(/^import[\s\S]*?;\s*/gm, '').replace(/\bexport\s+(?=const|function)/g, '');
const { ASSISTANCE_RESOURCES: resources, resourcesForCountyAndState: select, assistancePhoneHref: phone } =
  vm.runInNewContext(code + ';({ ASSISTANCE_RESOURCES, resourcesForCountyAndState, assistancePhoneHref });', {}, { timeout: 1500 });
let checks = 0;
const check = (label, fn) => { fn(); checks++; console.log('PASS ' + label); };
check('Arizona receives Arizona statewide help and no California county help', () => {
  const result = select('Pima', 'AZ');
  assert.ok(result.statewide.length > 0);
  assert.ok(result.statewide.every((item) => item.jurisdiction === 'Arizona'));
  assert.equal(result.byCounty.length, 0);
});
check('county names never substitute for the explicit state', () => {
  assert.equal(select('Los Angeles', 'AZ').byCounty.length, 0);
  assert.ok(select(' Los Angeles County ', 'CA').byCounty.length > 0);
});
check('other California counties still receive California statewide help', () => {
  const result = select('Alameda', 'CA');
  assert.ok(result.statewide.length > 0);
  assert.ok(result.statewide.every((item) => item.jurisdiction === 'California'));
});
check('legacy callers retain their California default', () => {
  assert.ok(select('Orange').byCounty.length > 0);
  assert.ok(select('Orange').statewide.every((item) => item.jurisdiction === 'California'));
});
check('federal help remains available in both states', () => {
  for (const state of ['CA', 'AZ']) {
    const result = select('', state);
    assert.ok(result.federal.length > 0);
    assert.ok(result.federal.every((item) => item.jurisdiction === 'Federal'));
  }
});
check('phone links accept complete public numbers and 211', () => {
  assert.equal(phone('1-888-694-0040'), 'tel:18886940040');
  assert.equal(phone('(877) 410-8829'), 'tel:8774108829');
  assert.equal(phone('211'), 'tel:211');
});
check('incomplete and placeholder phone values never become dial links', () => {
  for (const value of [undefined, '', '213', '(213) child-of-help - see site', '+', 'https://example.invalid']) assert.equal(phone(value), null);
});
check('directory identifiers and URLs are usable', () => {
  assert.equal(new Set(resources.map((item) => item.id)).size, resources.length);
  for (const item of resources) {
    assert.match(item.id, /^[a-z0-9-]+$/);
    for (const href of [item.application_url, item.source_url, ...(item.printable_docs ?? []).map((doc) => doc.url)]) {
      const url = new URL(href); assert.equal(url.protocol, 'https:'); assert.equal(url.username + url.password, '');
    }
    if (item.application_phone) assert.ok(phone(item.application_phone), item.id);
  }
});
check('reported closed programs are not advertised with opening dates', () => {
  for (const id of ['la-errp-2026', 'az-arap-status']) {
    const resource = resources.find((item) => item.id === id);
    assert.equal(resource.application_status, 'closed');
    assert.equal(resource.reopen_date, undefined);
  }
});
console.log('PASS: ' + checks + ' assistance checks. Browser, provider eligibility and live applications NOT_RUN.');
