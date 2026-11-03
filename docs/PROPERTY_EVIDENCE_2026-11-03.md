# Property evidence review — 2026-11-03

Scope: ten exact communities, mapped to thirteen existing IDs: six of the 79 workbook communities, five saved unit records across Solimar and Presidio, and two Arizona resource records. The original workbook and catalog were not edited. This is a bounded source review, not a review of every property.

## Implementation contract

`src/lib/property-evidence/records.json` contains schemaVersion 1, reviewedAt, and records. Each record includes propertyIds, name, state, address, officialUrl, galleryUrl, identityEvidence, availability, tours, and photoReuse. Optional availability.plans entries contain plan, beds, baths, availableUnits, and optional sqft/startingRent/rentBasis. Optional availability.units are observed examples. `sampleOnly` distinguishes examples from an aggregate. `reportedCount` is supplied only for the explicitly observed plan aggregate.

- Three communities have dated provider observations: one unit sample and two plan-count samples/aggregates. Seven remain unconfirmed.
- Nine published tour URLs are recorded: three YouTube player candidates and six Matterport links.
- Ten original image URLs were discovered from official source markup. Zero image files were copied or uploaded. No image redistribution license was established.
- Public player playback, property-owner photo permission, leasing-office confirmation, and authenticated uploads were NOT_RUN by this research worker.

`observedAt` records this review's observation time, not a provider guarantee or continuous synchronization. The parent UI expires availability snapshots after 48 hours. `reviewedAt` and source publication dates must never become image capture dates. All tour capture dates remain unknown. A community/model tour is not an exact current-unit photograph.

## Sources and identity

