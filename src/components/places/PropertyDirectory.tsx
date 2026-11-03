'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { WORKBOOK_RANKED_LISTINGS, WORKBOOK_CITY_OPTIONS, type WorkbookRankedListing } from '@/lib/data/workbook-ranked-listings';
import { filterWorkbookProperties, propertyPath, recordedRent } from '@/lib/places/property-view';

const TIERS = Array.from(new Set(WORKBOOK_RANKED_LISTINGS.map(item => item.fit_tier).filter((value): value is string => Boolean(value)))).sort();
const PAGE_SIZE = 24;
const control = 'mt-2 min-h-11 w-full min-w-0 rounded-xl border border-gingerbread-300 bg-white px-3 py-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-lightning-700';
const chip = 'inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-gingerbread-300 bg-white px-3 py-2 text-left text-xs font-semibold text-chocolate-900 focus:outline-none focus:ring-2 focus:ring-lightning-700';
type PropertySort = 'rank' | 'name' | 'city' | 'rent-asc' | 'rent-desc';
function positiveNumber(value: unknown): number | null { return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null; }
function exactBedrooms(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return null;
  const number = Number(value.trim());
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}
function recordedMaximum(item: WorkbookRankedListing): number | null {
  const high = positiveNumber(item.rent_high); const low = positiveNumber(item.rent_low);
  return high !== null && (low === null || high >= low) ? high : null;
}
function compareKnown(a: number | null, b: number | null, descending = false) {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return descending ? b - a : a - b;
}
function matchesRecordedFilters(item: WorkbookRankedListing, maxRent: string, beds: string): boolean {
  if (beds && exactBedrooms(item.beds) !== Number(beds)) return false;
  if (maxRent) {
    const cap = Number(maxRent); const maximum = recordedMaximum(item);
    if (!Number.isFinite(cap) || cap <= 0 || maximum === null || maximum > cap) return false;
  }
  return true;
}
function compareProperties(a: WorkbookRankedListing, b: WorkbookRankedListing, sort: PropertySort): number {
  let compared = 0;
  if (sort === 'rank') compared = compareKnown(positiveNumber(a.rank), positiveNumber(b.rank));
  if (sort === 'city') compared = !a.city ? (b.city ? 1 : 0) : !b.city ? -1 : a.city.localeCompare(b.city);
  if (sort === 'rent-asc' || sort === 'rent-desc') compared = compareKnown(recordedMaximum(a), recordedMaximum(b), sort === 'rent-desc');
  return compared || a.property_name.localeCompare(b.property_name);
}
const BED_OPTIONS = Array.from(new Set(WORKBOOK_RANKED_LISTINGS.map(item => exactBedrooms(item.beds)).filter((value): value is number => value !== null))).sort((a, b) => a - b);
const UNKNOWN_RENT_COUNT = WORKBOOK_RANKED_LISTINGS.filter(item => recordedMaximum(item) === null).length;

