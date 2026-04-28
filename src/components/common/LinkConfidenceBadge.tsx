import { Gumdrop } from '@/components/ui/Gumdrop';
import {
  APARTMENT_LINK_LABEL,
  FINANCE_LINK_LABEL,
  RESERVATION_LINK_LABEL,
  LINK_TONE_BY_CONFIDENCE,
  type ApartmentLinkType,
  type FinanceLinkType,
  type ReservationLinkType,
  type AppLinkConfidence,
} from '@/types/links';

interface BaseProps {
  confidence: AppLinkConfidence;
  className?: string;
}

export function ApartmentLinkBadge({ kind, confidence }: BaseProps & { kind: ApartmentLinkType }) {
  return (
    <Gumdrop tone={LINK_TONE_BY_CONFIDENCE[confidence]} title={`Link confidence: ${confidence}`}>
      🔗 {APARTMENT_LINK_LABEL[kind]}
    </Gumdrop>
  );
}

export function FinanceLinkBadge({ kind, confidence }: BaseProps & { kind: FinanceLinkType }) {
  return (
    <Gumdrop tone={LINK_TONE_BY_CONFIDENCE[confidence]} title={`Link confidence: ${confidence}`}>
      💳 {FINANCE_LINK_LABEL[kind]}
    </Gumdrop>
  );
}

export function ReservationLinkBadge({ kind, confidence }: BaseProps & { kind: ReservationLinkType }) {
  return (
    <Gumdrop tone={LINK_TONE_BY_CONFIDENCE[confidence]} title={`Link confidence: ${confidence}`}>
      🛒 {RESERVATION_LINK_LABEL[kind]}
    </Gumdrop>
  );
}

export function VerifiedAtBadge({ iso }: { iso: string }) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  const stale = days > 30;
  return (
    <Gumdrop tone={stale ? 'warn' : 'mute'} title={`Last verified ${iso.slice(0, 10)}`}>
      ⏱ Verified {days < 1 ? 'today' : days === 1 ? 'yesterday' : `${days}d ago`}{stale ? ' · may be stale' : ''}
    </Gumdrop>
  );
}
