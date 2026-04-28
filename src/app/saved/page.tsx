import type { Metadata } from 'next';
import { CandyCard } from '@/components/ui/CandyCard';

export const metadata: Metadata = { title: 'Saved' };

export default function SavedPage() {
  return (
    <>
      <header className="mt-6">
        <h1 className="font-display text-3xl font-extrabold text-chocolate-900">Saved</h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          Your saved rentals, cars, and work vehicles. Stored on this device only — works offline.
        </p>
      </header>
      <div className="mt-6">
        <CandyCard className="text-center text-sm text-chocolate-700">
          <p>Use the &ldquo;Save&rdquo; star on any card to add it here.</p>
          <p className="mt-2 text-xs">
            Saved items are kept in <code>localStorage</code> via the
            {' '}<code>useSavedStore</code> Zustand slice and are visible offline.
          </p>
        </CandyCard>
      </div>
    </>
  );
}
