import type { Metadata } from 'next';
import Link from 'next/link';
import { PhotoManager } from '@/components/photos/PhotoManager';

export const metadata: Metadata = {
  title: 'Photo editor',
  robots: { index: false, follow: false },
};

export default function PhotoEditorPage() {
  return (
    <div className="mx-auto max-w-4xl py-8">
      <Link href="/admin" className="text-sm font-semibold text-lightning-800 underline">Back to admin</Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-lightning-800">Place photography</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold text-chocolate-900">Show the place. Tell its story.</h1>
      <p className="mt-4 max-w-2xl text-chocolate-700">
        Add your own photographs to California and Arizona city guides. Published photos are public.
        Use accurate captions and only images you own or have permission to share.
      </p>
      <PhotoManager />
    </div>
  );
}
