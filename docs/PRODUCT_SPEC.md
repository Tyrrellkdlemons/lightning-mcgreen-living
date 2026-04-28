# Product Spec — Lightning McGreen Living

## 1. Mission

Help Southern California users discover apartments + townhomes to rent, cars to
buy or finance, and work vehicles to rent — and understand whether they are
likely to *qualify* for each — without copying any protected brand, scraping
any prohibited site, or guaranteeing approvals.

## 2. Audiences

| Audience | Top jobs |
| --- | --- |
| Renters (apartment) | "Will I qualify? What does move-in actually cost?" |
| Renters (townhome) | "Same as apartment + space/garage/private entrance fit." |
| Car buyers | "What can I realistically afford? Which dealers are transparent?" |
| Work-vehicle renters | "Which van/truck fits my job, today, near me, under $X?" |
| Combined ("Life Budget") | "Can I afford rent + car + work vehicle together?" |

## 3. Top-level structure

Two doors on the homepage:

1. **Apartments & Townhomes** — "Find Southern California rentals you are more
   likely to qualify for." → CTA `Start Rental Match`
2. **Cars & Work Vehicles** — "Find Southern California dealers, promos, cars,
   and work vehicles that fit your real budget." → CTA `Start Vehicle Match`

Top toggle (always present in the shell):

`Apartments & Townhomes` | `Cars` | `Work Vehicles` | `Compare Life Budget`

## 4. Page inventory

See `README.md` "Folder layout" for the route map. Each detail page MUST
include the per-listing requirements in `DATA_SOURCES.md §5` and the
disclaimers in `COMPLIANCE_NOTES.md §8`.

## 5. The "Qualification Fit Score"

Explainable, never opaque. See `src/lib/scoring/`.

For an apartment / townhome:

```
score = w1 * rent_to_income_fit
      + w2 * move_in_to_savings_fit
      + w3 * location_match
      + w4 * pet_or_parking_fit
      + w5 * application_readiness
      + w6 * fee_burden
      + w7 * commute_fit
      + w8 * data_freshness
```

Returns one of: **Strong Fit · Possible Fit · Stretch · Risky · Needs
Verification** plus a list of `reasons[]` and `concerns[]` that drive the UI's
"Why this may fit" / "What could hurt approval" panels. The score never uses
or stores any protected attribute.

For a car:

```
score = w1 * price_to_budget
      + w2 * monthly_payment_to_budget
      + w3 * down_payment_fit
      + w4 * credit_range_guidance        // self-selected, not pulled
      + w5 * fuel_cost_fit
      + w6 * insurance_placeholder
      + w7 * dealer_transparency
      + w8 * distance
      + w9 * data_freshness
```

For a work vehicle rental:

```
score = w1 * rate_to_budget                 // daily/weekly/monthly chosen
      + w2 * deposit_to_savings
      + w3 * mileage_cost_fit
      + w4 * insurance_requirement_fit
      + w5 * vehicle_to_job_match
      + w6 * pickup_distance
      + w7 * term_match
      + w8 * business_account_availability
      + w9 * promo_availability
      + w10 * data_freshness
```

## 6. Calculators

| Calculator | Inputs | Output |
| --- | --- | --- |
| Move-In Cost | rent, deposit, first month, last month?, admin fee, app fee, pet fee, parking fee | total + breakdown |
| Monthly Affordability | gross monthly income | recommended max rent (≤ 30%) + stretch (≤ 35%) |
| Income Requirement | property's stated multiplier (commonly 2.5–3×) + rent | required gross monthly income |
| Payment Estimator (car) | price, down, APR, term | monthly payment + total interest |
| Down Payment Estimator | price, target monthly, APR, term | required down |
| Total Monthly Cost (car) | payment, fuel/mo, insurance/mo placeholder | total |
| Work Vehicle Cost | rate (d/w/m), days/weeks/months, miles × per-mile, deposit, insurance/day | total |

All inputs/outputs are inline, accessible, and never block on a network call.

## 7. Apartment / townhome filters

`unit_type` (apartment / townhome / both), city, county, max rent, max move-in
total, beds, baths, pet policy, parking type, accessibility features,
private entrance, attached garage, yard/patio, levels (townhome), washer/dryer,
verified-special only, lower-application-friction, sort orders described in
the prompt.

## 8. Car filters

Buy / Finance / Compare-both mode toggle, body type, max price, max monthly,
max down, year range, max mileage, fuel type, drive, transmission, distance,
dealer-transparency rating, public-promo only.

## 9. Work-vehicle filters

Vehicle type (cargo van, box truck, pickup, stake bed, flatbed, passenger van,
refrigerated), term (daily/weekly/monthly), max rate, max deposit, mileage
included, insurance bundled, business-account available, after-hours pickup,
one-way available, distance.

## 10. Application Prep / Buyer Prep / Rental Prep wizards

Each is a Zod-validated multi-step form. None auto-submits. Outputs:

- A **redirect preview** (where partner prefill is supported)
- A **Copy Sheet** (always available) — clean, copy/paste-ready
- A **document checklist** the user can mark off

## 11. Source transparency panel

Every listing has a panel that shows: source, source URL, last seen, last
verified, freshness state, and trust label. The Data Sources page (`/data-sources`)
is a public summary of every connector and its current status.

## 12. PWA

Manifest, service worker, install banner, offline saved-list page. Mobile
bottom-nav, sticky filter button, swipeable cards.

## 13. Admin

`/admin` (gated by `ADMIN_SHARED_SECRET`):

- CSV upload (apartments / townhomes / dealers / vehicles / work-vehicles)
- Source verification toggles
- Stale-listing report
- Broken-link checker
- API sync status
- Manual record approve/reject

## 14. Out of scope (today)

- Single-family homes for rent or sale, condos for sale, mortgage origination.
- Auto-submit applications, finance forms, or rental reservations.
- Pulling real credit reports.
- Any character or visual that could be confused with Disney/Pixar Cars,
  NASCAR, or competitor logos.
