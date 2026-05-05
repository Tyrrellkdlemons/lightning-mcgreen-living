#!/usr/bin/env node
/**
 * add-direct-url.mjs
 * ==================
 * Adds a direct property URL for a workbook rank, no JSON editing required.
 * Prompts you for the rank (1..79) and the URL, looks up the property name
 * from the workbook, and writes `data/direct-listings.json`.
 *
 * Run via:
 *   npm run add:direct-url
 * or by picking it from START_HERE.bat.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'direct-listings.json');
const WORKBOOK_FILE = path.join(
  ROOT,
  'src',
  'lib',
  'data',
  'generated',
  'workbook-listings-full.json',
);

function looksLikeUrl(s) {
  return typeof s === 'string' && /^https?:\/\/\S+/i.test(s.trim());
}

async function main() {
  const rl = readline.createInterface({ input, output });
  console.log('');
  console.log('===========================================================');
  console.log('  Add a direct listing URL for a workbook rank');
  console.log('===========================================================');
  console.log('');

  const wb = JSON.parse(await fs.readFile(WORKBOOK_FILE, 'utf8'));
  const byRank = new Map(wb.map((x) => [String(x.rank), x]));

  let rank;
  while (true) {
    const ans = (await rl.question('Rank (1-79): ')).trim();
    if (!ans) continue;
    if (!/^\d+$/.test(ans) || !byRank.has(ans)) {
      console.log(`  ! '${ans}' is not a known workbook rank (try 1..${wb.length}).`);
      continue;
    }
    rank = ans;
    break;
  }
  const listing = byRank.get(rank);
  console.log(`  Property: ${listing.property_name} (${listing.city || 'unknown city'})`);
  console.log('');

  let url;
  while (true) {
    const ans = (await rl.question('Direct property URL (https://...): ')).trim();
    if (!looksLikeUrl(ans)) {
      console.log('  ! That does not look like an http(s):// URL. Try again.');
      continue;
    }
    url = ans;
    break;
  }

  const notes = (await rl.question('Optional note (where you found it, why direct, etc.) [enter to skip]: ')).trim() || undefined;
  const probeNow = (await rl.question('Probe this URL right now to set its status? [Y/n]: ')).trim().toLowerCase();

  rl.close();

  const raw = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  raw.overrides = raw.overrides || {};
  const existed = !!raw.overrides[rank];
  raw.overrides[rank] = {
    rank: Number(rank),
    property_name: listing.property_name,
    city: listing.city,
    direct_url: url,
    added_at: new Date().toISOString().slice(0, 10),
    last_verified_at: null,
    status: 'untested',
    status_text: null,
    notes,
  };
  raw.updated_at = new Date().toISOString();
  await fs.writeFile(DATA_FILE, JSON.stringify(raw, null, 2) + '\n');
  console.log('');
  console.log(`${existed ? 'Updated' : 'Added'} rank ${rank} -> ${url}`);
  console.log(`Saved to ${DATA_FILE}`);
  console.log('');

  if (probeNow !== 'n' && probeNow !== 'no') {
    console.log('Probing now ...');
    const { spawn } = await import('node:child_process');
    const node = process.execPath;
    const probe = spawn(node, [path.join(__dirname, 'check-direct-listings.mjs')], {
      stdio: 'inherit',
    });
    probe.on('exit', (code) => process.exit(code ?? 0));
  } else {
    console.log("Skipping probe. Run 'npm run check:direct-listings' whenever you want.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
