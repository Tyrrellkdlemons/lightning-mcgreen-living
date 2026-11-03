import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { WORKBOOK_RANKED_LISTINGS } from '@/lib/data/workbook-ranked-listings';
import { WORKBOOK_FULL_LISTINGS, WORKBOOK_FIELDS, WORKBOOK_FIELD_GROUPS } from '@/lib/data/workbook-listings-full';
import { propertyPath, recordedRent, safeSourceUrl, workbookView } from '@/lib/places/property-view';
import { PropertyEvidence } from '@/components/properties/PropertyEvidence';
import { PlaceGallery } from '@/components/photos/PlaceGallery';
import { PropertyView } from '@/components/places/PropertyView';

export const dynamicParams = false;
export function generateStaticParams() { return WORKBOOK_RANKED_LISTINGS.map((listing) => ({ id: listing.id })); }
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const listing = WORKBOOK_RANKED_LISTINGS.find((item) => item.id === params.id);
  if (!listing) return {};
  return { title: `${listing.property_name} — property research`, description: `Recorded research for ${listing.property_name} in ${listing.city}: location context, original sources and complete workbook details. Confirm current availability with the property.`, alternates: { canonical: propertyPath(listing.id) } };
}

export default function PropertyPage({ params }: { params: { id: string } }) {
  const listing = WORKBOOK_RANKED_LISTINGS.find((item) => item.id === params.id);
  const full = WORKBOOK_FULL_LISTINGS.find((item) => item.id === params.id);
  if (!listing || !full) notFound();
  const labels = new Map(WORKBOOK_FIELDS.map((field) => [field.key, field.label]));
  const grouped = new Set(WORKBOOK_FIELD_GROUPS.flatMap((group) => group.keys));
  const extras = WORKBOOK_FIELDS.filter((field) => !grouped.has(field.key)).map((field) => field.key);
  const groups = [...WORKBOOK_FIELD_GROUPS, ...(extras.length ? [{ title: 'Additional workbook fields', keys: extras }] : [])];
  const nearby = WORKBOOK_RANKED_LISTINGS.filter((item) => item.city === listing.city && item.id !== listing.id).slice(0, 3);
  return <>
    <nav aria-label="Breadcrumb" className="mt-6 flex flex-wrap items-center gap-2 text-sm text-chocolate-700"><Link href="/properties" className="inline-flex min-h-11 items-center gap-2 underline"><ArrowLeft className="h-4 w-4" aria-hidden />Property research</Link><span aria-hidden>/</span><span>Workbook #{listing.rank}</span></nav>
    <header className="mt-3 rounded-3xl border border-gingerbread-300 bg-frosting-100 p-6 sm:p-10">
      <p className="eyebrow">{listing.city}, California · Workbook #{listing.rank}</p>
      <h1 className="mt-3 break-words font-display text-3xl font-extrabold tracking-tight text-chocolate-900 sm:text-5xl">{listing.property_name}</h1>
      {listing.address && <p className="mt-4 text-base text-chocolate-700">{listing.address}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">{[['Recorded rent', recordedRent(listing.rent_low, listing.rent_high)], ['Recorded layout', [listing.beds && `${listing.beds} beds`, listing.baths && `${listing.baths} baths`].filter(Boolean).join(' · ') || 'Not recorded'], ['Research source date', listing.source_date || 'Not recorded']].map(([label, value]) => <div key={label} className="min-w-0 rounded-2xl border border-gingerbread-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-chocolate-600">{label}</p><p className="mt-2 break-words text-lg font-bold text-chocolate-900">{value}</p></div>)}</div>
      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-chocolate-700">This is a historical research snapshot. Rent, availability, fees, rankings and screening notes are recorded research, not current offers or approval predictions. Confirm details directly before applying.</p>
    </header>
    <PropertyEvidence propertyId={listing.id} />
    <PlaceGallery placeId={listing.id} name={listing.property_name} targetKind="workbook" />
    <PropertyView {...workbookView(listing)} />
    <section className="mt-8 explore-card p-5 sm:p-6" aria-labelledby="property-next-steps">
      <p className="eyebrow">Turn a possibility into a plan</p><h2 id="property-next-steps" className="section-heading mt-2">Before you book a tour</h2>
      <ol className="mt-5 grid gap-4 text-sm leading-relaxed text-chocolate-700 md:grid-cols-3">{['Confirm the property name, address and official leasing contact using the original sources.', 'Ask for photos or a tour of the exact unit, its floor plan and the current move-in date.', 'Request written rent, required fees, deposit and screening criteria before paying an application fee.'].map((step) => <li key={step} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-lightning-700" aria-hidden />{step}</li>)}</ol>
      {listing.questions_to_ask_leasing && <div className="mt-5 rounded-xl bg-frosting-100 p-4"><h3 className="text-sm font-bold text-chocolate-900">Questions saved in the workbook</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-chocolate-700">{listing.questions_to_ask_leasing}</p></div>}
      <div className="mt-5 flex flex-wrap gap-3"><Link href="/life-budget" className="cinnamon-btn">Check your monthly budget</Link><Link href="/apartments/apply-engine" className="cinnamon-btn">Open Apply Engine</Link></div>
    </section>
    <section className="mt-8" aria-labelledby="full-property-research">
      <p className="eyebrow">The complete record</p><h2 id="full-property-research" className="section-heading mt-2">Original workbook research</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-chocolate-700">Every workbook field is retained below. Blank fields mean the workbook did not record a value. Fit, safety and screening scores are workbook assessments, not verified guarantees or current measurements.</p>
      <div className="mt-5 grid items-start gap-3 lg:grid-cols-2">{groups.map((group, index) => <details key={group.title} open={index < 2} className="min-w-0 rounded-2xl border border-gingerbread-300 bg-white"><summary className="cursor-pointer rounded-2xl px-5 py-4 font-bold text-chocolate-900">{group.title}</summary><dl className="space-y-3 border-t border-gingerbread-200 px-5 py-4">{group.keys.map((key) => { const value = full[key]; const text = value == null || value === '' ? 'Not recorded' : String(value); const url = typeof value === 'string' ? safeSourceUrl(value) : null; return <div key={String(key)} className="min-w-0"><dt className="text-xs font-bold text-chocolate-600">{labels.get(String(key)) || String(key).replace(/_/g, ' ')}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-chocolate-900">{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-semibold text-lightning-700 underline">Open recorded source<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden /></a> : text}</dd></div>; })}</dl></details>)}</div>
    </section>
    {nearby.length > 0 && <section className="mt-8" aria-labelledby="nearby-property-research"><h2 id="nearby-property-research" className="section-heading">More research in {listing.city}</h2><ul className="mt-4 grid gap-3 md:grid-cols-3">{nearby.map((item) => <li key={item.id}><Link href={propertyPath(item.id)} className="explore-card flex h-full items-center justify-between gap-3 p-5"><span><span className="block text-xs text-chocolate-600">Workbook #{item.rank}</span><span className="mt-1 block font-bold text-chocolate-900">{item.property_name}</span></span><ArrowUpRight className="h-5 w-5 shrink-0 text-lightning-700" aria-hidden /></Link></li>)}</ul></section>}
    <p className="mt-8 text-sm text-chocolate-700"><Link href={`/properties?city=${encodeURIComponent(listing.city || '')}`} className="inline-flex min-h-11 items-center gap-2 font-bold text-lightning-700 underline"><ArrowLeft className="h-4 w-4" aria-hidden />Browse all {listing.city} research</Link></p>
  </>;
}
