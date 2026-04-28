# Data Sources

> Status legend
>
> - ✅ **Live, free, no key** — already wired up, runs out of the box
> - 🔑 **Free with optional key** — works without; key raises rate limit
> - 💼 **Partner / contractual** — placeholder adapter only; no auto-fetch
> - 💰 **Paid** — placeholder adapter only; requires commercial agreement
> - 📥 **Manual import** — CSV upload through `/admin`
> - ❌ **Unavailable** — known to disallow scraping or have no public/partner API
>
> Every listing rendered in the UI carries `source`, `source_url`,
> `confidence_score`, `last_seen_at`, `last_verified_at`, `data_freshness_status`,
> and a `trust label` per `docs/COMPLIANCE_NOTES.md`. **Production mode refuses
> to render listings without these fields.**

---

## 1. Apartment & townhome rental sources

### Aggregators / portals

| Source | Status | Access | Allowed use | Fields | Difficulty | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| Zillow Rental Network / Bridge Interactive | 💼 partner-only | Application + MLS contractual access | Display licensed listings | full listing schema | High | 📥 CSV |
| Apartments.com (CoStar) | 💼 partner-only | Direct partner agreement; no public dev portal for listings | Display licensed listings | full | High | 📥 CSV |
| Rent.com (Redfin/Rent Group) | 💼 partner-only | Partner program | Display licensed listings | full | High | 📥 CSV |
| Realtor.com Rentals (Move) | 💼 partner-only | Partner agreement | Display licensed listings | full | High | 📥 CSV |
| Apartment List | 💼 partner-only | Partner program | Display licensed listings | full | High | 📥 CSV |
| Trulia / HotPads | 💼 via Zillow | Same Zillow ecosystem terms | Same as Zillow | full | High | 📥 CSV |

> All of the above explicitly **disallow scraping** in their ToS. The adapters
> in `src/lib/providers/` are stubs — they will not fetch without a real
> key/contract. See `docs/COMPLIANCE_NOTES.md` §1.

### Property-management platforms (often the *real* application platform)

| Platform | Status | Notes |
| --- | --- | --- |
| Yardi RentCafe / ScreeningWorks | 💼 partner | Many large SoCal communities apply through RentCafe. We can deep-link to a property's RentCafe page when publicly listed. |
| Entrata | 💼 partner | Used by many Class-A communities. Deep-link only. |
| AppFolio | 💼 partner | Common for mid-market. Deep-link only. |
| RealPage / OnSite / Knock | 💼 partner | Common for large operators. Deep-link only. |
| Snappt (income verification) | 💼 partner | Surface "screening vendor" only when publicly disclosed for that property. |

> The app can **observe and label** that a property's public application page
> is hosted on RentCafe / Entrata / AppFolio / RealPage / Knock without an API
> key — the URL pattern is the signal. We display the application platform so
> users know what to expect, but we do **not** call the platform's private API.

### Large SoCal owner-operators (per-property pages, public)

`Greystar`, `Essex Property Trust`, `Irvine Company Apartments`,
`Equity Residential`, `AvalonBay`, `UDR`, `Camden`, `FPI Management`, `ConAm`,
`Alliance Residential`, `MG Properties`, `Western National Property
Management` — **all status 💼 partner / 📥 manual import**. Their public
property pages can be linked to (the user is redirected to the official site to
apply); detailed ingestion requires an explicit feed.

### Open / public data

| Source | Status | Use |
| --- | --- | --- |
| HUD Fair Market Rents API | 🔑 free (token recommended) | "Is this rent within the FMR for the ZIP?" — qualification context only |
| HUD User datasets (CHAS, etc.) | ✅ free | Affordability analysis |
| U.S. Census ACS (api.census.gov) | 🔑 free (key raises limit) | Median income, rent burden, commute time at tract/ZIP |
| California HCD open data | ✅ free | Housing element + production data |
| LA County / City of LA open data (GeoHub) | ✅ free | Zoning, transit, amenities |
| Orange / San Bernardino / Riverside / Ventura County GIS | ✅ free where published | Same |
| LA Metro / OCTA / Metrolink GTFS | ✅ free | Transit score, commute estimates |
| Google Places API | 🔑 paid after free tier | Nearby groceries/schools/gyms — deep amenity layer |
| OpenStreetMap Overpass | ✅ free | Nearby amenities (groceries, schools, transit, hospitals) — default |

### Townhome rental specifics

Townhome rentals are surfaced from the **same** underlying property managers
(Greystar, Irvine Company, Essex, AvalonBay, etc.) plus smaller property
managers. Filter via `unit_type = 'townhouse'` and feature flags
(`private_entrance`, `attached_garage`, `yard_or_patio`, `levels`).

📥 The CSV import format in `docs/MANUAL_DATA_IMPORT_FORMAT.md` covers
townhomes too — operationally this is the most reliable path until partner
contracts are signed.

---

