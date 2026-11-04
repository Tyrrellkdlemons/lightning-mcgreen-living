'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AssistanceCard } from './AssistanceCard';
import {
  ASSISTANCE_CATEGORY_LABELS, ASSISTANCE_EMPTY_TEXT, ASSISTANCE_PAGE_SIZE, ASSISTANCE_PURPOSE_LABELS,
  ASSISTANCE_STATE_LABELS, assistanceCostPurposes, assistanceDirectoryUrl, filterAssistanceResources,
  readAssistanceFilters, type AssistanceCategory, type AssistanceCounties, type AssistanceFilters,
  type AssistancePlace, type AssistancePurpose, type AssistanceResource, type AssistanceState,
} from '@/lib/assistance-directory/model';

const control = 'mt-2 min-h-11 w-full min-w-0 rounded-xl border border-gingerbread-300 bg-white px-3 py-2.5 text-base text-chocolate-900 placeholder:text-chocolate-700 focus:border-lightning-800 focus:outline-none focus:ring-2 focus:ring-lightning-800';
const toggle = 'min-h-11 rounded-xl border px-3 py-2 text-sm font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800 focus-visible:ring-offset-2 motion-reduce:transition-none';
const selected = 'border-lightning-800 bg-lightning-100 text-lightning-950';
const idle = 'border-gingerbread-300 bg-white text-chocolate-700 hover:bg-frosting-100';
export function AssistanceDirectory({ resources, counties, places }: { resources: readonly AssistanceResource[]; counties: AssistanceCounties; places: readonly AssistancePlace[] }) {
  const searchParams = useSearchParams();
  const filterKey = searchParams.toString();
  const filters = readAssistanceFilters(searchParams);
  const [paging, setPaging] = useState({ key: '', limit: ASSISTANCE_PAGE_SIZE });
  const limit = paging.key === filterKey ? paging.limit : ASSISTANCE_PAGE_SIZE;
  const matches = filterAssistanceResources(resources, filters, counties, places);
  const countyOptions = [...new Set(filters.state ? counties[filters.state] : [...counties.CA, ...counties.AZ])].sort();
  const purposes = [...new Set(resources.filter(resource => !filters.state || resource.state === filters.state).flatMap(assistanceCostPurposes))];
  if (filters.purpose && !purposes.includes(filters.purpose)) purposes.push(filters.purpose);
  const active = Object.entries(filters).filter(([, value]) => !!value?.trim()) as [keyof AssistanceFilters, string][];
  const update = (patch: AssistanceFilters, replace = false) => {
    const current = readAssistanceFilters(new URLSearchParams(window.location.search));
    const url = assistanceDirectoryUrl({ ...current, ...patch });
    // Next.js synchronizes native history with useSearchParams; no router/server request is needed.
    if (replace) window.history.replaceState(null, '', url); else window.history.pushState(null, '', url);
  };
  const reset = () => window.history.pushState(null, '', assistanceDirectoryUrl());
  const chipLabel = (key: keyof AssistanceFilters, value: string) => key === 'state' ? ASSISTANCE_STATE_LABELS[value as AssistanceState]
    : key === 'category' ? ASSISTANCE_CATEGORY_LABELS[value as AssistanceCategory]
      : key === 'purpose' ? ASSISTANCE_PURPOSE_LABELS[value as AssistancePurpose]
        : `${key === 'q' ? 'Search' : key === 'county' ? 'County' : 'City'}: ${value}`;

  return <section className="min-w-0" aria-labelledby="assistance-results-heading">
    <div className="rounded-2xl border border-gingerbread-300 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-lightning-800" aria-hidden="true" /><h2 className="font-display text-lg font-extrabold">Find the right starting point</h2></div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <fieldset className="min-w-0"><legend className="mb-2 text-sm font-bold text-chocolate-800">State</legend><div className="flex flex-wrap gap-2">{[['', 'Both states'], ['CA', 'California'], ['AZ', 'Arizona']].map(([value, label]) => <button key={value} type="button" aria-pressed={filters.state === value} onClick={() => update({ state: value as AssistanceState | '', county: '', city: '' })} className={`${toggle} ${filters.state === value ? selected : idle}`}>{label}</button>)}</div></fieldset>
        <fieldset className="min-w-0"><legend className="mb-2 text-sm font-bold text-chocolate-800">Type of help</legend><div className="flex flex-wrap gap-2">{[['', 'All help'], ['down_payment', 'Down payment'], ['rental_assistance', 'Rent assistance'], ['both', 'Both types']].map(([value, label]) => <button key={value} type="button" aria-pressed={filters.category === value} onClick={() => update({ category: value as AssistanceCategory | '' })} className={`${toggle} ${filters.category === value ? selected : idle}`}>{label}</button>)}</div></fieldset>
      </div>
      <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="min-w-0 text-sm font-bold text-chocolate-800">Search programs<span className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-chocolate-700" aria-hidden="true" /><input className={`${control} pl-9`} type="search" maxLength={200} value={filters.q ?? ''} placeholder="Name, agency, or keyword" onChange={event => update({ q: event.target.value }, true)} /></span></label>
        <label className="min-w-0 text-sm font-bold text-chocolate-800">County<select className={control} value={filters.county ?? ''} onChange={event => update({ county: event.target.value, city: '' })} aria-describedby="assistance-area-note"><option value="">All counties</option>{filters.county && !countyOptions.includes(filters.county) && <option value={filters.county}>{filters.county}</option>}{countyOptions.map(county => <option key={county} value={county}>{county} County</option>)}</select></label>
        <label className="min-w-0 text-sm font-bold text-chocolate-800">City (optional)<input list="assistance-cities" className={control} value={filters.city ?? ''} maxLength={100} placeholder="Exact city name" onChange={event => update({ city: event.target.value }, true)} aria-describedby="assistance-area-note" /></label>
        <label className="min-w-0 text-sm font-bold text-chocolate-800">Cost or support needed<select className={control} value={filters.purpose ?? ''} onChange={event => update({ purpose: event.target.value as AssistancePurpose | '' })}><option value="">All purposes</option>{purposes.sort((a, b) => ASSISTANCE_PURPOSE_LABELS[a].localeCompare(ASSISTANCE_PURPOSE_LABELS[b])).map(purpose => <option key={purpose} value={purpose}>{ASSISTANCE_PURPOSE_LABELS[purpose]}</option>)}</select></label>
      </div>
      <datalist id="assistance-cities">{places.filter(place => (!filters.state || place.state === filters.state) && (!filters.county || place.counties.includes(filters.county))).map(place => <option key={`${place.state}-${place.name}-${place.counties.join()}`} value={place.name}>{place.state} · {place.counties.join(", ")}</option>)}</datalist>
      <p id="assistance-area-note" className="mt-4 max-w-4xl text-xs leading-relaxed text-chocolate-700">County searches include applicable statewide and national resources. Some results serve only the named cities. Choose an exact city to include its county-wide programs automatically, including cities that cross county lines. A location match is a referral, not an eligibility decision.</p>
      {active.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gingerbread-200 pt-4" aria-label="Active assistance filters">{active.map(([key, value]) => <button key={key} type="button" onClick={() => update({ [key]: '', ...(key === 'state' ? { county: '', city: '' } : {}) })} aria-label={`Remove ${chipLabel(key, value)}`} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-gingerbread-300 bg-frosting-50 px-3 py-2 text-left text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800"><span className="min-w-0 break-words [overflow-wrap:anywhere]">{chipLabel(key, value)}</span><X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></button>)}<button type="button" onClick={reset} className="min-h-11 rounded px-3 text-sm font-bold text-lightning-800 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800">Clear all</button></div>}
    </div>
    <div className="mt-7 flex flex-wrap items-end justify-between gap-3"><h2 id="assistance-results-heading" className="font-display text-2xl font-extrabold">Programs & referral resources</h2><p role="status" aria-live="polite" aria-atomic="true" className="text-sm font-semibold text-chocolate-700">{matches.length} matching {matches.length === 1 ? 'resource' : 'resources'} · {Math.min(limit, matches.length)} shown</p></div>
    <p className="mt-2 text-sm leading-relaxed text-chocolate-700">Check the evidence label on each result. Published amounts do not confirm available funding, acceptance or approval.</p>
    {matches.length ? <ul className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">{matches.slice(0, limit).map(resource => <li className="min-w-0" key={resource.id}><AssistanceCard resource={resource} countyBrowse={!!filters.county && !filters.city} /></li>)}</ul> : <div className="mt-5 rounded-2xl border border-gingerbread-300 bg-frosting-100 p-6 sm:p-8"><p className="font-display text-xl font-extrabold">{ASSISTANCE_EMPTY_TEXT}</p><p className="mt-3 max-w-2xl text-sm leading-relaxed text-chocolate-700">A missing match does not mean assistance is unavailable. Broaden your search or use the help navigator for another referral route.</p><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={reset} className="bolt-btn min-h-11">Clear filters</button><Link href="/help" className="cinnamon-btn min-h-11">Find my next step</Link></div></div>}
    {matches.length > limit && <div className="mt-7 text-center"><button type="button" onClick={() => setPaging({ key: filterKey, limit: limit + ASSISTANCE_PAGE_SIZE })} className="cinnamon-btn min-h-11">Load {Math.min(ASSISTANCE_PAGE_SIZE, matches.length - limit)} more resources</button><p className="mt-2 text-xs text-chocolate-700">{matches.length - Math.min(limit, matches.length)} more match your filters</p></div>}
  </section>;
}
