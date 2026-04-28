'use client';

import { useState } from 'react';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

/**
 * External-redirect screen — required by the L spec before sending users off
 * to any official application / finance / reservation page.
 *
 * Renders an inline modal-style card with the EXACT spec wording and a
 * clear "Open the official page" link. The user must click through; we
 * never auto-redirect.
 */
export function RedirectScreen({
  open,
  onClose,
  href,
  destinationLabel,
  packetSummary,
}: {
  open: boolean;
  onClose: () => void;
  href: string | null;
  destinationLabel: string;
  packetSummary: { label: string; value: string }[];
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-label="Leaving Lightning McGreen Living"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <CandyCard className="w-full max-w-xl">
        <Gumdrop tone="warn">Leaving Lightning McGreen Living</Gumdrop>
        <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">
          Heading to: {destinationLabel}
        </h2>
        <p className="mt-2 text-sm text-chocolate-800">
          You are leaving Lightning McGreen Living and opening the official
          application, finance, or reservation page. We prepared your
          information below so you can copy, paste, and complete the
          official process faster. Final approval, pricing, and availability
          are controlled by the official property, dealer, lender, or rental
          provider.
        </p>

        {packetSummary.length > 0 && (
          <div className="mt-3 rounded-cookie border border-gingerbread-300/60 bg-frosting-100 p-3 text-xs">
            <p className="font-bold uppercase tracking-wider text-chocolate-700">Your packet (copy/paste-ready)</p>
            <dl className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {packetSummary.map((row) => (
                <div key={row.label} className="flex justify-between gap-2">
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
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="bolt-btn text-sm"
            >
              Open the official page →
            </a>
          ) : (
            <span className="text-xs text-peppermint-600">No verified link — call the property/dealer/provider.</span>
          )}
        </div>

        <p className="mt-3 text-[11px] text-chocolate-600">
          We never auto-submit anything. You always click the official page yourself.
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