## 2. Car / dealer / financing sources

### Dealer discovery

| Source | Status | Use |
| --- | --- | --- |
| Google Places API | 🔑 paid after free tier | Find dealers by category + city |
| OpenStreetMap Overpass | ✅ free | `shop=car` POIs in SoCal — default fallback |
| Yelp Fusion | 🔑 free tier | Reviews/ratings (limited use; respect ToS) |
| BBB | 💼 / scraping prohibited | Display only manually verified summaries |
| DealerRater | 💼 license required | Same |
| California DMV Occupational Licensing | ✅ public | Verify dealer license number when publicly available |
| California Secretary of State business search | ✅ public | LLC / corporate name lookup; **manual** unless API license is acquired |

### VIN / safety / fuel — government APIs (free)

| Source | Status | Use |
| --- | --- | --- |
| NHTSA vPIC | ✅ free, no key | Decode any VIN; year/make/model/trim, body class, drive type, plant info |
| NHTSA Safety Ratings | ✅ free | NCAP star ratings |
| NHTSA Recalls | ✅ free | Open recalls by VIN |
| FuelEconomy.gov | ✅ free | MPG, fuel cost estimates |
| EPA Green Vehicle Guide | ✅ free | Emissions / efficiency |
| FTC Used Car Buyers Guide | ✅ public rules | Disclosure requirements (we surface the *requirement*, not a doc) |

### Inventory aggregators

| Source | Status | Notes |
| --- | --- | --- |
| Cars.com / Autotrader (Cox Automotive) / CarGurus | 💼 partner | No public dev portal for listings |
| MarketCheck | 💰 paid | Has commercial inventory API |
| Dealer XML/JSON feeds | 💼 dealer-by-dealer | Many dealers will provide a feed under contract |
| 📥 Manual CSV inventory | ✅ supported | Default when partner deals not yet in place |

### "Hidden / less-visible" promos — compliance reframe

The prompt mentions surfacing hidden promos. **Per compliance**, we render only
**publicly-listed** or **manually verified** promos and label every promo as one
of:

- `Publicly verified promo` — present on the dealer's own public page
- `Manager / dealer special` — listed publicly but in a less-visible spot
- `Move-in / zero-down / low-deposit / first-time buyer offer`
- `Needs verification` — surfaced for the user's research, not as fact

We **never** invent promos and we **never** fetch from systems that prohibit it.

---

## 3. Work-vehicle rental sources

### National providers

| Provider | Status | Notes |
| --- | --- | --- |
| Enterprise Truck Rental | 💼 partner | Public site for deep-link; no public API. 📥 CSV otherwise. |
| U-Haul | 💼 partner | Same. |
| Penske Truck Rental | 💼 partner | Same. |
| Budget Truck Rental (Avis) | 💼 partner | Same. |
| Ryder | 💼 partner | Same. |
| Fluid Truck | 💼 partner | App-first; deep-link possible. |
| Fetch | 💼 partner | Same. |
| Home Depot Truck Rental | 💼 partner | In-store; surface store info via Google Places. |
| Lowe's Truck Rental | 💼 partner | Same. |
| Herc / United Rentals | 💼 partner | Vehicle/equipment overlap. |

### Local SoCal providers

Discoverable via Google Places (🔑) or OpenStreetMap (✅ free) using queries
like `"cargo van rental"`, `"box truck rental"`, `"work truck rental"`,
`"commercial vehicle rental"`, `"pickup truck rental"` constrained to the SoCal
geofence box.

📥 Manual CSV is the recommended path for accurate rates / deposit /
mileage / insurance details.

---

## 4. Geofence

Default Southern California bounding box used when filtering all sources:

```
Latitude:   32.50  →  35.30
Longitude: -120.00 → -116.00
```

Plus an explicit allow-list of cities (Northridge, Santa Ana, LA County, OC,
San Bernardino County, Riverside County, Ventura County, Long Beach, Anaheim,
Irvine, Fullerton, Garden Grove, Ontario, Rancho Cucamonga, Fontana, Pomona,
Pasadena, Inglewood, Glendale, Burbank, Costa Mesa, Huntington Beach, plus any
nearby SoCal city inside the bounding box).

Implementation: `src/lib/geofence/socal.ts`.

---

## 5. Per-listing required metadata (production mode)

Every record (apartment, townhome, dealer, vehicle, work-vehicle) MUST carry:

```ts
{
  source: 'official' | 'partner' | 'public-open-data'
        | 'property-or-dealer-website' | 'manual-verified' | 'unverified',
  source_url: string,
  confidence_score: number,        // 0–100
  last_seen_at: ISO8601,
  last_verified_at: ISO8601,
  data_freshness_status: 'live' | 'recent' | 'stale' | 'manual-review-needed',
  trust_label: 'official' | 'partner' | 'public-open-data'
             | 'manual-verified' | 'unverified',
}
```

If any of these are missing, the listing is hidden in production mode.
