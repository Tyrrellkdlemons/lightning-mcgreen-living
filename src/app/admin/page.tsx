import type { Metadata } from 'next';
import Link from 'next/link';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <>
      <header className="mt-6">
        <Gumdrop tone="warn">Internal</Gumdrop>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">Admin dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-chocolate-700">
          Edit city guides and listings, manage place photographs, and validate import files.
          Content editing uses your authorized GitHub account; photo publishing requires your private editor key.
        </p>
      </header>

      <div className="mt-3 flex flex-wrap gap-3">
        <Link href="/admin/photos" className="bolt-btn text-sm">Manage place photos</Link>
        <a href="/admin/content/index.html" className="cinnamon-btn text-sm">Edit places and listings</a>
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
          <h3 className="font-display text-lg font-extrabold text-chocolate-900">Check your sources</h3>
          <p className="mt-2 text-sm text-chocolate-700">Confirm listing links and review connected data sources before adding records. Prices and availability need current provider confirmation.</p>
          <div className="mt-4 flex flex-col gap-3 text-sm font-bold">
            <Link href="/admin/verify" className="underline">Check application links</Link>
            <Link href="/data-sources" className="underline">Review data sources</Link>
          </div>
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
        This checks the file and reports validation results. It does not save listings. Use the content editor above to publish records.
      </p>
    </CandyCard>
  );
}
