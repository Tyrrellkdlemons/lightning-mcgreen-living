'use client';

import { useMemo, useState } from 'react';

const DEFAULT = `Request for Auto Loan Hardship Assistance

Borrower name:
Lender / servicer:
Account number:
Vehicle VIN:
Date:

I am contacting you because I am experiencing financial hardship and need a temporary payment solution to avoid delinquency or repossession.

I am requesting information about:
[ ] Payment extension / deferral
[ ] Due-date change
[ ] Temporary forbearance
[ ] Reduced-payment plan
[ ] Reinstatement amount if already past due
[ ] Written explanation of credit-reporting impact

Reason for hardship:
________________________________________

My current income / hardship status:
________________________________________

Documents I can provide:
[ ] Recent pay stubs
[ ] Benefits letter
[ ] Bank statements
[ ] Disaster / emergency documentation
[ ] Other: _____________________________

Please confirm any offer or agreement in writing.

Signature:
____________`;

export function AutoHardshipTemplate() {
  const [text, setText] = useState(DEFAULT);
  const blob = useMemo(() => `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`, [text]);

  return (
    <div className="mt-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={20}
        className="w-full rounded-cookie border-2 border-gingerbread-300 bg-frosting-50 p-3 font-mono text-xs"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => copy(text)} className="bolt-btn text-sm">Copy to clipboard</button>
        <a href={blob} download="auto-hardship-request.txt" className="cinnamon-btn text-sm">Download .txt</a>
        <button type="button" onClick={() => print()} className="cinnamon-btn text-sm">Print</button>
      </div>
    </div>
  );
}

function copy(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
}
function print() {
  if (typeof window !== 'undefined') window.print();
}
