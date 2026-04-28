import Link from 'next/link';
import { LightningBolt } from '@/components/theme/LightningBolt';

export default function NotFound() {
  return (
    <div className="mt-16 text-center">
      <LightningBolt glow className="mx-auto h-12" />
      <h1 className="mt-3 font-display text-4xl font-extrabold text-chocolate-900">404</h1>
      <p className="mt-2 text-sm text-chocolate-700">That gingerbread street isn&apos;t on the map.</p>
      <Link href="/" className="bolt-btn mt-6 inline-block">Back home</Link>
    </div>
  );
}