- **Solimar Luxury Homes** — 1500 West Pacific Coast Highway, Wilmington, CA 90744. IDs: `r-solimar-wilmington-0217`, `r-solimar-wilmington-0281`, `r-solimar-wilmington-0115`. [Official property](https://www.livesolimar.com/apartments/ca/wilmington/), [gallery](https://www.livesolimar.com/apartments/ca/wilmington/gallery), [availability source](https://www.livesolimar.com/apartments/ca/wilmington/floor-plans).
- **Presidio Townhomes** — 2726 West Lincoln Avenue, Anaheim, CA 92801. IDs: `r-presidio-anaheim-129`, `r-presidio-anaheim-118`. [Official property](https://www.presidioanaheim.com/), [gallery](https://www.presidioanaheim.com/gallery/), [availability source](https://www.presidioanaheim.com/floorplans/).
- **The Residences on Jamboree** — 2801 Kelvin Avenue, Irvine, CA 92614. IDs: `wb-1-the-residences-on-jamboree-irvine`. [Official property](https://www.udr.com/orange-county-apartments/irvine/the-residences-on-jamboree/), [gallery](https://www.udr.com/orange-county-apartments/irvine/the-residences-on-jamboree/photos-and-tours/), [availability source](https://www.udr.com/orange-county-apartments/irvine/the-residences-on-jamboree/apartments-pricing/).
- **Paseos at Ontario** — 2615 E Date Palm Paseo, Ontario, CA 91764. IDs: `wb-2-paseos-at-ontario-ontario`. [Official property](https://www.paseosontario.com/), [gallery](https://www.paseosontario.com/photogallery.aspx), [availability source](https://www.paseosontario.com/availableunits.aspx).
- **Villas at the Gardens** — 7828 Day Creek Boulevard, Rancho Cucamonga, CA 91739. IDs: `wb-3-villas-at-the-gardens-rancho-cucamonga`. [Official property](https://www.villasatthegardens.com/), [gallery](https://www.villasatthegardens.com/photogallery), [availability source](https://www.villasatthegardens.com/floorplans).
- **The Core on Foothill** — 13250 Foothill Boulevard, Rancho Cucamonga, CA 91739. IDs: `wb-4-the-core-on-foothill-rancho-cucamonga`. [Official property](https://www.thecoreonfoothill.com/), [gallery](https://www.thecoreonfoothill.com/gallery/), [availability source](https://www.thecoreonfoothill.com/plans-availability/).
- **The Upland** — 1162 E 19th Street, Upland, CA 91784. IDs: `wb-5-the-upland-upland`. [Official property](https://www.uplandapts.com/), [gallery](https://www.uplandapts.com/gallery), [availability source](https://www.uplandapts.com/floorplans).
- **Union South Bay** — 615 E Carson Street, Carson, CA 90745. IDs: `wb-6-union-south-bay-carson`. [Official property](https://www.unionsouthbay.com/), [gallery](https://www.unionsouthbay.com/gallery), [availability source](https://www.unionsouthbay.com/floorplans).
- **Bellagio** — 5635 E Bell Road, Scottsdale, AZ 85254. IDs: `resource-3704263f121b2aea`. [Official property](https://www.mark-taylor.com/apartments/az/scottsdale/bellagio/), [gallery](https://www.mark-taylor.com/apartments/az/scottsdale/bellagio/photos/), [availability source](https://www.mark-taylor.com/apartments/az/scottsdale/bellagio/floor-plans/).
- **Sentio** — 3600 W Happy Valley Road, Glendale, AZ 85310. IDs: `resource-ca0cdd2b3119d29b`. [Official property](https://www.mark-taylor.com/apartments/az/glendale/sentio/), [gallery](https://www.mark-taylor.com/apartments/az/glendale/sentio/photos/), [availability source](https://www.mark-taylor.com/apartments/az/glendale/sentio/floor-plans/).

Identity was checked against the existing workbook JSON, real-rentals.ts, and catalog. Solimar is the Wilmington, California community, not the unrelated Florida property. Presidio is the Anaheim community. The Core is the Foothill Boulevard community, not a similarly named apartment site. Sentio uses the canonical Glendale page.

## Snapshot limits and conflicts

The Upland and Union South Bay observations were refreshed by direct HTTP GET at 2026-11-03T14:41:03Z and 14:41:04Z. Upland #2302 changed from the indexed November 11 date to November 10 in the direct response. Union S3 appeared wait-listed in the direct response; it was omitted from the positive sample.

Villas' latest content response at approximately 14:40:47Z showed 17 homes across five plans; an earlier response showed 18. Prices also differed, so this record retains counts and clearly discloses that retrieval difference. It does not assert that all 17 remain vacant.

Jamboree's indexed unit results conflicted with the retrieved pricing interface. The latter returned zero matching apartments, possibly because of rendering or filters. Neither an inventory count nor an indexed unit price was accepted as current. Paseos' availability retrieval timed out, and direct photo-site requests to Paseos/Villas returned 403. No restriction was bypassed. CORE and Mark-Taylor availability interfaces did not expose reliable unit rows in inspected content.

Search metadata, historical May workbook data, and older move-in-date query URLs are not promoted to current vacancy evidence. No application, tour booking, message, or resident record was submitted.

## Media reuse and embedding

Use gallery links for publisher photographs unless the owner supplies a separate license or their own photograph. [North Coast terms](https://northcoastliving.com/terms) require permission for public reuse. [Union South Bay terms](https://www.unionsouthbay.com/terms) limit copied materials to personal viewing. [Presidio's operator terms](https://www.conam.com/terms-of-use/) and the site's copyright notice do not supply a redistribution grant.

Bellagio's [official tour page](https://www.mark-taylor.com/apartments/az/scottsdale/bellagio/virtual-tour/) publishes community, one-bedroom and two-bedroom YouTube videos. [YouTube's terms](https://www.youtube.com/t/terms) permit its embeddable player; [official embed guidance](https://support.google.com/youtube/answer/171780?hl=en) explains privacy-enhanced mode and uploader controls. Use an explicit click before loading, `youtube-nocookie.com`, normal controls/branding, no copied thumbnail, and an outbound fallback. Send a valid HTTP Referer; `no-referrer` can cause error 153. The uploader may restrict embedding. Actual playback is not proven by the existence of an official link.

Matterport candidates were discovered in official property markup: [Jamboree gallery](https://www.udr.com/orange-county-apartments/irvine/the-residences-on-jamboree/photos-and-tours/), [Villas tours](https://www.villasatthegardens.com/virtualtours), and [Union gallery](https://www.unionsouthbay.com/gallery). The [current US terms](https://matterport.com/terms-of-use), updated August 5, 2026, differ materially from older regional wording that expressly permitted third-party embedding. This review does not establish an applicable grant for this directory. Records use `embedStatus: link-only`; the UI should open the official property source page. No model imagery, thumbnails, or model metadata was extracted from the Matterport service.

Jamboree's sourcePublishedAt values come from the property's JSON-LD uploadDate, not a recording-date assertion. Union's sourcePublishedDate comes from its published February 16, 2026 uploadDate; an exact time was not supplied.

## Image URL audit (metadata only; do not render automatically)

The following URLs identify images referenced by official pages. This is provenance for an owner permission request, not permission to copy, rehost, hotlink or publish. File-name dates are not verified capture dates. No image bytes were retained or visually inspected in this research pass.

- **Solimar Luxury Homes** — [published image URL](https://g5-assets-cld-res.cloudinary.com/image/upload/q_auto,f_auto,c_fill,g_center,h_1000,w_1000/v1728656183/g5/g5-c-5ygd95thp-truamerica/g5-cl-1oi2hmh339-truamerica-wilmington-ca/uploads/9c5f2ae9b8629bb1d1cafa1dda16d46b_f93ggv.jpg). Official gallery identifies a bedroom. No exact saved-unit match.
- **Presidio Townhomes** — [published image URL](https://media.apts247.info/18/1827f89044b249438c4934341e12af8c/hero_shot/community/7N4A2272.jpg). Published page background; descriptive caption not established.
- **The Residences on Jamboree** — [published image URL](https://www.udr.com/globalassets/communities/the-residences-on-jamboree/images/residenceatjamboree_2024_sign-02_ad.jpg). Official alternative text identifies the building exterior.
- **Paseos at Ontario** — [published image URL](https://cdngeneralcf.rentcafe.com/dmslivecafe/2/7204/1X6A5745_1_18689_941522661%20%281%29.jpg). Official homepage image link; image fetch timed out.
- **Villas at the Gardens** — [published image URL](https://resource.rentcafe.com/image/upload/x_0,y_0,w_2560,h_1600,c_crop/q_auto,f_auto,c_lfill,w_576,ar_1.844/s3/2/83511/villas-community-patio-clubhouse-back-patio-with-fire-pits.jpg). Official page identifies the clubhouse rear patio.
- **The Core on Foothill** — [published image URL](https://www.thecoreonfoothill.com/wp-content/uploads/2024/04/GS_TCOFH_Ph_II_One_Bed_Living_Kitchen-1.jpg). Official alternative text identifies a living/kitchen interior; not an exact available unit.
- **The Upland** — [published image URL](https://www.livenorthcoast.com/images/upland/gallery/community/0923-upland-exterior-view-5b.jpg). Official source names an exterior view.
- **Union South Bay** — [published image URL](https://s3-us-west-2.amazonaws.com/mktapts/images/forum/731USB/home/slide1.jpg). Official homepage hero; descriptive caption not established.
- **Bellagio** — [published image URL](https://union-corporate.imgix.net/bellagio/image/2024-07-19/1721400871_Spacious_Living_Area.jpg?auto=format). Official source names a living area.
- **Sentio** — [published image URL](https://union-corporate.imgix.net/sentio/image/2025-04-15/1744696369_23-051-01_Front_exterior_A.jpg?auto=format). Official page identifies the community location/exterior.

## Verification and handoff

The scoped writer validates JSON, ID membership/uniqueness, HTTP(S) URLs without credentials, allowed states and statuses, plan counts, and source/provenance fields before atomic replacement. Root owns integration, tests, browser review, release, and checkpoint updates. No build/install/Git/browser operation or background job was started by this worker.

## Licensed city-context image candidate for the owner upload test

This candidate is separate from the ten property communities above. The existing registry contains `az-phoenix`.

- Source: [Phoenix Skyline 2025.jpg on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Phoenix_Skyline_2025.jpg), file page ID 177458273.
- Original image: [Phoenix_Skyline_2025.jpg](https://upload.wikimedia.org/wikipedia/commons/6/6a/Phoenix_Skyline_2025.jpg).
- Author: J550112. The file page labels it the uploader's own work.
- License: [CC0 1.0 Universal Public Domain Dedication](https://creativecommons.org/publicdomain/zero/1.0/), explicitly attached to this image rather than inferred from Commons' general metadata license.
- Source-reported photograph date: October 25, 2025. Identity evidence: the image caption identifies a westward view of downtown Phoenix.
- Commons imageinfo API returned JPEG, 1,930 × 1,343 pixels, 490,696 bytes. Its returned original URL carried only utm tracking parameters; the clean URL above preserves the same file path.
- Suggested caption/alt: Downtown Phoenix skyline, photographed in October 2025. City context only.
- Suggested credit: J550112 / Wikimedia Commons (CC0 1.0).
- Use only as city context. It does not depict any specifically matched rental or establish current conditions or vacancy. Root should visually inspect the actual image before an authenticated upload.

The file page, license deed and imageinfo metadata were inspected. No image file was downloaded, uploaded or visually inspected by this worker. CC0 permits copyright reuse; attribution is retained for provenance without implying endorsement.
