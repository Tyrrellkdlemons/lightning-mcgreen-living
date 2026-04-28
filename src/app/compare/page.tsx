import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { CandyCard } from '@/components/ui/CandyCard';

export const metadata: Metadata = { title: 'Compare' };

export default function ComparePage() {
  return (
    <>
      <TopToggle />
      <header className="mt-6">
        <h1 className="font-display text-3xl font-extrabold text-chocolate-900">Compare side-by-side</h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          Pick up to 4 rentals, cars, or work vehicles to compare. Comparison
          state lives on this device.
        </p>
      </header>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CandyCard className="text-center text-sm text-chocolate-700">
          <p className="font-semibold">Slot 1</p>
          <p className="text-xs">Use the &ldquo;Save&rdquo; control on any card.</p>
        </CandyCard>
        <CandyCard className="text-center text-sm text-chocolate-700">
          <p className="font-semibold">Slot 2</p>
        </CandyCard>
        <CandyCard className="text-center text-sm text-chocolate-700">
          <p className="font-semibold">Slot 3</p>
        </CandyCard>
        <CandyCard className="text-center text-sm text-chocolate-700">
          <p className="font-semibold">Slot 4</p>
        </CandyCard>
      </div>
      <p className="mt-4 text-xs text-chocolate-600">
        Compare drawer is wired through Zustand store <code>useCompareStore</code> in <code>src/lib/store/compare.ts</code>.
        Add items by clicking the star/plus icon on a card.
      </p>
    </>
  );
}
