import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); }
catch {
  const localCompiler = process.env.TYPESCRIPT_PATH || 'C:/Users/TKDL/AppData/Roaming/npm/node_modules/typescript/lib/typescript.js';
  if (!existsSync(localCompiler)) throw new Error('Install the project development dependencies to run this test.');
  ts = require(localCompiler);
}
const staged = process.argv.includes('--staged');
function source(file) {
  const url = new URL('../' + file + (staged && existsSync(new URL('../' + file + '.stage', import.meta.url)) ? '.stage' : ''), import.meta.url);
  return readFileSync(url, 'utf8');
}
const jsx = (type, props) => ({ type, props: props || {} });
const jsxRuntime = { jsx, jsxs: jsx, Fragment: 'fragment' };
function load(file, mocks = {}, expose = '') {
  const text = source(file);
  const { outputText, diagnostics = [] } = ts.transpileModule(text, {
    fileName: file, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  assert.equal(diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error).length, 0, file + ' syntax');
  const module = { exports: {} };
  vm.runInNewContext(outputText + expose, {
    module, exports: module.exports, console, URL, URLSearchParams,
    requestAnimationFrame: (fn) => fn(),
    require: (name) => {
      if (name === 'react/jsx-runtime') return jsxRuntime;
      if (name === 'next/link') return { default: 'a' };
      if (name === 'lucide-react') return new Proxy({}, { get: (_, icon) => String(icon) });
      if (name in mocks) return mocks[name];
      throw new Error(file + ': unexpected dependency ' + name);
    },
  }, { timeout: 1500 });
  return module.exports;
}
function hooks() {
  let cursor = 0;
  const slots = [], effects = [];
  return {
    api: {
      useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
        return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
      },
      useRef(initial) { const index = cursor++; return slots[index] ||= { current: initial }; },
      useMemo: (fn) => fn(),
      useEffect(fn, deps) {
        const index = cursor++, previous = slots[index];
        if (!previous || deps.some((value, position) => value !== previous[position])) { effects.push(fn); slots[index] = deps; }
      },
    },
    render: (component, props) => { cursor = 0; return component(props); },
    flush: () => { effects.splice(0).forEach((effect) => effect()); },
  };
}
function all(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap((node) => all(node, predicate));
  if (!tree || typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...all(tree.props?.children, predicate)];
}
const node = (tree, predicate) => { const found = all(tree, predicate); assert.equal(found.length, 1); return found[0]; };
const text = (tree) => Array.isArray(tree) ? tree.map(text).join('') : tree && typeof tree === 'object' ? text(tree.props?.children) : tree == null || tree === false ? '' : String(tree);
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS ' + name); }

// Run the actual store implementation. Only Zustand's React subscription and
// persistence transport are replaced, so this test never touches localStorage.
const create = () => (initializer) => {
  let state;
  const get = () => state, set = (next) => { state = { ...state, ...(typeof next === 'function' ? next(state) : next) }; };
  state = initializer(set, get);
  const store = (selector) => selector(state);
  store.getState = get;
  return store;
};
const stores = load('src/lib/store/compare.ts', { zustand: { create }, 'zustand/middleware': { persist: (initializer) => initializer } });
const saved = () => stores.useSavedStore.getState();
const compare = () => stores.useCompareStore.getState();
const planningHooks = hooks();
const { RentalPlanningActions } = load('src/components/rentals/RentalPlanningActions.tsx', { react: planningHooks.api, '@/lib/store/compare': stores });
const planning = () => planningHooks.render(RentalPlanningActions, { id: 'fixture-home', name: 'Fixture Home' });
const action = (tree, word) => node(tree, (item) => item.type === 'button' && item.props['aria-label'].includes(word));
check('planning controls wait for client hydration before exposing persisted state', () => {
  saved().toggle('rental', 'fixture-home');
  const tree = planning();
  assert.ok(all(tree, (item) => item.type === 'button').every((item) => item.props.disabled));
  assert.equal(action(tree, 'Save')['props']['aria-pressed'], false);
  planningHooks.flush();
  assert.equal(action(planning(), 'Saved').props['aria-pressed'], true);
});
check('Save removes and restores only the requested record using the real store', () => {
  saved().toggle('car', 'keep-car');
  action(planning(), 'Saved').props.onClick();
  assert.equal(saved().has('rental', 'fixture-home'), false);
  assert.equal(saved().has('car', 'keep-car'), true);
  action(planning(), 'Save').props.onClick();
  assert.equal(saved().has('rental', 'fixture-home'), true);
  assert.match(text(planning()), /Saved on this device/);
});
check('Compare adds once, then removes without changing Saved', () => {
  action(planning(), 'Compare').props.onClick();
  assert.equal(compare().items.length, 1);
  assert.equal(action(planning(), 'Compare').props['aria-pressed'], true);
  action(planning(), 'Compare').props.onClick();
  assert.equal(compare().items.length, 0);
  assert.equal(saved().has('rental', 'fixture-home'), true);
});
check('comparison capacity includes other categories and exposes a recovery route', () => {
  for (let i = 0; i < 8; i++) compare().add(i % 2 ? 'car' : 'work-vehicle', 'full-' + i);
  action(planning(), 'Compare').props.onClick();
  assert.equal(compare().items.length, 8);
  assert.equal(compare().has('rental', 'fixture-home'), false);
  assert.match(text(planning()), /Compare is full/);
  assert.equal(node(planning(), (item) => item.props.href === '/compare').props.href, '/compare');
  compare().remove('work-vehicle', 'full-0');
  action(planning(), 'Compare').props.onClick();
  assert.equal(compare().items.length, 8);
  assert.equal(compare().has('rental', 'fixture-home'), true);
});
check('rapid calls read current comparison state instead of a captured render', () => {
  compare().clear();
  const handler = action(planning(), 'Compare').props.onClick;
  handler(); handler();
  assert.equal(compare().items.length, 0);
});

