/**
 * Map basemap configuration — open-source first, no Google Maps required.
 *
 *   1. CARTO Voyager — free for non-commercial + light usage; attribution required.
 *      Style URL: https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json
 *   2. OSM Liberty — open style on top of OSM tiles (self-host friendly).
 *
 * Selectable via NEXT_PUBLIC_BASEMAP_STYLE env var; defaults to CARTO Voyager.
 */

export const BASEMAP_PRESETS = {
  cartoVoyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  cartoPositron: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  cartoDarkMatter: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const;

export function getBasemapStyle(): string {
  return (
    process.env.NEXT_PUBLIC_BASEMAP_STYLE ||
    BASEMAP_PRESETS.cartoVoyager
  );
}

export const MAP_ATTRIBUTION = '© OpenStreetMap contributors © CARTO';
