import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEMO_VEHICLES, DEMO_DEALERS } from '@/lib/data/demo-vehicles';
import { CarDetailClient } from '@/components/cars/CarDetail';

interface Props { params: { id: string } }

export function generateMetadata({ params }: Props): Metadata {
  const v = DEMO_VEHICLES.find((x) => x.id === params.id);
  return { title: v ? `${v.year} ${v.make} ${v.model}` : 'Vehicle' };
}

export default function CarDetail({ params }: Props) {
  const vehicle = DEMO_VEHICLES.find((x) => x.id === params.id);
  if (!vehicle) notFound();
  const dealer = DEMO_DEALERS.find((d) => d.id === vehicle.dealer_id);
  return <CarDetailClient vehicle={vehicle} dealer={dealer} />;
}
