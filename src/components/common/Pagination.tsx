'use client';

import { cn } from '@/lib/utils/cn';

/**
 * Pagination control: ‹ 1 2 3 … 7 ›
 *
 * Uses simple windowing so even 100 pages stay readable.
 */
export function Pagination({
  page,
  pageCount,
  onChange,
  className,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
  className?: string;
}) {
  if (pageCount <= 1) return null;
  const pages = visiblePages(page, pageCount);

  return (
    <nav aria-label="Pagination" className={cn('mt-6 flex items-center justify-center gap-1.5', className)}>
      <NavBtn
        label="Previous page"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        ‹
      </NavBtn>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-chocolate-700">
            …
          </span>
        ) : (
          <PageBtn key={p} active={p === page} onClick={() => onChange(p)}>
            {p}
          </PageBtn>
        ),
      )}
      <NavBtn
        label="Next page"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
      >
        ›
      </NavBtn>
      <span className="ml-3 text-xs text-chocolate-700">
        page <strong className="num">{page}</strong> of <strong className="num">{pageCount}</strong>
      </span>
    </nav>
  );
}

function visiblePages(page: number, pageCount: number): (number | '…')[] {
  const out: (number | '…')[] = [];
  const window = 1; // pages around current
  for (let p = 1; p <= pageCount; p++) {
    if (
      p === 1 ||
      p === pageCount ||
      (p >= page - window && p <= page + window)
    ) {
      out.push(p);
    } else if (out[out.length - 1] !== '…') {
      out.push('…');
    }
  }
  return out;
}

function PageBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'min-w-[2.25rem] rounded-full px-2 py-1 text-sm font-bold',
        active
          ? 'bg-lightning-500 text-chocolate-900 shadow-sm'
          : 'border border-gingerbread-300 bg-frosting-100 text-chocolate-800 hover:bg-frosting-200',
      )}
    >
      {children}
    </button>
  );
}

function NavBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-gingerbread-300 bg-frosting-100 px-3 py-1 text-sm font-bold text-chocolate-800 hover:bg-frosting-200 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

/** Tiny helper hook used by listing screens. */
export function paginate<T>(items: T[], page: number, perPage: number) {
  const safe = Math.max(1, page);
  const start = (safe - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    pageCount: Math.max(1, Math.ceil(items.length / perPage)),
  };
}
