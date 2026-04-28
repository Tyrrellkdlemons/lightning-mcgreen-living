#!/usr/bin/env node
/**
 * scripts/sync-insert-images.mjs
 *
 * Copies any image found in `_insertimages/` to `public/backgrounds/` and
 * writes `public/backgrounds/manifest.json` so the client-side
 * `<RotatingBackground>` component can rotate them every 30s without a page
 * refresh.
 *
 * Runs as part of `npm run prebuild` (and as `npm run sync-images` ad-hoc).
 * Idempotent — re-running just re-copies + re-writes the manifest.
 */

import { readdirSync, statSync, mkdirSync, copyFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { extname, join, basename } from 'node:path';

const REPO = process.cwd();
const SRC = join(REPO, '_insertimages');
const DST = join(REPO, 'public', 'backgrounds');
const MANIFEST = join(DST, 'manifest.json');

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function ensure(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function listImages(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => !f.startsWith('.'))
    .filter((f) => ALLOWED.has(extname(f).toLowerCase()))
    .filter((f) => {
      try { return statSync(join(dir, f)).isFile(); } catch { return false; }
    })
    .sort();
}

function clean(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    if (f === 'manifest.json') continue;
    if (ALLOWED.has(extname(f).toLowerCase())) {
      try { rmSync(join(dir, f)); } catch {}
    }
  }
}

console.log('→ sync-insert-images');
console.log('  src:', SRC);
console.log('  dst:', DST);

ensure(DST);
clean(DST);

const images = listImages(SRC);
const copied = [];

for (const name of images) {
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const target = join(DST, safe);
  copyFileSync(join(SRC, name), target);
  copied.push({
    src: `/backgrounds/${safe}`,
    name: basename(safe, extname(safe)),
  });
}

writeFileSync(
  MANIFEST,
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      count: copied.length,
      images: copied,
      rotate_seconds: 30,
    },
    null,
    2,
  ),
);

if (copied.length === 0) {
  console.log('  ✓ no images present — manifest written empty (component will no-op)');
} else {
  console.log(`  ✓ copied ${copied.length} image${copied.length === 1 ? '' : 's'}:`);
  for (const c of copied) console.log('    ·', c.src);
}
