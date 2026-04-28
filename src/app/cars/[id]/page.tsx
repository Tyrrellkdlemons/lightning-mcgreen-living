import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REAL_VEHICLES, REAL_DEALERS } from '@/lib/data/real-vehicles';
import { CarDetailClient } from '@/components/cars/CarDetail';

interface Props { params: { id: string } }

export function generateMetadata({ params }: Props): Metadata {
  const v = REAL_VEHICLES.find((x) => x.id === params.id);
  return { title: v ? `${v.year} ${v.make} ${v.model}` : 'Vehicle' };
}

export default function CarDetail({ params }: Props) {
  const vehicle = REAL_VEHICLES.find((x) => x.id === params.id);
  if (!vehicle) notFound();
  const dealer = REAL_DEALERS.find((d) => d.id === vehicle.dealer_id);
  return <CarDetailClient vehicle={vehicle} dealer={dealer} />;
}
