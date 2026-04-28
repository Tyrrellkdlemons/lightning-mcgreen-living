import { cn } from '@/lib/utils/cn';

/**
 * Original green-lightning bolt SVG.
 *
 * Hand-built path; deliberately not a copy of any branded logo.
 * Use `glow` for the homepage hero / primary CTAs.
 */
export function LightningBolt({
  className,
  glow = false,
  title = 'Green lightning bolt',
}: {
  className?: string;
  glow?: boolean;
  title?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 64 96"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'h-8 w-auto text-lightning-500',
        glow && 'drop-shadow-[0_0_14px_rgba(52,219,0,0.65)] animate-bolt-pulse',
        className,
      )}
    >
      <defs>
        <linearGradient id="lmgl-bolt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#75ff45" />
          <stop offset="55%" stopColor="#34db00" />
          <stop offset="100%" stopColor="#1a7d04" />
        </linearGradient>
      </defs>
      <path
        d="M38 2 L8 50 L26 50 L18 94 L58 38 L38 38 L46 2 Z"
        fill="url(#lmgl-bolt)"
        stroke="#0c3a02"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M40 8 L18 46 L28 46 L24 78"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
