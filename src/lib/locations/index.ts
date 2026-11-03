import places from './places.json';
import metadata from './metadata.json';

export type LocationState = 'CA' | 'AZ';
export type LocationType = 'city' | 'town' | 'cdp';
export type LocationCounty = Readonly<{ geoid: string; name: string }>;
export type LocationRecord = Readonly<{
  id: string;
  geoid: string;
  state: LocationState;
  stateFips: string;
  name: string;
  officialName: string;
  type: LocationType;
  /** Only aliases explicitly included in the Census official name. */
  aliases: readonly string[];
  counties: readonly LocationCounty[];
  /** Census internal point, not a centroid, property location, or street address. */
  internalPoint: Readonly<{ lat: number; lng: number }>;
  sourceYear: number;
  sourceId: string;
  countySourceYear: number;
  countySourceId: string;
}>;

export type LocationSearchOptions = {
  query?: unknown;
  state?: unknown;
  county?: unknown;
  type?: unknown;
  page?: unknown;
  pageSize?: unknown;
};

export type LocationSearchResult = {
  items: readonly LocationRecord[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type LocationResolution = {
  status: 'matched' | 'ambiguous' | 'not-found';
  matches: readonly LocationRecord[];
};

function scalar(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function text(value: unknown): string {
  const first = scalar(value);
  return typeof first === 'string' ? first.trim() : '';
}

/** Case, accent, punctuation, and whitespace insensitive; no guessed place aliases. */
export function normalizeLocationText(value: unknown): string {
  return text(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function stateFilter(value: unknown): LocationState | '' | null {
  const first = scalar(value);
  if (first == null || first === '') return '';
  if (typeof first !== 'string') return null;
  const normalized = normalizeLocationText(first);
  if (!normalized) return first.trim() ? null : '';
  if (normalized === 'ca' || normalized === 'california') return 'CA';
  if (normalized === 'az' || normalized === 'arizona') return 'AZ';
  return null;
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

const records: LocationRecord[] = places.map((place) => Object.freeze({
  ...place,
  state: place.state as LocationState,
  type: place.type as LocationType,
  aliases: Object.freeze([...place.aliases]),
  counties: Object.freeze(place.counties.map((county) => Object.freeze({ ...county }))),
  internalPoint: Object.freeze({ ...place.internalPoint }),
}));

/** Complete 2026 Gazetteer corpus. Existing curated neighborhood guides remain separate. */
export const LOCATIONS: readonly LocationRecord[] = Object.freeze(records);
export const LOCATION_METADATA = Object.freeze(metadata);

const index = records.map((record) => {
  const names = [record.name, record.officialName, ...record.aliases].map(normalizeLocationText);
  const counties = record.counties.flatMap((county) => [
    county.geoid,
    normalizeLocationText(county.name),
    normalizeLocationText(county.name.replace(/ County$/, '')),
  ]);
  return {
    record,
    names,
    name: normalizeLocationText(record.name),
    counties,
    search: normalizeLocationText([
      ...names, ...counties, record.state,
      record.state === 'CA' ? 'California' : 'Arizona', record.geoid, record.id,
    ].join(' ')),
  };
}).sort((a, b) => compareText(a.name, b.name)
  || compareText(a.record.state, b.record.state) || compareText(a.record.geoid, b.record.geoid));

const byId = new Map(LOCATIONS.map((record) => [record.id, record]));

export function getLocation(id: unknown): LocationRecord | undefined {
  return byId.get(text(id).toLowerCase());
}

function positiveInteger(value: unknown, fallback: number, maximum: number): number {
  const first = scalar(value);
  if (typeof first !== 'number' && typeof first !== 'string') return fallback;
  const number = Number(first);
  return Number.isFinite(number) && number > 0
    ? Math.min(maximum, Math.max(1, Math.floor(number))) : fallback;
}

/** Filters are intersections. Invalid supplied jurisdictions never broaden the search. */
export function searchLocations(options: LocationSearchOptions = {}): LocationSearchResult {
  const state = stateFilter(options.state);
  const rawCounty = scalar(options.county);
  const county = normalizeLocationText(rawCounty);
  const rawType = scalar(options.type);
  const type = normalizeLocationText(rawType);
  const invalidCounty = rawCounty != null && (typeof rawCounty !== 'string' || (!!text(rawCounty) && !county));
  const invalidType = rawType != null && (typeof rawType !== 'string'
    || (!!text(rawType) && !['city', 'town', 'cdp'].includes(type)));
  const query = normalizeLocationText(options.query);
  const tokens = query.split(' ').filter(Boolean);
  const filtered = state === null || invalidCounty || invalidType ? [] : index.filter((entry) =>
    (!state || entry.record.state === state)
    && (!county || entry.counties.includes(county))
    && (!type || entry.record.type === type)
    && tokens.every((token) => entry.search.includes(token)));
  // Stable exact-name/prefix ranking; every remaining match is still paginated.
  if (query) {
    const rank = (names: string[]) => names.includes(query) ? 0 : names.some((name) => name.startsWith(query)) ? 1 : 2;
    filtered.sort((a, b) => rank(a.names) - rank(b.names));
  }
  const pageSize = positiveInteger(options.pageSize, 50, 200);
  const pageCount = Math.ceil(filtered.length / pageSize);
  const page = Math.min(positiveInteger(options.page, 1, Number.MAX_SAFE_INTEGER), Math.max(1, pageCount));
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map((entry) => entry.record),
    total: filtered.length, page, pageSize, pageCount,
  };
}

/** Exact names only; even a state may contain two distinct places with the same name. */
export function resolveLocation(name: unknown, state?: unknown): LocationResolution {
  const normalized = normalizeLocationText(name);
  const jurisdiction = stateFilter(state);
  const matches = !normalized || jurisdiction === null ? [] : index
    .filter((entry) => (!jurisdiction || entry.record.state === jurisdiction) && entry.names.includes(normalized))
    .map((entry) => entry.record);
  return { status: matches.length === 1 ? 'matched' : matches.length ? 'ambiguous' : 'not-found', matches };
}
