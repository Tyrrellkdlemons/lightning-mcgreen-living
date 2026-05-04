import type { Metadata } from 'next';
import Link from 'next/link';
import { TopToggle } from '@/components/home/TopToggle';
import { ApartmentApplyEngine } from '@/components/rentals/ApartmentApplyEngine';
import { GingerbreadHero } from '@/components/theme/GingerbreadHero';

export const metadata: Metadata = { title: 'Auto Apartment Apply Engine' };

export default function ApartmentApplyEnginePage() {
  return (
    <>
      <TopToggle />
      <GingerbreadHero
        title="Auto Apartment Apply Engine"
        subtitle="Apartment-side application queue with direct deep links, owner/operator routing, strict-screening alerts, open map links, and editable owned visuals."
      />
      <p className="mt-3 max-w-3xl text-xs text-chocolate-700">
        This prepares packets and opens the official property portals. It does not auto-submit forms,
        bypass CAPTCHA, or pay fees for you. Need the wider list?{' '}
        <Link href="/apartments" className="underline decoration-lightning-500 underline-offset-2">
          Back to apartments
        </Link>
        .
      </p>
      <ApartmentApplyEngine />
    </>
  );
}
