'use client';

export type SortKey =
  | 'best-fit'
  | 'price-asc'
  | 'price-desc'
  | 'newest';

const LABELS: Record<SortKey, string> = {
  'best-fit': 'Best fit',
  'price-asc': 'Lowest price',
  'price-desc': 'Highest price',
  newest: 'Newest data',
};

export function SortDropdown({
  value,
  onChange,
  className,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
  className?: string;
}) {
  return (
    <label className={'flex items-center gap-2 text-sm font-semibold text-chocolate-800 ' + (className ?? '')}>
      <span className="text-xs uppercase tracking-wider text-chocolate-700">Sort:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="rounded-md border border-gingerbread-300 bg-white px-2 py-1 text-sm"
      >
        {(Object.keys(LABELS) as SortKey[]).map((k) => (
          <option key={k} value={k}>{LABELS[k]}</option>
        ))}
      </select>
    </label>
  );
}
