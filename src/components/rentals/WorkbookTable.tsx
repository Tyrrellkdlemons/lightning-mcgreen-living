'use client';

/**
 * WorkbookTable — designed inline rendering of the spreadsheet (NOT a basic
 * table dump). Sortable columns, search, city + fit-tier filters, sticky
 * header, mobile-friendly two-line cells, themed in green-lightning +
 * gingerbread, with one-tap apply / map links per row.
 */
import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  Filter,
  MapPinned,
  Search,
} from 'lucide-react';
import {
  WORKBOOK_FULL_LISTINGS,
  WORKBOOK_CITIES,
  WORKBOOK_FIT_TIERS,
  pickPrimaryLink,
  isYes,
  isUnknown,
  type WorkbookFullListing,
} from '@/lib/data/workbook-listings-full';

type SortKey =
  | 'rank'
  | 'match'
  | 'rent_low'
  | 'rent_high'
  | 'safety_score'
  | 'screening_difficulty';
type SortDir = 'asc' | 'desc';

const COLS: { key: SortKey | 'name' | 'amenities' | 'links'; label: string; sortable?: boolean; align?: 'left' | 'right' }[] = [
  { key: 'rank', label: '#', sortable: true, align: 'right' },
  { key: 'match', label: 'Match', sortable: true, align: 'right' },
  { key: 'name', label: 'Property' },
  { key: 'rent_low', label: 'Rent low', sortable: true, align: 'right' },
  { key: 'rent_high', label: 'Rent high', sortable: true, align: 'right' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'safety_score', label: 'Safety', sortable: true, align: 'right' },
  { key: 'screening_difficulty', label: 'Screen', sortable: true, align: 'right' },
  { key: 'links', label: 'Apply / Map', align: 'left' },
];

function tierTone(tier?: string) {
  switch (String(tier || '').toLowerCase()) {
    case 'strong':
      return 'bg-lightning-100 text-lightning-800 ring-lightning-300';
    case 'good':
      return 'bg-frosting-100 text-gingerbread-700 ring-gingerbread-300';
    case 'fair':
      return 'bg-caramel-400/20 text-caramel-600 ring-caramel-400';
    default:
      return 'bg-frosting-50 text-chocolate-700 ring-gingerbread-200';
  }
}

function AmenityDot({ label, value }: { label: string; value: unknown }) {
  const tone = isYes(value)
    ? 'bg-lightning-500'
    : isUnknown(value)
    ? 'bg-caramel-400'
    : 'bg-gingerbread-300';
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-chocolate-700"
      title={`${label}: ${String(value ?? '—')}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone}`} aria-hidden /> {label}
    </span>
  );
}

export interface WorkbookTableProps {
  /** Hide the search/filter strip (used inside small embeds). */
  compact?: boolean;
  /** Callback when a rank is selected — used by the apply engine. */
  onSelect?: (rank: number) => void;
  /** Override default page size. */
  initialLimit?: number;
}

