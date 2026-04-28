import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEMO_RENTALS } from '@/lib/data/demo-rentals';
import { RentalDetailClient } from '@/components/rentals/RentalDetail';

interface Props { params: { id: string } }

export function generateMetadata({ params }: Props): Metadata {
  const r = DEMO_RENTALS.find((x) => x.id === params.id);
  return { title: r?.property_name ?? 'Townhome' };
}

export default function TownhomeDetail({ params }: Props) {
  const rental = DEMO_RENTALS.find((x) => x.id === params.id);
  if (!rental || rental.unit_type === 'apartment') notFound();
  return <RentalDetailClient rental={rental} />;
}
