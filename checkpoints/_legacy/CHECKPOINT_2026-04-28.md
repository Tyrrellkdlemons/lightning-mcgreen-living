# Lightning McGreen Living — Checkpoint · 2026-04-28

> 🟢 **DEPLOYED** — live at <https://lightning-mcgreen-living.netlify.app>
> Repo: <https://github.com/Tyrrellkdlemons/lightning-mcgreen-living>
> First production deploy: `main@3091373` · Published in 8.9 s.

Snapshot after the multi-slice expansion. Theme split (gingerbread for
rentals, race-day for cars). Real public operators tagged on every listing.
Animated 3-photo galleries on every card. Global search box in TopNav.
Pagination, sort, save-heart, screening-vendor inference, county assistance
overlay, auto hardship card — all inline.

---

## 1. What shipped today

### Slice 1 · Documentation foundation
- `docs/DATA_SOURCES.md` — every API researched + access tier
- `docs/COMPLIANCE_NOTES.md` — Fair Housing, FCRA, scraping rules, brand do-not list
- `docs/PRODUCT_SPEC.md`, `docs/UI_THEME_GUIDE.md`, `docs/LAUNCH_CHECKLIST.md`
- `docs/API_CONNECTOR_STATUS.md` — per-provider status matrix
- `docs/MANUAL_DATA_IMPORT_FORMAT.md` — full CSV column schemas

### Slice 2 · Design system + theme split
- Tailwind palette: `lightning`, `gingerbread`, `caramel`, `peppermint`, `frosting`, `chocolate` + research aliases (`candy-cream`, `gumdrop-mint`, `lightning-lime`, `peppermint-red`, `race-flag-charcoal`, `snow-icing`, `glass-sugar`, `shadow-cocoa`)
- New CSS utilities: `.cookie-card`, `.cinnamon-btn`, `.bolt-btn`, `.gumdrop`, `.speed-stripe`, `.checkered-ribbon`, `.candy-icing-divider`, `.race-shell`, `.gingerbread-shell`, `.race-corner`, `.race-stripe`, `.neon-stat`, `.tach`
- Original SVGs: `LightningBolt`, `GingerbreadApartment`, `GingerbreadTownhome`, `CookieCar`, `WorkVan`
- New `<RaceHero>` (asphalt + neon green + checkered corner + speed stripe) on `/cars` and `/work-vehicles`
- New `<GingerbreadHero>` (warm cream + dashed cookie border + candy ribbon + scalloped icing divider) on `/rentals`, `/apartments`, `/townhomes`
- All original — no Disney/Pixar Cars / NASCAR / "95" / branded assets

### Slice 3 · Listings: 40 rentals + 16 vehicles + 12 work vehicles
- **40 rentals** across LA / OC / SB / Riverside / Ventura tagged to real public operators: Greystar, Irvine Company Apartments, Equity Residential, Essex Property Trust, AvalonBay, Camden, FPI Management, Western National, ConAm, MG Properties, Alliance Residential, Prime Residential, UDR, Decron, Lyon Living
- **16 vehicles** across CarMax (Anaheim + Buena Park), Carvana, AutoNation USA, Driveway, EchoPark — Honda, Toyota, Tesla, Mazda, Ford, Chevy, Jeep, Subaru, Kia, VW, Nissan, BMW, Hyundai
- **12 work vehicles** across U-Haul (3 branches), Penske (2), Enterprise Truck Rental (2), Home Depot (2), Ryder, Budget Truck, Fluid Truck

### Slice 4 · Animated photo galleries
- 3-photo Ken Burns scale + crossfade on every card (180px) and every detail-page hero (340px)
- Free-license CC0 sources via Lorem Picsum (no API key)
- Honors `prefers-reduced-motion` AND the manual "Reduce motion" toggle
- `next.config.mjs` allows `picsum.photos`, `fastly.picsum.photos`, `images.unsplash.com`, `source.unsplash.com`

