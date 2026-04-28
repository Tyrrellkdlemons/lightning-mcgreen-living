/**
 * Original racing accents. NO Disney/Pixar Cars / NASCAR assets — see
 * docs/UI_THEME_GUIDE.md §11 for the do-not list. Numbered race pad uses
 * "MG" + caller-provided suffix, never "95".
 */

import { cn } from '@/lib/utils/cn';

export function TireTreadDivider({ className }: { className?: string }) {
  return <div role="separator" aria-hidden className={cn('tire-tread', className)} />;
}

export function PitLaneLeds({ className, count = 5 }: { className?: string; count?: number }) {
  return (
    <div aria-hidden className={cn('pit-lane-leds', className)}>
      {Array.from({ length: count }).map((_, i) => <span key={i} />)}
    </div>
  );
}

/** Original numbered race pad. Default identifier is "MG-7". */
export function RacePad({
  number = 'MG-7',
  className,
  title = 'Original race pad badge',
}: {
  number?: string;
  className?: string;
  title?: string;
}) {
  return (
    <div role="img" aria-label={title} className={cn('race-pad', className)}>
      {number}
    </div>
  );
}

/** Sliding marquee for race-day hero. Loops `items` twice for seamless scroll. */
export function SpeedTicker({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div aria-hidden className={cn('speed-ticker', className)}>
      <div>
        {doubled.map((s, i) => <span key={i}>{s}</span>)}
      </div>
    </div>
  );
}
