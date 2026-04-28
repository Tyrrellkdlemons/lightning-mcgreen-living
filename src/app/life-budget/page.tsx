import type { Metadata } from 'next';
import { TopToggle } from '@/components/home/TopToggle';
import { LifeBudget } from '@/components/life/LifeBudget';
import { Gumdrop } from '@/components/ui/Gumdrop';

export const metadata: Metadata = {
  title: 'Compare Life Budget',
  description: 'Match a Southern California rental to a car and/or work vehicle that actually fits your monthly budget.',
};

export default function LifeBudgetPage() {
  return (
    <>
      <TopToggle />
      <header className="mt-6">
        <Gumdrop tone="ok">Combined view</Gumdrop>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">Compare Life Budget</h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          Plug in your monthly income and budget caps. We surface live + drive + earn combos
          and warn when the math doesn&apos;t add up.
        </p>
      </header>
      <LifeBudget />
    </>
  );
}