### Slice 5 · Screening vendor + strictness panel
- New `src/lib/data/screening-stacks.ts` infers vendor + strictness from
  application_platform + manager
- Vendors mapped: Snappt, Yardi ScreeningWorks Pro, Entrata PreciseID, AppFolio Tenant Screening (CoreLogic), RealPage LeasingDesk, TransUnion SmartMove, Plaid Income, CoreLogic Rental Property Solutions
- Operator bumps: Greystar adds Snappt; Equity / Essex / AvalonBay / Camden add Plaid Income; Irvine Company elevates to strict with internal flow
- Card badge (gumdrop) + full panel on every rental detail page

### Slice 6 · Pagination + sort + save heart
- `<Pagination>` (1 2 3 ... ›) on rentals/apartments/townhomes/cars/work-vehicles, 9 per page, auto-resets on filter change
- `<SortDropdown>` (Best fit / Lowest price / Highest price / Newest data) with profile-aware best-fit using the scoring engine
- `<SaveHeart>` peppermint heart on every card, persisted in `useSavedStore` (localStorage)

### Slice 7 · Global search with smart synonyms
- `<SearchBox>` in TopNav with `⌘K` / `Ctrl+K` shortcut, dropdown live results, thumbnails, kind badges, "see all results"
- Cross-entity index over 70+ items (rentals + vehicles + dealers + work vehicles + assistance)
- Synonyms baked in: `LA` ↔ `Los Angeles`, `OC` ↔ `Orange`, `apt` ↔ `apartment`, `th` ↔ `townhome`, `van` ↔ `cargo-van`, `truck` ↔ `box-truck/pickup/flatbed`, `ev` ↔ `electric/tesla`, `greys` ↔ `Greystar`, `irvine` ↔ `Irvine Company`, `cmx` ↔ `CarMax`, `cvn` ↔ `Carvana`
- Standalone `/search` page with kind filter + pagination

### Slice 8 · County assistance + auto hardship + templates
- `/assistance` — verified LA County ERRP (Feb 9 2026 reopen), OCHA forms, Riverside DPSS, San Bernardino court help, statewide CalWORKs, federal CFPB/FTC/BAR — 19 resources
- `<AutoHardshipCard>` (3-state CFPB/FTC/CA BAR) on every car detail page
- `<SourceOfIncomeNotice>` (CRD source-of-income FAQ) + `<AdverseActionPanel>` (FCRA dispute letter generator) on every rental detail page
- `/templates` — printable lease-extension, auto-hardship, county-packet (copy-to-clipboard, .txt download, print-CSS)

### Slice 9 · Open-source provider workarounds
- `CaSosProvider` — California SOS bizfile lookup (deep-link)
- `CaDmvOlProvider` — CA DMV Occupational License lookup (deep-link)
- `YelpFusionProvider` — Yelp Fusion (env-key gated, free tier)
- `NominatimProvider` — OSM geocoding
- `TransitFeedsProvider` — LA Metro / Metrolink / OCTA
- `NhtsaSafetyProvider` — Safety Ratings + Recalls
- `OpenChargeMapProvider` — EV chargers
- `MapPanel` — MapLibre + CARTO Voyager (no Google Maps key required)

### Slice 10 · Deployment conventions (mirrors Crypto Site / TLM / Emailer)
- `DEPLOY.bat` — Windows one-click: stage + commit + push + Netlify deploy
- `netlify.toml` — Crypto Site pattern: NEXT_TELEMETRY_DISABLED, NETLIFY_NEXT_SKEW_PROTECTION, esbuild functions, no-store on `/api/admin/*`
- `DEPLOY_NETLIFY.md` — Crypto Site user-style: "What you'll need / Step 1 / Step 2 / Troubleshooting / Alternative hosts"
- `.github/workflows/netlify-deploy.yml` — TLM pattern: validate → deploy on main, preview on PR with comment URL
- `scripts/validate.mjs` — TLM pattern: file-existence + banned-string + sample-CSV checks before build

