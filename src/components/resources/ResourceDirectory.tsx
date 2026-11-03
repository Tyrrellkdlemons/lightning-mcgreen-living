'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, ExternalLink, X } from 'lucide-react';
import { filterResources, resourceOutboundDisabled, RESOURCE_CATEGORIES, type ResourceCategory, type ResourceSource } from '@/lib/resources';

import { SourceReview } from './SourceReview';

const PAGE_SIZE = 24;
const control = 'mt-2 min-h-11 w-full min-w-0 rounded-xl border border-gingerbread-300 bg-white px-3 py-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-lightning-700';
const stateLabel = (value: string) => value === 'CA' ? 'California' : value === 'AZ' ? 'Arizona' : value === 'Federal' ? 'Federal resource' : 'California + Arizona';
type SourceSort = 'directory' | 'name' | 'location' | 'reviewed';
function compareSources(a: ResourceSource, b: ResourceSource, sort: SourceSort) {
  if (sort === 'directory') return 0;
  let compared = 0;
  if (sort === 'reviewed') compared = Number(b.inspection === 'content-inspected') - Number(a.inspection === 'content-inspected');
  if (sort === 'location') compared = stateLabel(a.state).localeCompare(stateLabel(b.state)) || (!a.city ? (b.city ? 1 : 0) : !b.city ? -1 : a.city.localeCompare(b.city));
  return compared || a.title.localeCompare(b.title);
}
export function ResourceDirectory({ sources, initialState = '', initialCategory = '', initialQuery = '' }: { sources: ResourceSource[]; initialState?: string; initialCategory?: string; initialQuery?: string }) {
  const [state, setState] = useState(['CA', 'AZ'].includes(initialState) ? initialState : '');
  const [category, setCategory] = useState(Object.hasOwn(RESOURCE_CATEGORIES, initialCategory) ? initialCategory : '');
  const [query, setQuery] = useState(initialQuery); const [evidence, setEvidence] = useState(''); const [sort, setSort] = useState<SourceSort>('directory'); const [limit, setLimit] = useState(PAGE_SIZE);
  useEffect(() => { setState(['CA', 'AZ'].includes(initialState) ? initialState : ''); setCategory(Object.hasOwn(RESOURCE_CATEGORIES, initialCategory) ? initialCategory : ''); setQuery(initialQuery); setEvidence(''); setSort('directory'); setLimit(PAGE_SIZE); }, [initialState, initialCategory, initialQuery]);
  const matches = useMemo(() => filterResources(sources, query, state, category).filter(source => !evidence || (evidence === 'dated-units' ? !!source.propertyObservation?.unitSamples : evidence === 'needs-attention' ? !!source.review && source.review.outcome !== 'content-inspected' : source.inspection === evidence)).sort((a, b) => compareSources(a, b, sort)), [sources, query, state, category, evidence, sort]);
  const reset = () => { setQuery(''); setState(''); setCategory(''); setEvidence(''); setSort('directory'); setLimit(PAGE_SIZE); };
  const filters = [
    ...(query ? [{ label: `Search: ${query}`, clear: () => setQuery('') }] : []),
    ...(state ? [{ label: stateLabel(state), clear: () => setState('') }] : []),
    ...(category ? [{ label: RESOURCE_CATEGORIES[category as ResourceCategory], clear: () => setCategory('') }] : []),
    ...(evidence ? [{ label: evidence === 'content-inspected' ? 'Source content reviewed' : evidence === 'dated-units' ? 'Dated unit advertisements' : evidence === 'needs-attention' ? 'Needs follow-up' : 'Directory metadata only', clear: () => setEvidence('') }] : []),
  ];
  return <section aria-labelledby="resource-directory-heading" className="mt-8 min-w-0">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Find a useful source</p><h2 id="resource-directory-heading" className="section-heading mt-2">Search the library</h2></div><p role="status" aria-atomic="true" className="text-sm font-semibold text-chocolate-700">{matches.length} of {sources.length} sources · {Math.min(limit, matches.length)} shown</p></div>
    <div className="mt-5 rounded-2xl border border-gingerbread-300 bg-white p-4 sm:p-5">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="min-w-0 text-xs font-bold text-chocolate-700">City, provider or type of help<div className="relative"><Search aria-hidden className="absolute left-3 top-3.5 h-4 w-4 text-chocolate-600" /><input type="search" value={query} onChange={e => { setQuery(e.target.value); setLimit(PAGE_SIZE); }} placeholder="Try Tucson or rental assistance" className={`${control} pl-9`} /></div></label>
        <label className="min-w-0 text-xs font-bold text-chocolate-700">State<select value={state} onChange={e => { setState(e.target.value); setLimit(PAGE_SIZE); }} className={control}><option value="">California + Arizona</option><option value="CA">California</option><option value="AZ">Arizona</option></select></label>
        <label className="min-w-0 text-xs font-bold text-chocolate-700">What you need<select value={category} onChange={e => { setCategory(e.target.value); setLimit(PAGE_SIZE); }} className={control}><option value="">All resource types</option>{Object.entries(RESOURCE_CATEGORIES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label className="min-w-0 text-xs font-bold text-chocolate-700">Research evidence<select value={evidence} onChange={e => { setEvidence(e.target.value); setLimit(PAGE_SIZE); }} aria-describedby="resource-evidence-note" className={control}><option value="">All evidence levels</option><option value="content-inspected">Source content reviewed</option><option value="metadata-reviewed">Directory metadata only</option><option value="needs-attention">Needs follow-up</option><option value="dated-units">Dated unit advertisements</option></select></label>
        <label className="min-w-0 text-xs font-bold text-chocolate-700">Sort sources<select value={sort} onChange={e => { setSort(e.target.value as SourceSort); setLimit(PAGE_SIZE); }} className={control}><option value="directory">Original directory order</option><option value="name">Source name A–Z</option><option value="location">State, then city</option><option value="reviewed">Reviewed content first</option></select></label>
      </div>
      <p id="resource-evidence-note" className="mt-4 text-xs leading-relaxed text-chocolate-700">“Content reviewed” means the source page was inspected during research. Directory-only records came from provider or agency listings. Neither confirms current openings, funding or eligibility. State filters include federal and shared-state resources; check each provider&apos;s service area.</p>
      {(filters.length > 0 || sort !== 'directory') && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gingerbread-200 pt-4" aria-label="Active source filters">{filters.map(filter => <button type="button" key={filter.label} onClick={() => { filter.clear(); setLimit(PAGE_SIZE); }} aria-label={`Remove ${filter.label}`} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-gingerbread-300 px-3 py-2 text-left text-xs font-semibold text-chocolate-900 focus:outline-none focus:ring-2 focus:ring-lightning-700"><span className="break-words [overflow-wrap:anywhere]">{filter.label}</span><X className="h-3.5 w-3.5 shrink-0" aria-hidden /></button>)}<button type="button" onClick={reset} className="min-h-11 px-3 text-sm font-bold text-lightning-800 underline">Reset all</button></div>}
    </div>
    {matches.length === 0 ? <div className="my-6 rounded-2xl border border-gingerbread-300 bg-frosting-100 p-6"><h3 className="font-display text-xl font-bold text-chocolate-900">No sources match all these filters.</h3><p className="mt-2 max-w-2xl text-sm leading-relaxed text-chocolate-700">Remove a filter, use fewer search words, or browse the state without a city. A missing match does not mean help is unavailable; the help navigator includes statewide referrals.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={reset} className="bolt-btn">Show all sources</button><Link href="/help" className="cinnamon-btn">Find my next step</Link><Link href="/assistant" className="inline-flex min-h-11 items-center font-semibold text-lightning-800 underline">Ask the housing assistant</Link></div></div> : <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{matches.slice(0, limit).map(source => <li key={source.id} className="flex min-w-0 flex-col rounded-2xl border border-gingerbread-300 bg-frosting-50 p-5">
      <div className="flex flex-wrap gap-2 text-xs font-semibold text-lightning-800"><span>{stateLabel(source.state)}</span><span>· {RESOURCE_CATEGORIES[source.category]}</span></div><h3 className="mt-3 break-words font-display text-xl font-extrabold leading-snug text-chocolate-900"><Link href={`/resources/${source.id}`} className="hover:underline">{source.title}</Link></h3><p className="mt-2 text-sm leading-relaxed text-chocolate-700">{source.description}</p><p className="mt-3 text-xs text-chocolate-600">{source.publisher}{source.city ? ` · ${source.city}` : ''}</p>
      <div className="mt-4"><SourceReview source={source} compact />{source.propertyObservation && <p className="mt-2 rounded-lg bg-lightning-100 px-3 py-2 text-xs font-bold text-lightning-900">{source.propertyObservation.unitSamples} dated unit sample{source.propertyObservation.unitSamples === 1 ? '' : 's'} · {source.propertyObservation.observedAt.slice(0,10)}<span className="mt-1 block font-normal">Advertisement snapshot; confirm with leasing.</span></p>}</div>
      <div className="mt-auto flex flex-wrap gap-4 pt-4 text-sm font-bold"><Link href={`/resources/${source.id}`} className="inline-flex min-h-11 items-center gap-1 text-lightning-800 underline">Details & next steps <ArrowUpRight className="h-4 w-4" aria-hidden /></Link>{!resourceOutboundDisabled(source) && <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 underline">Open source <ExternalLink className="h-3 w-3" aria-hidden /></a>}</div>
    </li>)}</ul>}
    {matches.length > limit && <div className="mt-6 text-center"><button type="button" onClick={() => setLimit(n => n + PAGE_SIZE)} className="cinnamon-btn min-h-11">Show {Math.min(PAGE_SIZE, matches.length - limit)} more sources</button></div>}
  </section>;
}
