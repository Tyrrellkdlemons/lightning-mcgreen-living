import { Info } from 'lucide-react';
import { ASSISTANCE_DISCLAIMER } from '@/lib/assistance-directory/model';
export function AssistanceNotice({ compact = false }: { compact?: boolean }) {
  return <aside aria-label="Directory information disclaimer" className={`flex min-w-0 gap-3 rounded-2xl border border-gingerbread-300 bg-frosting-100 ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
    <Info className="mt-0.5 h-5 w-5 shrink-0 text-chocolate-700" aria-hidden="true" />
    <p className="min-w-0 text-sm leading-relaxed text-chocolate-700">{ASSISTANCE_DISCLAIMER}</p>
  </aside>;
}
