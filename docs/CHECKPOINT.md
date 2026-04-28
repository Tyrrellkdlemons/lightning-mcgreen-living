# Build Checkpoint — 2026-04-28

> 🟢 **DEPLOYED 2026-04-28 01:31** — live at
> <https://lightning-mcgreen-living.netlify.app>
> Repo: <https://github.com/Tyrrellkdlemons/lightning-mcgreen-living>
> First production deploy: `main@3091373` (Published in 8.9s).
> Continuous deploy on every push to `main`.
> See [`/CHECKPOINT_2026-04-28.md`](../CHECKPOINT_2026-04-28.md) for the
> deploy-state snapshot.

---

# Build inventory — 2026-04-28

This file is a snapshot of what is built so future work can resume cleanly.

## Project name & site name
**Lightning McGreen Living** — original SoCal rentals + cars + work-vehicle
discovery platform with a green-lightning gingerbread racing theme. Not
affiliated with Disney/Pixar Cars, NASCAR, Zillow, Apartments.com, Rent.com,
Cars.com, Autotrader, CarGurus, or any property manager / dealer / rental
provider.

## What's shipped (Phase 1–8 + addendum)

### Documentation (`docs/`)
- `README.md`, `LICENSE` (MIT + non-affiliation notice), `SETUP.md`, `GITHUB_WORKFLOW.md`
- `DATA_SOURCES.md` — exhaustive provider matrix
- `COMPLIANCE_NOTES.md` — Fair Housing, FCRA, scraping, source-of-income, brand
- `PRODUCT_SPEC.md`, `UI_THEME_GUIDE.md`, `LAUNCH_CHECKLIST.md`
- `API_CONNECTOR_STATUS.md` — per-provider live/partner/paid/unavailable
- `MANUAL_DATA_IMPORT_FORMAT.md` — CSV column schemas
- `CHECKPOINT.md` (this file)

### Routes
- `/` — homepage with two doors + top toggle + Life Budget teaser + WhyBetter
- `/rentals`, `/apartments`, `/townhomes`, `/apartments/[id]`, `/townhomes/[id]`
- `/cars`, `/cars/[id]`, `/dealers/[id]`
- `/work-vehicles`, `/work-vehicles/[id]`
- `/life-budget`, `/compare`, `/saved`
- `/data-sources`, `/admin`, `/privacy`, `/terms`, `/accessibility`
- `/offline`, `not-found`, `loading`
- `/api/vin/[vin]` — NHTSA vPIC server route
- `/api/admin/import/[kind]` — CSV import server route

### Design system
- Tailwind palette: `lightning`, `gingerbread`, `caramel`, `peppermint`,
  `frosting`, `chocolate`
- Custom CSS: cookie-card, cinnamon-btn, bolt-btn, gumdrop, speed-line,
  asphalt-strip, candy-stripe, checkered, skel
- Original SVGs: `LightningBolt`, `GingerbreadApartment`,
  `GingerbreadTownhome`, `CookieCar`, `WorkVan`
- Performance-controlled raining objects (CSS transforms only;
  `prefers-reduced-motion` + manual toggle both honored)

### Live, free, no-key providers
| File | Source | Endpoint |
| --- | --- | --- |
| `nhtsa-vpic.ts` | NHTSA vPIC | `/api/vehicles/DecodeVin/{vin}?format=json` |
| `fuel-economy.ts` | FuelEconomy.gov | `/ws/rest/vehicle/menu/options` + `/ws/rest/vehicle/{id}` |
| `overpass.ts` | OSM Overpass | nearby amenities + dealers + work-vehicle rentals |
| `census-acs.ts` | U.S. Census ACS 5-yr | `B19013_001E`, `B25064_001E` by ZCTA |
| `hud-fmr.ts` | HUD Fair Market Rents | `/hudapi/public/fmr/data/{cbsa}` |
| `manual-csv.ts` | Admin CSV import | Zod-validated, geofence-checked |

### Env-key gated
- `google-places.ts` — gracefully empty when key missing

### Partner/paid stubs (throw `ProviderRequiresContractError`)
- Zillow Bridge, Apartments.com, Rent.com, Yardi RentCafe, Entrata, AppFolio,
  RealPage, Cars.com, Autotrader, CarGurus, MarketCheck, U-Haul, Penske,
  Budget Truck, Enterprise Truck, Ryder, Fluid Truck, Home Depot Truck

### Scoring + calculators
- `scoreRental` — apartment + townhome (rent-to-income, multiplier, move-in,
  location, pet/parking, app readiness, fee burden, freshness)
- `scoreVehicle` — price, monthly, down, credit range, fuel, mileage,
  dealer transparency, freshness
- `scoreWorkRental` — rate, deposit, vehicle-to-job match, insurance,
  business account, mileage, freshness
- `calcMoveInCost`, `calcAffordability`, `calcRequiredIncome`
- `calcPaymentEstimate`, `calcRequiredDownForMonthly`, `calcTotalMonthlyCarCost`
- `calcWorkRentalCost` (daily/weekly/monthly + mileage + insurance)

