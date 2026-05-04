/**
 * Cross-entity search index for Lightning McGreen Living.
 *
 * Indexes rentals (apartments + townhomes), vehicles, work-vehicle rentals,
 * dealers, and assistance resources into a single searchable list with smart
 * synonyms (LA → Los Angeles, OC → Orange, apt → apartment, etc.) and a
 * lightweight scoring function that handles partial / prefix / multi-token
 * queries.
 *
 * Pure data — no React deps — so it can run in a server route as well as
 * the client search box.
 */

import { REAL_RENTALS } from '@/lib/data/real-rentals';
import { REAL_VEHICLES, REAL_DEALERS } from '@/lib/data/real-vehicles';
import { REAL_WORK_VEHICLES } from '@/lib/data/real-work-vehicles';
import { ASSISTANCE_RESOURCES } from '@/lib/data/assistance';
import { WORKBOOK_RANKED_LISTINGS, workbookPrimaryUrl } from '@/lib/data/workbook-ranked-listings';

export type SearchKind =
  | 'rental-apartment'
  | 'rental-townhouse'
  | 'rental-workbook'
  | 'vehicle'
  | 'dealer'
  | 'work-vehicle'
  | 'assistance';

export interface SearchEntry {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  manager_or_provider?: string;
  city?: string;
  county?: string;
  /** Full normalized search text (lowercase). */
  text: string;
  /** Tokenized form (deduped). */
  tokens: string[];
  /** Optional thumbnail URL (single still — never animated). */
  thumb?: string;
}

/**
 * Synonym expansion map. Both sides are lowercased.
 *
 * Used at INDEX time so a query for "LA" matches an entry whose text contains
 * "los angeles", and used at QUERY time so a search for "los angeles" can
 * still match documents only tagged "LA".
 */
const SYNONYMS: Record<string, string[]> = {
  la: ['los angeles', 'la county', 'la-county'],
  'los angeles': ['la'],
  oc: ['orange', 'orange county'],
  orange: ['oc'],
  sb: ['san bernardino', 'san-bernardino'],
  'san bernardino': ['sb'],
  riv: ['riverside', 'riverside county'],
  riverside: ['riv'],
  ven: ['ventura', 'ventura county'],
  ventura: ['ven'],
  apt: ['apartment', 'apartments'],
  apartment: ['apt', 'apartments'],
  apartments: ['apt', 'apartment'],
  th: ['townhome', 'townhouse', 'townhomes'],
  townhome: ['th', 'townhouse'],
  townhouse: ['th', 'townhome'],
  townhomes: ['th', 'townhome', 'townhouse'],
  van: ['cargo-van', 'cargo van', 'cargovan'],
  truck: ['box-truck', 'pickup', 'flatbed', 'stake-bed'],
  pickup: ['truck'],
  car: ['vehicle', 'auto'],
  vehicle: ['car', 'auto'],
  rent: ['rental', 'lease'],
  rental: ['rent', 'lease'],
  ev: ['electric', 'tesla'],
  hybrid: ['gas-electric'],
  // Operator nicknames
  greys: ['greystar'],
  irvine: ['irvine company', 'irvineco'],
  avalon: ['avalonbay'],
  equity: ['equity residential'],
  // Dealer chains
  cmx: ['carmax'],
  cvn: ['carvana'],
  // County abbreviations are above
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s: string): string[] {
  return Array.from(new Set(normalize(s).split(/[\s-]+/).filter((t) => t.length > 1)));
}

function expandText(text: string): string {
  // For each token in text, append synonym tokens to text so an entry like
  // "Los Angeles" also indexes "la".
  const seen = new Set<string>();
  const out: string[] = [text];
  for (const tok of tokenize(text)) {
    const syns = SYNONYMS[tok];
    if (syns) {
      for (const s of syns) {
        if (!seen.has(s)) {
          seen.add(s);
          out.push(s);
        }
      }
    }
  }
  return out.join(' ');
}

function expandQueryTokens(query: string): string[] {
  const base = tokenize(query);
  const out = new Set<string>(base);
  for (const t of base) {
    const syns = SYNONYMS[t];
    if (syns) for (const s of syns) for (const inner of tokenize(s)) out.add(inner);
  }
  return Array.from(out);
}

