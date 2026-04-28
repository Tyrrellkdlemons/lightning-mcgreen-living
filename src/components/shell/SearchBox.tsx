'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildSearchIndex, searchIndex, KIND_LABEL, KIND_TONE, type SearchHit } from '@/lib/search';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { cn } from '@/lib/utils/cn';

/**
 * Global search box — appears in TopNav.
 *
 * - Type to filter against a 70+ entry cross-entity index
 * - Smart synonyms ("LA" → Los Angeles, "apt" → apartment, "van" → cargo-van, ...)
 * - Keyboard: ⌘K / Ctrl+K to focus, ↑↓ to move, Enter to open, Esc to close
 * - Clicking "See all results" navigates to /search?q=...
 */
export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const index = useMemo(() => buildSearchIndex(), []);
  const hits: SearchHit[] = useMemo(() => searchIndex(index, q, { limit: 8 }), [index, q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQ('');
    router.push(href);
  }

  return (
    <div ref={wrapRef} className={cn('relative w-full max-w-lg', className)}>
      <div className="flex items-center gap-2 rounded-full border-2 border-gingerbread-300 bg-frosting-50 px-3 py-1.5 focus-within:border-lightning-500">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-chocolate-700">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(hits.length, a + 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
            else if (e.key === 'Enter') {
              e.preventDefault();
              const h = hits[active];
              if (h) go(h.entry.href);
              else if (q.trim()) go(`/search?q=${encodeURIComponent(q)}`);
            } else if (e.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Search rentals, cars, dealers, work vans, help…"
          aria-label="Site search"
          className="w-full bg-transparent text-sm placeholder:text-chocolate-700/70 focus:outline-none"
        />
        <kbd className="hidden rounded border border-gingerbread-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-chocolate-700 sm:inline">
          ⌘K
        </kbd>
      </div>

      {open && (q.length > 0 ? hits.length > 0 : true) && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-cookie border-2 border-gingerbread-300 bg-frosting-50 shadow-cookie">
          {q.length === 0 && (
            <div className="px-3 py-2 text-xs text-chocolate-700">
              Try: <kbd className="rounded bg-frosting-200 px-1.5 py-0.5">greystar</kbd>{' '}
              <kbd className="rounded bg-frosting-200 px-1.5 py-0.5">irvine townhomes</kbd>{' '}
              <kbd className="rounded bg-frosting-200 px-1.5 py-0.5">cargo van burbank</kbd>{' '}
              <kbd className="rounded bg-frosting-200 px-1.5 py-0.5">la rent relief</kbd>
            </div>
          )}
          {hits.map((h, i) => (
            <Link
              key={h.entry.kind + h.entry.id}
              href={h.entry.href}
              onClick={() => { setOpen(false); setQ(''); }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 hover:bg-frosting-200',
                active === i && 'bg-frosting-200',
              )}
            >
              {h.entry.thumb ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={h.entry.thumb} alt="" loading="lazy" className="h-10 w-14 shrink-0 rounded object-cover" />
              ) : (
                <span className="h-10 w-14 shrink-0 rounded bg-gingerbread-100" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Gumdrop tone={KIND_TONE[h.entry.kind]}>{KIND_LABEL[h.entry.kind]}</Gumdrop>
                  <p className="truncate text-sm font-bold text-chocolate-900">{h.entry.title}</p>
                </div>
                <p className="truncate text-xs text-chocolate-700">{h.entry.subtitle}</p>
              </div>
            </Link>
          ))}
          {q && (
            <button
              type="button"
              onClick={() => go(`/search?q=${encodeURIComponent(q)}`)}
              className="block w-full border-t border-gingerbread-300/60 px-3 py-2 text-left text-xs font-bold text-lightning-700 hover:bg-frosting-200"
            >
              See all results for &ldquo;{q}&rdquo; →
            </button>
          )}
          {q && hits.length === 0 && (
            <p className="px-3 py-3 text-sm text-chocolate-700">No matches. Try a city, operator, or vehicle make.</p>
          )}
        </div>
      )}
    </div>
  );
}
