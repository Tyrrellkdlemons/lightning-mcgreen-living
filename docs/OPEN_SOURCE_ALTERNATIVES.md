# Open-Source / Free Alternatives to Partner-Only Providers

Until partner contracts unlock, every "absent" provider has a defensible
free alternative or workaround. This doc maps each one.

> Rule (per `docs/COMPLIANCE_NOTES.md §1`): **no scraping** of any source whose
> ToS prohibits it. Every alternative below is either an official public API,
> public open-data, or an explicitly user-driven action (Google search,
> manual click-through).

---

## Listing aggregators

### Zillow Group / Bridge Interactive · Apartments.com (CoStar) · Rent.com · Realtor.com · Apartment List · Trulia · HotPads
**Workaround now:**
- **HUD User datasets** (FMR, HUDS, CHAS) — affordability anchors. Free token. Already wired.
- **U.S. Census ACS** — area-level rent / income / tenure / commute.
  Already wired.
- **California HCD open data + city-of-LA GeoHub** — affordable housing
  project lists, zoning, building permits. Public. Add as need.
- **Direct operator websites** — every major SoCal operator (Greystar, Irvine
  Company, Equity, Essex, AvalonBay, Camden, FPI, Western, ConAm, MG,
  Alliance) publishes their own property lists. We deep-link these via
  `pickLeasingPortal()` in `src/lib/links/leasing-portals.ts`.
- **RentCafe public city search** — works without partner status; we use it.
- **Google site-search shortcut** — `site:rentcafe.com "<property>" <city>`
  for property-name-specific resolution. Already wired in
  `propertySiteSearchUrl()`.
- **CSV import via /admin** — operator-provided property feeds dropped here
  bypass aggregator dependencies entirely.

### Cars.com · Autotrader · CarGurus · Cox Automotive · MarketCheck
**Workaround now:**
- **NHTSA vPIC** — VIN decode (real, free, no key). Already wired.
- **NHTSA Safety Ratings + Recalls** — real safety + recall lookup. Already wired.
- **FuelEconomy.gov** — real MPG + annual fuel cost. Already wired.
- **Direct dealer chain sites** — CarMax, Carvana, AutoNation USA, Driveway,
  EchoPark publish public inventory + financing pages. We deep-link these.
- **CARS.gov / DOT used-car safety guides** — official disclosure
  references. Surface as inline guidance.
- **CSV import via /admin** — dealer-provided inventory feeds bypass
  aggregator dependencies.

---

## Property-management leasing APIs

### Yardi RentCafe / ScreeningWorks · Entrata · AppFolio · RealPage / Knock
**Workaround now:**
- **Application platform inference** — we observe the PUBLIC URL pattern of
  each property (RentCafe vs Entrata vs AppFolio vs RealPage vs Knock) and
  surface the platform name + a screening-strictness flag (green/yellow/
  orange/red) so users know what they're walking into.
- **CRD source-of-income FAQ** — California prohibits "no Section 8"
  rejections. We surface this notice on every rental detail page.
- **FCRA adverse-action helper** — if a screening report drives a denial,
  applicants have a right to the report and to dispute. Real letter
  generator shipped.
- **Public knowledge of vendor stacks** — Greystar publicly references
  Snappt; Equity / Essex / AvalonBay / Camden publicly reference Plaid
  Income; etc. We cite these in `src/lib/data/screening-stacks.ts`.

### Snappt Enterprise (income document fraud detection)
**Workaround now:**
- **Plaid Income (live)** — operator-side, but applicants can pre-prepare a
  Plaid-ready bank account if they know Plaid will be used.
- **Direct from employer** — request originals on company letterhead;
  income-doc fraud detection cannot challenge a verifiable letterhead from
  a real employer with a verifiable phone number.
- **Inline "documents to prepare" panel** — we tell users which docs the
  property's vendor stack will scrutinize most.

---

## Work-vehicle reservation APIs

### U-Haul · Penske · Enterprise Truck · Budget · Ryder · Fluid · Home Depot Truck
**Workaround now:**
- **Direct provider site links** — every chain has a public branch + reservation
  flow. We deep-link to the branch page, vehicle-class page, or provider-wide
  search.
