import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { inferScreeningStack, STRICTNESS_LABEL, STRICTNESS_TONE, type Strictness } from '@/lib/data/screening-stacks';
import type { ApplicationPlatform } from '@/types';

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
  const vendor = stack.vendors[0]?.name ?? 'screening tbd';
  return (
    <Gumdrop
      tone={STRICTNESS_TONE[stack.strictness]}
      title={`Inferred screening: ${stack.vendors.map((v) => v.name).join(' + ') || 'unknown'}`}
    >
      🛡 {STRICTNESS_LABEL[stack.strictness]} · {vendor}
      {stack.vendors.length > 1 ? ` +${stack.vendors.length - 1}` : ''}
    </Gumdrop>
  );
}

/** Full panel for the rental detail page. */
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
  const StrictnessExplain: Record<Strictness, string> = {
    soft: 'Light touch — usually credit + ID. Easier to qualify, faster decision.',
    standard: 'Common stack — credit, criminal, eviction, income docs.',
    strict: 'Multi-vendor — credit, criminal, eviction PLUS income-document fraud detection.',
    premium: 'Most rigorous — bank-linked income verification + identity scoring.',
  };

  return (
    <CandyCard>
      <div className="flex items-start justify-between gap-2">
        <div>
          <Gumdrop tone={STRICTNESS_TONE[stack.strictness]}>
            🛡 {STRICTNESS_LABEL[stack.strictness]}
          </Gumdrop>
          <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">
            How this property screens applicants
          </h2>
          <p className="mt-1 text-sm text-chocolate-700">
            {StrictnessExplain[stack.strictness]}
          </p>
        </div>
      </div>

      {stack.vendors.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-wider text-chocolate-700">
            Likely screening vendors
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {stack.vendors.map((v) => (
              <li key={v.name}>
                ·{' '}
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline decoration-lightning-500 underline-offset-2"
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

      <p className="mt-3 text-[11px] text-chocolate-600">
        {stack.notes} The vendor map is inferred from the application platform and
        manager — call the property if anything here matters to your decision.
      </p>
    </CandyCard>
  );
}
