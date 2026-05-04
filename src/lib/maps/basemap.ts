/**
 * Map basemap registry with open defaults + optional satellite providers.
 *
 * Default behavior (no keys required):
 * - CARTO Voyager (street)
 * - CARTO Dark Matter (dark)
 * - Esri World Imagery (satellite)
 * - USGS Imagery Only (satellite, US-focused)
 *
 * Optional keyed providers:
 * - MapTiler satellite (`NEXT_PUBLIC_MAPTILER_API_KEY`)
 * - Mapbox satellite (`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`)
 */

export type BasemapKind = 'street' | 'dark' | 'satellite';

export type BasemapId =
  | 'carto-voyager'
  | 'carto-dark'
  | 'esri-world-imagery'
  | 'usgs-imagery'
  | 'maptiler-satellite'
  | 'mapbox-satellite';

export type BasemapStyle =
  | string
  | {
      version: 8;
      name: string;
      sources: Record<
        string,
        {
          type: 'raster';
          tiles: string[];
          tileSize: number;
          attribution?: string;
          minzoom?: number;
          maxzoom?: number;
        }
      >;
      layers: Array<{
        id: string;
        type: 'raster';
        source: string;
        minzoom?: number;
        maxzoom?: number;
      }>;
    };

export interface BasemapOption {
  id: BasemapId;
  label: string;
  kind: BasemapKind;
  provider: string;
  style: BasemapStyle;
  attribution: string;
  requiresEnv?: 'NEXT_PUBLIC_MAPTILER_API_KEY' | 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN';
}

function rasterStyle(name: string, tiles: string[], attribution: string, maxzoom = 22): BasemapStyle {
  return {
    version: 8,
    name,
    sources: {
      rasterTiles: {
        type: 'raster',
        tiles,
        tileSize: 256,
        attribution,
        maxzoom,
      },
    },
    layers: [{ id: 'raster-base', type: 'raster', source: 'rasterTiles' }],
  };
}

function optionalSatelliteProviders(): BasemapOption[] {
  const out: BasemapOption[] = [];

  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY?.trim();
  if (mapTilerKey) {
    out.push({
      id: 'maptiler-satellite',
      label: 'Satellite (MapTiler)',
      kind: 'satellite',
      provider: 'MapTiler',
      style: `https://api.maptiler.com/maps/satellite/style.json?key=${encodeURIComponent(mapTilerKey)}`,
      attribution: '© MapTiler © OpenStreetMap contributors',
      requiresEnv: 'NEXT_PUBLIC_MAPTILER_API_KEY',
    });
  }

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
  if (mapboxToken) {
    out.push({
      id: 'mapbox-satellite',
      label: 'Satellite (Mapbox)',
      kind: 'satellite',
      provider: 'Mapbox',
      style: rasterStyle(
        'Mapbox Satellite',
        [
          `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg90?access_token=${encodeURIComponent(
            mapboxToken,
          )}`,
        ],
        '© Mapbox © OpenStreetMap contributors',
      ),
      attribution: '© Mapbox © OpenStreetMap contributors',
      requiresEnv: 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
    });
  }

  return out;
}

const ALWAYS_AVAILABLE: BasemapOption[] = [
  {
    id: 'carto-voyager',
    label: 'Street (CARTO)',
    kind: 'street',
    provider: 'CARTO Voyager',
    style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    attribution: '© OpenStreetMap contributors © CARTO',
  },
  {
    id: 'carto-dark',
    label: 'Dark (CARTO)',
    kind: 'dark',
    provider: 'CARTO Dark Matter',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    attribution: '© OpenStreetMap contributors © CARTO',
  },
  {
    id: 'esri-world-imagery',
    label: 'Satellite (Esri)',
    kind: 'satellite',
    provider: 'Esri World Imagery',
    style: rasterStyle(
      'Esri World Imagery',
      ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      'Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    ),
    attribution: 'Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  },
  {
    id: 'usgs-imagery',
    label: 'Satellite (USGS)',
    kind: 'satellite',
    provider: 'USGS Imagery Only',
    style: rasterStyle(
      'USGS Imagery',
      ['https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}'],
      'Courtesy of U.S. Geological Survey',
      20,
    ),
    attribution: 'Courtesy of U.S. Geological Survey',
  },
];

export function getBasemapOptions(): BasemapOption[] {
  return [...ALWAYS_AVAILABLE, ...optionalSatelliteProviders()];
}

export function getDefaultBasemapId(): BasemapId {
  const env = (process.env.NEXT_PUBLIC_DEFAULT_BASEMAP ?? '').trim().toLowerCase();
  const valid = new Set<BasemapId>([
    'carto-voyager',
    'carto-dark',
    'esri-world-imagery',
    'usgs-imagery',
    'maptiler-satellite',
    'mapbox-satellite',
  ]);
  if (valid.has(env as BasemapId)) return env as BasemapId;
  return 'carto-voyager';
}

export function resolveBasemap(id?: BasemapId): BasemapOption {
  const options = getBasemapOptions();
  const wanted = id ?? getDefaultBasemapId();
  return options.find((x) => x.id === wanted) ?? options[0];
}
