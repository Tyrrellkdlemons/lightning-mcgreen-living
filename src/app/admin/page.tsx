import type { Metadata } from 'next';
import Link from 'next/link';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

export const metadata: Metadata = { title: 'Admin' };

export default function AdminPage() {
  return (
    <>
      <header className="mt-6">
        <Gumdrop tone="warn">Internal</Gumdrop>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">Admin dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          CSV import, source verification, broken-link checker, and API sync status.
          Gated by <code>ADMIN_SHARED_SECRET</code> in production.
        </p>
      </header>

      <div className="mt-3">
        <Link href="/admin/verify" className="bolt-btn text-sm">
          🔗 Open exact-link verifier →
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UploadCard
          title="Apartments CSV"
          endpoint="/api/admin/import/apartments"
          schema="docs/MANUAL_DATA_IMPORT_FORMAT.md §1"
        />
        <UploadCard
          title="Townhomes CSV"
          endpoint="/api/admin/import/townhomes"
          schema="docs/MANUAL_DATA_IMPORT_FORMAT.md §2"
        />
        <UploadCard
          title="Dealers CSV"
          endpoint="/api/admin/import/dealers"
          schema="docs/MANUAL_DATA_IMPORT_FORMAT.md §3"
        />
        <UploadCard
          title="Vehicles CSV"
          endpoint="/api/admin/import/vehicles"
          schema="docs/MANUAL_DATA_IMPORT_FORMAT.md §4"
        />
        <UploadCard
          title="Work-vehicle rentals CSV"
          endpoint="/api/admin/import/work-vehicles"
          schema="docs/MANUAL_DATA_IMPORT_FORMAT.md §5"
        />

        <CandyCard>
          <h3 className="font-display text-lg font-extrabold text-chocolate-900">Source verification</h3>
          <p className="mt-1 text-xs text-chocolate-700">Mark promos &amp; properties verified.</p>
          <ul className="mt-2 space-y-1 text-xs text-chocolate-700">
            <li>· Stale-listing report</li>
            <li>· Broken-link checker</li>
            <li>· API sync log</li>
            <li>· Approve / reject pending records</li>
          </ul>
          <p className="mt-2 text-[11px] text-chocolate-600">Wire to Postgres in Phase 8.</p>
        </CandyCard>
      </div>
    </>
  );
}

function UploadCard({ title, endpoint, schema }: { title: string; endpoint: string; schema: string }) {
  return (
    <CandyCard>
      <h3 className="font-display text-lg font-extrabold text-chocolate-900">{title}</h3>
      <p className="mt-1 text-xs text-chocolate-700">Schema: <code>{schema}</code></p>
      <form action={endpoint} method="POST" encType="multipart/form-data" className="mt-3 space-y-2">
        <input type="file" name="file" accept=".csv" className="block w-full text-xs" />
        <button type="submit" className="bolt-btn text-sm">Upload &amp; validate</button>
      </form>
      <p className="mt-2 text-[11px] text-chocolate-600">
        Rows missing source metadata are rejected and returned in a{' '}
        <code>{title.toLowerCase().replace(' csv', '')}-rejected.csv</code>.
      </p>
    </CandyCard>
  );
}
