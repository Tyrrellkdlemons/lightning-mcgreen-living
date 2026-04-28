# Lightning McGreen Living ⚡🍪

A Southern California rental + vehicle qualification discovery platform with a
green-lightning gingerbread racing theme.

> **Project name:** Lightning McGreen Living
> **Site name:** Lightning McGreen Living
> **Theme:** Green lightning · gingerbread streets · candy garages · racing energy
> **Geography:** Southern California only (geofenced)

This project is **original and legally distinct**. It does not use Disney/Pixar
"Lightning McQueen", NASCAR branding, the Cars franchise, or any protected
character/logo/font. The visual identity is "inspired by friendly animated
racing films and professional motorsport dashboards" — not copied from them.

---

## What it does

Lightning McGreen Living helps Southern California users find:

1. **Apartments & Townhomes for rent** — qualification-aware, application-ready
2. **Cars to buy or finance** — dealer + inventory + budget-fit
3. **Work vehicles to rent** — cargo vans, box trucks, pickups for jobs/business
4. **Combined "Life Budget"** — the rent + car + work-vehicle math, together

It is **not** a property manager, dealer, lender, screening provider, or
rental-reservation system. It helps users prepare and compare; the final
approval is always controlled by the property, dealer, lender, or rental
provider.

The platform is **better than Zillow / Rent.com / Apartments.com / Cars.com /
Autotrader / CarGurus** by combining qualification guidance, application-process
transparency, source-backed listings, an inline life-budget compare, and a
delightful, original gingerbread-racing visual identity.

---

## What it does NOT do

- Does **not** include single-family homes, home purchases, condos for sale, or
  mortgage buying features yet (apartments + townhomes for rent only).
- Does **not** scrape sites that prohibit scraping.
- Does **not** bypass CAPTCHAs.
- Does **not** auto-submit applications, finance forms, or rental reservations.
- Does **not** guarantee approval, financing, "zero-down" qualification, or
  rental availability.
- Does **not** ask for SSNs or full bank credentials.
- Does **not** copy the Disney/Pixar "Cars" franchise, NASCAR, or any other
  protected brand assets.

---

## Tech stack

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion
  (performance-controlled), React Hook Form, Zod, TanStack Query, Zustand
- **Maps:** MapLibre GL (default, no API key) or Google Maps (env-key gated)
- **Backend:** Next.js API routes (Node), Postgres + PostGIS optional, Prisma
  schema included, Redis/Upstash optional caching
- **Data/ETL:** Provider adapter pattern, manual CSV import, scheduled refresh
- **Free public APIs wired up:** NHTSA vPIC (VIN decode), FuelEconomy.gov,
  U.S. Census ACS, HUD Fair Market Rents, OpenStreetMap Overpass
- **Env-key gated:** Google Places, MarketCheck, Yardi/Entrata/AppFolio/RealPage
  (partner-only — see `docs/API_CONNECTOR_STATUS.md`)
- **PWA:** Web manifest, service worker, offline fallback, installable

---

## Quick start

```bash
# 1. Install
npm install

# 2. Copy env template
cp .env.example .env.local
# Fill in any keys you have. The app runs without keys in DEMO mode
# (clearly labeled), and gracefully degrades for missing providers.

# 3. Run dev
npm run dev
# → http://localhost:3000
```

### Demo vs Production mode

- `NEXT_PUBLIC_DATA_MODE=demo` (default) — mock/labeled sample data, banner
  visible at the top of every page
- `NEXT_PUBLIC_DATA_MODE=production` — requires real API/imported data;
  refuses to render fake listings

---

## Folder layout

```
lightning-mcgreen-living/
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.js
├── docs/
│   ├── DATA_SOURCES.md          ← every API researched + access tier
│   ├── COMPLIANCE_NOTES.md      ← Fair Housing, FCRA, scraping, etc.
│   ├── PRODUCT_SPEC.md          ← full product spec (rentals + cars + work)
│   ├── UI_THEME_GUIDE.md        ← gingerbread/green-lightning design system
│   ├── LAUNCH_CHECKLIST.md      ← pre-launch QA
│   ├── API_CONNECTOR_STATUS.md  ← per-provider status (live/partner/manual)
│   └── MANUAL_DATA_IMPORT_FORMAT.md  ← CSV schemas
├── public/
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
├── prisma/
│   └── schema.prisma
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx                       ← Home (two doors)
    │   ├── rentals/page.tsx               ← Combined apartment+townhome
    │   ├── apartments/page.tsx
    │   ├── apartments/[id]/page.tsx
    │   ├── townhomes/page.tsx
    │   ├── townhomes/[id]/page.tsx
    │   ├── cars/page.tsx
    │   ├── cars/[id]/page.tsx
    │   ├── dealers/[id]/page.tsx
    │   ├── work-vehicles/page.tsx
    │   ├── work-vehicles/[id]/page.tsx
    │   ├── compare/page.tsx
    │   ├── life-budget/page.tsx
    │   ├── saved/page.tsx
    │   ├── data-sources/page.tsx
    │   ├── privacy/page.tsx
    │   ├── terms/page.tsx
    │   ├── accessibility/page.tsx
    │   ├── admin/page.tsx
    │   └── offline/page.tsx
    ├── components/
    │   ├── theme/                         ← Raining objects, lightning, etc.
    │   ├── ui/                            ← Candy cards, cinnamon buttons
    │   ├── rentals/
    │   ├── cars/
    │   ├── work-vehicles/
    │   ├── compare/
    │   └── shell/                         ← Nav, footer, banner
    ├── lib/
    │   ├── providers/                     ← Provider adapter pattern
    │   ├── scoring/                       ← Qualification fit engine
    │   ├── calculators/                   ← Move-in cost, payment, rental
    │   ├── compliance/                    ← Disclaimers + Fair-Housing guards
    │   ├── geofence/                      ← Southern California gating
    │   ├── data/                          ← Mock/demo data (labeled)
    │   └── db/                            ← Schema + query helpers
    └── types/
```

---

## GitHub workflow

1. Create the repo: `gh repo create lightning-mcgreen-living --public --source=. --remote=origin`
2. Branches: `main` (protected) ← `develop` ← `feature/*`
3. PR template: see `.github/PULL_REQUEST_TEMPLATE.md`
4. CI: `.github/workflows/ci.yml` runs lint + typecheck + build on every PR
5. Deploy: Vercel or Netlify — environment variables from `.env.example`

---

## License & legal

All visual identity is original. Do **not** add any character, logo, font, or
visual that is owned by Disney, Pixar, NASCAR, Zillow, Rent.com, Realtor.com,
Apartments.com, Cars.com, Autotrader, CarGurus, or any property manager / dealer
without an explicit license.

See `docs/COMPLIANCE_NOTES.md` for Fair Housing, FCRA, and data-sourcing rules.
