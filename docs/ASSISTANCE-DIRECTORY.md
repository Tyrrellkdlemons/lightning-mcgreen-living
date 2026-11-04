# Assistance directory

`/resources/assistance` contains public program descriptions and referral leads for California and Arizona. The first release has 131 state-specific records mapping every one of the 122 supplied table rows and upfront-cost addendum leads. Repeated referrals retain `source_rows` aliases; a state-specific record is not an independent source or separate pot of money.

## Edit with Decap CMS

Open `/admin/content/`, sign in through the configured GitHub OAuth flow, and select **Assistance resources**. Choose **California programs**, **Arizona programs**, or **Partners & upfront-cost resources**. The `resources` list supports adding, editing and removing entries within that file. Keep existing published IDs stable; they determine detail-page URLs.

Add a resource with a unique lowercase ID, name, state, scope, category, administrator, plain-language summary, amount, assistance type, eligibility, application instructions and an official HTTPS source. Use empty county/city lists for statewide entries. `county` scope treats `cities` as examples; `city` and `regional` records with a city list restrict matches to those cities. Describe narrower boundaries such as unincorporated areas explicitly in eligibility notes. Create a separate state-specific record for each applicable state.

Save an editorial draft. Publishing controls stay disabled in the editor; review and merge the resulting GitHub pull request after CI passes. Adding a valid new provenance ID is allowed. The original supplied row aliases remain required so accidental loss of an imported lead is caught during review.

GitHub OAuth configuration and authorized repository access are required for an actual CMS save. A rendered login screen alone does not prove authenticated editing. The directory itself does not depend on CMS authentication.

## Update evidence honestly

Open the actual administrator page before changing `last_verified`. Enter the real inspection date as `YYYY-MM-DD`, update `verification_notes`, and record `reviewed_at`. Use `verified` only for the published description actually inspected, `partial` for material gaps, `unverified` for unsupported current claims, or `closed` for published closure/unavailability. Even a checked page does not prove available funding or an individual award.

The initial table's `2025-06-01` is a supplied dataset date, not a fresh verification. Unverified seed records keep that baseline and display an explicit unverified label. The addendum has its own November 3, 2026 provenance date. Keep original claims in `supplied_claim`; do not copy unsupported amounts into the current public summary. Closures show the actual closure-check date. Review at least quarterly, and immediately when administrators change terms.

Use `cost_purposes` to distinguish purchase down payments/closing costs from rental deposits, first rent, move-in costs, back rent and housing navigation. Paid deposit alternatives and guarantors use their own `help_kind` and purpose. They are labeled **Paid product — not a grant** and carry a property-participation caveat. Geographic matching never establishes eligibility or landlord acceptance. No profile, medical information or personal financial data is used for matching.

## Optional images

`image_key` accepts an already published Netlify Blobs image key in the existing format `images/place-id/photo-id`, with a version-4 UUID photo ID. The renderer requests the existing published-photo route through Netlify Image CDN; unpublished, invalid or missing assets fall back to a neutral building icon. Width and height are fixed at 44 pixels. Do not enter external URLs, credentials, private keys or unlicensed logos. The existing protected photo manager controls publication; this directory does not expand upload permissions or add a new photo target type.

## Filtering and tests

The build imports three JSON files under `src/content/assistance_resources/`. Browser filtering uses embedded data, including a compact registry of all 2,089 CA/AZ Census places. State, county, exact city, category, cost purpose and keywords are encoded in the URL. A known city inherits its county or multiple counties; an unknown or contradictory city/state combination returns no match. Results load 20 at a time. Original names remain searchable through preserved claims, with evidence labels visible.

Run `node scripts/test-assistance-directory.mjs`, `node scripts/test-cms.mjs`, `npm run typecheck`, and `npm run lint`. Both CI workflows run the directory regression before build/deployment. Browser acceptance covers filtering, history, empty state, pagination, details, city/property callouts, mobile navigation, narrow layouts, keyboard use and console errors. Automated checks and desktop viewport emulation do not establish physical-device or complete assistive-technology conformance.

Source/API credentials remain server-side. No financial application, health-plan referral or paid-product enrollment is submitted by this directory.
