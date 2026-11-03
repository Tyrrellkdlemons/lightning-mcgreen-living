import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PlaceDirectory } from '@/components/places/PlaceDirectory';
import { HousingResources } from '@/components/places/HousingResources';
import { STATES } from '@/lib/places';

export const metadata: Metadata = {
  title: 'California & Arizona city guides',
  description: 'Explore California and Arizona city guides, compare listed rentals and find primary housing and shelter resources.',
  alternates: { canonical: '/places' },
};
export default function PlacesPage({ searchParams }: { searchParams: { state?: string; q?: string } }) {
  const state = searchParams.state === 'CA' || searchParams.state === 'AZ' ? searchParams.state : '';
  const query = typeof searchParams.q === 'string' ? searchParams.q.slice(0, 100) : '';
  return <>
    <header className="pt-9 sm:pt-12"><p className="eyebrow">California + Arizona</p><h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-chocolate-900 sm:text-5xl">A clearer path to your next place.</h1><p className="mt-4 max-w-2xl text-base leading-relaxed text-chocolate-700">Start with a city, build a practical shortlist, and find the right local resources. Our guides help you plan; listings and availability are always confirmed with the provider.</p></header>
    <div className="mt-7 grid gap-4 sm:grid-cols-2">{(['CA','AZ'] as const).map((code) => <Link key={code} href={`/places/${STATES[code].slug}`} className="explore-card flex items-center justify-between gap-4 p-6"><div><span className="eyebrow">{code}</span><h2 className="mt-1 font-display text-2xl font-extrabold text-chocolate-900">{STATES[code].name}</h2><p className="mt-2 max-w-sm text-sm text-chocolate-700">{STATES[code].description}</p></div><ArrowRight className="h-6 w-6 shrink-0 text-lightning-700" aria-hidden /></Link>)}</div>
    <PlaceDirectory initialState={state} initialQuery={query} />
    <HousingResources />
  </>;
}