- **OpenStreetMap Overpass** — `amenity=car_rental` POIs near the user's
  pickup city. Already wired.
- **Google Places (env-key gated)** — supplements OSM with ratings + photos
  if a key is set. Optional.
- **CSV import** — local rental providers (non-chain) drop their own data
  via the /admin CSV.

---

## Optional paid layers

### Google Places
**Free alternative:** OpenStreetMap Overpass + Nominatim. Already wired.
Covers nearby amenities, geocoding, dealer + work-rental discovery.

### Google Maps
**Free alternative:** MapLibre GL JS + open/default basemaps already wired in
`<MapPanel>`:
- CARTO Voyager (street)
- CARTO Dark Matter (dark)
- Esri World Imagery (satellite)
- USGS Imagery Only (satellite)

Optional keyed satellite providers are also supported:
- MapTiler satellite via `NEXT_PUBLIC_MAPTILER_API_KEY`
- Mapbox satellite via `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

### Yelp Fusion
**Free alternative:** Reviews are not strictly necessary for the use case
(we surface the dealer's CA DMV license + LLC + Google rating instead).
When we want them: BBB Business Profiles (free for nonprofits/journalism;
review per use case), or social-proof aggregation via direct site reviews
displayed with proper attribution.

---

## Free open-data sources we already use

| Source | Use |
|---|---|
| NHTSA vPIC | VIN decode |
| NHTSA Safety Ratings | NCAP star ratings |
| NHTSA Recalls | Open recalls by VIN/make/model/year |
| FuelEconomy.gov | MPG + emissions + annual fuel cost |
| U.S. Census ACS 5-year | Area income / rent / commute |
| HUD Fair Market Rents | County rent benchmarks |
| HUD User CHAS | Comprehensive housing affordability data |
| OpenStreetMap Overpass | Amenities / dealers / rentals near a point |
| OpenStreetMap Nominatim | Geocoding |
| CARTO Voyager basemap | Map tiles |
| Open Charge Map | EV chargers |
| LA Metro / Metrolink / OCTA GTFS | Transit feeds |
| LA County GeoHub / HCD open data | Local housing data |
| CA Secretary of State bizfile | LLC / entity verification (manual deep-link) |
| CA DMV Occupational License Lookup | Dealer license verification (manual deep-link) |
| FTC + CFPB + DFPI + CA BAR | Consumer protection guidance + complaint paths |
| CDSS CalWORKs Housing Support | State rental assistance |
| LA County DCBA Emergency Rent Relief | Direct county program |
| OCHA / Riverside DPSS / SB Court | County-specific resources |

Every one of these is referenced in `docs/DATA_SOURCES.md`.

---

## Summary: what's possible without partner contracts

- ✅ Verified VIN decode + safety + recalls + MPG (real, live, free)
- ✅ Area income / rent / commute context (Census + HUD)
- ✅ Real maps (MapLibre + CARTO, no key)
- ✅ Real apply links via the operator's own portal or RentCafe city search
- ✅ Screening transparency from public knowledge (vendor stacks)
- ✅ Real FCRA / source-of-income / adverse-action paths
- ✅ Real auto hardship paths (CFPB / FTC / CA BAR / DFPI)
- ✅ Real rental assistance overlays (LA / OC / Riverside / SB / Ventura / state / federal)
- ✅ Real dealer + provider chain deep-links
- ✅ Real legal templates (lease extension / auto hardship / county packet)
- ✅ Manual CSV import for any partner-feed data the user has access to

- ❌ Live unit-level apartment availability + pricing → needs Zillow/Apartments.com partner OR operator API
- ❌ Live VIN-specific dealer inventory → needs Cars.com/Cox/MarketCheck partner OR dealer feed CSV
- ❌ Live work-vehicle reservation → needs U-Haul/Penske/Enterprise/etc. partner OR provider feed CSV
- ❌ Active screening report on file with the property's vendor → only after the user starts an application

Bottom line: **everything except "is this specific unit available right now"
and "is this specific VIN in stock right now"** can be answered with the
free / open / public sources we already use. The two missing pieces only
unlock with partner contracts.
