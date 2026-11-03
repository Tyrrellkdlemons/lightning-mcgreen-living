'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { photoUrl, type PlacePhoto, type PhotoTargetKind } from '@/lib/photos/types';

function Photo({ photo }: { photo: PlacePhoto }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="overflow-hidden rounded-2xl border border-gingerbread-200 bg-white">
      {failed ? (
        <div className="flex aspect-[4/3] items-center justify-center bg-frosting-100 p-6 text-sm text-chocolate-700">
          This photo is temporarily unavailable.
        </div>
      ) : (
        <Image
          loader={({ src, width }) => photoUrl(src, width)}
          src={photo.url}
          width={800}
          height={600}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={photo.alt}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      <figcaption className="space-y-2 p-4 text-sm text-chocolate-700">
        {photo.caption && <p>{photo.caption}</p>}
        <p className="text-xs">
          Photo: {photo.credit}
          {photo.sourceUrl && <>  /  <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Source</a></>}
        </p>
      </figcaption>
    </figure>
  );
}

export function PlaceGallery(props: {
  placeId: string; name: string; targetKind?: PhotoTargetKind; contextOnly?: boolean;
}) { return <GalleryContent key={props.placeId} {...props}/>; }
function GalleryContent({ placeId, name, targetKind = 'city', contextOnly = targetKind === 'city' }: {
  placeId: string; name: string; targetKind?: PhotoTargetKind; contextOnly?: boolean;
}) {
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [responseStatus, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [page, setPage] = useState(0);

  const requestKey = `${placeId}:${page}:${retry}`;
  const [resolvedKey,setResolvedKey] = useState<string|null>(null);
  const status = resolvedKey === requestKey ? responseStatus : 'loading';

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let active = true;
    fetch('/api/place-photos/gallery?placeId=' + encodeURIComponent(placeId) + '&page=' + page, {
      signal: controller.signal, cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('unavailable');
        const data = await response.json();
        if (!Array.isArray(data.photos)) throw new Error('invalid');
        if (active) {
          setResolvedKey(requestKey);
          setPhotos(data.photos);
          setTruncated(Boolean(data.truncated));
          setStatus('ready');
        }
      })
      .catch(() => { if (active) { setResolvedKey(requestKey); setStatus('error'); } })
      .finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [placeId, retry, page, requestKey]);

  return (
    <section aria-labelledby={'photos-' + placeId} className="my-10">
      <div className="mb-5 flex items-start gap-3">
        <Camera className="mt-1 h-6 w-6 shrink-0 text-lightning-800" aria-hidden="true" />
        <div>
          <h2 id={'photos-' + placeId} className="font-display text-2xl font-extrabold text-chocolate-900">Editor photo collection: {name}</h2>
          <p className="mt-1 text-sm text-chocolate-700">{contextOnly ? 'Area photographs published by the site editor. These do not represent a specific property or available rental unit.' : 'Photographs published by the site editor for this property record. Check captions and source credits; images do not establish current condition or unit availability.'}</p>
        </div>
      </div>
      <div aria-live="polite" aria-busy={status === 'loading'}>
        {status === 'loading' && <p className="rounded-2xl bg-frosting-100 p-6 text-sm text-chocolate-700">Loading photographs...</p>}
        {status === 'error' && (
          <div className="rounded-2xl border border-gingerbread-200 bg-frosting-50 p-6">
            <p className="text-sm text-chocolate-700">We couldn&apos;t load this photo collection. The page&apos;s source and resource links are still available.</p>
            <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-lightning-800 underline">
              <RefreshCw size={16} aria-hidden="true" /> Try photos again
            </button>
          </div>
        )}
        {status === 'ready' && photos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gingerbread-300 bg-frosting-50 p-6">
            <p className="font-semibold text-chocolate-900">The {name} photo collection is just getting started.</p>
            <p className="mt-2 text-sm text-chocolate-700">No photographs have been published to this collection yet. Explore the linked sources for more information.</p>
          </div>
        )}
        {status === 'ready' && photos.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo) => <Photo key={photo.id} photo={photo} />)}</div>
        )}
        {status === 'ready' && (page > 0 || truncated) && <nav aria-label="Photo gallery pages" className="mt-4 flex items-center gap-4"><button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)} className="cinnamon-btn min-h-11 disabled:opacity-50">Previous photos</button><span className="text-sm">Page {page + 1}</span><button type="button" disabled={!truncated || page >= 999} onClick={() => setPage(value => value + 1)} className="cinnamon-btn min-h-11 disabled:opacity-50">More photos</button></nav>}
      </div>
    </section>
  );
}
