/**
 * Static map tile helpers for listing photo galleries.
 *
 * - `neighborhoodTile(...)` uses CARTO Voyager (street context)
 * - `satelliteNeighborhoodTile(...)` uses Esri World Imagery (aerial context)
 */

export interface OsmTile {
  url: string;
  attribution: string;
}

export interface SatelliteFallbackOptions {
  mapTilerKey?: string;
  mapboxToken?: string;
  zoom?: number;
}

function clampLat(lat: number): number {
  // Web Mercator hard limit.
  return Math.max(-85.05112878, Math.min(85.05112878, lat));
}

function normalizeLng(lng: number): number {
  // Wrap into [-180, 180) so tile selection is deterministic.
  const wrapped = ((lng + 180) % 360 + 360) % 360 - 180;
  return wrapped === -180 ? 180 : wrapped;
}

function lonToTileX(lon: number, z: number): number {
  return Math.floor(((normalizeLng(lon) + 180) / 360) * Math.pow(2, z));
}

function latToTileY(lat: number, z: number): number {
  const clamped = clampLat(lat);
  const rad = (clamped * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, z),
  );
}

/** Return a single CARTO raster tile URL covering the (lat, lng) area. */
export function neighborhoodTile(lat: number, lng: number, zoom = 14): OsmTile {
  const x = lonToTileX(lng, zoom);
  const y = latToTileY(lat, zoom);
  // Retina @2x for sharper card thumbnails.
  const url = `https://basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${x}/${y}@2x.png`;
  return {
    url,
    attribution: '© OpenStreetMap contributors © CARTO',
  };
}

/** Return a single Esri World Imagery tile URL for (lat, lng). */
export function satelliteNeighborhoodTile(lat: number, lng: number, zoom = 16): OsmTile {
  const x = lonToTileX(lng, zoom);
  const y = latToTileY(lat, zoom);
  const url = `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
  return {
    url,
    attribution: 'Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  };
}

/** Return a MapTiler satellite tile URL (when key is available). */
export function mapTilerSatelliteTile(lat: number, lng: number, mapTilerKey: string, zoom = 16): OsmTile {
  const x = lonToTileX(lng, zoom);
  const y = latToTileY(lat, zoom);
  const key = encodeURIComponent(mapTilerKey.trim());
  const url = `https://api.maptiler.com/tiles/satellite-v4/${zoom}/${x}/${y}.jpg?key=${key}`;
  return {
    url,
    attribution: '© MapTiler © OpenStreetMap contributors',
  };
}

/** Return a Mapbox satellite tile URL (when token is available). */
export function mapboxSatelliteTile(lat: number, lng: number, mapboxToken: string, zoom = 16): OsmTile {
  const x = lonToTileX(lng, zoom);
  const y = latToTileY(lat, zoom);
  const token = encodeURIComponent(mapboxToken.trim());
  const url = `https://api.mapbox.com/v4/mapbox.satellite/${zoom}/${x}/${y}.jpg90?access_token=${token}`;
  return {
    url,
    attribution: '© Mapbox © OpenStreetMap contributors',
  };
}

/**
 * Choose the best available satellite fallback:
 * MapTiler -> Mapbox -> Esri.
 */
export function preferredSatelliteFallback(
  lat: number,
  lng: number,
  options: SatelliteFallbackOptions = {},
): OsmTile {
  const zoom = options.zoom ?? 16;
  const mapTilerKey = options.mapTilerKey?.trim();
  if (mapTilerKey) return mapTilerSatelliteTile(lat, lng, mapTilerKey, zoom);

  const mapboxToken = options.mapboxToken?.trim();
  if (mapboxToken) return mapboxSatelliteTile(lat, lng, mapboxToken, zoom);

  return satelliteNeighborhoodTile(lat, lng, zoom);
}
