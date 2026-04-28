import Link from 'next/link';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

/**
 * Three-state auto hardship card. Per the research, there is no single CA
 * program that broadly defers payments. We surface three real paths instead
 * of a generic link:
 *
 *   1. Lender talk     — CFPB script (forbearance, due-date change, plan)
 *   2. Repo rescue scam — FTC warning + DFPI complaint route
 *   3. Vehicle problem  — CA BAR Consumer Assistance Program (repair / retire)
 */
export function AutoHardshipCard() {
  return (
    <CandyCard>
      <Gumdrop tone="warn">Auto loan hardship</Gumdrop>
      <h3 className="mt-2 font-display text-lg font-extrabold text-chocolate-900">
        Can&apos;t make this car payment? Three real paths.
      </h3>

      <ol className="mt-3 space-y-3 text-sm text-chocolate-800">
        <li>
          <p className="font-bold text-chocolate-900">1. Talk to your lender first — fast.</p>
          <p>
            CFPB&apos;s consistent guidance: contact the lender or servicer immediately, ask about a payment
            plan, due-date change, or forbearance, and get any agreement in writing.
          </p>
          <p className="mt-1">
            <a className="underline decoration-lightning-500 underline-offset-2" target="_blank" rel="noopener noreferrer"
               href="https://www.consumerfinance.gov/ask-cfpb/i-cant-make-my-auto-loan-payment-what-should-i-do-en-845/">
              CFPB · what to do step-by-step ↗
            </a>
          </p>
        </li>

        <li>
          <p className="font-bold text-chocolate-900">2. Already at repossession risk? Watch for scams.</p>
          <p>
            FTC warns against any third party promising to stop repossession or lower payments for a fee.
            Use your lender, the FTC, and California DFPI for complaints.
          </p>
          <p className="mt-1 space-x-2">
            <a className="underline decoration-lightning-500 underline-offset-2" target="_blank" rel="noopener noreferrer"
               href="https://consumer.ftc.gov/articles/car-loans">FTC · car loans ↗</a>
            <a className="underline decoration-lightning-500 underline-offset-2" target="_blank" rel="noopener noreferrer"
               href="https://dfpi.ca.gov/file-a-complaint/">CA DFPI · file a complaint ↗</a>
          </p>
        </li>

        <li>
          <p className="font-bold text-chocolate-900">3. The car itself is the problem? CA helps with that too.</p>
          <p>
            The California Bureau of Automotive Repair runs a Consumer Assistance Program that can help
            qualifying owners with repair or vehicle retirement.
          </p>
          <p className="mt-1">
            <a className="underline decoration-lightning-500 underline-offset-2" target="_blank" rel="noopener noreferrer"
               href="https://www.bar.ca.gov/services/consumer-assistance-program">
              CA BAR · Consumer Assistance Program ↗
            </a>
          </p>
        </li>
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/templates#auto-hardship" className="bolt-btn text-sm">Open hardship letter template</Link>
        <Link href="/assistance#federal" className="cinnamon-btn text-sm">All hardship resources</Link>
      </div>

      <p className="mt-3 text-[11px] text-chocolate-600">
        Lightning McGreen Living is not a lender, debt-relief company, or law firm. We surface the official
        paths and never charge to "stop repossession."
      </p>
    </CandyCard>
  );
}
