import type { Metadata } from 'next';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { LeaseExtensionTemplate } from '@/components/templates/LeaseExtensionTemplate';
import { AutoHardshipTemplate } from '@/components/templates/AutoHardshipTemplate';
import { CountyPacketChecklist } from '@/components/templates/CountyPacketChecklist';

export const metadata: Metadata = {
  title: 'Printable letters & checklists',
  description:
    'Lease-extension request, auto-loan hardship letter, and county-assistance packet checklist — print-ready, copy-to-clipboard.',
};

export default function TemplatesPage() {
  return (
    <>
      <header className="mt-6">
        <Gumdrop tone="ok">Printable</Gumdrop>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">Letters &amp; checklists</h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          Templates you can fill in, copy or print. These are requests to a provider, not court filings or legal advice. If you received court papers, contact qualified local legal help promptly; a letter does not replace a required court response. We never auto-send these on your behalf.
        </p>
      </header>

      <section id="lease-extension" className="mt-6">
        <CandyCard>
          <Gumdrop tone="info">Apartment / townhome</Gumdrop>
          <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">Lease extension / payment plan request</h2>
          <p className="mt-1 text-sm text-chocolate-700">Use when you need more time on your lease or a payment plan for past-due rent.</p>
          <LeaseExtensionTemplate />
        </CandyCard>
      </section>

      <section id="auto-hardship" className="mt-6">
        <CandyCard>
          <Gumdrop tone="warn">Auto loan</Gumdrop>
          <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">Auto loan hardship request</h2>
          <p className="mt-1 text-sm text-chocolate-700">Use when contacting your lender about a missed or upcoming car payment.</p>
          <AutoHardshipTemplate />
        </CandyCard>
      </section>

      <section id="county-packet" className="mt-6">
        <CandyCard>
          <Gumdrop tone="mute">County assistance</Gumdrop>
          <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">County assistance packet checklist</h2>
          <p className="mt-1 text-sm text-chocolate-700">A preparation checklist for LA / OC / Riverside / SB programs. Each provider determines its own required documents.</p>
          <CountyPacketChecklist />
        </CandyCard>
      </section>
    </>
  );
}
