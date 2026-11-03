import type { Metadata } from 'next';
import { PlanningList } from '@/components/planning/PlanningList';

export const metadata: Metadata = { title: 'Saved', description: 'Review the rentals, cars and work vehicles saved on this device, and choose items to compare.' };

export default function SavedPage() {
  return <>
    <header className="mt-6"><p className="eyebrow">Keep your possibilities together</p><h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900 sm:text-5xl">Saved</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-chocolate-700">Return to your saved rentals, cars and work vehicles. Review the details or add them to your comparison.</p></header>
    <PlanningList mode="saved" />
  </>;
}
