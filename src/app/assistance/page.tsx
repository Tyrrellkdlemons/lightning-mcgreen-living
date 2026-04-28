import type { Metadata } from 'next';
import Link from 'next/link';
import { ASSISTANCE_RESOURCES, resourcesForJurisdiction } from '@/lib/data/assistance';
import { AssistanceCard } from '@/components/assistance/AssistanceCard';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

export const metadata: Metadata = {
  title: 'Stay-housed & vehicle hardship help',
  description:
    'County-by-county rent-relief, voucher, eviction-help, and auto-loan hardship resources for Southern California — verified, source-linked.',
};

const SECTIONS: { jurisdiction: Parameters<typeof resourcesForJurisdiction>[0]; label: string; sub: string }[] = [
  { jurisdiction: 'Los Angeles County', label: 'Los Angeles County', sub: 'ERRP reopened 2026-02-09 + housing search' },
  { jurisdiction: 'Orange County', label: 'Orange County', sub: 'OCHA forms, payment standards, tenant-rights' },
  { jurisdiction: 'Riverside County', label: 'Riverside County', sub: 'DPSS Housing Support, voucher, legal aid' },
  { jurisdiction: 'San Bernardino County', label: 'San Bernardino County', sub: 'Project list, voucher, court help' },
  { jurisdiction: 'California', label: 'Statewide California', sub: 'CalWORKs, tenant guide, source-of-income FAQ' },
  { jurisdiction: 'Federal', label: 'Federal & auto hardship', sub: 'CFPB, FTC, BAR Consumer Assistance Program' },
];

export default function AssistancePage() {
  return (
    <>
      <header className="mt-6">
        <Gumdrop tone="ok">Stay-housed + drive-safe</Gumdrop>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">
          Help &amp; hardship resources
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          When the math gets tight, real programs can help. Every link below
          goes to the official agency or program — never a third-party
          intermediary. {ASSISTANCE_RESOURCES.length} verified resources.
        </p>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {SECTIONS.map((s) => (
          <a key={s.jurisdiction} href={`#${slug(s.jurisdiction)}`} className="rounded-full border border-gingerbread-300 bg-frosting-100 px-3 py-1 font-semibold text-chocolate-800 hover:bg-frosting-200">
            {s.label}
          </a>
        ))}
        <Link href="/templates" className="rounded-full border border-lightning-500 bg-lightning-100 px-3 py-1 font-semibold text-lightning-700 hover:bg-lightning-200">
          Printable letter templates →
        </Link>
      </div>

      {SECTIONS.map((s) => {
        const items = resourcesForJurisdiction(s.jurisdiction);
        if (items.length === 0) return null;
        return (
          <section key={s.jurisdiction} id={slug(s.jurisdiction)} className="mt-10">
            <h2 className="font-display text-2xl font-extrabold text-chocolate-900">{s.label}</h2>
            <p className="text-sm text-chocolate-700">{s.sub}</p>
            <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((r) => <li key={r.id}><AssistanceCard resource={r} /></li>)}
            </ul>
          </section>
        );
      })}

      <CandyCard className="mt-10">
        <h3 className="font-display text-lg font-extrabold text-chocolate-900">Important</h3>
        <ul className="mt-2 space-y-1 text-xs text-chocolate-700">
          <li>· Lightning McGreen Living is not a county agency or lender.</li>
          <li>· We never pay third-party "rent rescue" or "repo rescue" intermediaries.</li>
          <li>· Programs change; always confirm the latest eligibility on the agency's site.</li>
          <li>· If you face an active eviction or repossession, talk to the program AND a tenant-rights / consumer-lending attorney.</li>
        </ul>
      </CandyCard>
    </>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-');
}
