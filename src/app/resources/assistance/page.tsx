import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowUpRight, House } from 'lucide-react';
import { config } from '@/lib/config';
import {
  ASSISTANCE_DIRECTORY_COUNTIES, ASSISTANCE_DIRECTORY_PLACES, ASSISTANCE_DIRECTORY_RESOURCES, assistanceDate, assistanceDetailUrl,
  latestAssistanceContentCheck, safeAssistanceJsonLd,
} from '@/lib/assistance-directory';
import { AssistanceDirectory } from '@/components/assistance-directory/AssistanceDirectory';
import { AssistanceNotice } from '@/components/assistance-directory/AssistanceNotice';
import { AssistanceSkeleton } from '@/components/assistance-directory/AssistanceSkeleton';

export const metadata: Metadata = {
  title: 'Down Payment & Rent Assistance in California and Arizona',
  description: 'Browse down payment, rental and move-in resources by state, county and purpose, with clear evidence labels, application guidance and source links.',
  alternates: { canonical: '/resources/assistance' },
};
export default function AssistanceDirectoryPage() {
  const latest = latestAssistanceContentCheck(ASSISTANCE_DIRECTORY_RESOURCES);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'California and Arizona assistance resource directory',
    description: 'Informational resource directory. Inclusion does not establish funding, eligibility or approval.',
    numberOfItems: ASSISTANCE_DIRECTORY_RESOURCES.length,
    itemListElement: ASSISTANCE_DIRECTORY_RESOURCES.map((resource, index) => ({ '@type': 'ListItem', position: index + 1,
      name: resource.name, url: new URL(assistanceDetailUrl(resource.id), config.url).href })),
  };
  return <div className="min-w-0 space-y-7 py-7 sm:space-y-9">
    <nav aria-label="Breadcrumb"><Link href="/resources" className="inline-flex min-h-11 items-center rounded text-sm font-bold text-lightning-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800">All housing resources</Link></nav>
    <header className="relative overflow-hidden rounded-3xl border border-lightning-200 bg-lightning-100 p-6 sm:p-10">
      <div className="flex items-center gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lightning-900"><House className="h-6 w-6" aria-hidden="true" /></span><p className="eyebrow text-lightning-900">A clearer route to housing help</p></div>
      <h1 className="mt-5 max-w-4xl break-words font-display text-3xl font-extrabold leading-tight tracking-tight text-chocolate-900 sm:text-5xl">Down Payment &amp; Rent Assistance in California and Arizona.</h1>
      <p className="mt-5 max-w-3xl text-base leading-relaxed text-chocolate-700 sm:text-lg">Explore help with buying a home, rental costs and finding the right local contact. Compare program information, see what was checked, and take your next step with the source in hand.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-white/80 p-4"><p className="text-2xl font-extrabold text-chocolate-900">{ASSISTANCE_DIRECTORY_RESOURCES.length}</p><p className="mt-1 text-sm text-chocolate-700">Program and referral records</p></div><div className="rounded-xl bg-white/80 p-4"><p className="text-2xl font-extrabold text-chocolate-900">2 states</p><p className="mt-1 text-sm text-chocolate-700">California and Arizona</p></div><div className="rounded-xl bg-white/80 p-4"><p className="text-sm font-bold text-chocolate-900">{latest ? `Latest content check: ${assistanceDate(latest)}` : 'Independent content checks pending'}</p><p className="mt-1 text-xs leading-relaxed text-chocolate-700">Some records are older or unverified. Check each resource&apos;s label; funding is not guaranteed.</p></div></div>
    </header>
    <AssistanceNotice />
    <Suspense fallback={<AssistanceSkeleton />}><AssistanceDirectory resources={ASSISTANCE_DIRECTORY_RESOURCES} counties={ASSISTANCE_DIRECTORY_COUNTIES} places={ASSISTANCE_DIRECTORY_PLACES} /></Suspense>
    <section className="rounded-2xl border border-gingerbread-300 bg-white p-6 sm:p-8" aria-labelledby="assistance-next-step"><h2 id="assistance-next-step" className="font-display text-2xl font-extrabold">Before you apply</h2><div className="mt-5 grid gap-6 md:grid-cols-3"><div><h3 className="font-bold">1. Confirm the current program</h3><p className="mt-2 text-sm leading-relaxed text-chocolate-700">Ask whether applications are open, funding remains, and your location is covered. A listed amount is not an offer or approval.</p></div><div><h3 className="font-bold">2. Ask about the full cost</h3><p className="mt-2 text-sm leading-relaxed text-chocolate-700">Check fees, repayment, income limits and application requirements. Paid deposit alternatives and guarantors are products, not grants, and your property must accept them.</p></div><div><h3 className="font-bold">3. Check before combining help</h3><p className="mt-2 text-sm leading-relaxed text-chocolate-700">Combining programs requires permission from each administrator and the lender, when a mortgage is involved. Do not assume two programs can be used together.</p></div></div><Link href="/help" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded font-bold text-lightning-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lightning-800">Need another starting point? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></section>
    <AssistanceNotice compact />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeAssistanceJsonLd(jsonLd) }} />
  </div>;
}
