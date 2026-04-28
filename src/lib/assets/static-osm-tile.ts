/**
 * OpenStreetMap raster tile URL for a single (lat, lng, zoom) — used as the
 * "neighborhood" slide on listing photo galleries.
 *
 * Uses CARTO Voyager light tiles (same basemap MapPanel uses) which is
 * permissive for non-commercial / light usage and is already declared in
 * `next.config.mjs` `images.remotePatterns`.
 *
 * Reference: https://github.com/CartoDB/basemap-styles
 */

export interface OsmTile {
  url: string;
  attribution: string;
}

function lonToTileX(lon: number, z: number) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, z));
}
function latToTileY(lat: number, z: number) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      Math.pow(2, z),
  );
}

/** Return a single CARTO raster tile URL covering the (lat, lng) area. */
export function neighborhoodTile(lat: number, lng: number, zoom = 14): OsmTile {
  const x = lonToTileX(lng, zoom);
  const y = latToTileY(lat, zoom);
  // Voyager raster tiles, retina @2x for sharper card thumbnails
  const url = `https://basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${x}/${y}@2x.png`;
  return {
    url,
    attribution: '© OpenStreetMap contributors © CARTO',
  };
}
