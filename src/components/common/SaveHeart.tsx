'use client';

import { useSavedStore, type CompareKind } from '@/lib/store/compare';
import { cn } from '@/lib/utils/cn';

/**
 * Heart icon that toggles a card's saved state. Persists in localStorage
 * via `useSavedStore`. Visible on every listing card.
 */
export function SaveHeart({
  kind,
  id,
  className,
}: {
  kind: CompareKind;
  id: string;
  className?: string;
}) {
  const saved = useSavedStore((s) => s.has(kind, id));
  const toggle = useSavedStore((s) => s.toggle);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(kind, id);
      }}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border transition-transform hover:scale-110',
        saved
          ? 'border-peppermint-600 bg-peppermint-500 text-white shadow-sm'
          : 'border-gingerbread-300 bg-white/90 text-chocolate-700 hover:bg-frosting-100',
        className,
      )}
      title={saved ? 'Saved — click to remove' : 'Save for later'}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        <path
          d="M12 21s-7-4.35-9.5-9.5C.86 7.85 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 4 23.14 7.85 21.5 11.5 19 16.65 12 21 12 21z"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
