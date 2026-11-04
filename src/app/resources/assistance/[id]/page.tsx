import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Building2 } from 'lucide-react';
import { config } from '@/lib/config';
import {
  ASSISTANCE_DIRECTORY_RESOURCES, ASSISTANCE_CATEGORY_LABELS, ASSISTANCE_PURPOSE_LABELS,
  ASSISTANCE_STATE_LABELS, assistanceCostPurposes, assistanceDate, assistanceDetailUrl,
  assistanceDirectoryUrl, assistanceScopeLabel, isPaidAssistanceResource, propertyParticipationLabel,
  safeAssistanceJsonLd, safeAssistanceSourceUrl, sourceKindLabel, sourceLinkLabel,
} from '@/lib/assistance-directory';
import { AssistanceNotice } from '@/components/assistance-directory/AssistanceNotice';
import { AssistanceStatus } from '@/components/assistance-directory/AssistanceStatus';

export const dynamicParams = false;
export function generateStaticParams() { return ASSISTANCE_DIRECTORY_RESOURCES.map(resource => ({ id: resource.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const resource = ASSISTANCE_DIRECTORY_RESOURCES.find(item => item.id === id);
  return resource ? { title: resource.name, description: resource.assistance_summary, alternates: { canonical: assistanceDetailUrl(resource.id) } } : {};
}
export default async function AssistanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = ASSISTANCE_DIRECTORY_RESOURCES.find(item => item.id === id);
  if (!resource) notFound();
  const source = safeAssistanceSourceUrl(resource.source_url);
  const paid = isPaidAssistanceResource(resource);
  const participation = propertyParticipationLabel(resource);
  const suppliedOnly = resource.verification_status === 'unverified';
  const amountHeading = suppliedOnly ? 'Supplied amount - not independently verified'
    : resource.verification_status === 'closed' ? 'Historical amount - program unavailable' : paid ? 'Published product terms / cost' : 'Assistance described by the source';
  const structuredData = { '@context': 'https://schema.org', '@type': 'WebPage', name: resource.name,
    description: resource.assistance_summary, url: new URL(assistanceDetailUrl(resource.id), config.url).href,
    ...(source ? { citation: source } : {}) };
  const facts = [
    ['Administrator', resource.administrator], ['Resource category', ASSISTANCE_CATEGORY_LABELS[resource.category]],
    ['State', ASSISTANCE_STATE_LABELS[resource.state]], ['Service area', assistanceScopeLabel(resource)],
    ['Listed counties', resource.counties.length ? resource.counties.join(', ') : 'No county list supplied; confirm the stated service area'],
    ['Listed cities', resource.cities.length ? resource.cities.join(', ') : 'No city list supplied; confirm the stated service area'],
    ['Form of assistance', resource.assistance_type], ['Source type', sourceKindLabel(resource)],
  ];
  return <article className="mx-auto min-w-0 max-w-5xl space-y-6 py-7 sm:space-y-8">
    <nav aria-label="Breadcrumb"><Link href={assistanceDirectoryUrl({ state: resource.state })} className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-bold text-lightning-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Assistance directory</Link></nav>
    <AssistanceNotice compact />
    <header className="min-w-0 rounded-3xl border border-lightning-200 bg-lightning-100 p-6 sm:p-9">
      <div className="flex flex-wrap items-center gap-3"><Building2 className="h-7 w-7 text-lightning-900" aria-hidden="true" /><p className="text-sm font-bold text-lightning-900">{ASSISTANCE_STATE_LABELS[resource.state]} · {ASSISTANCE_CATEGORY_LABELS[resource.category]}</p>{paid && <span className="rounded-lg border border-gingerbread-300 bg-frosting-50 px-3 py-2 text-xs font-extrabold text-chocolate-900">Paid product - not a grant</span>}{resource.help_kind === 'referral' && <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold">Referral / navigation resource</span>}</div>
      <h1 className="mt-4 break-words font-display text-3xl font-extrabold leading-tight tracking-tight text-chocolate-900 [overflow-wrap:anywhere] sm:text-4xl">{resource.name}</h1>
      <p className="mt-3 text-sm font-semibold text-chocolate-700">Administered by {resource.administrator}</p>
      <p className="mt-5 max-w-3xl text-base leading-relaxed text-chocolate-700">{resource.assistance_summary}</p>
      <div className="mt-5"><AssistanceStatus resource={resource} /></div>
      {participation && <p className="mt-5 rounded-xl border border-gingerbread-300 bg-white p-4 text-sm font-bold leading-relaxed text-chocolate-800">{participation}</p>}
    </header>
    <section className="rounded-2xl border border-gingerbread-300 bg-white p-6 sm:p-8" aria-labelledby="assistance-amount-heading"><h2 id="assistance-amount-heading" className="text-sm font-bold text-chocolate-700">{amountHeading}</h2><p className="mt-3 break-words font-display text-2xl font-extrabold leading-snug text-chocolate-900 [overflow-wrap:anywhere] sm:text-3xl">{resource.assistance_amount}</p><p className="mt-3 text-sm leading-relaxed text-chocolate-700">{resource.assistance_type}</p><p className="mt-3 text-sm leading-relaxed text-chocolate-700">Confirm the amount, all fees, repayment obligations and available funding directly. This record is not an offer, eligibility determination or approval.</p></section>
    <section className="rounded-2xl border border-gingerbread-200 bg-white p-6 sm:p-8"><h2 className="font-display text-2xl font-extrabold">Program at a glance</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2">{facts.map(([label, value]) => <div className="min-w-0" key={label}><dt className="text-xs font-bold uppercase tracking-wide text-chocolate-700">{label}</dt><dd className="mt-1.5 break-words text-sm leading-relaxed text-chocolate-800">{value}</dd></div>)}</dl><div className="mt-6 border-t border-gingerbread-200 pt-5"><h3 className="font-bold">Listed cost or support purposes</h3><ul className="mt-3 flex flex-wrap gap-2">{assistanceCostPurposes(resource).map(purpose => <li key={purpose} className="rounded-full bg-frosting-100 px-3 py-1.5 text-xs font-semibold">{ASSISTANCE_PURPOSE_LABELS[purpose]}</li>)}</ul>{!resource.cost_purposes?.length && <p className="mt-3 text-xs leading-relaxed text-chocolate-700">This broad focus comes from the supplied category. The source has not established coverage for a specific expense.</p>}</div></section>
    <div className="grid gap-6 md:grid-cols-2"><section className="min-w-0 rounded-2xl border border-gingerbread-200 bg-white p-6"><h2 className="font-display text-xl font-extrabold">Eligibility notes</h2><p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-chocolate-700">{resource.eligibility_notes}</p><p className="mt-4 text-xs font-semibold leading-relaxed text-chocolate-700">Only the administrator can determine whether you qualify. A matching city, county, cost or household need does not establish eligibility.</p></section><section className="min-w-0 rounded-2xl border border-gingerbread-200 bg-white p-6"><h2 className="font-display text-xl font-extrabold">How to apply or ask for help</h2>{resource.verification_status === 'closed' && <p className="mt-3 rounded-lg bg-frosting-100 p-3 text-sm font-bold">This record is marked closed or unavailable. Use the source to ask about current alternatives; do not assume applications are open.</p>}<p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-chocolate-700">{resource.how_to_apply}</p>{source ? <a href={source} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-lightning-100 px-4 py-3 text-sm font-bold text-lightning-950 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800 focus-visible:ring-offset-2">{sourceLinkLabel(resource)} <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : <p className="mt-4 text-sm font-semibold">A valid HTTPS source link is not recorded. Confirm the administrator before sharing information or paying a fee.</p>}</section></div>
    <section className="rounded-2xl border border-gingerbread-300 bg-frosting-100 p-6 sm:p-8"><h2 className="font-display text-xl font-extrabold">What was checked</h2><div className="mt-4"><AssistanceStatus resource={resource} /></div><p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-chocolate-700">{resource.verification_notes}</p><p className="mt-4 text-xs leading-relaxed text-chocolate-700">Record review date: {assistanceDate(resource.reviewed_at)}. A record review is separate from confirming every supplied claim, available funding or individual eligibility.</p>{source && <p className="mt-3 break-all text-xs leading-relaxed text-chocolate-700">Source: <a href={source} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 max-w-full items-center rounded underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800">{source}<span className="sr-only"> (opens in a new tab)</span></a></p>}</section>
    <section className="rounded-2xl border border-gingerbread-300 bg-white p-6 sm:p-8"><h2 className="font-display text-xl font-extrabold">Original supplied information</h2><p className="mt-3 text-sm font-semibold leading-relaxed text-chocolate-700">Original dataset claim, dated {assistanceDate(resource.supplied_date)}. Retained for transparency; it is not a statement of current terms.</p><blockquote className="mt-4 whitespace-pre-line border-l-4 border-gingerbread-300 pl-4 text-sm leading-relaxed text-chocolate-700">{resource.supplied_claim}</blockquote>{resource.source_rows.length > 0 && <p className="mt-4 break-words text-xs text-chocolate-700">Supplied reference: {resource.source_rows.join('; ')}</p>}</section>
    <section className="rounded-2xl border border-gingerbread-200 p-6"><h2 className="font-display text-xl font-extrabold">Can this be combined with other help?</h2><p className="mt-3 text-sm leading-relaxed text-chocolate-700">Combining programs requires permission from each administrator and the lender, when a mortgage is involved. Ask about restrictions, total assistance limits and repayment terms before relying on more than one program.</p></section>
    <AssistanceNotice compact />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeAssistanceJsonLd(structuredData) }} />
  </article>;
}
