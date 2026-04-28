'use client';

import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * GPU-friendly raining objects — bolts, keys, tiny apartments / townhomes,
 * race flags, steering wheels, cookie cars, candy coins.
 *
 * Uses CSS transforms only (no layout-affecting properties). Pauses entirely
 * when `prefers-reduced-motion` is set or the user toggles "Reduce motion".
 *
 * Mounted high in the layout; never blocks pointer events.
 */

type ObjectKind =
  | 'bolt'
  | 'key'
  | 'apartment'
  | 'townhome'
  | 'flag'
  | 'wheel'
  | 'car'
  | 'coin';

const OBJECT_GLYPHS: Record<ObjectKind, JSX.Element> = {
  bolt: (
    <path d="M14 2 L4 16 L10 16 L8 30 L20 12 L14 12 L18 2 Z" fill="#34db00" stroke="#0c3a02" strokeWidth="1" />
  ),
  key: (
    <g>
      <circle cx="8" cy="16" r="5" fill="#dca257" stroke="#5e3914" strokeWidth="1" />
      <rect x="11" y="14" width="14" height="4" fill="#dca257" stroke="#5e3914" strokeWidth="1" />
      <rect x="22" y="18" width="3" height="4" fill="#dca257" stroke="#5e3914" strokeWidth="1" />
    </g>
  ),
  apartment: (
    <g>
      <rect x="6" y="6" width="20" height="22" fill="#a86926" stroke="#5e3914" strokeWidth="1" />
      <rect x="9" y="10" width="4" height="4" fill="#fff3dc" />
      <rect x="19" y="10" width="4" height="4" fill="#fff3dc" />
      <rect x="9" y="18" width="4" height="4" fill="#fff3dc" />
      <rect x="14" y="20" width="4" height="8" fill="#5e3914" />
    </g>
  ),
  townhome: (
    <g>
      <rect x="4" y="14" width="24" height="14" fill="#dca257" stroke="#5e3914" strokeWidth="1" />
      <rect x="4" y="6" width="24" height="8" fill="#a86926" stroke="#5e3914" strokeWidth="1" />
      <rect x="14" y="20" width="6" height="8" fill="#5e3914" />
    </g>
  ),
  flag: (
    <g>
      <rect x="4" y="4" width="2" height="26" fill="#1a0d05" />
      <path d="M6 4 H24 V18 H6 Z" fill="#fff" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) =>
          (r + c) % 2 === 0 ? (
            <rect key={`${r}-${c}`} x={6 + c * 4.5} y={4 + r * 4.5} width="4.5" height="4.5" fill="#1a0d05" />
          ) : null,
        ),
      )}
    </g>
  ),
  wheel: (
    <g>
      <circle cx="16" cy="16" r="11" fill="#1a0d05" stroke="#fffaf0" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3" fill="#fffaf0" />
      <line x1="16" y1="5" x2="16" y2="27" stroke="#fffaf0" strokeWidth="1.4" />
      <line x1="5" y1="16" x2="27" y2="16" stroke="#fffaf0" strokeWidth="1.4" />
    </g>
  ),
  car: (
    <g>
      <rect x="3" y="14" width="26" height="10" rx="3" fill="#34db00" stroke="#0c3a02" strokeWidth="1" />
      <rect x="9" y="10" width="14" height="6" rx="2" fill="#dff3ff" stroke="#0c3a02" strokeWidth="1" />
      <circle cx="9" cy="25" r="3" fill="#1a0d05" />
      <circle cx="23" cy="25" r="3" fill="#1a0d05" />
    </g>
  ),
  coin: (
    <g>
      <circle cx="16" cy="16" r="11" fill="#fff3dc" stroke="#a86926" strokeWidth="1.5" />
      <text x="16" y="20" textAnchor="middle" fontFamily="ui-sans-serif" fontWeight="800" fontSize="12" fill="#a86926">$</text>
    </g>
  ),
};

interface RainObject {
  kind: ObjectKind;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

function generateObjects(count: number): RainObject[] {
  const kinds: ObjectKind[] = [
    'bolt', 'bolt', 'bolt',         // bolts most frequent
    'key', 'apartment', 'townhome',
    'flag', 'wheel', 'car', 'coin',
  ];
  const out: RainObject[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      kind: kinds[Math.floor((i * 9301 + 49297) % kinds.length) % kinds.length],
      left: ((i * 137) % 100),
      delay: ((i * 53) % 60) / 5,
      duration: 16 + ((i * 17) % 14), // 16–30s — slow + soft
      size: 18 + ((i * 31) % 14),     // 18–32 px
      drift: ((i * 71) % 40) - 20,    // -20 to +20 px horizontal drift
    });
  }
  return out;
}

export function RainingObjects({
  count = 18,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Honor OS-level reduce-motion + persisted user preference.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const userReduced = localStorage.getItem('lmgl:reduce-motion') === '1';
    setEnabled(!prefersReduced && !userReduced);

    const onUpdate = () => {
      const u = localStorage.getItem('lmgl:reduce-motion') === '1';
      setEnabled(!prefersReduced && !u);
    };
    window.addEventListener('lmgl:reduce-motion-change', onUpdate);
    return () => window.removeEventListener('lmgl:reduce-motion-change', onUpdate);
  }, []);

  const objs = useMemo(() => generateObjects(count), [count]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-0 z-0 overflow-hidden',
        className,
      )}
    >
      {objs.map((o, i) => (
        <svg
          key={i}
          viewBox="0 0 32 32"
          width={o.size}
          height={o.size}
          style={{
            position: 'absolute',
            left: `${o.left}%`,
            top: '-10vh',
            opacity: 0.55,
            animationName: 'rain-fall',
            animationDuration: `${o.duration}s`,
            animationDelay: `${o.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            transform: `translateX(${o.drift}px)`,
            willChange: 'transform, opacity',
          }}
        >
          {OBJECT_GLYPHS[o.kind]}
        </svg>
      ))}
    </div>
  );
}
