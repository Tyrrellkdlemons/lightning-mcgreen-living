# Resource corpus expansion — 2026-11-03

This batch adds **232 distinct public source URLs** absent from the frozen pre-expansion source baseline. It is a source directory, not a feed of vacant homes or a promise of eligibility, approval, funding, placement, price, or availability.

## Initial collection and final audited counts

| Stage | Count | Meaning |
| --- | ---: | --- |
| Directory records collected | 249 | 147 published Mark-Taylor property paths plus 81 California and 21 Arizona HUD agency rows |
| Rejected directory records | 15 | Missing or malformed public URL, or state mismatch |
| Curated page candidates | 21 | Public page sections independently inspected with the web tool |
| Discovered candidates | 255 | Accepted directory rows plus curated candidates, before URL deduplication |
| Deduplicated and metadata-screened | 232 | Canonical URL identities before comparison with existing sources |
| Existing canonical baseline URLs | 267 | URLs extracted from src and docs at revision 5eb2e395e316a9ca69f92bf06e7fdea219615039 |
| Existing URLs excluded | 0 | None of this final candidate set overlapped that baseline |
| Included additional URLs | 232 | Final public catalog records |
| Content-inspected destinations | 29 | Relevant page sections read; not an assertion that every PDF page or linked page was read |
| Metadata-only destinations | 203 | Directory fields reviewed; destination content was not inspected |
| HEAD link attempts | 8 | Bounded requests, each recorded with linkCheckedAt |
| Successful HEAD responses | 6 | HTTP 2xx/3xx |
| HEAD access refusals | 2 | HTTP 403; these pages were readable through the public web tool |
| Distinct publisher labels | 80 | Labels, not an audited count of independently controlled organizations |

Final coverage: Arizona165; California62; CA/AZ3; Federal2.
Final categories: property149; housing65; directory10; benefits4; legal2; shelter2.
There are no new transport sources in this batch. The initial147 operator paths yielded145 retained property records after audit. This single operator still makes Arizona properties the largest group. This is a bounded expansion with that known bias, not exhaustive or balanced coverage.

## Collection and inclusion method

