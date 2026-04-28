#!/usr/bin/env bash
# Lightning McGreen Living — push-and-deploy
#
# Initializes the git repo, creates a public GitHub repo via `gh`, pushes
# the initial commit, and (optionally) does a one-shot Netlify deploy.
#
# Usage:
#   chmod +x scripts/push-and-deploy.sh
#   ./scripts/push-and-deploy.sh
#
# Requirements:
#   - gh CLI authenticated (gh auth login)
#   - netlify CLI authenticated (netlify login)   [optional]
#   - vercel CLI authenticated (vercel login)     [optional]

set -euo pipefail

REPO_NAME="${REPO_NAME:-lightning-mcgreen-living}"
DEPLOY_TARGET="${DEPLOY_TARGET:-netlify}"   # netlify | vercel | none
VISIBILITY="${VISIBILITY:-public}"          # public | private

# 1. git init + first commit (idempotent) ------------------------------------
if [ ! -d .git ]; then
  echo "→ git init"
  git init -b main
  git add .
  git commit -m "feat: initial scaffold of Lightning McGreen Living"
else
  echo "→ git already initialized"
fi

# 2. create remote + push ----------------------------------------------------
if ! git remote get-url origin >/dev/null 2>&1; then
  if command -v gh >/dev/null 2>&1; then
    echo "→ creating GitHub repo $REPO_NAME ($VISIBILITY)"
    gh repo create "$REPO_NAME" "--$VISIBILITY" --source=. --remote=origin --push
  else
    echo "✗ gh CLI not found. Install: https://cli.github.com/  (or set origin manually)"
    exit 1
  fi
else
  echo "→ pushing to existing origin"
  git push -u origin main
fi

# 3. develop branch ----------------------------------------------------------
if ! git rev-parse --verify develop >/dev/null 2>&1; then
  git checkout -b develop
  git push -u origin develop
  git checkout main
fi

# 4. deploy ------------------------------------------------------------------
case "$DEPLOY_TARGET" in
  netlify)
    if command -v netlify >/dev/null 2>&1; then
      echo "→ Netlify deploy"
      netlify init || true
      netlify deploy --prod
    else
      echo "✗ netlify CLI not found. Install: npm i -g netlify-cli"
    fi
    ;;
  vercel)
    if command -v vercel >/dev/null 2>&1; then
      echo "→ Vercel deploy"
      vercel link --yes || true
      vercel --prod
    else
      echo "✗ vercel CLI not found. Install: npm i -g vercel"
    fi
    ;;
  none)
    echo "→ skipping deploy (DEPLOY_TARGET=none)"
    ;;
esac

echo "✓ done."
