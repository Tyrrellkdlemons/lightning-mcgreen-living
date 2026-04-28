import type { Metadata } from 'next';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { LinkVerifier } from '@/components/admin/LinkVerifier';

export const metadata: Metadata = { title: 'Admin · Verify exact links' };

export default function AdminVerifyPage() {
  return (
    <>
      <header className="mt-6">
        <Gumdrop tone="warn">Internal</Gumdrop>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">
          Verify exact application / finance / reservation links
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          Spot-check the live status of every direct link we surface. Any
          host on the scrape-blocked list (Zillow / Apartments.com / Rent.com /
          Cars.com / Autotrader / CarGurus / Trulia / HotPads / Realtor.com)
          is verified manually in a browser, not by this tool.
        </p>
      </header>
      <LinkVerifier />
      <CandyCard className="mt-6">
        <h2 className="font-display text-lg font-extrabold text-chocolate-900">Manual verification log</h2>
        <ul className="mt-2 space-y-1 text-sm text-chocolate-700">
          <li>· Mark "manual verification complete" once you click through the official site.</li>
          <li>· Add a screenshot/reference note (URL of the live page you confirmed).</li>
          <li>· Stored locally for now (in-browser); a Postgres adapter ships in the next slice.</li>
        </ul>
      </CandyCard>
    </>
  );
}
