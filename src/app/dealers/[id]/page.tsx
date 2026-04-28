import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REAL_DEALERS, REAL_VEHICLES } from '@/lib/data/real-vehicles';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { SourcePanel } from '@/components/common/SourcePanel';
import { DealerInventory } from '@/components/cars/DealerInventory';

interface Props { params: { id: string } }

export function generateMetadata({ params }: Props): Metadata {
  const d = REAL_DEALERS.find((x) => x.id === params.id);
  return { title: d?.dealer_name ?? 'Dealer' };
}

export default function DealerDetail({ params }: Props) {
  const dealer = REAL_DEALERS.find((x) => x.id === params.id);
  if (!dealer) notFound();
  const inv = REAL_VEHICLES.filter((v) => v.dealer_id === dealer.id);

  return (
    <div className="mt-6 space-y-6">
      <CandyCard>
        <Gumdrop tone="info">Dealer</Gumdrop>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-chocolate-900">{dealer.dealer_name}</h1>
        {dealer.legal_name && <p className="text-xs text-chocolate-600">Legal: {dealer.legal_name}</p>}
        <p className="mt-1 text-sm text-chocolate-700">
          {dealer.address_line} · {dealer.city}, CA {dealer.zip}
        </p>
        <p className="mt-1 text-sm">
          Phone: <a href={`tel:${dealer.phone}`} className="underline decoration-lightning-500 underline-offset-2">{dealer.phone}</a>
          {' · '}
          Website: <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="underline decoration-lightning-500 underline-offset-2">{dealer.website}</a>
        </p>
        {dealer.public_promos?.length ? (
          <div className="mt-3">
            <p className="text-xs font-bold uppercase text-chocolate-700">Public promos</p>
            <ul className="mt-1 space-y-1 text-sm text-chocolate-800">
              {dealer.public_promos.map((p, i) => <li key={i}>· {p.label}</li>)}
            </ul>
          </div>
        ) : null}
        <div className="mt-4"><SourcePanel meta={dealer.meta} /></div>
      </CandyCard>

      <section>
        <h2 className="font-display text-xl font-extrabold text-chocolate-900">Inventory ({inv.length})</h2>
        <DealerInventory vehicles={inv} />
      </section>
    </div>
  );
}
