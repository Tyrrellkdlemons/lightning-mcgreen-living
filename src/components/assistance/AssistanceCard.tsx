import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { assistancePhoneHref } from '@/lib/data/assistance';
import type { AssistanceResource } from '@/types/assistance';

const TOPIC_TONE: Record<AssistanceResource['topic'], 'ok' | 'info' | 'warn' | 'mute'> = {
  rent_relief: 'ok',
  voucher: 'info',
  eviction_help: 'warn',
  tenant_rights: 'info',
  auto_loan_hardship: 'warn',
  auto_repair_assistance: 'info',
  utility_assistance: 'info',
  legal_aid: 'mute',
  general_housing: 'mute',
};

const TOPIC_LABEL: Record<AssistanceResource['topic'], string> = {
  rent_relief: 'Rent relief',
  voucher: 'Voucher',
  eviction_help: 'Eviction help',
  tenant_rights: 'Tenant rights',
  auto_loan_hardship: 'Auto hardship',
  auto_repair_assistance: 'Repair assistance',
  utility_assistance: 'Utility assistance',
  legal_aid: 'Legal aid',
  general_housing: 'Housing search',
};

export function AssistanceCard({ resource }: { resource: AssistanceResource }) {
  const phoneHref = assistancePhoneHref(resource.application_phone);
  return (
    <CandyCard id={resource.id} className="h-full scroll-mt-28 [overflow-wrap:anywhere]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Gumdrop tone={TOPIC_TONE[resource.topic]}>{TOPIC_LABEL[resource.topic]}</Gumdrop>
          <h3 className="mt-2 font-display text-base font-extrabold text-chocolate-900">
            {resource.program_name}
          </h3>
          <p className="text-xs text-chocolate-700">{resource.agency}</p>
        </div>
        {resource.application_status === 'closed' && (
          <Gumdrop tone="warn">Reported closed</Gumdrop>
        )}
      </div>

      <p className="mt-2 text-sm text-chocolate-800">{resource.eligibility_summary}</p>

      {resource.printable_docs?.length ? (
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-chocolate-700">Printable docs</p>
          <ul className="mt-1 space-y-1 text-sm">
            {resource.printable_docs.map((d) => (
              <li key={d.url}>
                · <a href={d.url} target="_blank" rel="noopener noreferrer" className="underline decoration-lightning-500 underline-offset-2">{d.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={resource.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bolt-btn text-sm"
        >
          {resource.application_status === 'closed' ? 'Check program status' : 'Open provider resource'}
        </a>
        {phoneHref && (
          <a href={phoneHref} className="cinnamon-btn text-sm">
            Call {resource.application_phone}
          </a>
        )}
      </div>

      {resource.notes && <p className="mt-3 text-xs text-chocolate-700">{resource.notes}</p>}
      <p className="mt-2 text-[11px] text-chocolate-600">
        Source date on record: {resource.last_verified_at.slice(0, 10)}
        {resource.languages?.length ? ` · Languages listed: ${resource.languages.join(', ')}` : ''}
      </p>
      <p className="mt-1 text-[11px] text-chocolate-600">Confirm current eligibility, availability and contact details with the provider.</p>
    </CandyCard>
  );
}
