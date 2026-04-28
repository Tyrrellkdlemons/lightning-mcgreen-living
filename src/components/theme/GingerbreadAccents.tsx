/**
 * Gingerbread accents — frosting drip edge, candy-cane corner, animated
 * chimney smoke, gumdrop rain overlay, embossed cookie texture wrapper.
 * Pair with `<GingerbreadHero>` and gingerbread cards for x10 polish.
 */

import { cn } from '@/lib/utils/cn';

export function FrostingDripEdge({ className }: { className?: string }) {
  return <div role="separator" aria-hidden className={cn('frosting-drip h-3', className)} />;
}

export function CandyCaneCorner({ className }: { className?: string }) {
  return <span aria-hidden className={cn('candy-cane-corner', className)} />;
}

export function ChimneySmokeWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('chimney-smoke relative', className)}>
      {children}
    </div>
  );
}

export function GumdropRainOverlay({ className }: { className?: string }) {
  return <span aria-hidden className={cn('gumdrop-rain absolute inset-0', className)} />;
}

export function CookieEmbossWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('cookie-emboss', className)}>{children}</div>;
}
