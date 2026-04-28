# Lightning McGreen Living — Checkpoint 2026-04-28

> 🟢 **DEPLOYED — LIVE IN PRODUCTION**

## Live links
- **Live site:** <https://lightning-mcgreen-living.netlify.app>
- **GitHub repo:** <https://github.com/Tyrrellkdlemons/lightning-mcgreen-living>
- **Netlify project:** <https://app.netlify.com/projects/lightning-mcgreen-living/overview>
- **First production deploy:** `main@3091373` · 2026-04-28 01:31 — *Published* in 8.9s
- **Continuous deploy:** every push to `main` triggers a new Netlify build
- **Branch convention:** `main` ← `develop` ← `feature/*`

## Mode
- `NEXT_PUBLIC_DATA_MODE = demo` (banner visible — production refuses unverified listings)
- `NEXT_PUBLIC_GEOFENCE_SOCAL = true`
- `NODE_VERSION = 20`

## What ships at this checkpoint
- Two-doors homepage + Life Budget teaser + assistance hub promo + WhyBetter
- `/rentals`, `/apartments`, `/townhomes` + per-listing detail with map, fit score,
  move-in calculator, application platform notes, source-of-income notice,
  FCRA adverse-action helper, county assistance cards
- `/cars`, `/cars/[id]`, `/dealers/[id]` with VIN decoder (real NHTSA vPIC),
  payment estimator, dealer LLC + DMV license verify links, auto hardship card
- `/work-vehicles`, `/work-vehicles/[id]` with cost calculator, job-to-vehicle matcher
- `/life-budget`, `/compare`, `/saved`
- `/assistance` — verified LA County ERRP (Feb 9 2026 reopen), OCHA forms,
  Riverside DPSS, San Bernardino court help, statewide CalWORKs, federal CFPB/FTC/BAR
- `/templates` — printable lease-extension, auto-hardship, county-packet
- `/data-sources` — provider registry (live · env-key · partner · paid)
- `/admin` (gated) + `/api/admin/import/[kind]` CSV upload
- `/api/vin/[vin]` — NHTSA vPIC server route
- `/privacy` `/terms` `/accessibility` `/offline` `/not-found` `loading`
- PWA: manifest, service worker (network-first nav + offline fallback), install banner
- Sitemap + robots
- Brand & Fair-Housing CI scan in `.github/workflows/ci.yml`

## Providers wired
- **Live, no key:** NHTSA vPIC, FuelEconomy.gov, OSM Overpass, U.S. Census ACS,
  HUD FMR, OSM Nominatim, NHTSA Safety + Recalls, Open Charge Map, SoCal transit feeds
- **Manual-link / verified-link:** CA SOS bizfile, CA DMV Occupational License lookup
- **Env-key gated:** Google Places, Yelp Fusion
- **Partner stubs (throw `ProviderRequiresContractError` until contract):**
  Zillow Bridge, Apartments.com, Rent.com, Yardi RentCafe, Entrata, AppFolio,
  RealPage, Cars.com, Autotrader, CarGurus, MarketCheck, U-Haul, Penske,
  Budget Truck, Enterprise Truck, Ryder, Fluid Truck, Home Depot Truck

## How the deploy happened (this checkpoint)
1. Filled in `github.com/new` form via Claude-in-Chrome MCP
2. Clicked **Create repository** under `Tyrrellkdlemons` (public)
3. Local `git init -b main; git add .; git commit; git push -u origin main`
4. On `app.netlify.com/start` → clicked **GitHub** → picked `lightning-mcgreen-living`
5. Netlify auto-detected Next.js + read `netlify.toml`
6. Project name `lightning-mcgreen-living` → **Deploy**
7. Build pipeline: Initializing → Building → Deploying (8.9s) → Cleanup → Post-processing
8. Live at `lightning-mcgreen-living.netlify.app`

## Optional next steps
- Add `ADMIN_SHARED_SECRET` in Netlify env (32-char random string)
- Flip `NEXT_PUBLIC_DATA_MODE` to `production` once real CSV data is in
- Add custom domain in Netlify Domain Management
- Add free-tier `CENSUS_API_KEY` and `HUD_API_TOKEN` for higher rate limits
- Sign partner contracts → flip stubs to live adapters one at a time
- Expand `/assistance` to Ventura, Santa Barbara, Kern, Imperial counties

See [`docs/CHECKPOINT.md`](./docs/CHECKPOINT.md) for the full file inventory.
