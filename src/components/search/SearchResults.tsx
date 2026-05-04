'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { buildSearchIndex, searchIndex, KIND_LABEL, KIND_TONE, type SearchKind } from '@/lib/search';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { Pagination, paginate } from '@/components/common/Pagination';

const ALL_KINDS: SearchKind[] = ['rental-apartment', 'rental-townhouse', 'rental-workbook', 'vehicle', 'dealer', 'work-vehicle', 'assistance'];

export function SearchResults({ initialQuery, initialKind }: { initialQuery: string; initialKind?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [kind, setKind] = useState<SearchKind | 'all'>(
    (ALL_KINDS as string[]).includes(initialKind ?? '') ? (initialKind as SearchKind) : 'all',
  );
  const [page, setPage] = useState(1);

  const index = useMemo(() => buildSearchIndex(), []);
  const hits = useMemo(
    () => searchIndex(index, q, { limit: 200, kinds: kind === 'all' ? undefined : [kind] }),
    [index, q, kind],
  );
  const { items: paged, pageCount } = paginate(hits, page, 12);

  return (
    <>
      <header className="mt-6">
        <Gumdrop tone="info">Search</Gumdrop>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">
          Search Lightning McGreen Living
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          One search across rentals, cars, dealers, work vehicles, and assistance resources. Smart
          synonyms — try &ldquo;LA&rdquo;, &ldquo;OC townhomes&rdquo;, &ldquo;cargo van burbank&rdquo;, &ldquo;greystar&rdquo;, &ldquo;la rent relief&rdquo;.
        </p>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          autoFocus
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search…"
          className="min-w-[260px] flex-1 rounded-full border-2 border-gingerbread-300 bg-frosting-50 px-4 py-2 text-sm focus:border-lightning-500 focus:outline-none"
        />
        <select
          value={kind}
          onChange={(e) => { setKind(e.target.value as any); setPage(1); }}
          className="rounded-full border-2 border-gingerbread-300 bg-frosting-50 px-3 py-2 text-sm font-semibold"
        >
          <option value="all">All kinds</option>
          {ALL_KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
        </select>
        <span className="text-xs text-chocolate-700">
          <strong>{hits.length}</strong> result{hits.length === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {paged.map((h) => (
          <li key={h.entry.kind + h.entry.id}>
            <Link href={h.entry.href} className="block">
              <CandyCard interactive className="h-full">
                <div className="flex items-start gap-3">
                  {h.entry.thumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={h.entry.thumb} alt="" loading="lazy" className="h-16 w-20 shrink-0 rounded object-cover" />
                  ) : (
                    <span className="h-16 w-20 shrink-0 rounded bg-gingerbread-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <Gumdrop tone={KIND_TONE[h.entry.kind]}>{KIND_LABEL[h.entry.kind]}</Gumdrop>
                    <p className="mt-1 truncate font-bold text-chocolate-900">{h.entry.title}</p>
                    <p className="truncate text-xs text-chocolate-700">{h.entry.subtitle}</p>
                  </div>
                </div>
              </CandyCard>
            </Link>
          </li>
        ))}
      </ul>

      {hits.length === 0 && q && (
        <CandyCard className="mt-6 text-center text-sm text-chocolate-700">
          No matches. Try a city, operator (&ldquo;Greystar&rdquo;, &ldquo;Irvine&rdquo;), make/model (&ldquo;Tacoma&rdquo;), or
          a topic (&ldquo;rent relief&rdquo;, &ldquo;auto hardship&rdquo;).
        </CandyCard>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </>
  );
}