### Slice 11 · This document
`CHECKPOINT_2026-04-28.md` (root) covers the full diff and what to do next.
The full file inventory lives in `docs/CHECKPOINT.md`.

---

## 2. Files touched (this session, project root `C:\Users\TKDL\Desktop\CLAUDE\Apartments & Cars\Apartments\lightning-mcgreen-living\`)

**New top-level files:**
- `DEPLOY.bat`, `DEPLOY_NETLIFY.md`, `CHECKPOINT_2026-04-28.md`
- `netlify.toml` (rewritten), `vercel.json`, `LICENSE`, `.prettierrc`, `.eslintrc.json`

**New `docs/`:**
- `DATA_SOURCES.md`, `COMPLIANCE_NOTES.md`, `PRODUCT_SPEC.md`, `UI_THEME_GUIDE.md`, `LAUNCH_CHECKLIST.md`, `API_CONNECTOR_STATUS.md`, `MANUAL_DATA_IMPORT_FORMAT.md`, `SETUP.md`, `DEPLOY.md`, `GITHUB_WORKFLOW.md`, `CHECKPOINT.md`

**New `src/app/` routes:**
- `/`, `/rentals`, `/apartments`, `/apartments/[id]`, `/townhomes`, `/townhomes/[id]`
- `/cars`, `/cars/[id]`, `/dealers/[id]`, `/work-vehicles`, `/work-vehicles/[id]`
- `/life-budget`, `/compare`, `/saved`, `/search`
- `/assistance`, `/templates`, `/data-sources`, `/admin`
- `/privacy`, `/terms`, `/accessibility`, `/offline`, `not-found`, `loading`
- `/api/vin/[vin]`, `/api/admin/import/[kind]`
- `sitemap.ts` (dynamic, includes every detail page)

**New `src/components/`:**
- theme: LightningBolt, GingerbreadHouse, CookieCar, RainingObjects, CheckeredDivider, RaceHero, GingerbreadHero
- ui: CandyCard, Gumdrop, Buttons, Skeleton
- shell: TopNav, BottomNav, Footer, DemoBanner, ReduceMotionToggle, PwaRegister, SearchBox
- common: SourcePanel, FitBadge, PhotoGallery, Pagination, SortDropdown, SaveHeart
- home: TwoDoors, Hero, WhyBetter, LifeBudgetTeaser, TopToggle, GeofenceNotice
- rentals: RentalCard, RentalFilters, ProfilePanel, RentalSearch, RentalDetail, ScreeningPanel
- cars: BuyerProfilePanel, CarCard, PaymentEstimator, VinDecoderPanel, CarSearch, CarDetail, DealerInventory
- work: WorkProfilePanel, WorkVehicleCard, WorkSearch, WorkDetail
- life: LifeBudget
- assistance: AssistanceCard, AutoHardshipCard, SourceOfIncomeNotice, AdverseActionPanel
- templates: LeaseExtensionTemplate, AutoHardshipTemplate, CountyPacketChecklist
- maps: MapPanel
- search: SearchResults

**New `src/lib/`:**
- providers/{base, nhtsa-vpic, fuel-economy, overpass, census-acs, hud-fmr, google-places, manual-csv, partner-stubs, registry, ca-sos, ca-dmv-ol, yelp-fusion, nominatim, transit-feeds, nhtsa-safety, open-charge-map}
- scoring/index, calculators/index, compliance/guards
- geofence/socal, store/compare, search/index, maps/basemap
- data/{photo-sets, real-rentals, real-vehicles, real-work-vehicles, assistance, demo-rentals, demo-vehicles, demo-work-vehicles, screening-stacks}
- utils/cn, config

**New `scripts/`:**
- `push-and-deploy.sh`, `push-and-deploy.ps1`, `validate.mjs`

**New `data/samples/`:**
- `apartments.csv`, `townhomes.csv`, `dealers.csv`, `vehicles.csv`, `work-vehicle-rentals.csv`

