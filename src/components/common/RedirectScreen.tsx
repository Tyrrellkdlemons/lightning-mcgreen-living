'use client';

import { useEffect, useRef, useState } from 'react';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

/**
 * External destination preview. A source or search page is not necessarily
 * an application. Users choose whether to open it; packets are never sent.
 */
export function RedirectScreen({
  open,
  onClose,
  href,
  fallbackHref,
  destinationLabel,
  actionLabel = 'Open external page',
  isSearch = false,
  packetSummary,
}: {
  open: boolean;
  onClose: () => void;
  href: string | null;
  fallbackHref?: string | null;
  destinationLabel: string;
  actionLabel?: string;
  isSearch?: boolean;
  packetSummary: { label: string; value: string }[];
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [open]);
  if (!open) return null;
  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); onClose(); }
        if (event.key !== 'Tab') return;
        const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
        const first = items[0]; const last = items[items.length - 1];
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === event.currentTarget)) { event.preventDefault(); first.focus(); }
      }}
      aria-label="Leaving Lightning McGreen Living"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <CandyCard className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto overscroll-contain [overflow-wrap:anywhere]">
        <Gumdrop tone="warn">Leaving Lightning McGreen Living</Gumdrop>
        <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">
          Heading to: {destinationLabel}
        </h2>
        <p className="mt-2 text-sm text-chocolate-800">
          {isSearch ? 'This opens a search page, not a verified application. Review the results and confirm the property or provider.' : 'This opens the linked external page. Confirm the property or provider and the purpose of that page before continuing.'}
          {' '}Your packet stays here unless you choose to copy and share it. Confirm the destination
          before entering personal information, paying fees or uploading documents. The provider
          controls its current prices, availability and application decisions.
        </p>

        {packetSummary.length > 0 && (
          <div className="mt-3 rounded-cookie border border-gingerbread-300/60 bg-frosting-100 p-3 text-xs">
            <p className="font-bold uppercase tracking-wider text-chocolate-700">Your packet (copy/paste-ready)</p>
            <dl className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {packetSummary.map((row) => (
                <div key={row.label} className="flex min-w-0 flex-wrap justify-between gap-2">
                  <dt className="text-chocolate-700">{row.label}</dt>
                  <dd className="font-semibold text-chocolate-900">{row.value || '—'}</dd>
                </div>
              ))}
            </dl>
            <CopyButton
              text={packetSummary.map((r) => `${r.label}: ${r.value}`).join('\n')}
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={onClose} className="cinnamon-btn text-sm">
            Stay here
          </button>
          <div className="flex flex-wrap items-center gap-2">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="bolt-btn text-sm"
                title={isSearch ? 'Open search results; no automatic property redirect' : 'Open the linked external page'}
              >
                {actionLabel} →
              </a>
            ) : (
              <span className="text-xs text-peppermint-600">No verified link — call the property/dealer/provider.</span>
            )}
            {fallbackHref && (
              <a
                href={fallbackHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="cinnamon-btn text-sm"
                title="Open the separately supplied search or provider fallback"
              >
                Open fallback source
              </a>
            )}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-chocolate-600">
          We never auto-submit your information. You choose whether to open an external page.
        </p>
      </CandyCard>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  function copy() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }).catch(() => {});
    }
  }
  return (
    <button type="button" onClick={copy} className="mt-2 rounded-full border border-gingerbread-300 bg-white px-2 py-0.5 text-[11px] font-bold">
      {done ? '✓ Copied' : '📋 Copy packet'}
    </button>
  );
}