const fixture = { id: 'ca-known', property_name: 'CA known', state: 'CA', city: 'Irvine', county: 'Orange', unit_type: 'apartment', min_rent: 1600, max_rent: 1800, beds_max: 1, pet_policy: 'Pets allowed', parking_type: 'Covered', application_platform: 'AppFolio', manager: 'Fixture', meta: { last_verified_at: '2026-05-01' } };
const records = [fixture,
  { ...fixture, id: 'ca-unknown', property_name: 'CA unknown', min_rent: 0, pet_policy: 'No pets allowed', parking_type: 'No covered parking', meta: { last_verified_at: 'not-a-date' } },
  { ...fixture, id: 'az-home', property_name: 'AZ home', state: 'AZ', city: 'Phoenix', county: 'Maricopa', unit_type: 'townhouse', min_rent: 2200 },
  { ...fixture, id: 'ca-style', property_name: 'CA style', unit_type: 'townhome-style-apartment', min_rent: 1900, pet_policy: 'Unknown', parking_type: 'Not recorded' }];
const searchHooks = hooks();
const filtersModule = load('src/components/rentals/RentalFilters.tsx', { react: searchHooks.api, '@/lib/data/real-rentals': { REAL_RENTALS: records } });
const profile = { score: 0 };
const dependencies = {
  react: searchHooks.api, '@/lib/store/compare': stores,
  '@/lib/data/real-rentals': { REAL_RENTALS: records }, './RentalCard': { RentalCard: 'RentalCard' },
  './RentalFilters': filtersModule, './ProfilePanel': { ProfilePanel: 'ProfilePanel', useRenterProfile: () => [profile, () => {}] },
  '@/components/common/Pagination': { Pagination: 'Pagination', paginate: (items, page, size) => ({ items: items.slice((page - 1) * size, page * size), pageCount: Math.ceil(items.length / size) }) },
  '@/lib/scoring': { scoreRental: () => ({ score: 0 }) }, '@/lib/calculators': { usd: (value) => '$' + value },
  '@/lib/places/property-view': { recordedRent: () => 'Recorded amount' },
  '@/lib/data/screening-stacks': { inferScreeningStack: () => ({ strictness: 'standard' }) },
  '@/lib/data/workbook-ranked-listings': { WORKBOOK_CITY_OPTIONS: [], WORKBOOK_RANKED_LISTINGS: [], workbookMapUrl: () => null },
};
const { RentalSearch, __test: { filterRentals, sortRentals } } = load('src/components/rentals/RentalSearch.tsx', dependencies, ';module.exports.__test={filterRentals,sortRentals};');
const search = () => searchHooks.render(RentalSearch, { initialState: 'AZ', initialCity: 'Phoenix' });
check('initial bookmarked state and city survive the mobile shell', () => {
  const tree = search();
  const filters = node(tree, (item) => item.type === filtersModule.RentalFilters);
  assert.equal(filters.props.initial.state, 'AZ'); assert.equal(filters.props.initial.city, 'Phoenix');
  assert.match(text(tree), /1matching records/);
});
check('mobile disclosure opens and Escape returns focus to its trigger', () => {
  let tree = search();
  const toggle = node(tree, (item) => item.props['aria-controls'] === 'rental-filter-panel');
  assert.equal(toggle.props['aria-expanded'], false);
  toggle.props.onClick(); tree = search();
  assert.equal(node(tree, (item) => item.props['aria-controls'] === 'rental-filter-panel').props['aria-expanded'], true);
  let focused = false;
  toggle.props.ref.current = { getClientRects: () => [{}], focus: () => { focused = true; } };
  node(tree, (item) => item.props.id === 'rental-filter-panel').props.onKeyDown({ key: 'Escape' });
  assert.equal(focused, true);
  assert.equal(node(search(), (item) => item.props['aria-controls'] === 'rental-filter-panel').props['aria-expanded'], false);
});
check('Show results closes filters and moves focus to the results heading', () => {
  let tree = search();
  node(tree, (item) => item.props['aria-controls'] === 'rental-filter-panel').props.onClick();
  tree = search();
  let focus = false, scroll = false;
  node(tree, (item) => item.props.id === 'rental-results-heading').props.ref.current = {
    focus: () => { focus = true; }, scrollIntoView: () => { scroll = true; },
  };
  node(tree, (item) => item.type === filtersModule.RentalFilters).props.onDone();
  assert.ok(focus && scroll);
  assert.equal(node(search(), (item) => item.props['aria-controls'] === 'rental-filter-panel').props['aria-expanded'], false);
});
check('changing a filter updates actual results and removing the state clears its city', () => {
  let tree = search();
  node(tree, (item) => item.type === filtersModule.RentalFilters).props.onChange({ unit_type: 'all', state: 'CA', city: 'Irvine', max_rent: 1700 });
  tree = search();
  assert.match(text(tree), /1matching records/);
  node(tree, (item) => item.props['aria-label'] === 'Remove California filter').props.onClick();
  const filters = node(search(), (item) => item.type === filtersModule.RentalFilters).props.initial;
  assert.equal(filters.state, undefined); assert.equal(filters.city, undefined); assert.equal(filters.max_rent, 1700);
});
check('known rent filters and both sort directions keep unknown amounts excluded or last', () => {
  assert.deepEqual(Array.from(filterRentals(records, { unit_type: 'all', max_rent: 2000 }), (item) => item.id), ['ca-known', 'ca-style']);
  for (const direction of ['price-asc', 'price-desc']) assert.equal(sortRentals(records, direction, profile).at(-1).id, 'ca-unknown');
});
check('negative and unknown policy text does not become a positive feature', () => {
  assert.deepEqual(Array.from(filterRentals(records, { unit_type: 'all', state: 'CA', pets: true, parking_garage: true }), (item) => item.id), ['ca-known']);
});
check('locked apartment routes preserve townhome-style apartment records', () => {
  const result = filterRentals(records, { unit_type: 'all' }, 'apartment');
  assert.equal(result.length, 3);
  assert.ok(result.some((item) => item.id === 'ca-style'));
  assert.equal(filterRentals(records, { unit_type: 'all' }, 'townhouse')[0].id, 'az-home');
});
const filterHooks = hooks();
const { RentalFilters } = load('src/components/rentals/RentalFilters.tsx', { react: filterHooks.api, '@/lib/data/real-rentals': { REAL_RENTALS: records } });
check('state selection clears stale city while preserving the budget', () => {
  let changed;
  const tree = filterHooks.render(RentalFilters, { initial: { unit_type: 'all', state: 'CA', city: 'Irvine', max_rent: 2000 }, onChange: (next) => { changed = next; }, onReset: () => {} });
  node(tree, (item) => item.type === 'select' && item.props.value === 'CA').props.onChange({ target: { value: 'AZ' } });
  assert.equal(changed.state, 'AZ'); assert.equal(changed.city, undefined); assert.equal(changed.max_rent, 2000);
});
const navHooks = hooks();
let pathname = '/apartments/apply-engine';
const nav = load('src/components/shell/BottomNav.tsx', { react: navHooks.api, 'next/navigation': { usePathname: () => pathname }, '@/lib/store/compare': stores });
check('Apply is the only selected tab on the engine; property detail selects Homes', () => {
  let tree = navHooks.render(nav.BottomNav);
  assert.equal(all(tree, (item) => item.props.href).length, 5);
  assert.equal(node(tree, (item) => item.props['aria-current'] === 'page').props.href, '/apartments/apply-engine');
  for (const route of ['/homes', '/homes/sale-fixture', '/apartments/example', '/townhomes/example', '/properties/wb-1', '/rentals']) {
    pathname = route; tree = navHooks.render(nav.BottomNav);
    assert.equal(node(tree, (item) => item.props['aria-current'] === 'page').props.href, '/homes');
  }
});
check('saved tab count is deferred until hydration and includes all saved categories', () => {
  pathname = '/saved';
  let tree = navHooks.render(nav.BottomNav);
  assert.equal(node(tree, (item) => item.props.href === '/saved').props['aria-label'], undefined);
  navHooks.flush();
  tree = navHooks.render(nav.BottomNav);
  assert.match(node(tree, (item) => item.props.href === '/saved').props['aria-label'], /2 items on this device/);
});
check('manifest preserves five shortcuts and allows tablet landscape', () => {
  const manifest = JSON.parse(source('public/manifest.json'));
  assert.equal(manifest.orientation, 'any');
  assert.equal(manifest.shortcuts.length, 5);
  assert.ok(manifest.shortcuts.some((item) => item.url === '/apartments/apply-engine'));
});
const cardHooks = hooks();
const cardModule = load('src/components/rentals/RentalCard.tsx', {
  react: cardHooks.api,
  '@/components/ui/CandyCard': { CandyCard: 'article' },
  '@/components/ui/Gumdrop': { Gumdrop: 'badge' },
  '@/components/common/FitBadge': { FitBadge: 'FitBadge' },
  '@/components/common/SourcePanel': { SourcePanel: 'SourcePanel' },
  '@/components/theme/GingerbreadHouse': { GingerbreadApartment: 'illustration', GingerbreadTownhome: 'illustration' },
  './ScreeningPanel': { ScreeningBadge: 'ScreeningBadge' },
  './RentalPlanningActions': { RentalPlanningActions: 'RentalPlanningActions' },
  '@/lib/data/operator-profiles': { findOperatorProfile: () => null, TIER_LABEL: {}, TIER_TONE: {} },
  '@/components/common/LinkConfidenceBadge': { ApartmentLinkBadge: 'LinkBadge', VerifiedAtBadge: 'DateBadge' },
  '@/lib/links/resolver': { resolveApartmentApplicationLink: () => ({ kind: 'search', confidence: 'low' }) },
  '@/lib/places/property-view': { recordedRent: (low, high) => low > 0 ? '$' + low + ' - $' + high : 'Not recorded' },
  '@/lib/scoring': { scoreRental: () => ({ score: 0 }) },
  '@/lib/data/screening-stacks': { inferScreeningStack: () => ({ strictness: 'strict' }), STRICTNESS_LABEL: { strict: 'Higher estimate' } },
});
check('higher screening estimates use inline notes without blocking the detail link', () => {
  const rental = { ...fixture, official_property_url: 'https://example.com/property', available_date: '2026-05-04', photos: { urls: ['data:image/svg+xml,test', '/api/maps/streetview', 'other.svg'] } };
  const before = JSON.stringify(rental);
  const tree = cardHooks.render(cardModule.RentalCard, { rental, profile });
  assert.equal(all(tree, (item) => item.props.role === 'dialog').length, 0);
  assert.equal(all(tree, (item) => item.type === 'details').length, 1);
  assert.equal(node(tree, (item) => item.props['aria-label'] === 'View details for CA known').props.href, '/apartments/ca-known');
  assert.match(text(tree), /Recorded availability: May 4, 2026/);
  assert.match(text(tree), /Current availability is not confirmed/);
  assert.match(text(tree), /Record date: May 1, 2026/);
  assert.doesNotMatch(text(tree), /Verified today/);
  assert.equal(JSON.stringify(rental), before);
});
check('generated card preview is decorative and explicitly labeled as an illustration', () => {
  const rental = { ...fixture, photos: { urls: ['data:image/svg+xml,test', '/api/maps/streetview', 'other.svg'] } };
  const tree = cardHooks.render(cardModule.RentalCard, { rental, profile });
  const image = node(tree, (item) => item.type === 'img');
  assert.equal(image.props.alt, '');
  assert.equal(image.props.src, 'data:image/svg+xml,test');
  assert.match(text(node(tree, (item) => item.type === 'figcaption')), /Illustration/);
});
check('rental card actions preserve the townhouse detail route and record identity', () => {
  const rental = { ...fixture, id: 'town-fixture', unit_type: 'townhouse' };
  const tree = cardHooks.render(cardModule.RentalCard, { rental, profile });
  assert.equal(node(tree, (item) => item.props['aria-label'] === 'View details for CA known').props.href, '/townhomes/town-fixture');
  assert.equal(node(tree, (item) => item.type === 'RentalPlanningActions').props.id, 'town-fixture');
});
check('Escape never moves focus to the hidden desktop filter trigger', () => {
  let tree = search();
  const toggle = node(tree, (item) => item.props['aria-controls'] === 'rental-filter-panel');
  toggle.props.onClick();
  let focused = false;
  toggle.props.ref.current = { getClientRects: () => [], focus: () => { focused = true; } };
  tree = search();
  node(tree, (item) => item.props.id === 'rental-filter-panel').props.onKeyDown({ key: 'Escape' });
  assert.equal(focused, false);
});
console.log('Mobile rental behavior checks: ' + checks + ' passed. Browser layout and assistive-technology checks are separate.');