**New `.github/`:**
- `workflows/ci.yml`, `workflows/netlify-deploy.yml`, `PULL_REQUEST_TEMPLATE.md`, `ISSUE_TEMPLATE/{bug_report,feature_request}.md`

**No changes to:**
- The original brand do-not list (no Disney/Pixar/NASCAR/Zillow/Cars.com lookalikes)
- Compliance guards (`hasFullSourceMeta`, `isFairHousingSafe`, `ProviderRequiresContractError`)
- The "production mode refuses unverified listings" rule

---

## 3. Deploy steps (in order)

1. **First time only — set up CLIs:**
   ```powershell
   winget install GitHub.cli
   gh auth login
   npm i -g netlify-cli
   netlify login
   ```

2. **Deploy:** double-click `DEPLOY.bat` at the repo root.
   - Stages + commits any pending changes (prompts for message)
   - Pushes to `origin main`
   - Triggers `netlify deploy --prod`

3. **Set Netlify env vars (one-time, after first deploy):**
   - `NEXT_PUBLIC_DATA_MODE=demo` (flip to `production` once real CSV data is in)
   - `NEXT_PUBLIC_GEOFENCE_SOCAL=true`
   - `ADMIN_SHARED_SECRET=<random 32+ chars>`
   - Optional free keys: `CENSUS_API_KEY`, `HUD_API_TOKEN`

4. **Wire continuous deploy via GitHub Actions (optional):**
   - Repo → Settings → Secrets → add `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `ADMIN_SHARED_SECRET`
   - Now every PR gets a preview comment, every push to `main` redeploys

5. **Smoke-test:**
   - Open the live URL in incognito → see homepage, demo banner, search box
   - `/rentals` → paginated cards with photos, screening badges, save hearts
   - `/cars` → race-day theme with asphalt + neon-green lightning hero
   - Search `greystar` or `cargo van burbank` in the nav
   - Visit `/assistance` and `/templates` to confirm overlays render
   - Decode a real VIN at any `/cars/[id]` page

---

## 4. What's NOT done

- **Multi-county expansion.** Right now `/assistance` covers LA / OC / Riverside / SB / Ventura + statewide. Santa Barbara, Kern, Imperial are next.
- **Persistent CSV import.** `/admin` accepts uploads and validates them, but they live in-memory only until a Postgres adapter is wired (Prisma schema already shipped, just needs `DATABASE_URL`).
- **Partner contracts.** All partner stubs (Yardi RentCafe, Entrata, AppFolio, RealPage, Cox, U-Haul, Penske, Ryder) throw `ProviderRequiresContractError` until contracts are signed.
- **Compare drawer UI.** `/compare` page exists, `useCompareStore` is wired, but the floating compare drawer that shows pinned items at the bottom of every page is still TODO.
- **Native maps on detail pages.** `<MapPanel>` is wired into rental detail; not yet on car or work-vehicle detail pages.
- **CSV upload UI on `/admin`.** Endpoint works (`POST /api/admin/import/{kind}`); the form on `/admin` page renders but doesn't yet show the per-row rejection report inline.

---

## 5. When you come back, just say

- `"add Santa Barbara + Kern + Imperial counties"` → 30-min slice
- `"wire compare drawer"` → 45-min slice
- `"add maps to car + work-vehicle detail pages"` → 20-min slice
- `"surface the per-row rejection report inline on /admin"` → 45-min slice
- `"connect Postgres for persistent admin imports"` → 1-hr slice (DATABASE_URL + Prisma migrate)
- `"flip to production mode"` → 5-min after CSV data is in

Theme preserved (gingerbread + race-day, original). 40 real-operator rentals
across 5 counties. 16 real-dealer-chain vehicles. 12 real-provider-chain work
vehicles. Animated photo galleries everywhere. Screening vendor inference,
auto hardship card, county assistance overlay, printable templates. Global
search with smart synonyms. Pagination + sort + save heart on every listing.
Race-day cars page. Deploy automation matching Crypto Site conventions.
Ready to ship.
