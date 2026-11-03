import type { Metadata } from 'next';
import Link from 'next/link';
import { PropertyDirectory } from '@/components/places/PropertyDirectory';

export const metadata: Metadata = {
  title: 'Property views & apartment research',
  description: 'Explore all 79 Southern California workbook properties with recorded research, map context, floor-plan links and original sources.',
  alternates: { canonical: '/properties' },
};

export default function PropertiesPage({ searchParams }: { searchParams: { q?: string | string[]; city?: string | string[]; tier?: string | string[] } }) {
  const first = (value?: string | string[]) => typeof value === 'string' ? value : value?.[0] || '';
  return <>
    <header className="mt-6 rounded-3xl border border-gingerbread-300 bg-frosting-100 p-6 sm:p-10">
      <p className="eyebrow">79 properties · Southern California workbook</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-chocolate-900 sm:text-6xl">See the place. Read the details.</h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-chocolate-700">Give each possibility a closer look: explore its recorded location, open the original photo and floor-plan sources, and keep the complete workbook research in view.</p>
      <p className="mt-5 max-w-3xl rounded-xl border border-gingerbread-200 bg-white p-4 text-sm leading-relaxed text-chocolate-700">Historical research sourced May 2, 2026. Recorded rent, availability, fit tiers and screening notes need confirmation with the property. This directory is a research collection, not a live vacancy feed.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/apartments/workbook" className="cinnamon-btn">Open the full workbook</Link><Link href="/apartments/apply-engine" className="cinnamon-btn">Plan an application</Link><Link href="/places" className="cinnamon-btn">California + Arizona guides</Link></div>
    </header>
    <PropertyDirectory initialQuery={first(searchParams.q)} initialCity={first(searchParams.city)} initialTier={first(searchParams.tier)} />
  </>;
}
