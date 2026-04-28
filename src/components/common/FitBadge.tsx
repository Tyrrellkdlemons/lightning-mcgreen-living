import { Gumdrop } from '@/components/ui/Gumdrop';
import { FIT_LABEL, FIT_TONE } from '@/lib/scoring';
import type { FitResult } from '@/types';

export function FitBadge({ fit }: { fit: FitResult }) {
  return (
    <Gumdrop tone={FIT_TONE[fit.tier]} title={`Fit score ${fit.score}/100`}>
      ⚡ {FIT_LABEL[fit.tier]} · <span className="fit-score">{fit.score}</span>
    </Gumdrop>
  );
}

export function FitExplain({ fit }: { fit: FitResult }) {
  return (
    <div className="rounded-cookie border border-gingerbread-300/40 bg-frosting-100 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-chocolate-700">
        Why this may fit
      </p>
      <ul className="mt-1 space-y-1 text-sm text-chocolate-800">
        {fit.reasons.length === 0 ? <li>—</li> : fit.reasons.map((r, i) => <li key={i}>· {r}</li>)}
      </ul>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-chocolate-700">
        What could hurt approval
      </p>
      <ul className="mt-1 space-y-1 text-sm text-chocolate-800">
        {fit.concerns.length === 0 ? <li>—</li> : fit.concerns.map((r, i) => <li key={i}>· {r}</li>)}
      </ul>
    </div>
  );
}
