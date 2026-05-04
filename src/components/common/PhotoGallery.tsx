'use client';

import { useEffect, useState } from 'react';
import type { PhotoSet } from '@/lib/data/photo-sets';

/**
 * Animated photo header — three free-license photos with a slow Ken Burns
 * scale + crossfade between them. GPU-friendly (transform + opacity only).
 *
 * Honors `prefers-reduced-motion` AND the user's manual "Reduce motion"
 * toggle (via the `.reduce-motion` class on `<html>` set in
 * `ReduceMotionToggle`). When motion is off, we render only the first photo
 * with no animation.
 */

interface Props {
  photos: PhotoSet;
  rounded?: boolean;
  height?: number;
  /** ms between crossfades (default 5000) */
  interval?: number;
}

export function PhotoGallery({ photos, rounded = true, height = 200, interval = 5000 }: Props) {
  const [idx, setIdx] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const userReduced =
      typeof window !== 'undefined' &&
      (document.documentElement.classList.contains('reduce-motion') ||
        localStorage.getItem('lmgl:reduce-motion') === '1');
    const off = prefersReduced || userReduced;
    setReduce(off);

    const onChange = () => {
      const u = localStorage.getItem('lmgl:reduce-motion') === '1';
      setReduce(prefersReduced || u);
    };
    window.addEventListener('lmgl:reduce-motion-change', onChange);
    return () => window.removeEventListener('lmgl:reduce-motion-change', onChange);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % photos.urls.length), interval);
    return () => window.clearInterval(t);
  }, [reduce, photos.urls.length, interval]);

  return (
    <div
      className={'relative w-full overflow-hidden bg-gingerbread-100 ' + (rounded ? 'rounded-cookie' : '')}
      style={{ height }}
    >
      {photos.urls.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={photos.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{
            opacity: reduce ? (i === 0 ? 1 : 0) : i === idx ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out, transform 8s ease-in-out',
            transform: reduce ? 'scale(1)' : i === idx ? 'scale(1.06)' : 'scale(1)',
          }}
        />
      ))}
      {/* Soft gradient bottom for legibility if we overlay a label later */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: 'linear-gradient(to top, rgba(26,13,5,0.35), transparent)' }}
      />
      <span className="pointer-events-none absolute bottom-1.5 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
        visual · {photos.credit_label}
      </span>
    </div>
  );
}
