import Link from 'next/link';
import type { AssistanceState } from '@/types/assistance';
import { resourcesForCountyAndState } from '@/lib/data/assistance';
import { AssistanceCard } from './AssistanceCard';
import { CandyCard } from '@/components/ui/CandyCard';

/** County matches are supplemented by resources from the selected state. */
export function CountyHelp({ county, state }: { county: string; state: AssistanceState }) {
  const { byCounty, statewide, federal } = resourcesForCountyAndState(county, state);
  const top = [...byCounty, ...statewide, ...federal]
    .filter((resource) => resource.application_status !== 'closed' &&
      resource.topic !== 'auto_loan_hardship' && resource.topic !== 'auto_repair_assistance')
    .slice(0, 3);
  if (!top.length) return null;
  const stateName = state === 'AZ' ? 'Arizona' : 'California';
  return <CandyCard>
    <h2 className="font-display text-xl font-extrabold text-chocolate-900">Housing help in {stateName}</h2>
    <p className="mt-1 text-sm text-chocolate-700">Start with these county or statewide resources. Ask the provider about your address, eligibility and current assistance.</p>
    <ul className="mt-3 grid gap-3 md:grid-cols-3">
      {top.map((resource) => <li key={resource.id}><AssistanceCard resource={resource} /></li>)}
    </ul>
    <p className="mt-3 text-xs"><Link href={`/assistance#${stateName.toLowerCase()}`} className="underline decoration-lightning-500 underline-offset-2">See {stateName} assistance resources</Link></p>
  </CandyCard>;
}
