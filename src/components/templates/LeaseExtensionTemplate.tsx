'use client';

import { useMemo, useState } from 'react';

const DEFAULT = `Request for Temporary Lease Extension or Payment Plan

Resident name:
Property:
Unit:
Property manager / company:
Date:

I am requesting a temporary lease extension and/or payment arrangement due to a documented financial hardship.

Requested help:
[ ] Extend my current lease through: __________
[ ] Allow a temporary month-to-month extension through: __________
[ ] Approve a payment plan for past-due rent
[ ] Waive or delay late fees if permitted
[ ] Confirm whether your property accepts or coordinates with local rent-relief or voucher programs

My proposed payment plan:
Amount I can pay now: __________
Amount I can pay each pay period / month: __________
Date I expect to return to regular payments: __________

Documents attached:
[ ] Photo ID
[ ] Proof of income / benefits
[ ] Recent bank statement
[ ] Notice of hardship / reduction in hours
[ ] County assistance application or case number
[ ] Any other supporting documents

Please respond in writing by:
____________

Signature:
____________`;

export function LeaseExtensionTemplate() {
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
        <a href={blob} download="lease-extension-request.txt" className="cinnamon-btn text-sm">Download .txt</a>
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
