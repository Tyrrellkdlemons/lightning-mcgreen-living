import fs from 'node:fs';
import path from 'node:path';

const INPUT = path.join('src', 'lib', 'data', 'generated', 'workbook-ranked-listings.json');

function looksLikeUrl(v) {
  return typeof v === 'string' && /^https?:\/\//i.test(v);
}

function primaryUrl(row) {
  return (
    row?.direct_links?.direct_listing_url ??
    row?.direct_links?.direct_platform_apply_url ??
    row?.links?.best_listing_url ??
    row?.links?.leasing_url ??
    row?.links?.source_url_clickable ??
    row?.links?.source_url ??
    null
  );
}

async function probe(url) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 12000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ac.signal,
      headers: {
        'user-agent': 'lightning-mcgreen-living-link-check/1.0',
      },
    });
    return { status: res.status, finalUrl: res.url || null, ok: res.ok };
  } catch {
    return { status: 0, finalUrl: null, ok: false };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const doProbe = process.argv.includes('--probe');
  const probeLimitArg = process.argv.find((x) => x.startsWith('--limit='));
  const probeLimit = probeLimitArg ? Number(probeLimitArg.split('=')[1]) : 30;

  if (!fs.existsSync(INPUT)) {
    console.error(`Missing workbook JSON: ${INPUT}`);
    process.exit(1);
  }

  const rows = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const hostCounts = new Map();

  let missingPrimary = 0;
  let malformedPrimary = 0;
  for (const row of rows) {
    const url = primaryUrl(row);
    if (!url) {
      missingPrimary++;
      continue;
    }
    if (!looksLikeUrl(url)) {
      malformedPrimary++;
      continue;
    }
    const host = new URL(url).host.toLowerCase();
    hostCounts.set(host, (hostCounts.get(host) ?? 0) + 1);
  }

  console.log(`Workbook rows: ${rows.length}`);
  console.log(`Primary URL missing: ${missingPrimary}`);
  console.log(`Primary URL malformed: ${malformedPrimary}`);
  console.log('Top hosts:');
  Array.from(hostCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([host, count]) => console.log(`  ${host} -> ${count}`));

  if (!doProbe) {
    console.log('Skip HTTP probing. Re-run with --probe to test live links.');
    return;
  }

  const candidates = rows
    .map((row) => ({ row, url: primaryUrl(row) }))
    .filter((x) => looksLikeUrl(x.url))
    .slice(0, probeLimit);

  let ok = 0;
  let fail = 0;
  console.log(`\nProbing ${candidates.length} links...`);
  for (const item of candidates) {
    const result = await probe(item.url);
    const rank = item.row.rank ?? 'n/a';
    const city = item.row.city ?? 'SoCal';
    const name = item.row.property_name;
    const status = result.status || 'ERR';
    const marker = result.ok ? 'OK' : 'FAIL';
    console.log(`[${marker}] #${rank} ${name} (${city}) -> ${status}`);
    if (result.ok) ok++;
    else fail++;
  }
  console.log(`\nProbe summary: ok=${ok}, fail=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
