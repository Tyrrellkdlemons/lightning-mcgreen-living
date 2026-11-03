import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
let ts;
try { ts = require(process.env.TYPESCRIPT_PATH || 'typescript'); }
catch { ts = require(process.env.TYPESCRIPT_PATH || 'C:/Users/TKDL/AppData/Roaming/npm/node_modules/typescript/lib/typescript.js'); }
const jsx = (type, props) => ({ type, props: props || {} });
const jsxRuntime = { jsx, jsxs: jsx, Fragment: 'fragment' };
const componentPath = 'src/components/maps/MapPanel.tsx';
const componentUrl = new URL('../' + componentPath, import.meta.url);
const componentSource = readFileSync(componentUrl, 'utf8');
function load(path, mocks, globals = {}) {
  const source = path === componentPath ? componentSource : readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  // CommonJS VM fixtures need a concrete module URL; production bundlers resolve this worker asset.
  const vmSource = source.replaceAll('import.meta.url', JSON.stringify(new URL('../' + path, import.meta.url).href));
  const compiled = ts.transpileModule(vmSource, { fileName: path, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  assert.equal(compiled.diagnostics?.filter((item) => item.category === ts.DiagnosticCategory.Error).length, 0, path + ': valid syntax');
  const module = { exports: {} };
  vm.runInNewContext(compiled.outputText, { module, exports: module.exports, ...globals, require: (name) => {
    if (name === 'react/jsx-runtime') return jsxRuntime;
    if (name === 'next/image') return { default: 'img' };
    if (name === 'lucide-react') return new Proxy({}, { get: (_, name) => String(name) });
    if (name in mocks) return mocks[name];
    throw new Error('Unexpected import: ' + name);
  } }, { timeout: 1500 });
  return module.exports;
}
function expand(tree) {
  if (Array.isArray(tree)) return tree.map(expand);
  if (!tree || typeof tree !== 'object') return tree;
  if (typeof tree.type === 'function') return expand(tree.type(tree.props));
  return { ...tree, props: { ...tree.props, children: expand(tree.props.children) } };
}
function nodes(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap((item) => nodes(item, predicate));
  if (!tree || typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props.children, predicate)];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join(' ');
  return tree && typeof tree === 'object' ? text(tree.props.children) : tree == null || tree === false ? '' : String(tree);
}
const registry = load('src/lib/maps/basemap.ts', {}, { process: { env: { NEXT_PUBLIC_MAPTILER_API_KEY: 'fixture-only', NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: 'fixture-only' } } });
const ids = registry.getBasemapOptions().map((option) => option.id);
assert.equal(ids.length, 6);
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS ' + name); }
async function renderMap(id, hostile = false, { storedStyle = id, blockedWrites = false, hydrating = false } = {}) {
  const effects = [], maps = [], controls = [], markers = [], workers = [], subscriptions = [];
  const storageKey = 'lmgl:basemap-style';
  const stored = new Map([[storageKey, storedStyle]]), writes = [];
  const window = new EventTarget();
  let notifications = 0;
  const localStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => { if (blockedWrites) throw new Error('Storage disabled'); writes.push([key, value]); stored.set(key, value); },
    removeItem: (key) => stored.delete(key),
  };
  const selected = registry.resolveBasemap(id);
  const badText = '<img src=x onerror="throw new Error(1)">';
  const options = hostile ? { ...selected, attribution: badText, style: { version: 8, sources: { hostile: { type: 'raster', attribution: badText, tiles: [] } }, layers: [] } } : selected;
  const state = [];
  let cursor = 0;
  const react = {
    useRef: () => ({ current: {} }), useMemo: (fn) => fn(), useCallback: (fn) => fn, useEffect: (fn) => effects.push(fn),
    useSyncExternalStore: (subscribe, getSnapshot, getServerSnapshot) => {
      if (hydrating) return getServerSnapshot();
      subscriptions.push(subscribe(() => { notifications++; }));
      return getSnapshot();
    },
    useState: (initial) => { const position = cursor++; state[position] = typeof initial === 'function' ? initial() : initial; return [state[position], (next) => { state[position] = next; }]; },
  };
  const maplibre = {
    setWorkerUrl: (url) => workers.push(url),
    Map: class { constructor(config) { assert.equal(workers.length, 1, 'Configure the ESM worker before constructing a map'); maps.push(config); } addControl(control) { controls.push(control); } remove() { this.removed = true; } },
    NavigationControl: class NavigationControl {},
    AttributionControl: class AttributionControl { constructor() { throw new Error('Raw attribution control must never be enabled'); } },
    Marker: class { constructor(config) { this.element = config.element; } setLngLat(coords) { this.coords = coords; return this; } addTo() { markers.push(this); return this; } },
  };
  const makeElement = () => {
    const el = { style: {}, dataset: {}, setAttribute(name, value) { this[name] = value; } };
    Object.defineProperty(el, 'innerHTML', { set() { throw new Error('Raw HTML assignment'); } });
    return el;
  };
  const storageModule = load('src/lib/client/state.ts', { react }, { window, localStorage, Event });
  const { MapPanel } = load(componentPath, { react, 'maplibre-gl': maplibre, '@/lib/client/state': storageModule, '@/lib/maps/basemap': { ...registry, getDefaultBasemapId: () => 'carto-voyager', resolveBasemap: (selectedId) => selectedId === id ? options : registry.resolveBasemap(selectedId) } }, {
    URL, localStorage,
    document: { head: { querySelector: () => ({}), appendChild() {} }, createElement: makeElement },
  });
  const tree = expand(MapPanel({ lat: 34.05, lng: -118.24, zoom: 12, markers: [{ lat: 34.06, lng: -118.25, label: '<b>Recorded location</b>', tone: 'work' }] }));
  const cleanup = effects.map((fn) => fn());
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(maps.length, 1, 'The real effect constructs one map');
  return { tree, maps, controls, markers, workers, stored, writes,
    readStyle: () => storageModule.useStorageValue(storageKey),
    notifications: () => notifications,
    dispose: () => { for (const fn of [...cleanup, ...subscriptions]) if (typeof fn === 'function') fn(); },
  };
}
const expected = {
  'carto-voyager': ['OpenStreetMap contributors', 'CARTO'],
  'carto-dark': ['OpenStreetMap contributors', 'CARTO'],
  'esri-world-imagery': ['Esri', 'Maxar', 'Earthstar Geographics', 'GIS User Community'],
  'usgs-imagery': ['U.S. Geological Survey'],
  'maptiler-satellite': ['MapTiler', 'OpenStreetMap contributors'],
  'mapbox-satellite': ['Mapbox', 'OpenStreetMap contributors', 'Maxar', 'Improve this map'],
};
const allowedHosts = new Set(['www.openstreetmap.org', 'carto.com', 'www.esri.com', 'www.usgs.gov', 'www.maptiler.com', 'www.mapbox.com', 'www.maxar.com', 'apps.mapbox.com']);
for (const id of ids) {
  const result = await renderMap(id);
  check(id + ': real map effect disables HTML attribution while keeping map/markers', () => {
    assert.equal(JSON.stringify(result.maps[0].style), JSON.stringify(registry.resolveBasemap(id).style), 'Stored provider is restored');
    assert.equal(result.writes.length, 0, 'Mount must not overwrite a stored preference');
    assert.equal(result.workers[0], new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', componentUrl).href);
    assert.equal(result.maps[0].attributionControl, false);
    assert.deepEqual(Array.from(result.maps[0].center), [-118.24, 34.05]);
    assert.equal(result.maps[0].zoom, 12);
    assert.equal(result.controls.length, 1);
    assert.equal(result.controls[0].constructor.name, 'NavigationControl');
    assert.equal(result.markers.length, 2);
    assert.equal(result.markers[1].element.textContent, 'W');
    assert.equal(result.markers[1].element['aria-label'], '<b>Recorded location</b>');
  });
  check(id + ': visible React credits retain provider names and approved HTTPS links', () => {
    const credits = nodes(result.tree, (item) => item.props['aria-label'] === 'Map attribution');
    assert.equal(credits.length, 1);
    assert.equal(credits[0].props.hidden, undefined);
    assert.equal(credits[0].props['aria-hidden'], undefined);
    for (const name of expected[id]) assert.ok(text(credits).includes(name), 'Missing credit: ' + name);
    for (const anchor of nodes(credits, (item) => item.type === 'a')) {
      const url = new URL(anchor.props.href);
      assert.equal(url.protocol, 'https:'); assert.ok(allowedHosts.has(url.hostname));
      assert.equal(url.username, ''); assert.equal(url.password, '');
      assert.equal(anchor.props.rel, 'noopener noreferrer');
    }
    if (id.startsWith('carto') || id.startsWith('maptiler') || id.startsWith('mapbox')) assert.ok(nodes(credits, (item) => item.props.href === 'https://www.openstreetmap.org/copyright').length);
    if (id.startsWith('maptiler') || id.startsWith('mapbox')) {
      const logo = nodes(credits, (item) => item.type === 'img');
      assert.equal(logo.length, 1); assert.equal(logo[0].props.unoptimized, true);
      assert.match(logo[0].props.alt, /logo/);
      if (id.startsWith('mapbox')) {
        const svg = Buffer.from(logo[0].props.src.split(',')[1], 'base64').toString();
        assert.ok(svg.includes('80.47 20.02'), 'Full official wordmark, not the separate icon');
        assert.doesNotMatch(svg, /<script|<foreignObject|(?:href|src)\s*=|onload\s*=/i);
      }
    }
  });
  result.dispose();
}
const hostile = await renderMap('carto-voyager', true);
check('remote attribution markup cannot become rendered markup, links, or text', () => {
  assert.equal(hostile.maps[0].attributionControl, false);
  assert.doesNotMatch(text(hostile.tree), /onerror|throw new Error/);
  assert.equal(nodes(hostile.tree, (item) => item.props.dangerouslySetInnerHTML || item.props.onError || item.props.href === 'x').length, 0);
});
check('provider selection and Street/Satellite/Dark controls remain wired', () => {
  const selector = nodes(hostile.tree, (item) => item.type === 'select');
  // The default street has only one provider; satellite has four when keys exist.
  assert.equal(selector.length, 0);
  const satellite = nodes(hostile.tree, (item) => item.type === 'button' && item.props['aria-label'] === 'Satellite')[0];
  satellite.props.onClick();
  assert.equal(hostile.stored.get('lmgl:basemap-style'), 'esri-world-imagery');
  assert.equal(hostile.readStyle(), 'esri-world-imagery');
  assert.ok(hostile.notifications() > 0, 'Same-tab write notifies the subscribed map');
});
hostile.dispose();
const invalidStyle = await renderMap('carto-voyager', false, { storedStyle: 'unknown-provider' });
check('invalid saved provider falls back without destroying the stored value', () => {
  assert.equal(JSON.stringify(invalidStyle.maps[0].style), JSON.stringify(registry.resolveBasemap('carto-voyager').style));
  assert.equal(invalidStyle.stored.get('lmgl:basemap-style'), 'unknown-provider');
  assert.equal(invalidStyle.writes.length, 0);
});
invalidStyle.dispose();
const hydratedStyle = await renderMap('carto-voyager', false, { storedStyle: 'mapbox-satellite', hydrating: true });
check('server hydration snapshot keeps the default map without overwriting the saved provider', () => {
  assert.equal(JSON.stringify(hydratedStyle.maps[0].style), JSON.stringify(registry.resolveBasemap('carto-voyager').style));
  assert.equal(hydratedStyle.stored.get('lmgl:basemap-style'), 'mapbox-satellite');
  assert.equal(hydratedStyle.writes.length, 0);
});
hydratedStyle.dispose();
const blockedStorage = await renderMap('carto-voyager', false, { blockedWrites: true });
check('map provider changes remain usable in memory when browser storage rejects writes', () => {
  nodes(blockedStorage.tree, item => item.type === 'button' && item.props['aria-label'] === 'Satellite')[0].props.onClick();
  assert.equal(blockedStorage.readStyle(), 'esri-world-imagery');
  assert.equal(blockedStorage.stored.get('lmgl:basemap-style'), 'carto-voyager');
  assert.ok(blockedStorage.notifications() > 0);
});
blockedStorage.dispose();
check('MapLibre ESM worker and CSS stay aligned with the installed release', () => {
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(manifest.dependencies['maplibre-gl'], /^6\./);
  assert.ok(componentSource.includes('https://unpkg.com/maplibre-gl@' + manifest.dependencies['maplibre-gl'] + '/dist/maplibre-gl.css'));
  assert.match(componentSource, /new URL\('maplibre-gl\/dist\/maplibre-gl-worker\.mjs', import\.meta\.url\)/);
});
check('no replacement raw HTML path exists in the map component', () => {
  assert.doesNotMatch(componentSource, /dangerouslySetInnerHTML|\.innerHTML\s*=|\.setHTML\s*\(|new\s+(?:\w+\.)?AttributionControl\s*\(/);
});
console.log('Map attribution checks: ' + checks + ' passed. No network, browser, or file writes are performed by this test.');