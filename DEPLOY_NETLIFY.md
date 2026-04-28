# Deploying Lightning McGreen Living to Netlify

Lightning McGreen Living is a Next.js 14 PWA. Netlify hosts it natively
through the Next.js plugin. Total time from clone to live URL: ~10 minutes.

## What you'll need

1. A **GitHub account** (Netlify deploys from Git).
2. A **Netlify account** at netlify.com (free tier covers this app).
3. That's it. No paid infra. No database required for the demo build.
4. Optional later: a Postgres database (Neon, Supabase, Railway) if you flip
   to production mode and want CSV imports persisted server-side.

## Step 1 — push the code to GitHub

If you haven't already pushed, **double-click `DEPLOY.bat`** at the repo root.
It runs `git add . && git commit && git push origin main` and (if Netlify CLI
is installed) triggers a production deploy.

If you'd rather do it by hand:

```powershell
cd "C:\Users\TKDL\Desktop\CLAUDE\Apartments & Cars\Apartments\lightning-mcgreen-living"
git init -b main
git add .
git commit -m "feat: initial scaffold of Lightning McGreen Living"
git remote add origin https://github.com/<you>/lightning-mcgreen-living.git
git push -u origin main
```

If you don't have a terminal, use **GitHub Desktop** (free app):
File → Add local repository → pick this folder → Publish repository.

## Step 2 — connect GitHub to Netlify

1. Sign in at netlify.com → **Add new site** → **Import an existing project**
   → **GitHub**.
2. Pick your `lightning-mcgreen-living` repo.
3. Netlify auto-detects `netlify.toml` — leave the build settings as-is.
4. Click **Deploy lightning-mcgreen-living**.

The first build takes ~90 seconds. You'll get a URL like
`https://lightning-mcgreen-living.netlify.app`.

## Step 3 — set environment variables

In the Netlify site dashboard → **Site configuration → Environment variables**
→ add these:

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_DATA_MODE` | `demo` | Flip to `production` once real CSV data is in. Production mode refuses any listing missing source metadata. |
| `NEXT_PUBLIC_GEOFENCE_SOCAL` | `true` | Hides any listing outside the SoCal bbox. |
| `ADMIN_SHARED_SECRET` | random 32+ char string | Required to use `/admin` CSV upload. Generate one at randomkeygen.com. |
| `NEXT_PUBLIC_SITE_URL` | the Netlify URL | Set after Step 2 once you know the URL. |

Optional (free signups, raise rate limits on the public APIs we already use):

| Key | Where to get it |
|---|---|
| `CENSUS_API_KEY` | <https://api.census.gov/data/key_signup.html> |
| `HUD_API_TOKEN` | <https://www.huduser.gov/hudapi/public/register> |

Optional (paid):

| Key | Where to get it |
|---|---|
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console |
| `YELP_API_KEY` | <https://docs.developer.yelp.com/> |

## Step 4 — verify the live site

1. Open your Netlify URL in incognito.
2. You should see the homepage with the **two doors**, the **TopNav search
   box** (`⌘K` / `Ctrl+K`), and the demo banner.
3. Click **Apartments & Townhomes** — you should see paginated listings with
   real operator names (Greystar, Irvine Company, etc.), animated photo
   galleries, and the screening-vendor badge on each card.
4. Try `/cars` — race-day theme should kick in (asphalt + neon green
   lightning + checkered corner flag).
5. Test search — type `greystar` or `cargo van burbank` in the nav search.
   Results should appear immediately.

## Step 5 — wire continuous deploy (optional but recommended)

Netlify auto-rebuilds on every push to `main` once the GitHub integration is
connected (Step 2 already does this).

To also use the project's GitHub Actions workflow (`.github/workflows/netlify-deploy.yml`):

In your GitHub repo → **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `NETLIFY_AUTH_TOKEN` | from Netlify → User settings → Applications → Personal access tokens |
| `NETLIFY_SITE_ID` | from Netlify → Site configuration → Site details → Site ID |
| `ADMIN_SHARED_SECRET` | same value as Netlify env var |

The workflow then runs **validate → build → deploy** on every `main` push,
and posts a preview URL comment on every PR.

---

## Troubleshooting

- **Build fails on `npm install`.** Make sure `NODE_VERSION=20` is set in
  `netlify.toml` `[build.environment]` (it is by default).
- **Listings missing photos.** Check `next.config.mjs` `images.remotePatterns`
  includes `picsum.photos`. We allow that by default.
- **`/admin` CSV upload returns 401.** `ADMIN_SHARED_SECRET` is unset or
  using the default placeholder. Set a real random value in Netlify env vars.
- **Deploy succeeds but page shows demo banner.** Set `NEXT_PUBLIC_DATA_MODE=production`
  in Netlify env vars (then redeploy). Until you have real CSV data
  imported via `/admin`, leave it on `demo`.
- **Netlify says "Site cap exceeded".** Free tier covers ~100 GB bandwidth +
  125k function invocations / month. Upgrade if you outgrow it; the app
  doesn't care which tier you're on.
- **GitHub Actions workflow runs but doesn't deploy.** Check that
  `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` are set as repo secrets. The
  workflow no-ops on missing secrets rather than failing.

## Alternative hosts

If Netlify ever gets finicky:

- **Vercel** — most natural Next.js host. Same env vars. Delete `netlify.toml`,
  keep everything else. `vercel.json` is already committed.
- **Railway** — provisions Postgres in one click. Good if you want to flip
  to production mode with persistent CSV imports without setting up Neon
  yourself.
- **Cloudflare Pages** — works with the OpenNext adapter; needs more setup.

The code doesn't care which you pick.