export function PropertyDirectory(props: { initialQuery?: string; initialCity?: string; initialTier?: string }) { return <PropertyDirectoryContent key={JSON.stringify([props.initialQuery,props.initialCity,props.initialTier])} {...props}/>; }
function PropertyDirectoryContent({ initialQuery = '', initialCity = '', initialTier = '' }: { initialQuery?: string; initialCity?: string; initialTier?: string }) {
  const [query, setQuery] = useState(initialQuery); const [city, setCity] = useState(initialCity); const [tier, setTier] = useState(initialTier);
  const [maxRent, setMaxRent] = useState(''); const [beds, setBeds] = useState(''); const [sort, setSort] = useState<PropertySort>('rank'); const [limit, setLimit] = useState(PAGE_SIZE);
  const results = useMemo(() => filterWorkbookProperties(WORKBOOK_RANKED_LISTINGS, query, city, tier).filter(item => matchesRecordedFilters(item, maxRent, beds)).sort((a, b) => compareProperties(a, b, sort)), [query, city, tier, maxRent, beds, sort]);
  const reset = () => { setQuery(''); setCity(''); setTier(''); setMaxRent(''); setBeds(''); setSort('rank'); setLimit(PAGE_SIZE); };
  const filters = [
    ...(query ? [{ label: `Search: ${query}`, clear: () => setQuery('') }] : []),
    ...(city ? [{ label: `City: ${city}`, clear: () => setCity('') }] : []),
    ...(tier ? [{ label: `Recorded tier: ${tier}`, clear: () => setTier('') }] : []),
    ...(maxRent ? [{ label: `Recorded rent up to $${Number(maxRent).toLocaleString('en-US')}`, clear: () => setMaxRent('') }] : []),
    ...(beds ? [{ label: `${beds} bedrooms recorded exactly`, clear: () => setBeds('') }] : []),
  ];
  return <section className="mt-8 min-w-0" aria-labelledby="property-directory-title">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Your research, easier to explore</p><h2 id="property-directory-title" className="section-heading mt-2">Find a property</h2></div><p role="status" aria-atomic="true" className="text-sm font-semibold text-chocolate-700">{results.length} of {WORKBOOK_RANKED_LISTINGS.length} records · {Math.min(limit, results.length)} shown</p></div>
    <div className="mt-5 rounded-2xl border border-gingerbread-300 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-bold text-chocolate-900"><SlidersHorizontal className="h-4 w-4" aria-hidden /> Narrow the workbook</div>
      <p id="property-filter-note" className="mt-2 max-w-3xl text-sm leading-relaxed text-chocolate-700">Historical research, not current vacancies or quotes. Rent filters use the upper end of recorded ranges; {UNKNOWN_RENT_COUNT} records without a usable rent are excluded when a cap is set. Bedroom filters match exact counts only, so “2+” is not treated as exactly 2.</p>
      <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="min-w-0 text-xs font-bold text-chocolate-700">Property, address, county or rank<div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-chocolate-600" aria-hidden /><input type="search" value={query} onChange={e => { setQuery(e.target.value); setLimit(PAGE_SIZE); }} placeholder="Try Jamboree or Riverside" className={`${control} pl-9`} /></div></label>
        <label className="min-w-0 text-xs font-bold text-chocolate-700">City<select value={city} onChange={e => { setCity(e.target.value); setLimit(PAGE_SIZE); }} className={control}><option value="">All workbook cities</option>{initialCity && !WORKBOOK_CITY_OPTIONS.includes(initialCity) && <option value={initialCity}>{initialCity}</option>}{WORKBOOK_CITY_OPTIONS.map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="min-w-0 text-xs font-bold text-chocolate-700">Original workbook tier<select value={tier} onChange={e => { setTier(e.target.value); setLimit(PAGE_SIZE); }} className={control}><option value="">All recorded tiers</option>{initialTier && !TIERS.includes(initialTier) && <option value={initialTier}>{initialTier}</option>}{TIERS.map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="min-w-0 text-xs font-bold text-chocolate-700">Recorded rent cap ($ / month)<input type="number" min="1" step="1" inputMode="numeric" value={maxRent} onChange={e => { setMaxRent(e.target.value); setLimit(PAGE_SIZE); }} placeholder="No cap" aria-describedby="property-filter-note" className={control} /></label>
        <label className="min-w-0 text-xs font-bold text-chocolate-700">Recorded bedrooms<select value={beds} onChange={e => { setBeds(e.target.value); setLimit(PAGE_SIZE); }} aria-describedby="property-filter-note" className={control}><option value="">All recorded layouts</option>{BED_OPTIONS.map(value => <option key={value} value={value}>{value === 0 ? 'Studio (exact count)' : `${value} bedrooms (exact count)`}</option>)}</select></label>
        <label className="min-w-0 text-xs font-bold text-chocolate-700">Sort records<select value={sort} onChange={e => { setSort(e.target.value as PropertySort); setLimit(PAGE_SIZE); }} className={control}><option value="rank">Original workbook order</option><option value="name">Property name A–Z</option><option value="city">City A–Z</option><option value="rent-asc">Recorded rent: low to high</option><option value="rent-desc">Recorded rent: high to low</option></select></label>
      </div>
      {(filters.length > 0 || sort !== 'rank') && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gingerbread-200 pt-4" aria-label="Active property filters">{filters.map(filter => <button type="button" key={filter.label} onClick={() => { filter.clear(); setLimit(PAGE_SIZE); }} className={chip} aria-label={`Remove ${filter.label}`}><span className="break-words [overflow-wrap:anywhere]">{filter.label}</span><X className="h-3.5 w-3.5 shrink-0" aria-hidden /></button>)}<button type="button" onClick={reset} className="min-h-11 px-3 text-sm font-bold text-lightning-800 underline">Reset all</button></div>}
    </div>
    <p className="mt-3 text-xs text-chocolate-700">Workbook order and tiers preserve the original research; they are not approval predictions. Unknown rents sort last in both directions.</p>
    {results.length > 0 ? <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{results.slice(0, limit).map(listing => <li key={listing.id} className="min-w-0"><Link href={propertyPath(listing.id)} className="explore-card flex h-full min-w-0 flex-col p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wider text-chocolate-600">Workbook #{listing.rank ?? '—'}</span>{listing.fit_tier && <span className="rounded-full bg-frosting-100 px-2.5 py-1 text-xs font-semibold text-chocolate-700">Recorded: {listing.fit_tier}</span>}</div>
      <h3 className="mt-4 break-words font-display text-xl font-extrabold text-chocolate-900">{listing.property_name}</h3><p className="mt-2 flex items-start gap-1.5 text-sm text-chocolate-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{listing.city || 'City not recorded'}, CA</p>
      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-gingerbread-200 py-3"><div><p className="text-[11px] font-bold uppercase text-chocolate-600">Historical rent</p><p className="mt-1 text-sm font-bold text-chocolate-900">{recordedRent(positiveNumber(listing.rent_low), positiveNumber(listing.rent_high))}</p></div><div><p className="text-[11px] font-bold uppercase text-chocolate-600">Recorded layout</p><p className="mt-1 text-sm font-bold text-chocolate-900">{listing.beds ? `${listing.beds} beds` : 'Not recorded'}</p></div></div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-chocolate-700">{listing.best_feature || 'Open the full workbook research, map context and original sources.'}</p><div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs text-chocolate-600">Source date: {listing.source_date || 'not recorded'}</span><ArrowUpRight className="h-5 w-5 shrink-0 text-lightning-700" aria-hidden /></div><span className="mt-2 text-sm font-bold text-lightning-700">View property research</span>
    </Link></li>)}</ul> : <div className="mt-5 rounded-2xl border border-gingerbread-300 bg-frosting-100 p-6"><h3 className="font-display text-xl font-bold text-chocolate-900">No workbook property matches these filters.</h3><p className="mt-2 max-w-2xl text-sm leading-relaxed text-chocolate-700">Remove a filter or raise the recorded rent cap. Missing rent and non-exact bedroom counts cannot match those filters. These 79 historical California records do not cover every home or assistance option.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={reset} className="bolt-btn">Show all 79 records</button><Link href="/places" className="cinnamon-btn">Explore city guides</Link><Link href="/help" className="inline-flex min-h-11 items-center font-semibold text-lightning-800 underline">Find housing help</Link><Link href="/assistant" className="inline-flex min-h-11 items-center font-semibold text-lightning-800 underline">Ask the housing assistant</Link></div></div>}
    {results.length > limit && <div className="mt-6 text-center"><button type="button" onClick={() => setLimit(value => value + PAGE_SIZE)} className="cinnamon-btn min-h-11">Show {Math.min(PAGE_SIZE, results.length - limit)} more records</button></div>}
  </section>;
}
