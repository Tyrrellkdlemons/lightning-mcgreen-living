# Property evidence, upload validation and remaining source gaps

Base: 7aa00e926a60d052e30be39c2bb40b63b056ae5d. Branch: feat/final-source-media-validation. Root is the integration owner. User authorized publication to the existing GitHub, Netlify site and Lightning McGreen Living notebook. No applications, payments, outreach, account changes or new access grants were performed.

## Shipped-candidate changes

- 242 catalog sources: 239 content-inspected and 3 original provider sites still inaccessible. The immutable 203-source original audit remains intact; its current recovery result is 200 inspected plus 3 gaps.
- Rechecked the three gaps: Comite remains under construction, Centro's domain fails DNS, SF Center blocks public retrieval with security verification. Their narrower course/referral alternatives remain labeled. Public directory phones and the Comite course's $100 non-refundable fee are now explicit. No organization closure or service availability is inferred.
- Added 10 California communities in 10 cities, increasing the evidence collection from151 to161 communities.13 sampled unit advertisements:8 explicit Available Now and5 advertised starting November4. These are dated publisher observations, not independent physical-vacancy confirmation.
- Added18 publisher-hosted photo references and opt-in previews, all visually inspected in Chrome. Seven Hoban properties label photos as similar units; Ni-Si exact-unit depiction is unknown; Avalon images are community references. No photos copied into the public repository. Brea's3 publisher-labelled actual-unit Matterport links and Calabasas's representative tour retain capture-date/playback limits.
- Corrected Arezzo's plan to Milan, normalized22 title separators, formatted new rents as currency, and classified Greenfield as Townhouse for real city/type filtering.9 other new communities are Apartment.
- All2,089 Census locations and36 existing sale observations remain available. Original79 workbook records preserved.

## Verification

Independent reviewer approved the exact8 tracked implementation/test-file diff against7aa00e9 after corrections. Root tests PASS: resource catalog, source audit, property evidence, city housing/filter/API-cache regressions, TypeScript, ESLint(0errors/1existing PhotoGallery warning),10/10 required workbook-link probes. These link probes are search destinations, not proof of vacancies. Remote build/full CI and candidate device-size browser checks follow the commit.

Real photo upload on deploy-preview-5 passed using the existing encrypted owner credential, without exposing it. Operation7bc34f31-36be-4e47-8c23-3ec7eb824490 saved one CC0 Phoenix skyline, was read back in the gallery, and returned HTTP200 image/jpeg. Same-ID identical retry returned duplicate:true without another photo. Changed-metadata retry returned409. Unauthenticated requests returned401. Production gallery does not contain the test image. The uploaded image is city context only.

Chrome390px upload form: public-file selection/preparation, permission fields, disabled-submit state, rejected dummy-key feedback, key clearing, and preview-gallery rendering PASS. No horizontal overflow; primary form fields/actions meet44px heights, with a20px checkbox inside its larger clickable label. Positive publication used the purpose-built authenticated helper/API; the full browser form was tested with a deliberately invalid key, not the private credential. Physical iOS/Android devices and assistive-technology evaluation remain NOT_RUN.

## Dependency limitation

Fresh npm audit: production0; full15 moderate,0high/critical. No safe compatible upstream upgrade was found. Current React/import/a11y ESLint plugins require minimatch3 APIs. Patched minimatch11 changes the callable export and removes makeRe(), used by eslint-plugin-import. No fake package version, audit suppression, global monkey patch or disabled lint rules was introduced. Package/config hashes unchanged. Recheck when maintained compatible releases or an authoritative advisory applicability correction appear.

Sources: https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249 and https://github.com/github/advisory-database/issues/10811 . The latter is an unresolved applicability report, not a finding resolution.

## Coordination and receipts

User explicitly approved transfer of the unavailable prior worker's two source-test reservations on2026-11-03; only that reservation was retired, files preserved. Shared browser/heavy resources were yielded to the separately authorized desktop setup at a natural boundary and reacquired after its actual release. No other locks or processes were interrupted.

Detailed local receipts: .revamp-evidence/followup-closure-root, followup-properties, followup-sources and followup-dependencies. Release status is pending candidate/production receipt; this file does not claim publication before it occurs. Three source gaps and15 development findings remain disclosed upstream limitations.
