# Deploy

Two ready-to-go targets: **Netlify** and **Vercel**. Both work without code
changes — pick one.

## One-shot script

```powershell
# Windows PowerShell
PowerShell -ExecutionPolicy Bypass -File scripts/push-and-deploy.ps1

# macOS / Linux / Git Bash
chmod +x scripts/push-and-deploy.sh
./scripts/push-and-deploy.sh
```

The script does, in order:

1. `git init` + first commit (idempotent)
2. `gh repo create lightning-mcgreen-living --public --source=. --remote=origin --push`
3. Creates a `develop` branch and pushes it
4. Deploys to Netlify (default) or Vercel via env var

Override:

```powershell
$env:REPO_NAME     = "lightning-mcgreen-living"
$env:DEPLOY_TARGET = "vercel"      # netlify | vercel | none
$env:VISIBILITY    = "public"      # public  | private
```

## Manual GitHub push

```bash
gh auth login                                                       # once
gh repo create lightning-mcgreen-living --public --source=. --remote=origin
git add .
git commit -m "feat: initial scaffold"
git push -u origin main
git checkout -b develop
git push -u origin develop
```

## Manual Netlify deploy

```bash
npm i -g netlify-cli
netlify login
netlify init                                                        # link site
netlify env:import .env.local                                       # ship env vars
netlify deploy --prod                                               # 🚀
```

`netlify.toml` is committed and:

- runs `npm run build` and publishes `.next`
- uses the official `@netlify/plugin-nextjs`
- sets long-cache headers on icons and a no-cache header on the service worker
- defaults `NEXT_PUBLIC_DATA_MODE=demo` on Netlify (flip to `production` in the
  Netlify UI once real data is in)

## Manual Vercel deploy

```bash
npm i -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_DATA_MODE   demo
vercel env add NEXT_PUBLIC_GEOFENCE_SOCAL true
vercel env add ADMIN_SHARED_SECRET     "$(openssl rand -hex 16)"
vercel --prod
```

`vercel.json` is committed.

## Branch protection (recommended on `main` and `develop`)

In GitHub → Settings → Branches:

- Require pull requests
- Require status check: **Lint · Typecheck · Build**
- Require status check: **Brand + Fair Housing scan**
- Require linear history

## After first deploy

1. Add custom domain (Netlify or Vercel UI).
2. Set `NEXT_PUBLIC_SITE_URL` to the canonical domain.
3. Optionally add `CENSUS_API_KEY` and `HUD_API_TOKEN` (free) for higher rate limits.
4. Optionally add `GOOGLE_PLACES_API_KEY` if you have one (the app degrades
   gracefully without it).
