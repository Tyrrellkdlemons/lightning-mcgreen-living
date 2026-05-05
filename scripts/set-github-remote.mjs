#!/usr/bin/env node
/**
 * set-github-remote.mjs
 * =====================
 * Sets up the `origin` remote for GitHub auto-deploy. Prompts you for the
 * GitHub repo URL, runs the right git commands, and verifies. No need to
 * remember `git remote add origin ...` or look up the syntax.
 *
 * Run via:
 *   npm run set:github-remote
 * or pick it from START_HERE.bat.
 */
import { execSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', cwd: ROOT, encoding: 'utf8', ...opts }).trim();
}
function tryRun(cmd, opts = {}) {
  try {
    return { ok: true, out: run(cmd, opts) };
  } catch (e) {
    return { ok: false, out: String(e.stderr || e.stdout || e.message || e) };
  }
}

function looksLikeGitUrl(s) {
  if (!s) return false;
  return /^(https?:\/\/github\.com\/.+\.git\/?|git@github\.com:.+\.git|https?:\/\/github\.com\/[^/]+\/[^/]+\/?)$/i.test(
    s.trim(),
  );
}

function normalize(url) {
  let u = url.trim().replace(/\/+$/, '');
  // Accept "https://github.com/user/repo" and add `.git`
  if (/^https?:\/\/github\.com\/[^/]+\/[^/]+$/i.test(u)) u = u + '.git';
  return u;
}

async function main() {
  const rl = readline.createInterface({ input, output });
  console.log('');
  console.log('===========================================================');
  console.log('  Set the GitHub remote for this project');
  console.log('===========================================================');
  console.log('');
  console.log(`Project folder: ${ROOT}`);
  console.log('');

  // Init repo if missing
  const insideRepo = tryRun('git rev-parse --is-inside-work-tree');
  if (!insideRepo.ok) {
    console.log('Not a git repo yet. Initializing ...');
    run('git init');
    run('git branch -M main');
  }

  const existing = tryRun('git remote get-url origin');
  if (existing.ok) {
    console.log(`Current origin: ${existing.out}`);
    const change = (await rl.question('Replace it? [y/N]: ')).trim().toLowerCase();
    if (change !== 'y' && change !== 'yes') {
      console.log('Keeping existing origin. Nothing changed.');
      rl.close();
      return;
    }
  }

  let url;
  while (true) {
    const ans = (
      await rl.question('GitHub repo URL (https://github.com/USER/REPO.git): ')
    ).trim();
    if (!looksLikeGitUrl(ans)) {
      console.log("  ! That doesn't look like a GitHub repo URL. Try again.");
      continue;
    }
    url = normalize(ans);
    break;
  }
  rl.close();

  if (existing.ok) {
    run(`git remote set-url origin "${url}"`);
  } else {
    run(`git remote add origin "${url}"`);
  }

  const check = tryRun('git remote get-url origin');
  console.log('');
  console.log(check.ok ? `origin set to: ${check.out}` : `WARNING: ${check.out}`);
  console.log('');
  console.log('You can now use:');
  console.log('  - BUILD_AND_PUSH_GITHUB.bat  (typecheck, lint, build, commit, push)');
  console.log('  - BUILD_AND_DEPLOY_GITHUB_NETLIFY.bat  (same, plus Netlify deploy)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