export function WorkbookTable({ compact, onSelect, initialLimit = 25 }: WorkbookTableProps) {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('all');
  const [tier, setTier] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [limit, setLimit] = useState(initialLimit);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = WORKBOOK_FULL_LISTINGS.filter((x) => {
      if (city !== 'all' && x.city !== city) return false;
      if (tier !== 'all' && (x.fit_tier || '').toLowerCase() !== tier.toLowerCase()) return false;
      if (!needle) return true;
      const blob = [
        x.property_name,
        x.address,
        x.city,
        x.county,
        x.neighborhood,
        x.screening_vendor,
        x.best_feature,
        x.extra_amenities,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(needle);
    });
    r = [...r].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const an = typeof av === 'number' ? av : Number(av) || 0;
      const bn = typeof bv === 'number' ? bv : Number(bv) || 0;
      const cmp = an - bn;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return r;
  }, [q, city, tier, sortKey, sortDir]);

  const visible = rows.slice(0, limit);

  const headerSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(k);
      setSortDir(k === 'rank' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="rounded-2xl bg-frosting-50 p-3 ring-1 ring-gingerbread-200 sm:p-4">
      {!compact && (
        <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <label className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-gingerbread-500" aria-hidden />
            <input
              type="search"
              placeholder="Search property, address, neighborhood, vendor…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-full border border-gingerbread-200 bg-white py-2 pl-9 pr-3 text-sm text-chocolate-900 outline-none ring-lightning-300 focus:ring-2"
              aria-label="Search workbook listings"
            />
          </label>
          <label className="flex items-center gap-1 rounded-full border border-gingerbread-200 bg-white px-3 py-2 text-sm text-chocolate-800">
            <Filter className="h-4 w-4 text-gingerbread-500" aria-hidden /> City
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border-none bg-transparent text-sm focus:outline-none"
              aria-label="Filter by city"
            >
              <option value="all">All</option>
              {WORKBOOK_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1 rounded-full border border-gingerbread-200 bg-white px-3 py-2 text-sm text-chocolate-800">
            <Filter className="h-4 w-4 text-gingerbread-500" aria-hidden /> Tier
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="border-none bg-transparent text-sm focus:outline-none"
              aria-label="Filter by fit tier"
            >
              <option value="all">All</option>
              {WORKBOOK_FIT_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl ring-1 ring-gingerbread-200">
        <table className="w-full min-w-[860px] table-fixed border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gingerbread-100 text-[11px] uppercase tracking-wide text-chocolate-800">
            <tr>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`border-b border-gingerbread-200 px-3 py-2 ${
                    c.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => headerSort(c.key as SortKey)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-chocolate-900 hover:underline"
                    >
                      {c.label}
                      {sortKey === c.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="h-3 w-3" aria-hidden />
                        ) : (
                          <ArrowDown className="h-3 w-3" aria-hidden />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden />
                      )}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white text-chocolate-900">
            {visible.map((x: WorkbookFullListing, idx) => {
              const url = pickPrimaryLink(x);
              const stripeBg = idx % 2 === 0 ? 'bg-white' : 'bg-frosting-50';
              return (
                <tr key={x.id} className={`${stripeBg} align-top`}>
                  <td className="border-b border-gingerbread-100 px-3 py-2 text-right font-semibold">
                    <button
                      type="button"
                      onClick={() => onSelect?.(x.rank)}
                      className="text-chocolate-900 underline decoration-lightning-400 underline-offset-2 hover:text-lightning-700"
                    >
                      {x.rank}
                    </button>
                  </td>
                  <td className="border-b border-gingerbread-100 px-3 py-2 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${tierTone(
                        x.fit_tier,
                      )}`}
                    >
                      {typeof x.match === 'number' ? `${Math.round(x.match)}%` : '—'}
                    </span>
                  </td>
                  <td className="border-b border-gingerbread-100 px-3 py-2">
                    <div className="font-semibold text-chocolate-900">{x.property_name}</div>
                    <div className="text-[11px] text-chocolate-700">
                      {[x.city, x.county].filter(Boolean).join(' · ') || x.address}
                    </div>
                    {x.neighborhood && (
                      <div className="text-[10px] uppercase tracking-wide text-gingerbread-600">
                        {x.neighborhood}
                      </div>
                    )}
                  </td>
                  <td className="border-b border-gingerbread-100 px-3 py-2 text-right">
                    {typeof x.rent_low === 'number' ? `$${x.rent_low.toLocaleString()}` : '—'}
                  </td>
                  <td className="border-b border-gingerbread-100 px-3 py-2 text-right">
                    {typeof x.rent_high === 'number' ? `$${x.rent_high.toLocaleString()}` : '—'}
                  </td>
                  <td className="border-b border-gingerbread-100 px-3 py-2">
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      <AmenityDot label="W/D" value={x.washer_dryer} />
                      <AmenityDot label="AC" value={x.central_ac} />
                      <AmenityDot label="Pool" value={x.pool} />
                      <AmenityDot label="Spa" value={x.jacuzzi_spa} />
                    </div>
                  </td>
                  <td className="border-b border-gingerbread-100 px-3 py-2 text-right">
                    {typeof x.safety_score === 'number' ? x.safety_score.toFixed(1) : '—'}
                  </td>
                  <td className="border-b border-gingerbread-100 px-3 py-2 text-right">
                    {typeof x.screening_difficulty === 'number'
                      ? x.screening_difficulty.toFixed(0)
                      : '—'}
                  </td>
                  <td className="border-b border-gingerbread-100 px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-lightning-500 px-2.5 py-1 text-[11px] font-semibold text-chocolate-900 hover:bg-lightning-400"
                        >
                          Apply <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <a
                        href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
                          x.address || `${x.property_name}, ${x.city || ''}`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-frosting-100 px-2.5 py-1 text-[11px] text-chocolate-800 ring-1 ring-gingerbread-200 hover:bg-frosting-200"
                      >
                        <MapPinned className="h-3 w-3" /> Map
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="px-3 py-6 text-center text-sm text-chocolate-700">
                  No workbook entries match those filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-chocolate-700">
        <span>
          Showing {visible.length} of {rows.length} (workbook total {WORKBOOK_FULL_LISTINGS.length})
        </span>
        {visible.length < rows.length && (
          <button
            type="button"
            onClick={() => setLimit((n) => n + 25)}
            className="rounded-full bg-lightning-500 px-3 py-1 font-semibold text-chocolate-900 hover:bg-lightning-400"
          >
            Show more
          </button>
        )}
      </div>
    </div>
  );
}
