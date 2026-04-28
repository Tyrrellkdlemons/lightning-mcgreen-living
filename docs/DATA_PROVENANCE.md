# Data Provenance — what's real, what's sample, what's missing

> Demo-mode banner has been removed. Read this doc instead so you know
> exactly which parts of the live site are real, which are stylized samples,
> and which need partner contracts to enable.

Updated 2026-04-28.

---

## ✅ Real, production-grade infrastructure (no replacement needed)

These run against real APIs / real reference data. Anything you see in the
UI from these sources is verifiable and current.

### Government APIs (free, no key required)
- **NHTSA vPIC** — `/api/vin/[vin]` decodes any 17-char VIN against the real
  NHTSA database (year/make/model/trim/body class/drive type/fuel type/
  manufacturer/plant country). Live.
- **NHTSA Safety Ratings + Recalls** — real NCAP data + recall lookups.
- **FuelEconomy.gov** — real MPG / annual fuel cost by year/make/model.
- **U.S. Census ACS 5-year** — real median income / median rent at the ZCTA
  level. Used as area-context badges.
- **HUD Fair Market Rents** — real FMR by county. Used as affordability
  context.
- **OpenStreetMap Overpass** — real nearby groceries / schools / transit /
  hospitals / gyms by lat/lng radius.
- **OSM Nominatim** — real US geocoding.
- **CARTO Voyager** map basemap — real street maps powering `<MapPanel>`
  and the "neighborhood" slide on every listing card.
- **Open Charge Map** — real EV charging POIs.
- **SoCal transit feeds** — real GTFS references for LA Metro / Metrolink /
  OCTA.

### California public lookups (free, deep-link based)
- **CA Secretary of State bizfile** — real entity-name lookup deep-links
  surfaced on dealer cards.
- **CA DMV Occupational License lookup** — real license verification
  deep-links.

### County + state + federal assistance overlay (real, verified 2026-04-28)
- **LA County Emergency Rent Relief Program** — reopened 2026-02-09;
  application_url, phone, printable PDFs all real.
- **LA County Development Authority Housing Search**, **Stay Housed L.A.** — real.
- **Orange County Housing Authority** documents + forms hub — real.
- **211 Orange County** — real helpline.
- **Santa Ana Rent Stabilization** — real.
- **Riverside County DPSS Housing Support** + Housing Authority + Inland
  Counties Legal Services — real.
- **San Bernardino County CDH** + Housing Authority + Superior Court Tenant
  Assistance — real.
- **California CalWORKs Housing Support** — real.
- **California Tenants' & Landlords' Rights guide** (DRE) — real PDF.
- **California CRD source-of-income FAQ** — real PDF.
- **CFPB auto loan hardship guidance** — real.
- **FTC car loans + repossession-rescue scam guidance** — real.
- **California Bureau of Automotive Repair Consumer Assistance Program** — real.
- **California DFPI complaint pathway** — real.
- **FTC landlord consumer-reports guidance** — real.

### Legal templates (based on real federal/state guidance)
- Lease extension / payment plan request letter
- Auto-loan hardship request letter
- County assistance packet checklist
- FCRA adverse-action dispute letter generator

### Compliance / scoring (production-grade)
- Qualification fit scoring (apartment, vehicle, work vehicle) — explainable,
  never uses protected attributes.
- Move-in cost calculator, payment estimator, work-rental cost calculator.
- Source-of-income notice for California renters (CRD-aligned).
- Auto hardship 3-state card (CFPB / FTC / CA BAR / DFPI).
- Screening vendor inference (Snappt / Yardi ScreeningWorks / Entrata
  PreciseID / AppFolio TS / RealPage LeasingDesk / TransUnion SmartMove /
  Plaid Income / CoreLogic) — based on publicly known operator tech stacks.

### Deploy + verification infrastructure
- Admin link verifier (`/admin/verify`) — real HEAD probes against any URL,
  with scrape-blocked-host filter per `docs/COMPLIANCE_NOTES.md §1`.
- CSV import endpoints + Zod validation — real, ready for real CSVs.
- GitHub Actions CI + Netlify deploy + brand/Fair-Housing scan — real.

### Apply / finance / reservation deep-links
- **Apartment apply links** — for RentCafe-platform operators (Greystar, FPI,
  ConAm, Western National, Alliance, Decron, MG, Prime, Lyon) the apply
  button goes to the **real public RentCafe city search** at
  `https://www.rentcafe.com/apartments-for-rent/us-california/{city}/`.
  For in-house portal operators (Equity, Essex, AvalonBay, Camden, Irvine
  Company, UDR, Decron) the apply button goes to their real city / property
  search.
- **Dealer pages** — every dealer card links to the real chain site
  (CarMax, Carvana, AutoNation USA, Driveway, EchoPark).
- **Work vehicle provider pages** — every card links to the real provider
  site (U-Haul, Penske, Enterprise Truck Rental, Home Depot Truck Rental,
  Ryder, Budget Truck, Fluid Truck).

---

## ⚠ Real tagging + sample data (need real CSVs to make literal)

These are tagged to **real public operator chains** in **real SoCal cities**,
but the specific property/unit/VIN/stock + pricing is a stylized sample
that needs replacement with real data. The /admin CSV upload exists for
exactly this — drop a real CSV and these get replaced.

