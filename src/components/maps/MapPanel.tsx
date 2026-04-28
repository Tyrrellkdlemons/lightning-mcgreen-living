'use client';

import { useEffect, useRef } from 'react';
import { getBasemapStyle, MAP_ATTRIBUTION } from '@/lib/maps/basemap';

/**
 * Lazy-loaded MapLibre GL JS map panel. No Google Maps key required.
 *
 * Imports `maplibre-gl` dynamically so the JS only ships on routes that
 * actually render a map (per UI_THEME_GUIDE.md performance rules).
 */
export function MapPanel({
  lat,
  lng,
  zoom = 13,
  height = 280,
  markers = [],
}: {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number;
  markers?: { lat: number; lng: number; label?: string; tone?: 'rental' | 'dealer' | 'work' }[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      if (!ref.current) return;
      const maplibre = await import('maplibre-gl');
      if (cancelled || !ref.current) return;
      // Dynamically inject maplibre-gl CSS once
      if (!document.head.querySelector('link[data-maplibre]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@4.1.0/dist/maplibre-gl.css';
        link.dataset.maplibre = '1';
        document.head.appendChild(link);
      }
      const map = new maplibre.Map({
        container: ref.current,
        style: getBasemapStyle(),
        center: [lng, lat],
        zoom,
        attributionControl: { customAttribution: MAP_ATTRIBUTION },
      });
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
      const all = [{ lat, lng, label: 'Here', tone: 'rental' as const }, ...markers];
      for (const m of all) {
        const el = document.createElement('div');
        el.style.cssText = `
          width: 22px; height: 22px; border-radius: 999px;
          border: 2px solid #1a0d05;
          background: ${m.tone === 'dealer' ? '#ff4f5e' : m.tone === 'work' ? '#dca257' : '#34db00'};
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: #1a0d05;
        `;
        el.textContent = (m.tone === 'dealer' ? 'D' : m.tone === 'work' ? 'W' : 'R');
        el.setAttribute('aria-label', m.label ?? 'marker');
        new maplibre.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
      }
      cleanup = () => map.remove();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [lat, lng, zoom, markers]);

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Map"
      style={{ height, width: '100%', borderRadius: 16, overflow: 'hidden', border: '2px solid #a86926' }}
    />
  );
}
