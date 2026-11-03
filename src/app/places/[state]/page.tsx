import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaceDirectory } from '@/components/places/PlaceDirectory';
import { HousingResources } from '@/components/places/HousingResources';
import { STATES, stateCode } from '@/lib/places';

export const dynamicParams = false;

export function generateStaticParams() { return [{ state: 'california' }, { state: 'arizona' }]; }
export async function generateMetadata({ params: paramsPromise }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const params = await paramsPromise;

  const code = stateCode(params.state); if (!code) return {};
  return { title: `${STATES[code].name} city guides & housing resources`, description: STATES[code].description, alternates: { canonical: `/places/${params.state}` } };
}
export default async function StatePage({ params: paramsPromise }: { params: Promise<{ state: string }> }) {
  const params = await paramsPromise;

  const code = stateCode(params.state); if (!code) notFound();
  const state = STATES[code];
  return <>
    <nav aria-label="Breadcrumb" className="mt-6 text-sm text-chocolate-700"><Link href="/places" className="underline">Explore places</Link><span aria-hidden> / </span>{state.name}</nav>
    <header className="mt-7 rounded-3xl border border-gingerbread-300 bg-frosting-100 p-6 sm:p-9"><p className="eyebrow">Make your next move</p><h1 className="mt-3 font-display text-4xl font-extrabold text-chocolate-900 sm:text-5xl">Find your place in {state.name}.</h1><p className="mt-4 max-w-2xl text-base text-chocolate-700">{state.description} Explore planning guides, then compare the listings we currently have or connect with local housing support.</p><div className="mt-6 flex flex-wrap gap-3"><Link href={`/rentals?state=${code}`} className="bolt-btn">Browse listed rentals</Link><a href="#housing-resources" className="cinnamon-btn">Find housing help</a></div></header>
    <PlaceDirectory fixedState={code} />
    <HousingResources state={code} />
  </>;
}