### 40 apartment + townhouse listings
| What's real | What's sample |
|---|---|
| Operator name (Greystar, Irvine Company, Equity Residential, Essex, AvalonBay, Camden, FPI, UDR, Decron, Western National, ConAm, MG, Alliance, Prime, Lyon) | The specific property name (e.g. "MODA at Northridge Walk", "Wilshire La Brea-style Highrise") — stylized, NOT literal |
| City + county + ZIP + lat/lng | Address line is a "corridor" reference, not a literal street number |
| Application platform inferred from operator (RentCafe / Entrata / AppFolio / RealPage / Knock / In-house) | Specific unit availability, exact rent, exact deposit |
| Apply URL (RentCafe city search OR operator portal) | Pet fee, parking fee, application fee, admin fee |
| Screening-vendor stack (correct for the operator) | Move-in specials |

**To replace with real specifics**: drop a CSV with the schema in
`docs/MANUAL_DATA_IMPORT_FORMAT.md §1–2` into `/admin` → the CSV import
endpoint validates + ingests them.

### 16 vehicle listings
| What's real | What's sample |
|---|---|
| Dealer chain name (CarMax, Carvana, AutoNation USA, Driveway, EchoPark) | Specific store inventory at that named dealer |
| VIN format (17 chars, valid pattern; decodes via NHTSA vPIC) | Whether that VIN is actually in stock today |
| Year / make / model / trim / mileage shape | Exact price, exact APR, exact down payment |
| Body type → SVG illustration shape | Specific stock number |
| Brand color hint on the SVG | The dealer's current promo |
| Dealer city + lat/lng → real neighborhood map | |

**To replace**: dealer feed CSV per `docs/MANUAL_DATA_IMPORT_FORMAT.md §3–4`.

### 12 work-vehicle rental listings
| What's real | What's sample |
|---|---|
| Provider chain (U-Haul, Penske, Enterprise Truck Rental, Home Depot, Ryder, Budget Truck, Fluid Truck) | Branch-specific availability today |
| Branch city + lat/lng → real neighborhood map | Exact daily / weekly / monthly rate (ballpark only) |
| Vehicle type (cargo van / box truck / pickup / etc.) | Mileage fee per mile |
| Provider site (real chain site) | Insurance per day |

**To replace**: work-vehicle CSV per `docs/MANUAL_DATA_IMPORT_FORMAT.md §5`.

### Photos
| What's real | What's sample |
|---|---|
| The neighborhood-map slide on every card (real CARTO tile of actual lat/lng) | Slides 1 & 3 — stylized SVG illustrations matching listing TYPE (apartment / townhome / sedan / SUV / pickup / cargo van / etc.), brand-color-hinted, never an actual photo of the literal property/vehicle |
| Optional `_insertimages/` LA-skyline backgrounds (whatever you drop there) | |

We never hotlink real property/dealer photos without rights. If you want
real photos per listing, drop them in `_insertimages/` (rotates as page
background) or extend the CSV to include `photo_url` columns sourced from
the operator with permission.

---

## ❌ Absent — needs partner contracts to enable

These are the stub adapters that throw `ProviderRequiresContractError` until
you sign the partner agreement. The UI surfaces "Provider not yet connected
— using manual import / public data instead" when this happens.

### Listing aggregators (all explicitly disallow scraping in their ToS)
- Zillow Group / Bridge Interactive
- Apartments.com (CoStar)
- Rent.com (Redfin / Rent Group)
- Realtor.com Rentals (Move)
- Apartment List
- Trulia / HotPads
- Cars.com / Autotrader / CarGurus / Cox Automotive
- MarketCheck (paid inventory API)

### Property-management / leasing platform APIs (partner)
- Yardi RentCafe / ScreeningWorks (would unlock direct application + screening readouts)
- Entrata (would unlock VOI + PreciseID readouts)
- AppFolio Stack APIs
- RealPage LeasingDesk
- Knock CRM
- Snappt Enterprise (income document fraud)

### Work-vehicle rental APIs (partner)
- U-Haul, Penske, Budget Truck, Enterprise Truck, Ryder, Fluid Truck, Home Depot Truck

### Optional paid layers
- Google Places (env-key gated; key provides nearby amenity + dealer rating coverage)
- Google Maps (replace MapLibre/CARTO if you prefer)
- Yelp Fusion (env-key gated; provides review counts/ratings)

---

## How the app behaves now (post demo-mode removal)

1. **No red banner at the top of every page.** Gone.
2. **Compliance guard `publishable()` still runs in production mode.** It
   filters out any listing missing required source metadata (source,
   source_url, last_seen_at, last_verified_at, data_freshness_status,
   trust_label, confidence_score). Today every shipped listing has all 7
   fields, so nothing is filtered.
3. **`trust_label` on every card is honest.** Currently `'unverified'`
   for the sample listings. After you import a real CSV with
   `trust_label: 'manual-verified'` or `'partner'`, the per-card source
   badge updates accordingly. Users see exactly how confident the data is.
4. **Apply / finance / reservation links** route to real platforms (RentCafe
   / dealer chain sites / provider sites) via the `LinkResolver`.
5. **All assistance overlays, calculators, scoring, hardship cards,
   templates, and adverse-action helpers** are real production features
   based on real federal/state guidance. They were never demo.

If you want the banner back: set Netlify env
`NEXT_PUBLIC_DATA_MODE=demo` (no rebuild needed if you redeploy).
