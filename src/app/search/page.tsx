import Link from 'next/link';
import { searchLocations } from '@/lib/locations';
import type { Metadata } from 'next';
import { SearchResults } from '@/components/search/SearchResults';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Lightning McGreen Living — rentals, cars, dealers, work vehicles, and assistance.',
};

interface Props {
  searchParams: Promise<{ q?: string | string[]; kind?: string | string[] }>;
}

export default async function SearchPage({ searchParams: searchParamsPromise }: Props) {
  const searchParams = await searchParamsPromise;

  const scalar = (value: string | string[] | undefined) => typeof value === 'string' ? value : value?.[0];
  const q = (scalar(searchParams.q) ?? '').trim();
  const cities = q ? searchLocations({query:q,pageSize:12}) : {items:[],total:0};
  return <>{cities.items.length > 0 && <section className="my-6 rounded-2xl border border-gingerbread-200 p-5"><h2 className="font-display text-xl font-extrabold">Cities & housing ({cities.total})</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cities.items.map(p => <Link key={p.id} className="cinnamon-btn text-sm" href={`/homes?city=${p.id}&state=${p.state}`}>{p.name}, {p.state} · Rent or buy</Link>)}</div><Link className="mt-4 inline-block text-sm underline" href={`/homes?q=${encodeURIComponent(q)}`}>See all matching cities</Link></section>}<SearchResults initialQuery={q} initialKind={scalar(searchParams.kind)} /></>;
}
