import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

/**
 * Surfaced inline on rental detail pages. California source-of-income
 * protection means properties cannot reject applicants for using a Housing
 * Choice Voucher / Section 8 / VASH / similar lawful income source.
 */
export function SourceOfIncomeNotice() {
  return (
    <CandyCard>
      <Gumdrop tone="info">Your rights</Gumdrop>
      <h3 className="mt-2 font-display text-lg font-extrabold text-chocolate-900">
        Source-of-income protection (California)
      </h3>
      <p className="mt-1 text-sm text-chocolate-800">
        California prohibits "no Section 8" / "no voucher" rejections.
        If a property turns you away because you use a Housing Choice Voucher,
        VASH, or similar lawful source of income, that may be unlawful.
      </p>
      <ul className="mt-2 space-y-1 text-xs text-chocolate-700">
        <li>· The property must consider your voucher when calculating income.</li>
        <li>· You can ask for the rejection in writing.</li>
        <li>
          ·{' '}
          <a className="underline decoration-lightning-500 underline-offset-2" target="_blank" rel="noopener noreferrer"
             href="https://calcivilrights.ca.gov/wp-content/uploads/sites/32/2020/02/SourceofIncomeFAQ_ENG.pdf">
            CRD source-of-income FAQ (PDF) ↗
          </a>
        </li>
        <li>
          ·{' '}
          <a className="underline decoration-lightning-500 underline-offset-2" target="_blank" rel="noopener noreferrer"
             href="https://calcivilrights.ca.gov/complaintprocess/">
            File a complaint with CRD ↗
          </a>
        </li>
      </ul>
    </CandyCard>
  );
}
