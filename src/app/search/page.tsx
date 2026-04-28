import type { Metadata } from 'next';
import { SearchResults } from '@/components/search/SearchResults';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Lightning McGreen Living — rentals, cars, dealers, work vehicles, and assistance.',
};

interface Props {
  searchParams: { q?: string; kind?: string };
}

export default function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? '').trim();
  return <SearchResults initialQuery={q} initialKind={searchParams.kind} />;
}
