'use client';

import { useState } from 'react';

const ITEMS = [
  'Photo ID (driver\'s license / state ID / passport)',
  'Lease or rental ledger (current address)',
  'Notice to pay or quit (if any)',
  'Proof of income / benefits (pay stubs, award letter, SSA, GA, CalWORKs)',
  'Recent bank statements (1–3 months)',
  'Household roster (everyone on the lease + ages)',
  'Utility notices (gas / electric / water shutoff if any)',
  'Vehicle registration (if requesting work-vehicle / rideshare context)',
  'Vehicle insurance',
  'Auto loan / lease statement (most recent)',
  'Case numbers from any active county portals',
  'Hardship documentation (layoff / hours-cut letter / medical notice)',
];

export function CountyPacketChecklist() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const allChecked = ITEMS.every((_, i) => checked[i]);

  return (
    <div className="mt-3">
      <ul className="space-y-2 text-sm text-chocolate-800">
        {ITEMS.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <input
              id={`pkt-${i}`}
              type="checkbox"
              checked={!!checked[i]}
              onChange={(e) => setChecked({ ...checked, [i]: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-lightning-500"
            />
            <label htmlFor={`pkt-${i}`} className="cursor-pointer">{item}</label>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-chocolate-700">
        {allChecked ? '✅ Packet ready — bring this to the program intake.' : `${Object.values(checked).filter(Boolean).length} of ${ITEMS.length} items checked.`}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => copy(text())} className="bolt-btn text-sm">Copy as plain text</button>
        <button type="button" onClick={() => print()} className="cinnamon-btn text-sm">Print</button>
      </div>
    </div>
  );
}

function text() {
  return [
    'COUNTY ASSISTANCE PACKET CHECKLIST',
    '',
    ...ITEMS.map((i) => `[ ] ${i}`),
  ].join('\n');
}
function copy(t: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(t).catch(() => {});
}
function print() {
  if (typeof window !== 'undefined') window.print();
}
