import { AssistanceLogo } from './AssistanceLogo';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { AssistanceStatus } from './AssistanceStatus';
import {
  ASSISTANCE_CATEGORY_LABELS, ASSISTANCE_STATE_LABELS, assistanceDetailUrl, assistanceScopeLabel,
  isCityRestricted, isPaidAssistanceResource, propertyParticipationLabel, safeAssistanceSourceUrl,
  sourceLinkLabel, type AssistanceResource,
} from '@/lib/assistance-directory/model';

export function AssistanceCard({ resource, countyBrowse = false }: { resource: AssistanceResource; countyBrowse?: boolean }) {
  const source = safeAssistanceSourceUrl(resource.source_url);
  const paid = isPaidAssistanceResource(resource);
  const participation = propertyParticipationLabel(resource);
  const amountLabel = resource.verification_status === 'unverified' ? 'Supplied amount - unverified'
    : resource.verification_status === 'closed' ? 'Historical amount - unavailable' : paid ? 'Product terms / cost' : 'Assistance described';
  return <article className="flex h-full min-w-0 flex-col rounded-2xl border border-gingerbread-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-cookie motion-reduce:transition-none sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <AssistanceLogo imageKey={resource.image_key} name={resource.name} />
      <p className="min-w-0 text-right text-xs font-bold leading-relaxed text-chocolate-700">{ASSISTANCE_STATE_LABELS[resource.state]}<span className="block font-normal">{ASSISTANCE_CATEGORY_LABELS[resource.category]}</span></p>
    </div>
    {paid && <p className="mt-4 self-start rounded-lg border border-gingerbread-300 bg-frosting-100 px-3 py-1.5 text-xs font-extrabold text-chocolate-900">Paid product - not a grant</p>}
    {resource.help_kind === 'referral' && <p className="mt-4 text-xs font-bold text-chocolate-700">Referral / navigation resource</p>}
    <h3 className="mt-4 break-words font-display text-xl font-extrabold leading-snug text-chocolate-900 [overflow-wrap:anywhere]"><Link className="inline-flex min-h-11 items-center rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800 focus-visible:ring-offset-2" href={assistanceDetailUrl(resource.id)} prefetch={false}>{resource.name}</Link></h3>
    <p className="mt-2 break-words text-sm leading-relaxed text-chocolate-700">{resource.administrator}</p>
    <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-chocolate-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span className="min-w-0 break-words">{assistanceScopeLabel(resource)}</span></p>
    {countyBrowse && isCityRestricted(resource) && <p className="mt-2 text-xs font-semibold text-chocolate-700">City-only coverage. A county match does not establish eligibility.</p>}
    <div className="my-4 rounded-xl bg-frosting-50 p-4"><p className="text-xs font-semibold text-chocolate-700">{amountLabel}</p><p className="mt-1 break-words text-lg font-extrabold leading-snug text-chocolate-900 [overflow-wrap:anywhere]">{resource.assistance_amount}</p><p className="mt-2 text-xs leading-relaxed text-chocolate-700">{resource.assistance_type}</p></div>
    <p className="text-sm leading-relaxed text-chocolate-700">{resource.assistance_summary}</p>
    {participation && <p className="mt-3 rounded-lg border border-gingerbread-200 px-3 py-2 text-xs font-bold leading-relaxed text-chocolate-700">{participation}</p>}
    <div className="mt-5"><AssistanceStatus resource={resource} /></div>
    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-gingerbread-100 pt-4 text-sm font-bold">
      <Link href={assistanceDetailUrl(resource.id)} prefetch={false} className="mt-3 inline-flex min-h-11 items-center gap-1 rounded text-lightning-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800 focus-visible:ring-offset-2">View details <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
      {source ? <a href={source} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1 rounded text-chocolate-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800 focus-visible:ring-offset-2">{sourceLinkLabel(resource)} <ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : <p className="mt-3 text-xs font-normal text-chocolate-700">A valid HTTPS source link is not recorded.</p>}
    </div>
  </article>;
}
