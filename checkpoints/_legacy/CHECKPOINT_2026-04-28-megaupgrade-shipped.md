# Lightning McGreen Living — Checkpoint · 2026-04-28 (megaupgrade shipped)

> 🟢 Direct-links + expanded inventory + screening-as-redline + alternatives doc shipped.

## What this slice added
- **`propertySiteSearchUrl()`** in `src/lib/links/leasing-portals.ts` — Google site-search shortcut so users land on the SPECIFIC property page on RentCafe/operator sites instead of just a city search.
- **28 vehicles** (up from 16) — added Honda Accord, Toyota Corolla, Tesla Model Y, Ford Mustang, Chevy Equinox, Nissan Altima, Jeep Grand Cherokee, Mazda3, Hyundai Elantra, Kia Forte, VW Tiguan, BMW X3 across CarMax / Carvana / AutoNation / Driveway / EchoPark.
- **ScreeningPanel — RED/ORANGE/YELLOW/GREEN flag treatment** with explicit "could redline you" warnings per strictness level. Highlights why each vendor matters (Snappt = income-doc fraud, Plaid = bank-linked verification, etc.).
- **Filter improvements**: accessibility toggle + "skip strict-screening properties" toggle on rental search.
- **`docs/OPEN_SOURCE_ALTERNATIVES.md`** — comprehensive map of free/legal workarounds for every partner-only provider (Zillow / Apartments.com / Cars.com / RentCafe / Entrata / AppFolio / RealPage / Snappt / U-Haul / Penske / Google Places / Google Maps / Yelp).
- **DATA_PROVENANCE.md** — honest "real / sample / absent" breakdown shipped earlier this session.

## Theme + UX preserved
- All previous theme work intact (race-day for cars, gingerbread-deep for rentals, RotatingBackground, raining objects)
- All previous direct-link infrastructure intact (resolver, prep packets, redirect screen)
- All previous screening + assistance + templates intact

## What's still partner-only
See `docs/OPEN_SOURCE_ALTERNATIVES.md` — every absent provider has a defensible
free workaround documented. Live unit-level apartment availability and live
VIN-specific dealer inventory remain the two pieces only partner contracts
unlock.

## Next slices when you come back
- `"sign Greystar partnership"` → flip the Greystar stub to a live Yardi RentCafe API adapter
- `"add Postgres for persistent CSV imports"` → run Prisma migrate, swap in-memory CSV → DB
- `"add Santa Barbara + Kern + Imperial counties"` → expand /assistance overlay
- `"OAuth login for saved profile sync"` → cross-device save state