### Compliance guards (`src/lib/compliance/guards.ts`)
- `ProviderRequiresContractError`
- `hasFullSourceMeta` + `publishable<T>()`
- `isFairHousingSafe` text scrubber

### State
- Zustand stores: `useCompareStore` (up to 8 items), `useSavedStore`
- LocalStorage profiles: renter, buyer, work-rental

### PWA
- `public/manifest.json` (4 shortcuts), `public/service-worker.js`
  (network-first navigations + offline fallback + cache-first assets)
- `PwaRegister` client component
- `/offline` fallback route

### GitHub workflow
- `.github/workflows/ci.yml` (lint+typecheck+build + brand & Fair-Housing scan)
- `.github/PULL_REQUEST_TEMPLATE.md` (compliance checklist)
- `.github/ISSUE_TEMPLATE/{bug_report,feature_request}.md`

### Database
- `prisma/schema.prisma` mirrors all types (Postgres + PostGIS)

### Sample data
- `data/samples/{apartments,townhomes,dealers,vehicles,work-vehicle-rentals}.csv`

## Addendum (this session, after research)

The deeper research pass identified high-value additions that preserve the
theme + functionality and add significant user value. The addendum builds:

### Open-source workarounds (wired into `registry.ts`)
- `CaSosProvider` — California Secretary of State bizfile (manual lookup
  link + helper to resolve dealer/owner LLC names)
- `CaDmvOlProvider` — California DMV Occupational License lookup (verifies
  dealer license status; deep-links public lookup)
- `YelpFusionProvider` — Yelp Fusion review surface (free tier, env-key gated)
- `CartoBasemapStyle` — CARTO Voyager / OSM-Liberty open vector tiles
  (no Google Maps key required)

### County assistance overlay (`src/lib/data/assistance.ts` + `/assistance`)
- LA County Emergency Rent Relief Program (Feb 9, 2026 reopening) +
  printable tenant/landlord guides
- Orange County Housing Authority — current 2026 payment standards + utility
  allowance + voucher forms; Santa Ana tenant-rights workshops
- Riverside County DPSS Housing Support / CalWORKs path + Riverside Legal Aid
- San Bernardino County housing-rental resources + court-linked
  tenant-landlord assistance
- Statewide CalWORKs Housing Support + CA Tenants' Guide + HCD grants

### Auto-loan hardship flow
- Three-state hardship card: lender talk (CFPB), repossession-rescue scam
  warning (FTC), Bureau of Automotive Repair Consumer Assistance Program
- DFPI complaint route

### Source-of-income compliance
- CRD source-of-income FAQ surfaced inline on rental pages
- FTC adverse-action workflow doc + `AdverseAction` record type

### Printable templates (`/templates`, print-CSS)
- Lease Extension / Payment Plan letter
- Auto-loan hardship letter
- County assistance packet checklist

### Theme polish (additive — no breaking changes)
- New token aliases per research: `--bg-candy-cream`, `--roof-cookie`,
  `--gumdrop-mint`, `--lightning-lime`, `--peppermint-red`,
  `--race-flag-charcoal`, `--snow-icing`, `--glass-sugar`, `--shadow-cocoa`
- Candy-icing dividers added to homepage
- Checkered-ribbon nav accent on saved & compare drawers

### MapLibre map module
- `MapPanel` component lazy-loaded on detail pages
- Free CARTO Voyager basemap (no key required)
- Dealer / property markers with custom gingerbread/lightning icons

### Deploy automation
- `netlify.toml` for one-click Netlify deploy
- `vercel.json` for one-click Vercel deploy
- `scripts/push-and-deploy.sh` (gh + netlify CLI)

## What's intentionally NOT in this build

Documented in `docs/COMPLIANCE_NOTES.md` and `docs/DATA_SOURCES.md`:

- No scraping of Zillow / Apartments.com / Rent.com / Cars.com / Autotrader / CarGurus
- No CAPTCHA bypass
- No SSN or full bank credential collection
- No auto-submission of applications, finance forms, or rental reservations
- No "guaranteed approval" claims
- No filtering by Fair Housing protected characteristics
- No use of any Disney/Pixar Cars / NASCAR / Zillow / Cars.com asset

## Resume points

If a future session needs to continue:

1. **More counties**: Ventura, Santa Barbara, Kern, Imperial — same shape as
   LA/OC/Riverside/SB in `src/lib/data/assistance.ts`.
2. **Real Postgres**: run `npx prisma migrate dev` after setting `DATABASE_URL`.
3. **Partner contracts**: when a contract is approved (Yardi, Entrata,
   AppFolio, Cox, etc.), replace the stub in
   `src/lib/providers/<id>.ts` with the real adapter. Registry stays the same.
4. **Chrome MCP / desktop control**: not used in this checkpoint pass — the
   build is purely file-based. To deploy, follow `docs/SETUP.md` §8 or run
   `scripts/push-and-deploy.sh` once `gh` and `netlify` CLIs are configured.
