import { ArrowUpRight, LifeBuoy } from 'lucide-react';
import { STATES, type StateCode } from '@/lib/places';

export function HousingResources({ state }: { state?: StateCode }) {
  const codes: StateCode[] = state ? [state] : ['CA', 'AZ'];
  return <section id="housing-resources" className="mt-10 rounded-3xl bg-chocolate-900 p-6 text-frosting-50 sm:p-8" aria-labelledby="housing-resources-heading">
    <div className="flex items-center gap-2 text-sm font-bold text-lightning-300"><LifeBuoy className="h-5 w-5" aria-hidden />A place to start when you need support</div>
    <h2 id="housing-resources-heading" className="mt-3 font-display text-2xl font-extrabold">Housing help beyond the city guides</h2>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-frosting-100">Use these primary directories to find local housing and shelter resources, including areas without a city guide here. Contact the service to confirm hours, eligibility, accessibility and current space. We do not reserve shelter beds or guarantee housing.</p>
    <ul className="mt-5 grid gap-3 md:grid-cols-3">
      {codes.map((code) => <li key={code}><a href={STATES[code].resourceUrl} target="_blank" rel="noopener noreferrer" className="flex h-full items-center justify-between gap-3 rounded-xl border border-frosting-100/30 p-4 text-sm font-bold hover:bg-white/10">{STATES[code].resourceName}<ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden /></a></li>)}
      <li><a href="https://www.hud.gov/findshelter" target="_blank" rel="noopener noreferrer" className="flex h-full items-center justify-between gap-3 rounded-xl border border-frosting-100/30 p-4 text-sm font-bold hover:bg-white/10">HUD Find Shelter<ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden /></a></li>
    </ul>
    <p className="mt-4 text-xs text-frosting-100">If you are in immediate danger, call 911. For local community-service referrals, dial 211; availability varies by location.</p>
  </section>;
}
