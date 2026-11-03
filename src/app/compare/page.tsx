import type { Metadata } from 'next';
import { PlanningList } from '@/components/planning/PlanningList';

export const metadata: Metadata = { title: 'Compare', description: 'Compare up to eight saved rentals, car purchases and work-vehicle rentals with clearly labeled costs and source dates.' };

export default function ComparePage() {
  return <>
    <header className="mt-6"><p className="eyebrow">Make the next choice clearer</p><h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900 sm:text-5xl">Compare side by side</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-chocolate-700">Compare up to 8 selections from your saved list. Each category keeps its own costs and details so you can judge similar options together.</p></header>
    <PlanningList mode="compare" />
  </>;
}
