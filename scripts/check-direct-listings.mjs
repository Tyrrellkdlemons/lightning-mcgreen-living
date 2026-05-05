#!/usr/bin/env node
/**
 * check-direct-listings.mjs
 * ========================
 * Probes every override URL in `data/direct-listings.json` and writes
 * back the per-listing `status`, `status_text`, and `last_verified_at`
 * so the UI knows which listings are live / stale / gone.
 *
 * Run via:
 *
 *     npm run check:direct-listings
 *
 * Status meanings:
 *   - live        → URL returned 200 OK with no "no longer available" body
 *   - redirected  → URL returned 3xx (typical when a unit moves to a list page)
 *   - gone        → URL returned 404/410, or 200 with "no longer available" body
 *   - stale       → network error, timeout, or unexpected status (5xx)
 *   - untested    → never probed yet
 *
 * The script uses HEAD then falls back to GET. It honors a 12s per-URL
 * timeout and pretends to be a desktop browser so apartments.com etc
 * don't auto-403 it.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data', 'direct-listings.json');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ' +
  'lightning-mcgreen-living-link-monitor/1.0';

const UNAVAILABLE_PATTERNS = [
  /no longer available/i,
  /this listing is unavailable/i,
  /this property is no longer/i,
  /listing has been removed/i,
  /not currently available/i,
];

async function probe(url) {
  // First try HEAD (cheap, no body)
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12_000);
    const r = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
    });
    clearTimeout(t);
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get('location');
      return {
        status: 'redirected',
        code: r.status,
        location: loc,
        text: `${r.status} → ${loc ?? '(no Location header)'}`,
      };
    }
    if (r.status === 404 || r.status === 410) {
      return { status: 'gone', code: r.status, text: `HTTP ${r.status}` };
    }
    if (r.status === 200) {
      // We need the body to scan for "no longer available" markers — fall through.
    } else if (r.status >= 500) {
      return { status: 'stale', code: r.status, text: `HTTP ${r.status} server error` };
    } else if (r.status === 403 || r.status === 405) {
      // Some sites refuse HEAD — fall through to GET.
    }
  } catch (e) {
    // network error on HEAD — try GET
  }

  // GET fallback
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15_000);
    const r = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(t);

    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get('location');
      return {
        status: 'redirected',
        code: r.status,
        location: loc,
        text: `${r.status} → ${loc ?? '(no Location header)'}`,
      };
    }
    if (r.status === 404 || r.status === 410) {
      return { status: 'gone', code: r.status, text: `HTTP ${r.status}` };
    }
    if (r.status === 200) {
      const body = await r.text();
      for (const pat of UNAVAILABLE_PATTERNS) {
        if (pat.test(body)) {
          return {
            status: 'gone',
            code: 200,
            text: `body matched /${pat.source}/`,
          };
        }
      }
      return { status: 'live', code: 200, text: 'HTTP 200 OK' };
    }
    return { status: 'stale', code: r.status, text: `HTTP ${r.status}` };
  } catch (e) {
    return { status: 'stale', text: `error: ${String(e?.message || e)}` };
  }
}

async function main() {
  const raw = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  const overrides = raw.overrides ?? {};
  const ranks = Object.keys(overrides);
  if (ranks.length === 0) {
    console.log('No overrides defined in data/direct-listings.json — nothing to probe.');
    return;
  }
  console.log(`Probing ${ranks.length} direct-listing URL(s) ...`);
  console.log('');

  let live = 0,
    redirected = 0,
    gone = 0,
    stale = 0;

  for (const rank of ranks) {
    const o = overrides[rank];
    if (!o.direct_url) continue;
    const label = `  rank ${String(rank).padStart(2)}  ${(o.property_name || '?').padEnd(34)}`;
    process.stdout.write(`${label} `);
    const res = await probe(o.direct_url);
    o.status = res.status;
    o.status_text = res.text || null;
    o.last_verified_at = new Date().toISOString();
    if (res.status === 'live') live++;
    else if (res.status === 'redirected') redirected++;
    else if (res.status === 'gone') gone++;
    else stale++;
    const tag = {
      live: '✓ LIVE',
      redirected: '↪  redirected',
      gone: '✗ GONE',
      stale: '? stale',
      untested: '? untested',
    }[res.status] || res.status;
    console.log(`${tag}  ${res.text || ''}`);
  }

  raw.updated_at = new Date().toISOString();
  await fs.writeFile(DATA_FILE, JSON.stringify(raw, null, 2) + '\n');
  console.log('');
  console.log(`Summary: live=${live} redirected=${redirected} gone=${gone} stale=${stale}`);
  console.log(`Updated ${DATA_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
