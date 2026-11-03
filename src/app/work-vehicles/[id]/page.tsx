import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REAL_WORK_VEHICLES } from '@/lib/data/real-work-vehicles';
import { WorkDetailClient } from '@/components/work/WorkDetail';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
  const params = await paramsPromise;

  const r = REAL_WORK_VEHICLES.find((x) => x.id === params.id);
  return { title: r?.provider_name ?? 'Work vehicle' };
}

export default async function WorkVehicleDetail({ params: paramsPromise }: Props) {
  const params = await paramsPromise;

  const rental = REAL_WORK_VEHICLES.find((x) => x.id === params.id);
  if (!rental) notFound();
  return <WorkDetailClient rental={rental} />;
}
