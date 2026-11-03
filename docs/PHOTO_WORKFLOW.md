# City photographs

The editor at /admin/photos publishes owner-curated photographs to California and
Arizona city guides. Photos describe the area; they are not evidence that a
particular rental unit is available. No fabricated property images or AI photo
generation is part of this feature.

## Configuration

1. Install the committed dependency lock with the existing project workflow.
   Netlify Blobs is pinned to 10.7.13 for compatibility with this site's Node 20 runtime.
2. Set ADMIN_SHARED_SECRET in the Netlify environment for the Functions scope.
   Use a unique, random value of at least 32 characters. Do not put it in
   NEXT_PUBLIC variables, source, chat, URLs, or a committed file. Missing,
   short, or recognizable placeholder values disable publishing.
3. Deploy with the functions directory set to netlify/functions and esbuild.
   The three functions export their route configuration directly:
   - POST /api/place-photos/upload
   - GET /api/place-photos/gallery?placeId=ca-los-angeles
   - GET or HEAD /place-photos/:placeId/:photoId
4. Test on a Netlify preview before publishing. Next dev alone does not run
   these standalone Netlify Functions. A failed gallery fetch is shown honestly
   as unavailable, not as an empty verified collection.

There is no dependence on Git Gateway or new Identity provisioning. The private
shared editor key follows this repository's existing administration mechanism.
It is a bearer credential: anyone given the key can publish photos. The UI holds
it in React memory, clears it on pagehide, and provides a Clear access key button.
The server checks it using a timing-safe comparison and requires same-origin
requests. No wildcard CORS permission is sent.

## Storage isolation

The server trusts Netlify's v2 context.deploy.context and context.deploy.id.
CONTEXT and DEPLOY_ID build environment variables are not assumed to exist in
Functions runtime. No request-supplied hostname or store name selects storage.

- Production: place-photos-production. Writes also require
  context.deploy.published === true, so an older production permalink cannot
  continue editing the live collection.
- Deploy Preview or branch deploy: place-photos-preview-<deploy ID>.
  Each deployment has a separate collection. Preview uploads never appear in
  production, and a new preview starts a fresh collection.
- Netlify Dev: place-photos-local (the CLI's local sandbox).
- Missing or unknown deployment metadata: fail closed with HTTP 503.

Site-wide stores normally span deployments. Explicit naming above is essential.
These are persistent records; removing a deployment does not necessarily remove
its site-wide preview store. Manage unused preview stores in Netlify's Blobs UI
after confirming they are no longer needed. No cleanup runs automatically.

## Publishing

1. Open /admin/photos on the intended live or preview URL.
2. Enter the editor key, select a city, then choose a JPEG, PNG, or WebP under 4 MB.
3. The browser decodes and re-encodes the image to remove EXIF camera/location
   metadata and reduce its largest dimension to 2560 pixels.
4. Enter accurate alt text, a caption, photographer credit, optional HTTPS source
   link, and rights basis. Confirm permission and absence of confidential content.
5. Publish. Wait for the receipt and gallery reload. On an uncertain failure,
   retry without changing the form; the same upload reference prevents duplicates.
6. Clear the key when finished.

Photos, credits, captions, source links, and dates are public. Avoid faces,
documents, license plates and confidential shelter locations. Retain permission
or license evidence privately; do not upload documents through this endpoint.
Direct API callers must remove sensitive metadata themselves; the browser editor
performs this transformation, while the server validates size, MIME signatures
and publication fields. There is no general-purpose public upload endpoint.

## Implementation and limits

The canonical city allowlist is src/lib/places/places.json. Unknown city IDs,
arbitrary blob keys, HTML/SVG content, mismatched MIME signatures, oversize bodies,
missing consent, and invalid source URLs are rejected. The stream is bounded
before multipart parsing; Content-Length is checked but not trusted alone.

Images use immutable UUID keys with conditional onlyIfNew writes. The
request digest covers metadata plus bytes. A retry cannot change an existing
photo; it can repair an interrupted metadata publication. Images are served only
after the corresponding public record exists.

Gallery reads fetch one bounded list page and at most 48 photo records. This is
an intentionally small curated gallery, not a searchable media database. Images
use Netlify Image CDN via a real read Function URL, responsive widths, lazy
loading and explicit dimensions. Image responses are cached for one hour;
gallery and upload responses are not cached.

This editor currently adds photos; it does not edit or delete them. To withdraw a
published photo, an authorized operator can remove its published record and image
in Netlify's Blobs UI, then clear relevant CDN caches. Cached copies may remain
until expiry; this is not a guaranteed immediate erasure workflow. Never publish
sensitive images assuming they can be completely recalled.

## Verification

Run: node --test scripts/test-photos.mjs

The no-dependency fixture suite checks authentication/origin failures, body
limits, MIME signatures, allowed fields, immutable upload retries, interrupted
publication recovery, environment isolation, public reads, and sanitized errors.
It uses in-memory storage; it does not prove Netlify configuration or live upload.

Before accepting the deployed workflow, verify:

- No key / incorrect key / wrong origin reject without creating blobs.
- Correct key publishes a consented fixture into the preview store.
- A repeated upload reference produces one image and record.
- Preview and production galleries differ as expected.
- The image source route and /.netlify/images return an image.
- Captions and credits render, and keyboard/mobile interaction works.
- Existing rental, apply-engine and vehicle routes still work.

The implementation alone does not establish that these deployed checks passed.

## Primary references inspected 2026-11-03

- Netlify Blobs: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- Image CDN: https://docs.netlify.com/build/image-cdn/overview/
- Function context: https://docs.netlify.com/build/functions/api/#deploy
- Runtime environment variables:
  https://docs.netlify.com/build/functions/environment-variables/
- Supported SDK methods were checked in @netlify/blobs 10.7.13 declarations:
  https://unpkg.com/@netlify/blobs@10.7.13/dist/main.d.ts

Gallery navigation exposes subsequent pages (up to 1,000 pages / 48,000 photos per city). This is a curated editor collection, not an unbounded public upload service. Concurrent edits may change page membership; reload if the collection changes.
