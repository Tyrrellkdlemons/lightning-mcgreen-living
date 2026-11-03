# Content editor

The entry point is `/admin/content/index.html`. Decap CMS 3.17.3 is pinned to the official package distribution. It uses the supported GitHub backend, not deprecated Git Gateway. No OAuth credentials are included in source.

## What it changes

- **City guides:** edits the existing `src/lib/places/places.json` array. A custom formatter wraps the array only inside the editor and writes the original array format back. Existing IDs and URLs stay stable. New IDs are derived from the selected state and city slug.
- **Rentals, dealers & vehicles:** edits `src/lib/data/editor-content.json`. Its three lists start empty. The site validates and appends these records to its actual rental, dealer and vehicle datasets, so merged/deployed edits appear in searches and detail pages.
- Existing seeded listings and the 79-property ranked workbook are preserved. This editor does not modify those original records. Supplemental records can be edited or removed from the corresponding list; vehicles must refer to a supplemental dealer in the same file. To remove a dealer, first remove its vehicles.
- Photos remain in `/admin/photos`, using Netlify Blobs and its own authorization. The CMS media library is disabled and there are no image/file widgets. Supplemental listings use the site's existing illustration/context-image fallbacks.

The single supplemental inventory file keeps dealer references and vehicle changes in one reviewable transaction. It is public catalog data: do not enter tenant/customer information, private contact details, credentials or private documents.

## Owner OAuth connection required

Source integration is provided; authenticated editing is **not verified** until the following setup and acceptance steps are completed.

1. After reviewing and merging the revamp, confirm the two content files exist on the configured `main` branch. A preview of this CMS still targets that configured GitHub repository and branch; it is not a sandbox for content writes.
2. Create a GitHub OAuth application in account **Settings  -  Developer settings  -  OAuth Apps**. Set the homepage to this site's URL and the authorization callback to `https://api.netlify.com/auth/done`.
3. In this Netlify site's **Project configuration  -  Security  -  OAuth**, install the GitHub authentication provider. Enter the OAuth client ID and client secret there. Never put the secret in this repository, browser scripts, screenshots or chat.
4. Sign in to the content editor with an authorized GitHub account that has push access to `Tyrrellkdlemons/lightning-mcgreen-living`. Existing Netlify CLI or GitHub CLI authentication does not configure this browser OAuth connection.

The content editor uses GitHub OAuth, not the photo manager's shared secret. GitHub repository permissions control access. Decap may retain its GitHub login in browser storage; log out when finished, particularly on a shared computer.

## Review and publication

`publish_mode: editorial_workflow` saves content drafts through GitHub branches/pull requests. `publish: false` hides CMS publishing controls for both collections. Review the diff, validation checks and deploy preview in GitHub, then merge there through the repository's normal authorized workflow. Verify the resulting Netlify deployment.

These UI settings do not configure GitHub branch protection or restrict a GitHub writer's other tools. Branch protection and required reviews, if desired, must be configured separately. A successful draft save is not proof that a deployment succeeded.

## Content rules

Required rental fields cover a stable external reference, property/type/location, manager/platform, official and application URLs, monthly rent range, bedroom/bathroom ranges, and source metadata. Disclosed fees and pet/parking descriptions are optional; leave unknown fees empty instead of entering zero.

Required dealers cover a stable reference, public business name/address/location/phone, website and source metadata. A financing URL is optional. Vehicles need their dealer's stable reference, VIN, year/make/model, mileage, price, condition, availability, listing URL and source metadata. Do not imply an availability or price was checked when it was not.

All records require an HTTPS source URL, source category, trust label, confidence score, freshness state, and actual observation/review timestamps with timezone. Defaults are unverified and need review; no verification timestamp is invented automatically.

Validation rejects unsupported fields, invalid types/ranges, reversed rent/bed/bath ranges, duplicate identifiers, invalid VIN format, unsupported states, county/state mismatches, implausible coordinates, unsafe URL schemes and unknown dealer references. The state boxes are consistency checks, not boundary polygons or geocoding. Cross-check addresses and sources manually. Supplemental records cannot overwrite matching original external IDs or VINs; a collision fails the render/build validation.

The existing CSV endpoint only validates uploads and returns counts; it does not publish listings. The supplemental JSON uses corresponding domain field names with provenance nested under `meta`. It is not a new CSV persistence service.

## Verification

Run `node scripts/test-cms.mjs` and the normal typecheck/lint/build checks. The bounded fixtures exercise the exact shared validators, formatters and data integration with synthetic test data that is never written to the inventory file.

Authenticated acceptance remains required:

1. Confirm an unauthorized GitHub account cannot save content.
2. Save a harmless existing city-description change as a draft; verify the file remains a JSON array, existing IDs remain unchanged and a GitHub draft/PR is created.
3. Confirm no publishing control or ordinary Git media upload is available. Review the draft preview and confirm the actual city page changed.
4. Add one owner-supplied, sourced dealer and vehicle or rental in a draft; verify validation, search/detail display and correct CA/AZ filtering. Do not publish invented test listings.
5. After authorized merge, match the deployed revision and verify the public page. Revert the reviewed content commit through a normal PR if needed.

No live OAuth login, draft save, GitHub merge or real listing publication is claimed by the source implementation.

## Official references

- [Decap GitHub backend](https://decapcms.org/docs/github-backend/)
- [File collections](https://decapcms.org/docs/collection-file/)
- [Custom formatters](https://decapcms.org/docs/editor-tooling/#custom-formatters)
- [Configuration and editorial publishing controls](https://decapcms.org/docs/configuration-options/)
- [Manual initialization](https://decapcms.org/docs/manual-initialization/)
- [Media-library extension contract used by Decap's official integration](https://github.com/decaporg/decap-cms/blob/master/packages/decap-cms-media-library-uploadcare/src/index.js)
- [Netlify OAuth provider setup](https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/)
- [Git Gateway deprecation](https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/)
