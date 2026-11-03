'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, MapPin, Search } from 'lucide-react';
import { PLACES, STATES, placeUrl, type StateCode } from '@/lib/places';

export function PlaceDirectory({ initialState = '', initialQuery = '', fixedState }: { initialState?: string; initialQuery?: string; fixedState?: StateCode }) {
  const [state, setState] = useState(fixedState ?? initialState);
  const [query, setQuery] = useState(initialQuery);
  useEffect(() => { setState(fixedState ?? initialState); setQuery(initialQuery); }, [initialState, initialQuery, fixedState]);
  const places = useMemo(() => {
    const words = query.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
    return PLACES.filter((place) => (!state || place.state === state) && words.every((word) => `${place.name} ${place.state} ${place.region} ${place.county} ${STATES[place.state].name}`.toLowerCase().includes(word)));
  }, [state, query]);
  return (
    <section className="mt-8" aria-labelledby="directory-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">Find your starting point</p><h2 id="directory-heading" className="mt-2 font-display text-2xl font-extrabold">Explore city guides</h2></div>
        <p className="text-sm text-chocolate-700" role="status">{places.length} guide{places.length === 1 ? '' : 's'}</p>
      </div>
      <div className="mt-4 grid gap-3 rounded-2xl border border-gingerbread-300 bg-white p-4 sm:grid-cols-[1fr_220px]">
        <label className="block"><span className="text-xs font-bold text-chocolate-700">City, county or region</span><div className="mt-1 flex items-center gap-2"><Search className="h-5 w-5 text-chocolate-700" aria-hidden /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Phoenix, Bay Area or Humboldt" className="min-w-0 w-full rounded-lg border border-gingerbread-300 px-3 py-2.5 text-sm" /></div></label>
        {!fixedState ? <label className="block"><span className="text-xs font-bold text-chocolate-700">State</span><select value={state} onChange={(event) => setState(event.target.value)} className="mt-1 w-full rounded-lg border border-gingerbread-300 bg-white px-3 py-2.5 text-sm"><option value="">California + Arizona</option><option value="CA">California</option><option value="AZ">Arizona</option></select></label> : <p className="self-center text-sm text-chocolate-700">Guides for {STATES[fixedState].name}</p>}
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => <li key={place.id}><Link href={placeUrl(place)} className="explore-card group flex h-full flex-col p-5"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-chocolate-700"><MapPin className="h-4 w-4" aria-hidden />{place.state} · {place.region}</span><ArrowUpRight className="h-5 w-5 shrink-0 text-lightning-700" aria-hidden /></div><h3 className="mt-4 font-display text-xl font-extrabold text-chocolate-900">{place.name}</h3><p className="mt-2 flex-1 text-sm leading-relaxed text-chocolate-700">{place.description}</p><span className="mt-4 text-xs font-bold text-lightning-700">Open city guide</span></Link></li>)}
      </ul>
      {places.length === 0 && <div className="mt-4 rounded-2xl border border-gingerbread-300 bg-frosting-100 p-6"><h3 className="font-bold text-chocolate-900">No city guide matches yet.</h3><p className="mt-2 text-sm text-chocolate-700">Try a nearby city or use the statewide housing resources below. Guide coverage is growing; these results are not a list of available homes.</p><button type="button" onClick={() => { setQuery(''); setState(fixedState ?? ''); }} className="cinnamon-btn mt-4">Reset search</button></div>}
    </section>
  );
}
