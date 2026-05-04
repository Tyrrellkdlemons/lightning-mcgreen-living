# Lightning McGreen Living — Checkpoint · 2026-04-28 (pre exact-links)

> 🟢 **DEPLOYED**, build green after duplicate-key fix.
> Live: <https://lightning-mcgreen-living.netlify.app>
> Repo: <https://github.com/Tyrrellkdlemons/lightning-mcgreen-living>
> Last successful deploy: post `fix: spread-first pattern in real-* data + as const`.

This snapshot freezes the project right before the **L upgrade**:
exact-listing + direct-application/finance-link system + x10 theme polish.
Use this file to roll back if the next slice goes sideways.

---

## 1. State at this checkpoint

### Routes (live)
- `/` homepage with two doors + Life Budget teaser + assistance hub promo
- `/rentals`, `/apartments`, `/townhomes` (+ `/[id]` detail) — paginated, sortable, save heart, screening badge, photo gallery
- `/cars`, `/cars/[id]`, `/dealers/[id]` — race-day hero, payment estimator, VIN decoder, auto hardship card
- `/work-vehicles`, `/work-vehicles/[id]` — race-day hero, cost calculator, job-to-vehicle matcher
- `/life-budget`, `/compare`, `/saved`, `/search`
- `/assistance` (LA/OC/Riverside/SB/Ventura + statewide + federal)
- `/templates` (lease ext, auto hardship, county packet — printable)
- `/data-sources`, `/admin`, `/privacy`, `/terms`, `/accessibility`, `/offline`
- `/api/vin/[vin]`, `/api/admin/import/[kind]`, `sitemap.ts` covers all detail pages

### Listings
- **40 rentals** across LA/OC/SB/Riverside/Ventura tagged to real public operators (Greystar, Irvine Company, Equity, Essex, AvalonBay, Camden, FPI, Western, ConAm, MG, Alliance, Decron, UDR, Prime, Lyon)
- **16 vehicles** across CarMax / Carvana / AutoNation / Driveway / EchoPark
- **12 work vehicles** across U-Haul / Penske / Enterprise / Home Depot / Ryder / Budget / Fluid

### Components in place
- Animated 3-photo Ken Burns + crossfade gallery on every card and detail hero
- Screening vendor inference (Snappt/Yardi/Entrata/AppFolio/RealPage/TransUnion/Plaid/CoreLogic) with strictness badge + full panel
- Global SearchBox with smart synonyms in TopNav (⌘K), `/search` standalone page
- Pagination (1 2 3 ...) on every listing page (9 per page)
- SortDropdown (best fit / price asc / price desc / newest)
- SaveHeart (peppermint, persisted in `useSavedStore`)
- GingerbreadHero (rentals) + RaceHero (cars/work) — original, no protected assets
- MapLibre + CARTO Voyager (no Google Maps key required) on rental detail
- AutoHardshipCard (CFPB/FTC/CA BAR/DFPI) on car detail
- SourceOfIncomeNotice + AdverseActionPanel on rental detail
- Printable Lease-Extension / Auto-Hardship / County-Packet templates

### Providers wired
- Live, no key: NHTSA vPIC, FuelEconomy.gov, OSM Overpass, U.S. Census ACS, HUD FMR, Nominatim, NHTSA Safety + Recalls, Open Charge Map, SoCal Transit Feeds
- Manual-link: CA SOS bizfile, CA DMV Occupational License Lookup
- Env-key gated: Google Places, Yelp Fusion
- Partner stubs (throw on call): Zillow Bridge, Apartments.com, Rent.com, Yardi RentCafe, Entrata, AppFolio, RealPage, Cars.com, Autotrader, CarGurus, MarketCheck, U-Haul, Penske, Budget Truck, Enterprise Truck, Ryder, Fluid Truck, Home Depot Truck

### Deploy plumbing (mirrors CLAUDE/Crypto Site + TLM + Emailer)
- `DEPLOY.bat` Windows one-click
- `netlify.toml` with NEXT_TELEMETRY_DISABLED, NETLIFY_NEXT_SKEW_PROTECTION, esbuild functions, no-store on `/api/admin/*`
- `DEPLOY_NETLIFY.md` user-friendly step-by-step
- `.github/workflows/netlify-deploy.yml` validate → deploy on main, preview on PR with comment URL
- `scripts/validate.mjs` static checks (banned strings, sample CSVs, registry stability)

### Modes
- `NEXT_PUBLIC_DATA_MODE=demo` (Netlify build env)
- `NEXT_PUBLIC_GEOFENCE_SOCAL=true`
- `NODE_VERSION=20`

---

## 2. Why this checkpoint exists

The **L upgrade** introduces a wide schema change (every listing gets a
direct-application link, finance link, or reservation link with confidence
labels and verification timestamps), plus a 10× theme polish. Both are
additive but they touch many files. If the upgrade regresses anything,
revert to this commit and start a clean slice.

---

## 3. Rollback recipe

If the next deploy fails or breaks behavior, run:

```powershell
cd "C:\Users\TKDL\Desktop\CLAUDE\Apartments & Cars\Apartments\lightning-mcgreen-living"
git log --oneline -n 5                           # find this checkpoint's hash
git revert <bad-commit-hash>
git push origin main                             # Netlify auto-rebuilds
```

The repo's GitHub Actions `validate` job will catch most regressions before
they ship to Netlify.

---

## 4. Up next (L upgrade — being applied right after this file is saved)

### A. Theme x10 (preserves brand do-not list)
- Tire-tread divider, race-flag-checker corner badge, RPM-gauge stat widget
- Neon-stripe hover, pit-lane LED row, animated speed-ticker
- Original numbered race pad (NOT "95")
- Frosting-drip card edge, candy-cane corner stripe
- Animated chimney smoke puff, gumdrop-rain hero overlay
- Embossed cookie texture, more elaborate gingerbread row silhouette

### B. Exact-listing + direct-link system (per L spec)
- Extend `RentalListing` / `VehicleListing` / `WorkVehicleRental` schema with
  exact unit / VIN / branch link fields + confidence labels
- Add `LinkResolver` priority resolver
- Add `LinkConfidenceBadge` UI on every card
- Add inline **Application Prep Packet**, **Car Finance Prep Packet**,
  **Work Vehicle Rental Prep Packet** on every detail page
- Add **External Redirect Screen** with the exact spec wording
- Update real-* seed data with the closest publicly available links + correct
  confidence labels (no fakes)

### C. Admin verification tools
- Endpoints to check listing/unit/application/dealer-vehicle/finance/reservation
  URL status
- Stale-link detection
- Manual-verification mark + notes + timestamps

---

## 5. When you come back, just say
- `"L upgrade complete — verify"` → I'll smoke-test direct links across every kind
- `"L upgrade is wrong, roll back"` → I'll cut a revert PR back to this checkpoint
- `"add Santa Barbara + Kern + Imperial"` → continue assistance overlay
- `"connect Postgres for persistent CSV imports"` → Prisma migrate slice

Theme preserved. Listings tagged to real public operators. Honest source
labels everywhere. Ready to layer the L upgrade.
