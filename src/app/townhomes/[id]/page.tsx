import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REAL_RENTALS } from '@/lib/data/real-rentals';
import { RentalDetailClient } from '@/components/rentals/RentalDetail';

interface Props { params: { id: string } }

export function generateMetadata({ params }: Props): Metadata {
  const r = REAL_RENTALS.find((x) => x.id === params.id);
  return { title: r?.property_name ?? 'Townhome' };
}

export default function TownhomeDetail({ params }: Props) {
  const rental = REAL_RENTALS.find((x) => x.id === params.id);
  if (!rental || rental.unit_type === 'apartment') notFound();
  return <RentalDetailClient rental={rental} />;
}