export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const r of REAL_RENTALS) {
    const text = expandText(
      [
        r.property_name,
        r.unit_type,
        r.address_line,
        r.city,
        r.county,
        r.state,
        r.zip,
        r.manager,
        r.application_platform,
        r.move_in_specials ?? '',
        r.amenities?.join(' ') ?? '',
        r.accessibility_features?.join(' ') ?? '',
      ].join(' '),
    );
    entries.push({
      kind: r.unit_type === 'townhouse' ? 'rental-townhouse' : 'rental-apartment',
      id: r.id,
      title: r.property_name,
      subtitle: `${r.manager} · ${r.city}, CA · $${r.min_rent.toLocaleString()}+`,
      href: r.unit_type === 'townhouse' ? `/townhomes/${r.id}` : `/apartments/${r.id}`,
      manager_or_provider: r.manager,
      city: r.city,
      county: r.county,
      text,
      tokens: tokenize(text),
      thumb: (r as any).photos?.urls?.[0],
    });
  }

  const dealersById = new Map(REAL_DEALERS.map((d) => [d.id, d]));
  for (const v of REAL_VEHICLES) {
    const dealer = dealersById.get(v.dealer_id);
    const text = expandText(
      [
        v.year, v.make, v.model, v.trim ?? '',
        v.body_type ?? '', v.fuel_type ?? '', v.drive ?? '',
        v.condition,
        dealer?.dealer_name ?? '',
        dealer?.city ?? '',
        dealer?.county ?? '',
      ].join(' '),
    );
    entries.push({
      kind: 'vehicle',
      id: v.id,
      title: `${v.year} ${v.make} ${v.model} ${v.trim ?? ''}`.trim(),
      subtitle: `${dealer?.dealer_name ?? 'Dealer'} · ${v.mileage.toLocaleString()} mi · $${v.price.toLocaleString()}`,
      href: `/cars/${v.id}`,
      manager_or_provider: dealer?.dealer_name,
      city: dealer?.city,
      county: dealer?.county,
      text,
      tokens: tokenize(text),
      thumb: (v as any).photos?.urls?.[0],
    });
  }

  for (const d of REAL_DEALERS) {
    const text = expandText([d.dealer_name, d.legal_name ?? '', d.city, d.county].join(' '));
    entries.push({
      kind: 'dealer',
      id: d.id,
      title: d.dealer_name,
      subtitle: `${d.city}, CA · ${d.inventory_count ?? '—'} vehicles`,
      href: `/dealers/${d.id}`,
      manager_or_provider: d.dealer_name,
      city: d.city,
      county: d.county,
      text,
      tokens: tokenize(text),
    });
  }

  for (const w of REAL_WORK_VEHICLES) {
    const text = expandText(
      [w.provider_name, w.legal_name ?? '', w.vehicle_type, w.city, w.county, w.state].join(' '),
    );
    entries.push({
      kind: 'work-vehicle',
      id: w.id,
      title: w.provider_name,
      subtitle: `${w.vehicle_type.replace('-', ' ')} · ${w.city}, CA · $${w.daily_rate ?? '?'}/day`,
      href: `/work-vehicles/${w.id}`,
      manager_or_provider: w.provider_name,
      city: w.city,
      county: w.county,
      text,
      tokens: tokenize(text),
      thumb: (w as any).photos?.urls?.[0],
    });
  }

  for (const a of ASSISTANCE_RESOURCES) {
    const text = expandText(
      [a.program_name, a.agency, a.jurisdiction, a.topic, a.eligibility_summary].join(' '),
    );
    entries.push({
      kind: 'assistance',
      id: a.id,
      title: a.program_name,
      subtitle: `${a.agency} · ${a.jurisdiction}`,
      href: '/assistance',
      city: a.jurisdiction,
      text,
      tokens: tokenize(text),
    });
  }

  for (const w of WORKBOOK_RANKED_LISTINGS) {
    const href = workbookPrimaryUrl(w) ? '/apartments/apply-engine' : '/apartments/apply-engine';
    const text = expandText(
      [
        w.property_name,
        w.city ?? '',
        w.county ?? '',
        w.address ?? '',
        w.fit_tier ?? '',
        w.management_company ?? '',
        w.leasing_contact ?? '',
        w.screening_vendor ?? '',
        w.application_platform_inferred ?? '',
        w.greystar_snappt_flag ?? '',
      ].join(' '),
    );
    entries.push({
      kind: 'rental-workbook',
      id: w.id,
      title: w.property_name,
      subtitle: `Workbook rank ${w.rank ?? 'n/a'} · ${w.city ?? 'SoCal'} · ${w.rent_low != null ? `$${Math.round(w.rent_low).toLocaleString()}+` : 'Rent verify'}`,
      href,
      city: w.city ?? undefined,
      county: w.county ?? undefined,
      text,
      tokens: tokenize(text),
    });
  }

  return entries;
}

export interface SearchHit {
  entry: SearchEntry;
  score: number;
}

/** Score a single entry against pre-tokenized query. */
function scoreEntry(qTokens: string[], entry: SearchEntry): number {
  if (qTokens.length === 0) return 0;
  let score = 0;
  let allMatched = true;
  for (const q of qTokens) {
    let matched = false;
    if (entry.text.includes(q)) {
      score += 4;
      matched = true;
    }
    for (const t of entry.tokens) {
      if (t === q) {
        score += 12;
        matched = true;
        break;
      }
    }
    if (!matched) {
      for (const t of entry.tokens) {
        if (t.startsWith(q)) {
          score += 7;
          matched = true;
          break;
        }
      }
    }
    if (!matched && q.length >= 4) {
      // Fuzzy-ish: token contains query
      for (const t of entry.tokens) {
        if (t.includes(q)) {
          score += 3;
          matched = true;
          break;
        }
      }
    }
    if (!matched) allMatched = false;
  }
  // Reward when ALL query tokens land somewhere
  if (allMatched) score += 5;
  // Boost when title starts with the first query token
  const firstTok = qTokens[0];
  if (firstTok && normalize(entry.title).startsWith(firstTok)) score += 6;
  return score;
}

export function searchIndex(
  index: SearchEntry[],
  query: string,
  opts: { limit?: number; kinds?: SearchKind[] } = {},
): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const qTokens = expandQueryTokens(q);
  const limit = opts.limit ?? 12;
  const kinds = opts.kinds;

  const hits: SearchHit[] = [];
  for (const entry of index) {
    if (kinds && !kinds.includes(entry.kind)) continue;
    const score = scoreEntry(qTokens, entry);
    if (score > 0) hits.push({ entry, score });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}

export const KIND_LABEL: Record<SearchKind, string> = {
  'rental-apartment': 'Apartment',
  'rental-townhouse': 'Townhome',
  'rental-workbook': 'Workbook',
  vehicle: 'Car',
  dealer: 'Dealer',
  'work-vehicle': 'Work vehicle',
  assistance: 'Assistance',
};

export const KIND_TONE: Record<SearchKind, 'ok' | 'info' | 'warn' | 'mute'> = {
  'rental-apartment': 'info',
  'rental-townhouse': 'info',
  'rental-workbook': 'mute',
  vehicle: 'ok',
  dealer: 'mute',
  'work-vehicle': 'ok',
  assistance: 'warn',
};
