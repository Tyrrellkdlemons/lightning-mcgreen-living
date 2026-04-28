'use client';

import { useState } from 'react';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import type { AdverseActionNotice } from '@/types/assistance';

/**
 * Adverse-action letter generator for renters who were denied / charged a
 * higher deposit / required to add a co-signer because of a consumer report
 * (e.g. Snappt, Yardi ScreeningWorks, RealPage).
 *
 * Per FTC guidance: applicant has the right to know which vendor produced the
 * report, to dispute inaccuracies, and to a free copy of the report within 60
 * days. We never store this — it lives in component state.
 */
export function AdverseActionPanel() {
  const [n, setN] = useState<AdverseActionNotice>({
    decision: 'denied',
    reason_short: '',
    decided_at: new Date().toISOString().slice(0, 10),
  });

  const letter = generateLetter(n);

  return (
    <CandyCard>
      <Gumdrop tone="warn">Adverse-action helper</Gumdrop>
      <h3 className="mt-2 font-display text-lg font-extrabold text-chocolate-900">
        Got denied (or asked for a higher deposit)?
      </h3>
      <p className="mt-1 text-sm text-chocolate-800">
        Under FCRA, when a consumer report (Snappt, Yardi ScreeningWorks, RealPage, etc.) drives a denial,
        higher deposit, co-signer requirement, or fee increase, the property must give you written notice
        with the vendor&apos;s contact info and your right to dispute. Use this to draft your dispute letter.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Field label="Decision">
          <select
            value={n.decision}
            onChange={(e) => setN({ ...n, decision: e.target.value as AdverseActionNotice['decision'] })}
            className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="denied">Denied</option>
            <option value="higher_deposit">Higher deposit required</option>
            <option value="co_signer_required">Co-signer required</option>
            <option value="fees_increased">Fees increased</option>
          </select>
        </Field>
        <Field label="Reason (short)">
          <input value={n.reason_short} onChange={(e) => setN({ ...n, reason_short: e.target.value })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
                 placeholder='e.g. "credit score below 620"' />
        </Field>
        <Field label="Screening vendor (if known)">
          <input value={n.consumer_report_vendor ?? ''} onChange={(e) => setN({ ...n, consumer_report_vendor: e.target.value })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm"
                 placeholder="Snappt / Yardi ScreeningWorks / RealPage" />
        </Field>
        <Field label="Vendor phone">
          <input value={n.consumer_report_phone ?? ''} onChange={(e) => setN({ ...n, consumer_report_phone: e.target.value })}
                 className="w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
        </Field>
      </div>

      <details className="mt-3 rounded-cookie border border-gingerbread-300/60 bg-frosting-100 p-3">
        <summary className="cursor-pointer text-sm font-bold text-chocolate-900">Preview dispute letter</summary>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-chocolate-800">{letter}</pre>
      </details>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => copy(letter)} className="bolt-btn text-sm">Copy letter</button>
        <a className="cinnamon-btn text-sm" target="_blank" rel="noopener noreferrer"
           href="https://www.ftc.gov/business-guidance/resources/using-consumer-reports-what-landlords-need-know">
          FTC guidance ↗
        </a>
      </div>
    </CandyCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-chocolate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function copy(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
}

function generateLetter(n: AdverseActionNotice) {
  return `Date: ${n.decided_at}

To whom it may concern at the property and the screening vendor,

I am writing about an adverse decision on my rental application:
  Decision: ${labelDecision(n.decision)}
  Stated reason: ${n.reason_short || '(reason not given)'}

Under the Fair Credit Reporting Act (FCRA), when a consumer report contributes
to an adverse action, the applicant is entitled to:
  1. The name, address, and phone of the consumer reporting vendor.
  2. A free copy of the report within 60 days.
  3. The right to dispute incomplete or inaccurate information.

Vendor on file (if known): ${n.consumer_report_vendor || '(not stated to applicant)'}
Vendor phone (if known):  ${n.consumer_report_phone || '(not stated to applicant)'}

Please provide:
  · The full screening report you used.
  · A written explanation of how my application failed to meet your criteria.
  · Confirmation that the same criteria are applied to all applicants.

If anything in the report is incorrect, I will dispute it directly with the vendor.

Sincerely,

________________________________________
(applicant signature)`;
}

function labelDecision(d: AdverseActionNotice['decision']) {
  return d === 'denied'
    ? 'application denied'
    : d === 'higher_deposit'
    ? 'higher security deposit required'
    : d === 'co_signer_required'
    ? 'co-signer required'
    : 'fees increased';
}
