# DEPLOY_NETLIFY.md — Lightning McGreen Living

Quickest path from a fresh clone to a live Netlify URL.

## One command (Windows / PowerShell)

```powershell
PowerShell -ExecutionPolicy Bypass -File scripts/push-and-deploy.ps1
```

## One command (Git Bash / macOS / Linux)

```bash
chmod +x scripts/push-and-deploy.sh && ./scripts/push-and-deploy.sh
```

## What it does

1. `git init`, first commit
2. `gh repo create lightning-mcgreen-living --public --source=. --remote=origin --push`
3. Creates a `develop` branch and pushes it
4. `netlify init` then `netlify deploy --prod`

## Required CLIs

```powershell
# GitHub CLI
winget install GitHub.cli ; gh auth login

# Netlify CLI
npm i -g netlify-cli ; netlify login
```

## Env vars to set after first deploy

```text
NEXT_PUBLIC_DATA_MODE       demo            # flip to "production" once real data is in
NEXT_PUBLIC_GEOFENCE_SOCAL  true
ADMIN_SHARED_SECRET         <random 32+ chars>
NEXT_PUBLIC_SITE_URL        https://<your-domain>
# Optional, free signups, raise rate limits:
CENSUS_API_KEY              <free>
HUD_API_TOKEN               <free>
# Optional, paid:
GOOGLE_PLACES_API_KEY
YELP_API_KEY
```

## Branch protection

Turn on these required checks on `main` and `develop` in GitHub:

- **Lint · Typecheck · Build** (from `.github/workflows/ci.yml`)
- **Brand + Fair Housing scan** (from same)

## Continuous deploy

`.github/workflows/netlify-deploy.yml` will redeploy on every push to `main`
when these GitHub repository secrets are set:

```text
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
ADMIN_SHARED_SECRET
```
