'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Full-screen rotating background. Reads /backgrounds/manifest.json (built
 * from `_insertimages/` by `scripts/sync-insert-images.mjs`) and crossfades
 * through every image every 30 seconds. No page refresh — pure client-side
 * rotation via setInterval.
 *
 * Behavior:
 *   - Empty manifest → renders nothing
 *   - Single image → renders that image, no rotation
 *   - Multiple images → crossfade every 30s (configurable via manifest)
 *   - Honors `prefers-reduced-motion` AND the manual "Reduce motion" toggle
 *     (pauses on the first image, no Ken Burns)
 *   - Sits at z-index 0 with a soft scrim overlay so foreground UI stays
 *     legible
 */

interface BgImage { src: string; name: string }
interface BgManifest {
  generated_at: string;
  count: number;
  images: BgImage[];
  rotate_seconds: number;
}

export function RotatingBackground() {
  const [manifest, setManifest] = useState<BgManifest | null>(null);
  const [active, setActive] = useState(0);
  const [reduce, setReduce] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Load manifest once
  useEffect(() => {
    let alive = true;
    fetch('/backgrounds/manifest.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: BgManifest | null) => { if (alive && j) setManifest(j); })
      .catch(() => { /* swallow — component just renders nothing */ });
    return () => { alive = false; };
  }, []);

  // Reduce-motion sync
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const userReduced =
      typeof window !== 'undefined' &&
      (document.documentElement.classList.contains('reduce-motion') ||
        localStorage.getItem('lmgl:reduce-motion') === '1');
    setReduce(prefersReduced || userReduced);

    const onChange = () => {
      const u = localStorage.getItem('lmgl:reduce-motion') === '1';
      setReduce(prefersReduced || u);
    };
    window.addEventListener('lmgl:reduce-motion-change', onChange);
    return () => window.removeEventListener('lmgl:reduce-motion-change', onChange);
  }, []);

  // Rotation timer
  useEffect(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!manifest || manifest.images.length < 2 || reduce) return;
    const sec = Math.max(5, manifest.rotate_seconds || 30);
    timerRef.current = window.setInterval(
      () => setActive((i) => (i + 1) % manifest.images.length),
      sec * 1000,
    );
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [manifest, reduce]);

  if (!manifest || manifest.images.length === 0) return null;

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      {manifest.images.map((img, i) => (
        <div
          key={img.src}
          style={{
            backgroundImage: `url(${img.src})`,
            opacity: i === active ? 1 : 0,
            transform: reduce ? 'scale(1)' : i === active ? 'scale(1.04)' : 'scale(1)',
            transition: 'opacity 1.6s ease-in-out, transform 32s ease-in-out',
          }}
          className="absolute inset-0 bg-center bg-cover will-change-transform"
        />
      ))}
      {/* Cream scrim — keeps gingerbread/cars foreground legible over photo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,250,240,0.78) 0%, rgba(255,243,220,0.68) 50%, rgba(255,250,240,0.82) 100%)',
        }}
      />
    </div>
  );
}
