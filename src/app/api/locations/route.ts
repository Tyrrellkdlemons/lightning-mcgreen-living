import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/locations';

// Every response depends on q/state. Netlify's Next adapter can otherwise share
// a durable cache entry across these queries. Keep this small lookup uncached.
export const dynamic = 'force-dynamic';
const headers = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Netlify-CDN-Cache-Control': 'no-store',
  'Netlify-Vary': 'query=q|state',
};

export function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100);
  const state = req.nextUrl.searchParams.get('state') ?? '';
  if (q.length < 2) return NextResponse.json({ items: [], total: 0 }, { headers });
  const result = searchLocations({ query: q, state: state || undefined, pageSize: 8 });
  return NextResponse.json({
    items: result.items.map(p => ({
      id: p.id, name: p.name, state: p.state,
      county: p.counties.map(c => c.name).join(', '),
    })),
    total: result.total,
  }, { headers });
}
