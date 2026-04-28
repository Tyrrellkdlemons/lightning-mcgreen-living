# Manual Setup Guide

This walks you from a fresh clone to a running PWA in five minutes.

## 1. Clone + install

```bash
git clone https://github.com/<you>/lightning-mcgreen-living.git
cd lightning-mcgreen-living
npm install
```

## 2. Environment

```bash
cp .env.example .env.local
# Open .env.local — leave NEXT_PUBLIC_DATA_MODE=demo for first run.
# Optional keys (all degrade gracefully):
#   CENSUS_API_KEY=...        free at https://api.census.gov/data/key_signup.html
#   HUD_API_TOKEN=...         free at https://www.huduser.gov/hudapi/public/register
#   GOOGLE_PLACES_API_KEY=... if you have one
```

## 3. Run

```bash
npm run dev
# → http://localhost:3000
```

You should see the Lightning McGreen Living homepage with the two doors,
Life Budget teaser, and "Why this is better" panel.

## 4. Try the live free APIs

- Visit any car detail page → click **VIN decoder** → paste a real VIN.
  This calls the **NHTSA vPIC** API (free, no key) and decodes year/make/model/trim/etc.
- Visit `/data-sources` to see every connector and its current status.

## 5. Try the manual CSV import

```bash
# In another terminal, with the dev server running:
curl -X POST http://localhost:3000/api/admin/import/apartments \
  -H "x-admin-secret: $(grep ADMIN_SHARED_SECRET .env.local | cut -d= -f2)" \
  -F "file=@data/samples/apartments.csv"
```

Returns `{ ok_count, rejected_count, rejected_sample }`.

## 6. Switch to production mode

```bash
sed -i.bak 's/^NEXT_PUBLIC_DATA_MODE=.*/NEXT_PUBLIC_DATA_MODE=production/' .env.local
# Then make sure ADMIN_SHARED_SECRET is set to a real 32-char value.
```

In production mode, demo listings are excluded — only listings with full
source metadata (from API or CSV import) will render.

## 7. Database (optional)

For multi-user deploys, point `DATABASE_URL` at Postgres + PostGIS and run:

```bash
npx prisma migrate dev
```

The schema in `prisma/schema.prisma` mirrors the in-memory types.

## 8. Deploy

### Vercel

```bash
vercel link
vercel env add  # for each var in .env.example
vercel --prod
```

### Netlify

```bash
netlify init
netlify env:import .env.local
netlify deploy --prod
```

## 9. Open the GitHub repo + workflow

```bash
gh repo create lightning-mcgreen-living --public --source=. --remote=origin
git add .
git commit -m "feat: initial scaffold"
git push -u origin main
gh workflow view CI
```
