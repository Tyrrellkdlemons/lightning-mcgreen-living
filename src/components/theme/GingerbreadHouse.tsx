import { cn } from '@/lib/utils/cn';

/**
 * A gingerbread apartment building. Original silhouette — no Disney/Pixar
 * "Cars" town buildings, no Zillow blue-house glyph.
 */
export function GingerbreadApartment({
  className,
  title = 'Gingerbread apartment building',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-12 w-auto text-gingerbread-500', className)}
    >
      <defs>
        <linearGradient id="ginger-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dca257" />
          <stop offset="100%" stopColor="#a86926" />
        </linearGradient>
      </defs>
      {/* roof frosting */}
      <path
        d="M8 30 L48 6 L88 30 L84 36 Q80 30 76 34 Q72 38 68 32 Q64 38 60 32 Q56 38 52 32 Q48 38 44 32 Q40 38 36 32 Q32 38 28 32 Q24 38 20 34 Q16 30 12 36 Z"
        fill="#fffaf0"
        stroke="#a86926"
        strokeWidth="1.8"
      />
      {/* body */}
      <rect x="14" y="34" width="68" height="56" rx="4" fill="url(#ginger-body)" stroke="#5e3914" strokeWidth="1.8" />
      {/* windows (3x2) — frosting frames */}
      {[0, 1, 2].map((c) =>
        [0, 1].map((r) => (
          <rect
            key={`${c}-${r}`}
            x={22 + c * 18}
            y={42 + r * 18}
            width="12"
            height="12"
            rx="2"
            fill="#fff3dc"
            stroke="#fffaf0"
            strokeWidth="2"
          />
        )),
      )}
      {/* door */}
      <rect x="42" y="68" width="12" height="22" rx="3" fill="#5e3914" stroke="#fffaf0" strokeWidth="1.5" />
      <circle cx="51" cy="80" r="1.2" fill="#34db00" />
    </svg>
  );
}

/** A gingerbread townhome row (2 stacked rectangles + chimney). */
export function GingerbreadTownhome({
  className,
  title = 'Gingerbread townhome',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-12 w-auto text-gingerbread-500', className)}
    >
      <defs>
        <linearGradient id="th-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dca257" />
          <stop offset="100%" stopColor="#a86926" />
        </linearGradient>
      </defs>
      {/* chimney */}
      <rect x="62" y="10" width="8" height="14" fill="#5e3914" />
      {/* upper roof frosting */}
      <path d="M10 28 L48 8 L86 28 L82 32 Q70 24 60 30 Q48 24 36 30 Q24 24 14 32 Z" fill="#fffaf0" stroke="#a86926" strokeWidth="1.8" />
      {/* upper level */}
      <rect x="14" y="30" width="68" height="26" fill="url(#th-body)" stroke="#5e3914" strokeWidth="1.8" />
      {/* lower level */}
      <rect x="10" y="56" width="76" height="32" rx="3" fill="url(#th-body)" stroke="#5e3914" strokeWidth="1.8" />
      {/* level divider */}
      <line x1="10" y1="56" x2="86" y2="56" stroke="#5e3914" strokeWidth="1.5" />
      {/* upper windows */}
      <rect x="22" y="36" width="12" height="14" rx="2" fill="#fff3dc" stroke="#fffaf0" strokeWidth="2" />
      <rect x="62" y="36" width="12" height="14" rx="2" fill="#fff3dc" stroke="#fffaf0" strokeWidth="2" />
      {/* lower garage */}
      <rect x="16" y="64" width="22" height="22" rx="2" fill="#3f260d" stroke="#fffaf0" strokeWidth="2" />
      {/* lower door */}
      <rect x="60" y="64" width="14" height="22" rx="2" fill="#5e3914" stroke="#fffaf0" strokeWidth="1.5" />
      <circle cx="70" cy="76" r="1.2" fill="#34db00" />
    </svg>
  );
}
