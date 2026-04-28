#!/usr/bin/env node
/**
 * scripts/validate.mjs — pre-build static checks
 *
 * Mirrors The Last Mile's `scripts/validate.mjs` pattern. Runs in the
 * `validate` job of `.github/workflows/netlify-deploy.yml` BEFORE typecheck /
 * lint / build. Fails fast and loud — catches issues that the type system
 * can't (banned strings, missing files, etc.).
 *
 * Cheap, no deps. Safe to run locally too: `node scripts/validate.mjs`.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const REPO = process.cwd();
const errors = [];
const warnings = [];

console.log('→ validate · Lightning McGreen Living');

// ----- 1. Required files exist -----------------------------------------------
const REQUIRED = [
  'package.json', 'tsconfig.json', 'next.config.mjs', 'tailwind.config.ts',
  'src/app/layout.tsx', 'src/app/page.tsx',
  'public/manifest.json', 'public/service-worker.js',
  'docs/DATA_SOURCES.md', 'docs/COMPLIANCE_NOTES.md',
  'docs/PRODUCT_SPEC.md', 'docs/UI_THEME_GUIDE.md',
  'docs/MANUAL_DATA_IMPORT_FORMAT.md',
  'netlify.toml', 'DEPLOY_NETLIFY.md',
];
for (const p of REQUIRED) {
  if (!existsSync(join(REPO, p))) errors.push(`missing required file: ${p}`);
}

// ----- 2. Walk src/ + check banned strings -----------------------------------
function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

const SOURCE_FILES = walk(join(REPO, 'src'))
  .concat(existsSync(join(REPO, 'public')) ? walk(join(REPO, 'public')) : [])
  .filter((p) => /\.(tsx?|jsx?|css|html)$/.test(p));

// Trademarked / brand-confusing strings that must NOT appear in source.
// Allowed inside docs/ + README + this validator.
const BANNED_TRADEMARK = [
  'Lightning McQueen',
  'Pixar Cars',
  'NASCAR-themed',
  'NASCAR sponsored',
];

// Fair-Housing-unsafe filter copy that must NOT appear in source.
const BANNED_FAIR_HOUSING = [
  'great for kids',
  'perfect for families',
  'young professionals only',
  'no children',
  'singles only',
];

// "Guaranteed approval" claims must NEVER appear.
const BANNED_GUARANTEE = [
  'guaranteed approval',
  'guaranteed financing',
  'guaranteed zero down',
];

const ALL_BANNED = [
  ...BANNED_TRADEMARK.map((s) => ({ kind: 'trademark', s })),
  ...BANNED_FAIR_HOUSING.map((s) => ({ kind: 'fair-housing', s })),
  ...BANNED_GUARANTEE.map((s) => ({ kind: 'guarantee', s })),
];

for (const file of SOURCE_FILES) {
  const text = readFileSync(file, 'utf8');
  for (const { kind, s } of ALL_BANNED) {
    if (text.toLowerCase().includes(s.toLowerCase())) {
      errors.push(`${kind} violation in ${relative(REPO, file)}: contains "${s}"`);
    }
  }
}

// ----- 3. Sample CSVs are still parseable ------------------------------------
const samples = ['apartments.csv', 'townhomes.csv', 'dealers.csv', 'vehicles.csv', 'work-vehicle-rentals.csv'];
for (const s of samples) {
  const p = join(REPO, 'data', 'samples', s);
  if (!existsSync(p)) {
    warnings.push(`sample CSV missing: data/samples/${s}`);
    continue;
  }
  const lines = readFileSync(p, 'utf8').trim().split(/\r?\n/);
  if (lines.length < 2) errors.push(`sample CSV ${s} has no data rows`);
  const header = lines[0].split(',');
  if (!header.includes('source')) errors.push(`sample CSV ${s} missing required "source" column`);
}

// ----- 4. Provider registry exports stable surface ---------------------------
const registryPath = join(REPO, 'src/lib/providers/registry.ts');
if (existsSync(registryPath)) {
  const text = readFileSync(registryPath, 'utf8');
  if (!text.includes('NhtsaVpicProvider')) errors.push('registry.ts no longer references NhtsaVpicProvider');
  if (!text.includes('OverpassProvider')) errors.push('registry.ts no longer references OverpassProvider');
}

// ----- Done ------------------------------------------------------------------
if (warnings.length) {
  console.log('\n⚠ warnings:');
  for (const w of warnings) console.log('   ' + w);
}

if (errors.length) {
  console.error('\n✗ validate failed:\n');
  for (const e of errors) console.error('   ' + e);
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}

console.log(`✓ validate passed (${SOURCE_FILES.length} source files scanned, ${warnings.length} warning${warnings.length === 1 ? '' : 's'})`);
