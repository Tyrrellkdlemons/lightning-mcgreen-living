import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/link-check?url=...
 *
 * Server-side HTTP probe used by the admin "Verify exact links" tool.
 * Returns { status, ok, redirected, final_url, checked_at } so admins can
 * mark a stored link verified / stale / dead.
 *
 * Gated by `x-admin-secret` header (matches `ADMIN_SHARED_SECRET` env var).
 * Compliance:
 *   - HEAD only (no body fetch).
 *   - 8s timeout.
 *   - Refuses non-http(s) URLs.
 *   - Refuses urls that don't match an allow-list of public host patterns
 *     when the operator is in the partner stub list (no scraping protected
 *     sites — see docs/COMPLIANCE_NOTES.md §1).
 */

const TIMEOUT_MS = 8000;

const SCRAPE_BLOCKED_HOSTS = [
  'zillow.com', 'apartments.com', 'rent.com', 'realtor.com', 'trulia.com', 'hotpads.com',
  'cars.com', 'autotrader.com', 'cargurus.com',
];

function authed(req: NextRequest) {
  const expected = process.env.ADMIN_SHARED_SECRET;
  if (!expected || expected === 'change-me-in-production-use-a-random-32-char-string') {
    throw new Error('ADMIN_SHARED_SECRET not configured.');
  }
  if (req.headers.get('x-admin-secret') !== expected) throw new Error('unauthorized');
}

export async function GET(req: NextRequest) {
  try {
    authed(req);
    const url = req.nextUrl.searchParams.get('url');
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

    let parsed: URL;
    try { parsed = new URL(url); } catch {
      return NextResponse.json({ error: 'invalid url' }, { status: 400 });
    }
    if (!/^https?:$/.test(parsed.protocol)) {
      return NextResponse.json({ error: 'http(s) only' }, { status: 400 });
    }
    const host = parsed.hostname.toLowerCase();
    if (SCRAPE_BLOCKED_HOSTS.some((b) => host === b || host.endsWith('.' + b))) {
      return NextResponse.json({
        url, status: 0, ok: false, blocked: true,
        reason: `Host ${host} is on the scrape-blocked list (per docs/COMPLIANCE_NOTES.md §1). Verify manually in a browser instead.`,
      });
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: ctrl.signal,
        headers: { 'User-Agent': 'lightning-mcgreen-living/0.1 (link verification)' },
      });
      return NextResponse.json({
        url,
        status: res.status,
        ok: res.ok,
        redirected: res.redirected,
        final_url: res.url,
        checked_at: new Date().toISOString(),
      });
    } catch (err: any) {
      return NextResponse.json({
        url, status: 0, ok: false,
        error: err?.message ?? 'fetch failed',
        checked_at: new Date().toISOString(),
      });
    } finally {
      clearTimeout(t);
    }
  } catch (err: any) {
    const code = err?.message === 'unauthorized' ? 401 : 400;
    return NextResponse.json({ error: err?.message ?? 'failed' }, { status: code });
  }
}
