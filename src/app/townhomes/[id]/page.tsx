import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REAL_RENTALS } from '@/lib/data/real-rentals';
import { PropertyEvidence } from '@/components/properties/PropertyEvidence';
import { RentalDetailClient } from '@/components/rentals/RentalDetail';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
  const params = await paramsPromise;

  const r = REAL_RENTALS.find((x) => x.id === params.id);
  return { title: r?.property_name ?? 'Townhome' };
}

export default async function TownhomeDetail({ params: paramsPromise }: Props) {
  const params = await paramsPromise;

  const rental = REAL_RENTALS.find((x) => x.id === params.id);
  if (!rental || rental.unit_type !== 'townhouse') notFound();
  return <RentalDetailClient rental={rental} propertyEvidence={<PropertyEvidence propertyId={rental.id} />} />;
}
