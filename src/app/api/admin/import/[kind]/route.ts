import { NextRequest, NextResponse } from 'next/server';
import {
  importApartments,
  importDealers,
  importVehicles,
  importWorkVehicles,
} from '@/lib/providers/manual-csv';

export const runtime = 'nodejs';

const ROUTES: Record<string, (csv: string) => any> = {
  apartments: importApartments,
  townhomes: importApartments, // same schema, unit_type guard at row level
  dealers: importDealers,
  vehicles: importVehicles,
  'work-vehicles': importWorkVehicles,
};

function ensureAuthed(req: NextRequest) {
  const expected = process.env.ADMIN_SHARED_SECRET;
  if (!expected || expected === 'change-me-in-production-use-a-random-32-char-string') {
    throw new Error('ADMIN_SHARED_SECRET not configured.');
  }
  const got = req.headers.get('x-admin-secret');
  if (got !== expected) throw new Error('unauthorized');
}

export async function POST(req: NextRequest, { params }: { params: { kind: string } }) {
  try {
    ensureAuthed(req);
    const fn = ROUTES[params.kind];
    if (!fn) return NextResponse.json({ error: `unknown kind: ${params.kind}` }, { status: 400 });
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'file required' }, { status: 400 });
    const csv = await file.text();
    const result = fn(csv);
    return NextResponse.json({
      kind: params.kind,
      ok_count: result.ok.length,
      rejected_count: result.rejected.length,
      rejected_sample: result.rejected.slice(0, 5),
    });
  } catch (err: any) {
    const code = err?.message === 'unauthorized' ? 401 : 400;
    return NextResponse.json({ error: err?.message ?? 'import failed' }, { status: code });
  }
}
