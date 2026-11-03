import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, MapPin } from 'lucide-react';
import { PLACES, STATES, getPlace, placeUrl, stateSlug } from '@/lib/places';
import { REAL_RENTALS } from '@/lib/data/real-rentals';
import { PlaceGallery } from '@/components/photos/PlaceGallery';
import { HousingResources } from '@/components/places/HousingResources';

export const dynamicParams = false;

export function generateStaticParams() { return PLACES.map((place) => ({ state: stateSlug(place.state), city: place.slug })); }
export function generateMetadata({ params }: { params: { state: string; city: string } }): Metadata {
  const place = getPlace(params.state, params.city); if (!place) return {};
  return { title: `${place.name}, ${place.state} housing & moving guide`, description: place.description, alternates: { canonical: placeUrl(place) } };
}
export default function CityPage({ params }: { params: { state: string; city: string } }) {
  const place = getPlace(params.state, params.city); if (!place) notFound();
  const count = REAL_RENTALS.filter((listing) => listing.state === place.state && listing.city.toLowerCase() === place.name.toLowerCase()).length;
  const rentalsUrl = `/rentals?state=${place.state}&city=${encodeURIComponent(place.name)}`;
  return <>
    <nav aria-label="Breadcrumb" className="mt-6 flex flex-wrap gap-2 text-sm text-chocolate-700"><Link href="/places" className="underline">Explore places</Link><span aria-hidden>/</span><Link href={`/places/${stateSlug(place.state)}`} className="underline">{STATES[place.state].name}</Link><span aria-hidden>/</span><span>{place.name}</span></nav>
    <header className="mt-6 rounded-3xl border border-gingerbread-300 bg-frosting-100 p-6 sm:p-10"><p className="eyebrow flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden />{place.region} · {place.state}</p><h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-chocolate-900 sm:text-6xl">Your next chapter in {place.name}.</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-chocolate-700">{place.description}</p><div className="mt-6 flex flex-wrap gap-3"><Link href={rentalsUrl} className="bolt-btn">Browse {place.name} rentals</Link><a href="#housing-resources" className="cinnamon-btn">Find local support</a></div><p className="mt-5 text-xs text-chocolate-700">Planning guide · {place.county} County · No promise of availability or approval</p></header>
    <section className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_1fr]" aria-label="Plan your move">
      <div className="explore-card p-6"><p className="eyebrow">Before you apply</p><h2 className="section-heading mt-2">Make the details work for you.</h2><ul className="mt-5 space-y-4">{place.planningTips.map((tip) => <li key={tip} className="flex items-start gap-3 text-sm leading-relaxed text-chocolate-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-lightning-700" aria-hidden />{tip}</li>)}<li className="flex items-start gap-3 text-sm leading-relaxed text-chocolate-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-lightning-700" aria-hidden />Confirm the application link with the property and request written screening criteria before paying.</li></ul><Link href="/life-budget" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-lightning-700 underline">Build your life budget<ArrowUpRight className="h-4 w-4" aria-hidden /></Link></div>
      <div className="explore-card p-6"><p className="eyebrow">Current directory coverage</p><h2 className="mt-2 font-display text-2xl font-extrabold text-chocolate-900">{count ? `${count} listed rental${count === 1 ? '' : 's'}` : 'Room to grow.'}</h2><p className="mt-3 text-sm leading-relaxed text-chocolate-700">{count ? 'These are records in our directory, not a live availability count. Open the listing and confirm the specific unit, rent and move-in date with the property.' : 'We do not have rental records for this city yet. Use the primary resources below while we expand the directory.'}</p><div className="mt-5 flex flex-col gap-3 text-sm font-bold"><Link href={rentalsUrl} className="text-lightning-700 underline">Open rental search</Link><Link href={`/cars?state=${place.state}`} className="text-lightning-700 underline">Compare listed cars in {STATES[place.state].name}</Link><Link href={`/work-vehicles?state=${place.state}`} className="text-lightning-700 underline">Explore listed work vehicles</Link></div></div>
    </section>
    <PlaceGallery placeId={place.id} name={place.name} />
    <HousingResources state={place.state} />
    <p className="mt-5 text-xs leading-relaxed text-chocolate-700">This is an editorial planning guide. Housing-referral source: <a href={place.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{place.sourcePublisher}</a>. Resource links were reviewed November 3, 2026; contact providers for current service details.</p>
  </>;
}
