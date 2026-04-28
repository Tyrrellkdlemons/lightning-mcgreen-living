import type { SourceMeta } from '@/types';
import { Gumdrop } from '@/components/ui/Gumdrop';

const TONE_FOR_FRESH: Record<SourceMeta['data_freshness_status'], 'ok' | 'info' | 'warn' | 'mute'> = {
  live: 'ok',
  recent: 'info',
  stale: 'warn',
  'manual-review-needed': 'warn',
};

function relative(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 1) return 'today';
  if (days < 2) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.floor(months / 12)} yr ago`;
}

export function SourcePanel({ meta, dense = false }: { meta: SourceMeta; dense?: boolean }) {
  return (
    <div className={dense ? 'flex flex-wrap items-center gap-2 text-xs' : 'rounded-cookie border border-gingerbread-300/50 bg-frosting-100 p-3 text-xs text-chocolate-700'}>
      <div className="flex flex-wrap items-center gap-2">
        <Gumdrop tone={TONE_FOR_FRESH[meta.data_freshness_status]}>
          {meta.data_freshness_status.replace('-', ' ')}
        </Gumdrop>
        <Gumdrop tone="mute">{meta.trust_label.replace('-', ' ')}</Gumdrop>
        <Gumdrop tone="info">conf {meta.confidence_score}</Gumdrop>
      </div>
      {!dense && (
        <p className="mt-2">
          <span className="font-semibold">Source:</span>{' '}
          <a href={meta.source_url} target="_blank" rel="noopener noreferrer" className="underline decoration-lightning-500 underline-offset-2 break-all">
            {meta.source}
          </a>{' '}
          · verified {relative(meta.last_verified_at)} · seen {relative(meta.last_seen_at)}
        </p>
      )}
    </div>
  );
}
