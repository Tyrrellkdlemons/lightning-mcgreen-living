import type { Metadata } from 'next';
import Link from 'next/link';
import { getProviderRegistry } from '@/lib/providers/registry';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

export const metadata: Metadata = {
  title: 'Data sources',
  description: 'Every API and data source Lightning McGreen Living uses, with current status.',
};

const STATUS_TONE: Record<string, 'ok' | 'info' | 'warn' | 'mute'> = {
  live: 'ok',
  'env-key-missing': 'mute',
  'partner-required': 'warn',
  'paid-required': 'warn',
  unavailable: 'warn',
};

export default function DataSourcesPage() {
  const registry = getProviderRegistry();
  const live = registry.filter((r) => r.status === 'live');
  const gated = registry.filter((r) => r.status === 'env-key-missing');
  const partner = registry.filter((r) => ['partner-required', 'paid-required', 'unavailable'].includes(r.status));

  return (
    <>
      <header className="mt-6">
        <h1 className="font-display text-3xl font-extrabold text-chocolate-900">Data sources</h1>
        <p className="mt-1 max-w-3xl text-sm text-chocolate-700">
          See which data connections are available and which need provider access.
          A configured connection is separate from a current availability check.
        </p>
      </header>

      <div className="mt-6 rounded-2xl border border-gingerbread-300 p-5"><h2 className="font-display text-xl font-extrabold">Looking for housing or practical help?</h2><p className="mt-2 text-sm">The source library lists individual providers and records how each was found.</p><Link href="/resources" className="mt-3 inline-block font-bold underline">Open the housing & help source library →</Link></div>
      <Section title="Available · free · no key required" items={live} />
      <Section title="Env-key gated (works without; key adds features)" items={gated} />
      <Section title="Partner / paid stubs (require contractual access)" items={partner} />
    </>
  );
}

function Section({ title, items }: { title: string; items: ReturnType<typeof getProviderRegistry> }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-xl font-extrabold text-chocolate-900">{title}</h2>
      <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <li key={p.id}>
            <CandyCard className="h-full">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-chocolate-900">{p.label}</h3>
                  <p className="text-xs text-chocolate-700">{p.legal_status}</p>
                </div>
                <Gumdrop tone={STATUS_TONE[p.status] ?? 'mute'}>{p.status}</Gumdrop>
              </div>
              {p.notes && <p className="mt-2 text-xs text-chocolate-700">{p.notes}</p>}
              {p.homepage && (
                <p className="mt-2 text-xs">
                  <a href={p.homepage} target="_blank" rel="noopener noreferrer"
                     className="underline decoration-lightning-500 underline-offset-2 break-all">
                    Homepage / docs
                  </a>
                </p>
              )}
            </CandyCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
