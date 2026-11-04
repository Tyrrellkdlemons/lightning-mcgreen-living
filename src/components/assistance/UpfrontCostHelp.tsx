import Link from 'next/link';
import { ArrowUpRight, Wallet } from 'lucide-react';
import { LOCATIONS, normalizeLocationText } from '@/lib/locations';
import { ASSISTANCE_DIRECTORY_RESOURCES, assistanceAppliesToPlace, assistanceDetailUrl, assistanceDirectoryUrl, verificationDateLabel, isPaidAssistanceResource, type AssistanceState } from '@/lib/assistance-directory';

/** Geography provides referral context only. No renter profile or personal eligibility data is used. */
export function UpfrontCostHelp({ state, city, county = '', intent = 'both' }: { state: AssistanceState; city: string; county?: string; intent?: 'rent' | 'buy' | 'both' }) {
  const location = LOCATIONS.find(place => place.state === state && normalizeLocationText(place.name) === normalizeLocationText(city));
  const counties = county ? [county.replace(/ County$/i, '')] : location?.counties.map(item => item.name.replace(/ County$/i, '')) ?? [''];
  const filter = { state, city, county: counties.length === 1 ? counties[0] : '', category: intent === 'buy' ? 'down_payment' as const : intent === 'rent' ? 'rental_assistance' as const : '' as const };
  const rank = { city: 0, county: 1, regional: 2, statewide: 3, national: 4 };
  const resources = ASSISTANCE_DIRECTORY_RESOURCES.filter(resource =>
    ['verified', 'partial'].includes(resource.verification_status) && !isPaidAssistanceResource(resource)
    && counties.some(area => assistanceAppliesToPlace(resource, state, area, city))
    && (!filter.category || resource.category === filter.category || resource.category === 'both'))
    .sort((a, b) => rank[a.scope] - rank[b.scope] || Number(a.verification_status === 'partial') - Number(b.verification_status === 'partial') || a.name.localeCompare(b.name)).slice(0, 4);
  return <section className="my-8 rounded-3xl border border-gingerbread-300 bg-frosting-50 p-5 sm:p-8" aria-label={`Housing cost help in ${city}`}>
    <p className="eyebrow inline-flex items-center gap-2"><Wallet className="h-5 w-5" aria-hidden />Help with upfront costs</p>
    <h2 className="mt-3 font-display text-2xl font-extrabold text-chocolate-900">{intent === 'buy' ? 'Down payment & closing-cost resources' : intent === 'rent' ? 'Deposit, move-in & rent resources' : 'Down Payment & Rent Assistance'} in {city}</h2>
    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-chocolate-700">These are location-based research leads. Your eligibility, available funding and this property’s participation are unconfirmed. Ask the administrator and management before relying on payment or signing a lease.</p>
    {resources.length > 0 && <ul className="mt-5 grid gap-3 md:grid-cols-2">{resources.map(resource => <li key={resource.id} className="min-w-0 rounded-2xl border border-gingerbread-200 bg-white p-4"><Link href={assistanceDetailUrl(resource.id)} prefetch={false} className="inline-flex min-h-11 items-center gap-2 font-bold text-lightning-800 underline"><span className="min-w-0 break-words">{resource.name}</span><ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden /></Link><p className="mt-2 text-sm leading-relaxed text-chocolate-700">{resource.assistance_summary}</p><p className="mt-3 text-xs text-chocolate-700">{verificationDateLabel(resource)}</p></li>)}</ul>}
    <div className="mt-5 flex flex-wrap gap-3"><Link href={assistanceDirectoryUrl(filter)} className="bolt-btn min-h-11">Browse all matching resources</Link>{intent !== 'buy' && <><Link href={assistanceDirectoryUrl({ ...filter, category: 'rental_assistance', purpose: 'rental_deposit' })} className="cinnamon-btn min-h-11">Rental deposits</Link><Link href={assistanceDirectoryUrl({ ...filter, category: 'rental_assistance', purpose: 'back_rent' })} className="cinnamon-btn min-h-11">Past-due rent</Link></>}</div>
    {intent !== 'buy' && <details className="mt-5 rounded-xl border border-gingerbread-200 bg-white p-4"><summary className="min-h-11 cursor-pointer font-bold text-chocolate-900">Paid deposit alternatives & guarantors</summary><p className="mt-2 text-sm leading-relaxed text-chocolate-700">These are paid products, not grants. Fees can be non-refundable, and rent or damage obligations remain. Compare the full lease cost with a refundable cash deposit. Exact property participation is unconfirmed.</p><div className="mt-3 flex flex-wrap gap-3"><Link href={assistanceDirectoryUrl({ ...filter, category: 'rental_assistance', purpose: 'deposit_alternative' })} className="cinnamon-btn min-h-11">Research deposit alternatives</Link><Link href={assistanceDirectoryUrl({ ...filter, category: 'rental_assistance', purpose: 'paid_guarantor' })} className="cinnamon-btn min-h-11">Research paid guarantors</Link></div></details>}
  </section>;
}
