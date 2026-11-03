import type { Metadata } from 'next';
import Link from 'next/link';
import { TopToggle } from '@/components/home/TopToggle';
import { CarSearch } from '@/components/cars/CarSearch';
import { RaceHero } from '@/components/theme/RaceHero';

export const metadata: Metadata = {
  title: 'Cars',
  description: 'Find California and Arizona cars and dealers that fit your real budget — race-day theme, honest payment math.',
};

export default async function CarsPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ state?: string; city?: string }> }) {
  const searchParams = await searchParamsPromise;

  const state = searchParams.state === 'CA' || searchParams.state === 'AZ' ? searchParams.state : undefined;
  const city = typeof searchParams.city === 'string' ? searchParams.city.trim().slice(0, 100) : undefined;
  return (
    <>
      <TopToggle />
      <RaceHero
        variant="cars"
        title="Cars · Pit Lane"
        subtitle="Real dealer chains — CarMax, Carvana, AutoNation USA, Driveway, EchoPark — with publicly verified promos, a real payment estimator, and original racing energy. Inspired by friendly animated racing films and motorsport dashboards."
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-chocolate-700">
        <span>Public promos only · we never invent &ldquo;zero-down&rdquo;.</span>
        <Link href="/work-vehicles" className="cinnamon-btn text-xs">Need a work vehicle? →</Link>
      </div>
      <CarSearch key={`${state ?? ""}:${city ?? ""}`} initialState={state} />
    </>
  );
}
