import type { Metadata } from 'next';
import Link from 'next/link';
import { LightningBolt } from '@/components/theme/LightningBolt';

export const metadata: Metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <div className="mt-12 text-center">
      <LightningBolt glow className="mx-auto h-12" />
      <h1 className="mt-3 font-display text-3xl font-extrabold text-chocolate-900">You&apos;re offline</h1>
      <p className="mt-2 text-sm text-chocolate-700">
        Your saved rentals, cars, and work vehicles are still here on this device.
      </p>
      <Link href="/saved" className="bolt-btn mt-6 inline-block">Open saved</Link>
    </div>
  );
}