The collector makes three sequential public GET requests, each capped at 2.5 MB and 15 seconds. It reads actual property paths published in the [Mark-Taylor community directory](https://www.mark-taylor.com/) and actual website fields from the [HUD housing-counselor API](https://data.hud.gov/housing_counseling.html), using separate California and Arizona requests. It does not construct invented property paths, scrape availability or photos, or crawl each destination.

The directory snapshot captures 147 distinct Mark-Taylor community paths at 2026-11-03T12:59:06Z. An earlier exploratory response yielded 150; only the final saved response supports the published count. HUD returned 81 California and 21 Arizona records. The capture stores only agency identifier, agency name, state, city, website and opaque directory status codes. It omits individual contact details, email addresses and phone numbers.

HUD status codes are preserved without interpreting them as current approval. A listed agency may have stale directory data. Public descriptions ask readers to confirm current services directly. Malformed values such as an address in a website field are rejected. Directory metadata is useful provenance but does not independently verify a destination's ownership, safety, services or availability.

URL identity deliberately ignores protocol, leading www, query strings, fragments and trailing slashes. This conservative approach prevents those variants from increasing the count. Original clickable URL values are retained; HTTP links are not silently rewritten to an unverified HTTPS destination. Duplicate agency branches merge into one URL record; multi-state organizations use CA/AZ and conflicting single-city metadata is removed. IDs are stable truncated SHA-256 hashes of the canonical identity.

The frozen baseline was extracted using read-only git grep against src and docs. The ignored evidence baseline contains all 267 canonical identities. The independently maintained catalog regression test embeds this public baseline so shallow CI checkouts can verify additional counts without historical Git objects.

## Content inspection and Gemini contribution

The 21 curated pages cover HUD state referral guides, Alameda coordinated entry, Arizona legal and court help, Arizona community assistance, Pima rent/utility referrals, California community providers, Community HousingWorks communities and four named property/development pages, and Bellagio's official page.

The parent integrator reported an actual Gemini Argon session and supplied its candidate URLs. Six candidates were then opened and relevant content independently inspected by this worker:

- [California CTCAC project map](https://www.treasurer.ca.gov/ctcac/projects): the state page explains its map and project spreadsheet and warns that some projects may still be under construction.
- [California housing authority contact report](https://www.hud.gov/sites/dfiles/PIH/documents/PHA_Contact_Report_CA.pdf): directory introduction and representative California entries inspected.
- [Arizona housing authority contact report](https://www.hud.gov/sites/dfiles/PIH/documents/PHA_Contact_Report_AZ.pdf): directory structure and Arizona entries inspected.
- [LAHSA Get Help](https://www.lahsa.org/get-help): coordinated entry and outreach referral sections inspected.
- [Arizona rental housing search](https://housingsearch.az.gov/): locator scope and search entry page inspected; no landlord account or listing transaction tested.
- [USDA rural multifamily housing overview](https://rdmfhrentals.sc.egov.usda.gov/RDMFHRentals/about_mfh.jsp): program overview inspected; individual rental destinations not retrieved.

These records retain discoveryContribution. Gemini's suggestions are discovery input, not proof of their claims. This worker did not operate Gemini or NotebookLM and does not claim that either system read the 232 destination pages. The parent owns separate evidence for its actual notebook session.

Every record's retrievedAt refers to the material actually retrieved: directory metadata for metadata-only records, or page content for inspected records. Only content-inspected records have pageRetrievedAt. The date does not mean a metadata-only destination was visited. Future collector refreshes preserve the curated review date rather than falsely refreshing it.

## Access limits and exclusions

- Two Arizona DES HEAD requests returned 403 despite successful public web content inspection. linkStatus records the actual HEAD response; it is not presented as proof that users cannot reach the page.
- The suggested Arizona Department of Housing affordable-housing path returned 403 through the web tool and was not included.
- Essex sitemap access returned 429; Irvine Company's sitemap returned 403. No retries to evade access restrictions and no source records were manufactured from those failures.
- Community HousingWorks direct programmatic requests returned 403; its curated pages were inspected using the public web tool. No bulk property crawl was performed.
- The Arizona Rental Assistance Program page explicitly states that the prior program ended. It is used only as discovery provenance for current referral pages, not included as an open assistance program.
- Fallbrook View's page reported a closed waitlist. The catalog preserves that observation with a request to confirm changes. The 1523 Harrison page describes a future development, not presently available housing.
- Page accessibility, authoritative provenance and an HTTP success code do not establish current inventory or approval. No applications, purchases, messages or account changes occurred.

## Artifacts and repeatability

- Public data: src/lib/resources/catalog.json.
- Bounded collector: scripts/discover-resource-catalog.py; Python standard library only.
- Ignored capture: .revamp-evidence/research-v2/capture.json, containing retrieval timestamps, response hashes, bounded public directory metadata, rejection reasons and HEAD receipts.
- Ignored comparison baseline: .revamp-evidence/research-v2/baseline.json.
- Independent schema, provenance, counts and baseline regression checks: scripts/test-resource-catalog.mjs, owned by the separate review worker.

For a read-only local validation, run C:\Python313\python.exe scripts/discover-resource-catalog.py --validate from the repository. This collector check requires the frozen baseline revision in local Git history. No network request is made in validate mode.

A deliberate refresh uses --refresh --write, optionally --probe-limit 8 (maximum 12). Obtain the project coordination claims for every output first. The refresh uses bounded sequential reads and hash-checked atomic output replacement. Review changed counts, malformed URLs and metadata before publishing. It does not update manual content-inspection dates. Browser, full build and deployment validation are the parent's integration responsibility.

## Verification at handoff

Collector syntax compilation: PASS.
Live bounded collection: PASS; 3 GETs and 8 HEAD attempts, no destination crawl.
Collector schema, uniqueness, provenance and frozen-baseline validation: PASS.
Catalog SHA-256: c8c92d134a82e2d1003523da76f006b87e7f496d9440fe1faf6bdbc3ae648be9.
Independent regression result and integrated browser/deploy evidence are recorded by their owners separately.

## Corroborated final correction audit

Gemini identified a placeholder host and a suspicious category page in the imported metadata. Independent primary-page inspection confirmed these and one duplicate/incorrect-city Sentio alias. Three records were removed and replaced with three additional content-inspected sources: Korean Community Services community support, CalHFA counseling directory and National CAPACD housing counseling network. KCS is described as benefits/community support, not an unverified counseling claim. Only its actual agency90768 is retained.

Four address-derived property titles were corrected to Banyan at17North, Blume on Central, Forge Tower and Bella Olivia using official headings. The retained Glendale Sentio page was inspected too. Final counts are232 additional URLs,29 content-inspected and203 metadata-only. The original255 discovered candidates and249 directory rows remain historical collection counts; they are not invented recalculations after a separate audit. The catalog audits field records removals, replacements and five upgrades.

The collector now rejects the placeholder host and reserved utility slugs, canonicalizes the confirmed Sentio alias, and retains curated title corrections and replacements. Three focused regressions prevent recurrence. The earlier catalog hash records the pre-audit artifact; final source hash is recorded with release evidence.
