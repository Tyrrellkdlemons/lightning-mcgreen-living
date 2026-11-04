import { Info } from 'lucide-react';
import { verificationDateLabel, verificationLabel, type AssistanceResource } from '@/lib/assistance-directory/model';

export function AssistanceStatus({ resource }: { resource: AssistanceResource }) {
  const checked = resource.verification_status === 'verified';
  return <div className="space-y-2 text-xs leading-relaxed">
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 font-bold ${checked ? 'border-lightning-200 bg-lightning-50 text-lightning-900' : 'border-gingerbread-300 bg-frosting-100 text-chocolate-800'}`}>
      <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{verificationLabel(resource)}
    </span>
    <p className="text-chocolate-700">{verificationDateLabel(resource)}</p>
    {resource.verification_status === 'closed' && <p className="font-semibold text-chocolate-800">Do not rely on this listing for currently available help.</p>}
  </div>;
}
