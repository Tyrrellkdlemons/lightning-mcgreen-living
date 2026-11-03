# California and Arizona place registry

This geography registry contains every California and Arizona place in the **2026 U.S. Census Gazetteer** retrieved November 3, 2026: **2,089 records**. California has 1,622 (462 cities, 21 towns, 1,139 Census-designated places); Arizona has 467 (46 cities, 46 towns, 375 Census-designated places).

The scope is incorporated cities/towns and Census-designated places, not every neighborhood, postal place name, or informal community. Existing curated guides stay separate. A place in this registry does not imply a housing listing, current vacancy, sale, or service eligibility.

`places.json` stores official names, stable state/GEOID IDs, entity types, county relationships, and Census internal points. `internalPoint` is the Gazetteer INTPTLAT/INTPTLONG representative location, **not a geometric centroid or property address**. Only parenthetical aliases present in an official Census name are included (for example Ventura). Records keep their original Unicode names.

`metadata.json` records sources, retrieval timestamps, source file hashes, counts, and limitations. The official [2026 Gazetteer reference page](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.2026.html) links the [California file](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_gaz_place_06.txt) and [Arizona file](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_gaz_place_04.txt). Both source responses were HTTP 200 with Last-Modified September 8, 2026.

## County vintage

The official [2020 Census place-by-county crosswalk](https://www2.census.gov/geo/docs/reference/codes2020/national_place_by_county2020.txt) matches 2,076 of the current GEOIDs. All county relationships are retained, including places such as Sedona and Apache Junction that span counties. These 2,076 relationships have **not all been reverified against 2026 boundaries**.

Thirteen new California CDPs are absent from that crosswalk. Their county relationships were queried from official January 1, 2026 [TIGERweb CDP polygons](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/5) and [county polygons](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1). The query tests polygon-interior intersection (`esriSpatialRelRelation`, `T********`), so it neither guesses from an internal point nor includes a county that touches only the border. Each record states `countySourceYear` and `countySourceId`. Raw source receipts and query evidence live in `.revamp-evidence/all-city-corpus/` (local research artifacts, not required in a deployment).

## Pure lookup API

```ts
import { LOCATIONS, LOCATION_METADATA, searchLocations, getLocation, resolveLocation } from '@/lib/locations';

getLocation('ca-0644000'); // Los Angeles
searchLocations({ state: 'AZ', county: 'Yavapai', query: 'Sedona', page: 1, pageSize: 50 });
resolveLocation('Glendale'); // ambiguous; both states returned
resolveLocation('Strawberry', 'CA'); // ambiguous; two distinct California CDPs
```

Exports also include `normalizeLocationText` and types `LocationRecord`, `LocationCounty`, `LocationState`, `LocationType`, `LocationSearchOptions`, `LocationSearchResult`, and `LocationResolution`.

`searchLocations({ query?, state?, county?, type?, page?, pageSize? })` returns `{ items, total, page, pageSize, pageCount }`. Filters intersect. State accepts CA/AZ or the full state name; county accepts its full name, short name, or five-digit GEOID; type accepts city/town/cdp. Invalid supplied state/county/type values return zero results rather than silently widening the geography. URL arrays use their first value. Search normalizes accents, punctuation, case, and whitespace, ranks exact names then prefixes, and preserves every remaining match through pagination. Default page size is 50; maximum is 200; a page beyond the end clamps to the last page. Empty results have page 1 and pageCount 0.

`resolveLocation` requires an exact normalized name or official alias and returns all exact matches with status matched/ambiguous/not-found. Never silently take the first match of an ambiguous result. `getLocation` accepts the stable ID. Every exported location and its nested geographic fields are immutable. The module has no network, browser, storage, UI, or external service dependencies.

Run `node --test scripts/test-location-registry.mjs` with the repository TypeScript dev dependency available. Tests cover official counts/GEOIDs, all 73 counties, original internal points, duplicate names, Unicode, strict jurisdiction handling, multi-county places, small towns, updated entity types, full pagination, and source-file equivalence when local evidence exists.
