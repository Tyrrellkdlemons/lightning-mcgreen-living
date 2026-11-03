'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, MapPin, Search } from 'lucide-react';
import { WORKBOOK_RANKED_LISTINGS, WORKBOOK_CITY_OPTIONS } from '@/lib/data/workbook-ranked-listings';
import { filterWorkbookProperties, propertyPath, recordedRent } from '@/lib/places/property-view';

const TIERS = Array.from(new Set(WORKBOOK_RANKED_LISTINGS.map((item) => item.fit_tier).filter((value): value is string => Boolean(value)))).sort();
const PAGE_SIZE = 24;

export function PropertyDirectory({ initialQuery = '', initialCity = '', initialTier = '' }: { initialQuery?: string; initialCity?: string; initialTier?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [tier, setTier] = useState(initialTier);
  const [limit, setLimit] = useState(PAGE_SIZE);
  useEffect(() => { setQuery(initialQuery); setCity(initialCity); setTier(initialTier); setLimit(PAGE_SIZE); }, [initialQuery, initialCity, initialTier]);
  const results = useMemo(() => filterWorkbookProperties(WORKBOOK_RANKED_LISTINGS, query, city, tier), [query, city, tier]);
  const reset = () => { setQuery(''); setCity(''); setTier(''); setLimit(PAGE_SIZE); };
  return <section className="mt-8" aria-labelledby="property-directory-title">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Your research, easier to explore</p><h2 id="property-directory-title" className="section-heading mt-2">Find a property</h2></div><p role="status" className="text-sm text-chocolate-700">{results.length} of {WORKBOOK_RANKED_LISTINGS.length} research records</p></div>
    <div className="mt-5 grid min-w-0 gap-3 rounded-2xl border border-gingerbread-300 bg-white p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <label className="min-w-0"><span className="text-xs font-bold text-chocolate-700">Property, address, county or rank</span><div className="mt-1 flex items-center gap-2"><Search className="h-5 w-5 shrink-0 text-chocolate-700" aria-hidden /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(PAGE_SIZE); }} placeholder="Try Jamboree or Riverside" className="min-w-0 w-full rounded-lg border border-gingerbread-300 px-3 py-3 text-sm" /></div></label>
      <label className="min-w-0"><span className="text-xs font-bold text-chocolate-700">City</span><select value={city} onChange={(event) => { setCity(event.target.value); setLimit(PAGE_SIZE); }} className="mt-1 w-full min-w-0 rounded-lg border border-gingerbread-300 bg-white px-3 py-3 text-sm"><option value="">All workbook cities</option>{initialCity && !WORKBOOK_CITY_OPTIONS.includes(initialCity) && <option value={initialCity}>{initialCity}</option>}{WORKBOOK_CITY_OPTIONS.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="min-w-0"><span className="text-xs font-bold text-chocolate-700">Workbook fit tier</span><select value={tier} onChange={(event) => { setTier(event.target.value); setLimit(PAGE_SIZE); }} className="mt-1 w-full min-w-0 rounded-lg border border-gingerbread-300 bg-white px-3 py-3 text-sm"><option value="">All recorded tiers</option>{initialTier && !TIERS.includes(initialTier) && <option value={initialTier}>{initialTier}</option>}{TIERS.map((value) => <option key={value}>{value}</option>)}</select></label>
    </div>
    {(query || city || tier) && <button type="button" onClick={reset} className="mt-3 min-h-11 px-2 text-sm font-bold text-lightning-700 underline">Reset filters</button>}
    {results.length > 0 ? <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {results.slice(0, limit).map((listing) => <li key={listing.id} className="min-w-0"><Link href={propertyPath(listing.id)} className="explore-card flex h-full min-w-0 flex-col p-5"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wider text-chocolate-600">Workbook #{listing.rank}</span>{listing.fit_tier && <span className="rounded-full bg-frosting-100 px-2.5 py-1 text-xs font-semibold text-chocolate-700">{listing.fit_tier}</span>}</div><h3 className="mt-4 break-words font-display text-xl font-extrabold text-chocolate-900">{listing.property_name}</h3><p className="mt-2 flex items-start gap-1.5 text-sm text-chocolate-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{listing.city}, CA</p><div className="mt-5 grid grid-cols-2 gap-3 border-y border-gingerbread-200 py-3"><div><p className="text-[11px] font-bold uppercase text-chocolate-600">Recorded rent</p><p className="mt-1 text-sm font-bold text-chocolate-900">{recordedRent(listing.rent_low, listing.rent_high)}</p></div><div><p className="text-[11px] font-bold uppercase text-chocolate-600">Recorded layout</p><p className="mt-1 text-sm font-bold text-chocolate-900">{listing.beds ? `${listing.beds} beds` : 'Not recorded'}</p></div></div><p className="mt-3 flex-1 text-sm leading-relaxed text-chocolate-700">{listing.best_feature || 'Open the full workbook research, map context and original sources.'}</p><div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs text-chocolate-600">Sourced {listing.source_date || 'date unknown'}</span><ArrowUpRight className="h-5 w-5 shrink-0 text-lightning-700" aria-hidden /></div><span className="mt-2 text-sm font-bold text-lightning-700">View property research</span></Link></li>)}
    </ul> : <div className="mt-5 rounded-2xl border border-gingerbread-300 bg-frosting-100 p-6"><h3 className="font-display text-xl font-bold text-chocolate-900">No workbook property matches.</h3><p className="mt-2 text-sm leading-relaxed text-chocolate-700">Try fewer words or another city. This workbook covers 79 Southern California properties; city guides offer a wider California and Arizona starting point.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={reset} className="bolt-btn">Show all properties</button><Link href="/places" className="cinnamon-btn">Explore city guides</Link></div></div>}
    {results.length > limit && <div className="mt-6 text-center"><button type="button" onClick={() => setLimit((value) => value + PAGE_SIZE)} className="cinnamon-btn min-h-11">Show {Math.min(PAGE_SIZE, results.length - limit)} more properties</button><p className="mt-2 text-xs text-chocolate-700">{limit} of {results.length} shown</p></div>}
  </section>;
}
