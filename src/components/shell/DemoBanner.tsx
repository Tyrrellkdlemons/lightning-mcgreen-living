import { config } from '@/lib/config';

export function DemoBanner() {
  if (config.dataMode !== 'demo') return null;
  return (
    <div
      role="status"
      className="bg-gradient-to-r from-peppermint-500 via-peppermint-600 to-peppermint-500 text-frosting-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-1.5 text-center text-xs font-semibold tracking-wide">
        DEMO MODE · sample data only · production refuses fake listings ·
        flip <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono">NEXT_PUBLIC_DATA_MODE=production</code> in <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono">.env.local</code>
      </div>
    </div>
  );
}
