import type { Metadata } from 'next';
import { SearchResults } from '@/components/search/SearchResults';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Lightning McGreen Living — rentals, cars, dealers, work vehicles, and assistance.',
};

interface Props {
  searchParams: { q?: string | string[]; kind?: string | string[] };
}

export default function SearchPage({ searchParams }: Props) {
  const scalar = (value: string | string[] | undefined) => typeof value === 'string' ? value : value?.[0];
  const q = (scalar(searchParams.q) ?? '').trim();
  return <SearchResults initialQuery={q} initialKind={scalar(searchParams.kind)} />;
}
