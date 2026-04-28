import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEMO_WORK_VEHICLES } from '@/lib/data/demo-work-vehicles';
import { WorkDetailClient } from '@/components/work/WorkDetail';

interface Props { params: { id: string } }

export function generateMetadata({ params }: Props): Metadata {
  const r = DEMO_WORK_VEHICLES.find((x) => x.id === params.id);
  return { title: r?.provider_name ?? 'Work vehicle' };
}

export default function WorkVehicleDetail({ params }: Props) {
  const rental = DEMO_WORK_VEHICLES.find((x) => x.id === params.id);
  if (!rental) notFound();
  return <WorkDetailClient rental={rental} />;
}
