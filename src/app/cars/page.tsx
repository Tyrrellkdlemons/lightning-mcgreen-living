import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { CarSearch } from '@/components/cars/CarSearch';
import { Gumdrop } from '@/components/ui/Gumdrop';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cars',
  description: 'Find Southern California cars and dealers that fit your real budget.',
};

export default function CarsPage() {
  return (
    <>
      <TopToggle />
      <header className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Gumdrop tone="ok">Vehicle side · Buy / Finance</Gumdrop>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">Cars</h1>
          <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
            Used, certified pre-owned, new — every listing shows the dealer, public promos,
            and an honest payment estimate. Hidden promos are reframed as
            "publicly verified" or "needs verification."
          </p>
        </div>
        <Link href="/work-vehicles" className="cinnamon-btn">Looking to rent a work vehicle? →</Link>
      </header>
      <CarSearch />
    </>
  );
}
