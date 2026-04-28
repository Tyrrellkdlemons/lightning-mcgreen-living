import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import { TopToggle } from '@/components/home/TopToggle';
import { TwoDoors } from '@/components/home/TwoDoors';
import { WhyBetter } from '@/components/home/WhyBetter';
import { LifeBudgetTeaser } from '@/components/home/LifeBudgetTeaser';
import { GeofenceNotice } from '@/components/home/GeofenceNotice';
import { CheckeredDivider } from '@/components/theme/CheckeredDivider';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TopToggle />
      <GeofenceNotice />
      <div className="mt-6" />
      <TwoDoors />
      <div className="candy-icing-divider mt-8" aria-hidden />
      <LifeBudgetTeaser />
      <CheckeredDivider className="mt-10" />
      <section className="mt-8">
        <CandyCard className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <Gumdrop tone="ok">Stay-housed + drive-safe</Gumdrop>
            <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">
              Real help when the math gets tight
            </h2>
            <p className="mt-1 text-sm text-chocolate-700">
              County rent-relief (LA ERRP reopened Feb 9, 2026), voucher info,
              tenant rights, and three real auto-loan hardship paths — all
              linked to the official agency, never a third-party "rescue" service.
            </p>
          </div>
          <Link href="/assistance" className="bolt-btn">Open assistance hub</Link>
        </CandyCard>
      </section>
      <WhyBetter />
    </>
  );
}
