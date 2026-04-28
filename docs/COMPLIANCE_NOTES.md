# Compliance Notes

These rules are **load-bearing**. Violating them puts the platform and its
users at legal risk. They are enforced both in code (`src/lib/compliance/`) and
in the build/lint pipeline.

---

## 1. Data sourcing

- **No scraping** of any site whose Terms of Service prohibit it. Zillow,
  Apartments.com, Rent.com, Realtor.com, Cars.com, Autotrader, CarGurus, and
  most listing portals fall in this bucket.
- **No CAPTCHA bypass.** Ever.
- Adapters for prohibited sources are stub-only. They throw a
  `ProviderRequiresContractError` if invoked without a configured partner key.
- Allowed inputs: official APIs, licensed feeds, partner programs, public
  open-data, dealer/property/rental-provider websites the company itself
  publishes, affiliate feeds with a contract, manually verified records.

## 2. Fair Housing Act compliance (apartments + townhomes)

- The app **never** filters or steers based on race, color, national origin,
  religion, sex, familial status, or disability — explicitly or by proxy.
- Allowed filters are limited to: budget, location, accessibility features
  (lift access, step-free entry, roll-in shower, wheelchair-accessible
  parking), commute, pet policy, parking, income requirement
  *as stated by the property*, move-in fees, vehicle needs, qualification
  documentation.
- "Family-friendly" / "great for kids" / "great for singles" / "young
  professional" copy is **banned** from listing cards and search filters.
  Reviewers must reject any PR that introduces such copy.
- The Qualification Fit Score never uses, infers, or stores any protected
  attribute. See `src/lib/scoring/`.
- Every public-facing property page links to HUD's Fair Housing complaint
  form: <https://www.hud.gov/program_offices/fair_housing_equal_opp/online-complaint>.

## 3. FCRA / financing compliance (cars)

- The app **never** guarantees approval, financing, or "zero-down" eligibility.
- Estimated qualification fit is **guidance**, not approval. Every score panel
  carries the explicit disclaimer.
- We **never** pull credit. We only ask the user to **self-select** a credit
  range (e.g., "below 580 / 580–669 / 670–739 / 740+") for guidance. That data
  stays client-side unless the user explicitly opts in to save it.
- We **never** auto-submit credit applications. Redirect previews require a
  user-clicked "Open dealer application" CTA.

## 4. Rental-reservation compliance (work vehicles)

- The app **never** books or reserves work-vehicle rentals on behalf of the
  user without an explicit, user-clicked "Open rental provider" action.
- We surface daily/weekly/monthly rates as **estimates pending verification**
  unless the rate came from a partner feed.

## 5. PII handling

- We do **not** store SSNs.
- We do **not** ask for full bank credentials.
- We do **not** collect government-issued IDs unless secure storage and
  explicit consent are implemented and audited.
- Profile fields used for prefill are stored **client-side first** (encrypted
  IndexedDB / `localStorage`) and only synced to a backend account if the user
  explicitly opts in.
- Sensitive fields are encrypted at rest using `crypto.subtle` in the browser
  and a per-user key derived from a passphrase the user controls.

## 6. Promotion claims

A promo can only be displayed when one of these is true:

1. It is on the property/dealer/provider's own public page (we link to it).
2. A partner feed delivered it.
3. An admin manually verified it through the admin panel and stored a
   `verified_by`, `verified_at`, and `source_url`.

Otherwise the promo card shows the **`Needs verification`** badge and the user
is told to call the property/dealer/provider to confirm.

## 7. Source labeling

Every visible price, fee, promo, availability state, application-process claim,
rental rate, and deposit must carry:

- `source` and a clickable `source_url`
- `last_verified_at` (relative time: "verified 3 days ago")
- one of the trust labels in `docs/DATA_SOURCES.md` §5

## 8. Disclaimers (must appear on every relevant page)

- Apartment / townhome detail: *"We help prepare and compare. Final approval is
  controlled by the property and its screening provider."*
- Car detail: *"Lightning McGreen Living is not a lender or dealer. Financing
  approval is controlled by the dealer and the lender."*
- Work-vehicle detail: *"Availability and rates can change. We do not reserve
  on your behalf without your action."*
- Footer (every page): *"Prices, promos, rates, and availability can change.
  Always verify with the property, dealer, or rental provider before applying,
  financing, reserving, or visiting."*

## 9. Brand & IP

- Visual identity is original. **No** Disney, Pixar, "Cars" franchise, NASCAR,
  or any other protected character/logo/font is used.
- "Lightning McGreen Living" is intentionally distinct from "Lightning McQueen".
  Reviewers must reject any PR that adds racing-character names, taglines, or
  visuals that could be confused with the protected mark.
- We do not display logos of property managers, dealers, or rental providers
  unless we have explicit permission or the logo is being used in a way that
  qualifies as nominative fair use (small, link to source, no implied
  endorsement).

## 10. Accessibility (WCAG 2.1 AA target)

- Color contrast ≥ 4.5:1 for body text.
- All interactive elements keyboard-reachable; focus rings always visible.
- All images have meaningful `alt` text.
- All animations honor `prefers-reduced-motion`. The "Reduce motion" toggle in
  the header is a hard kill switch for raining objects, lightning pulses, and
  speed-line transitions.

## 11. Production-mode hard rules

When `NEXT_PUBLIC_DATA_MODE=production` the app:

- Refuses to render any listing missing the metadata in `DATA_SOURCES.md` §5.
- Refuses to start without `ADMIN_SHARED_SECRET` set to a non-default value.
- Hides the demo banner.
- Does not load `src/lib/data/demo-*.ts` files.
