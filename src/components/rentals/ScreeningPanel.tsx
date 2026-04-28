import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { inferScreeningStack, STRICTNESS_LABEL, STRICTNESS_TONE, type Strictness } from '@/lib/data/screening-stacks';
import type { ApplicationPlatform } from '@/types';

/**
 * Screening transparency — surfaced prominently because the vendor stack
 * directly affects whether the property might "redline" your application
 * (over-tighten thresholds on income docs, criminal history, eviction,
 * credit) before a human reviews you.
 */

const FLAG: Record<Strictness, { emoji: string; label: string; warn: string }> = {
  soft: {
    emoji: '🟢',
    label: 'GREEN flag — light check',
    warn: 'Usually approves on credit + ID. Most applicants pass on the first look.',
  },
  standard: {
    emoji: '🟡',
    label: 'YELLOW flag — standard',
    warn: 'Credit + criminal + eviction + income docs. Missing or inconsistent paperwork can stall the file.',
  },
  strict: {
    emoji: '🟠',
    label: 'ORANGE flag — strict',
    warn: 'Multi-vendor stack with income-document fraud detection (often Snappt). Edited / inconsistent pay stubs WILL redline you. Bring originals from your employer or a Plaid bank link.',
  },
  premium: {
    emoji: '🔴',
    label: 'RED flag — multi-vendor premium',
    warn: 'Bank-linked income verification + identity scoring. Very little tolerance for mismatched data, gaps in employment, or shaky rental history. Prepare every doc in advance.',
  },
};

/** Compact one-line badge for the rental card. */
export function ScreeningBadge({
  platform,
  manager,
  publiclyDisclosed,
}: {
  platform: ApplicationPlatform;
  manager: string;
  publiclyDisclosed?: string | null;
}) {
  const stack = inferScreeningStack(platform, manager, publiclyDisclosed);
  const f = FLAG[stack.strictness];
  const vendor = stack.vendors[0]?.name ?? 'screening tbd';
  return (
    <Gumdrop
      tone={STRICTNESS_TONE[stack.strictness]}
      title={`Inferred screening: ${stack.vendors.map((v) => v.name).join(' + ') || 'unknown'}`}
    >
      {f.emoji} {STRICTNESS_LABEL[stack.strictness]} · {vendor}
      {stack.vendors.length > 1 ? ` +${stack.vendors.length - 1}` : ''}
    </Gumdrop>
  );
}

/** Full panel for the rental detail page — now treated as IMPORTANT, with redline warning. */
export function ScreeningPanel({
  platform,
  manager,
  publiclyDisclosed,
}: {
  platform: ApplicationPlatform;
  manager: string;
  publiclyDisclosed?: string | null;
}) {
  const stack = inferScreeningStack(platform, manager, publiclyDisclosed);
  const f = FLAG[stack.strictness];

  return (
    <CandyCard className="border-2 border-peppermint-500/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-3xl">{f.emoji}</span>
          <div>
            <Gumdrop tone={STRICTNESS_TONE[stack.strictness]}>{f.label}</Gumdrop>
            <h2 className="mt-1 font-display text-xl font-extrabold text-chocolate-900">
              How this property screens applicants
            </h2>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-peppermint-500/10 p-3 text-sm text-chocolate-900">
        <strong>Why this matters:</strong> {f.warn}
      </div>

      {stack.vendors.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-wider text-chocolate-700">
            Likely screening vendors (click to learn how each one works)
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {stack.vendors.map((v) => (
              <li key={v.name}>
                ·{' '}
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline decoration-peppermint-500 underline-offset-2"
                >
                  {v.name}
                </a>{' '}
                — <span className="text-chocolate-700">{v.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-chocolate-700">
            Steps you should expect
          </p>
          <ol className="mt-1 list-decimal pl-5 text-sm text-chocolate-800">
            {stack.steps_likely.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-chocolate-700">
            Documents likely checked
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm text-chocolate-800">
            {stack.documents_likely_checked.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-frosting-100 p-2 text-[11px] text-chocolate-700">
        <strong className="text-chocolate-900">Note on inference:</strong> {stack.notes}
        {' '}If you were denied, you have FCRA rights — see the Adverse-Action Helper below to
        request the report and dispute inaccuracies.
      </div>
    </CandyCard>
  );
}
