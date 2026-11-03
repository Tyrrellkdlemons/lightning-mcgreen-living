'use client';

import { useEffect, useId, useState } from 'react';
import { ArrowUpRight, Camera, MapPin, Navigation } from 'lucide-react';
import { propertyMapLinks, safeSourceUrl, type PropertyViewData } from '@/lib/places/property-view';

const SOURCE_LABELS = { property: 'Property / leasing', 'floor-plan': 'Floor plan', listing: 'Listing', search: 'Search results', application: 'Application', source: 'Research source' };

export function PropertyView(view: PropertyViewData) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapId = useId();
  const links = propertyMapLinks(view);
  const sources = (view.sources || []).filter((source) => safeSourceUrl(source.url));
  useEffect(() => { setMapLoaded(false); }, [links.embed]);
  return (
    <section className="mt-8 min-w-0" aria-label={`Location and source views for ${view.name}`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">Get a closer look</p><h2 className="section-heading mt-2">Location &amp; source views</h2></div>
        {view.sourceDate && <p className="text-xs text-chocolate-700">Research date: {view.sourceDate}</p>}
      </div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="explore-card min-w-0 overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3"><MapPin className="mt-1 h-6 w-6 shrink-0 text-lightning-700" aria-hidden /><div className="min-w-0"><h3 className="font-display text-xl font-extrabold text-chocolate-900">{view.locationPrecision === 'area' ? 'Explore the surrounding area' : 'Locate the property'}</h3><p className="mt-2 break-words text-sm leading-relaxed text-chocolate-700">{[view.address, view.city, view.state].filter(Boolean).join(' · ') || view.name}</p></div></div>
            <p className="mt-4 text-sm leading-relaxed text-chocolate-700">{links.embed ? view.locationPrecision === 'area' ? 'This is an area reference, not a confirmed property location. The map has no building pin.' : 'The pin uses coordinates saved with the research. Confirm the building, entrance and unit with the property before visiting.' : 'No coordinates are recorded. Search by property name and address, then confirm the result with the property.'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={links.search} target="_blank" rel="noopener noreferrer" className="cinnamon-btn min-h-11 text-sm">Search Google Maps<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden /></a>
              {links.streetView && <a href={links.streetView} target="_blank" rel="noopener noreferrer" className="cinnamon-btn min-h-11 text-sm">Explore Street View<Navigation className="h-4 w-4 shrink-0" aria-hidden /></a>}
            </div>
            {links.streetView && <p className="mt-3 text-xs leading-relaxed text-chocolate-700">Street View opens nearby public imagery when available. Its capture date, coverage and viewpoint may differ from the property today.</p>}
          </div>
          {links.embed && <div className="border-t border-gingerbread-200 bg-frosting-100">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <button type="button" aria-expanded={mapLoaded} aria-controls={mapId} onClick={() => setMapLoaded((value) => !value)} className="bolt-btn min-h-11 text-sm">{mapLoaded ? 'Hide area map' : 'Load area map'}</button>
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-xs text-chocolate-700 underline">© OpenStreetMap contributors</a>
            </div>
            <div id={mapId}>
              {mapLoaded ? <iframe src={links.embed} title={`Recorded map area for ${view.name}`} className="h-80 w-full border-0" loading="lazy" referrerPolicy="no-referrer" /> : <p className="px-4 pb-5 text-xs leading-relaxed text-chocolate-700">Load an interactive map from OpenStreetMap, or use the external map links above.</p>}
            </div>
            {mapLoaded && <p className="px-4 py-3 text-xs text-chocolate-700">Map blank or difficult to use? <a href={links.osm!} target="_blank" rel="noopener noreferrer" className="font-bold underline">Open the area in OpenStreetMap.</a></p>}
          </div>}
        </div>
        <div className="explore-card min-w-0 p-5 sm:p-6">
          <div className="flex items-start gap-3"><Camera className="mt-1 h-6 w-6 shrink-0 text-lightning-700" aria-hidden /><div><h3 className="font-display text-xl font-extrabold text-chocolate-900">Photos, floor plans &amp; tours</h3><p className="mt-2 text-sm leading-relaxed text-chocolate-700">Explore the original publisher’s pages for any photographs, floor plans and tour options they provide. Ask which images show the specific unit.</p></div></div>
          <p className="mt-4 rounded-xl bg-frosting-100 p-3 text-xs leading-relaxed text-chocolate-700">No verified property photographs are hosted in this view. Map imagery is location context; it does not show an available unit.</p>
          {sources.length > 0 ? <ul className="mt-4 space-y-2">{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-gingerbread-200 p-3 hover:bg-frosting-100"><span className="min-w-0"><span className="block text-[11px] font-bold uppercase tracking-wide text-chocolate-600">{SOURCE_LABELS[source.kind]}</span><span className="mt-1 block break-words text-sm font-semibold text-chocolate-900">{source.label}</span></span><ArrowUpRight className="h-5 w-5 shrink-0 text-lightning-700" aria-hidden /></a></li>)}</ul> : <p className="mt-5 text-sm text-chocolate-700">No property source link is recorded yet. Use the map search to find and confirm the property’s own website.</p>}
          <p className="mt-4 text-xs leading-relaxed text-chocolate-700">A source may open a search page or require sign-in. A working link does not confirm current rent, availability or permission to republish its images.</p>
        </div>
      </div>
    </section>
  );
}
