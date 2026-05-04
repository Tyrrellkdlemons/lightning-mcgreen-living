'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Map as MapIcon, Moon, Satellite } from 'lucide-react';
import {
  type BasemapId,
  type BasemapKind,
  getBasemapOptions,
  getDefaultBasemapId,
  resolveBasemap,
} from '@/lib/maps/basemap';

const STYLE_STORAGE = 'lmgl:basemap-style';

/**
 * Lazy-loaded MapLibre GL JS map panel with user-selectable map styles.
 *
 * Includes open, no-key street + satellite defaults, and automatically exposes
 * extra satellite providers when API keys are present.
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
  const options = useMemo(() => getBasemapOptions(), []);
  const [basemapId, setBasemapId] = useState<BasemapId>(getDefaultBasemapId());
  const selected = useMemo(() => resolveBasemap(basemapId), [basemapId]);

  const byKind = useMemo(
    () => ({
      street: options.filter((o) => o.kind === 'street'),
      dark: options.filter((o) => o.kind === 'dark'),
      satellite: options.filter((o) => o.kind === 'satellite'),
    }),
    [options],
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STYLE_STORAGE) as BasemapId | null;
      if (saved && options.some((o) => o.id === saved)) {
        setBasemapId(saved);
      } else if (!options.some((o) => o.id === basemapId)) {
        setBasemapId(options[0].id);
      }
    } catch {
      // ignore storage failures
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  useEffect(() => {
    try {
      localStorage.setItem(STYLE_STORAGE, basemapId);
    } catch {
      // ignore storage failures
    }
  }, [basemapId]);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      if (!ref.current) return;
      const maplibre = await import('maplibre-gl');
      if (cancelled || !ref.current) return;
      if (!document.head.querySelector('link[data-maplibre]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@4.1.0/dist/maplibre-gl.css';
        link.dataset.maplibre = '1';
        document.head.appendChild(link);
      }

      const map = new maplibre.Map({
        container: ref.current,
        style: selected.style as any,
        center: [lng, lat],
        zoom,
        attributionControl: { customAttribution: selected.attribution },
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
        el.textContent = m.tone === 'dealer' ? 'D' : m.tone === 'work' ? 'W' : 'R';
        el.setAttribute('aria-label', m.label ?? 'marker');
        new maplibre.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
      }

      cleanup = () => map.remove();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [lat, lng, zoom, markers, selected]);

  function setKind(kind: BasemapKind) {
    const first = byKind[kind][0];
    if (first) setBasemapId(first.id);
  }

  const currentKindOptions = byKind[selected.kind];

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label="Map"
        style={{ height, width: '100%', borderRadius: 16, overflow: 'hidden', border: '2px solid #a86926' }}
      />

      <div className="pointer-events-none absolute left-2 top-2 z-10">
        <div className="pointer-events-auto rounded-md border border-gingerbread-300 bg-frosting-50/95 p-1.5 shadow-cookie">
          <div className="grid grid-cols-3 gap-1">
            <StyleButton active={selected.kind === 'street'} onClick={() => setKind('street')} icon={<MapIcon className="h-3.5 w-3.5" />} label="Street" />
            <StyleButton active={selected.kind === 'satellite'} onClick={() => setKind('satellite')} icon={<Satellite className="h-3.5 w-3.5" />} label="Satellite" />
            <StyleButton active={selected.kind === 'dark'} onClick={() => setKind('dark')} icon={<Moon className="h-3.5 w-3.5" />} label="Dark" />
          </div>

          {currentKindOptions.length > 1 && (
            <select
              value={basemapId}
              onChange={(e) => setBasemapId(e.target.value as BasemapId)}
              className="mt-1.5 w-full rounded border border-gingerbread-300 bg-white px-1.5 py-1 text-[11px] font-semibold text-chocolate-800"
              aria-label="Map provider"
            >
              {currentKindOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.provider}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

function StyleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex items-center justify-center gap-1 rounded border px-1.5 py-1 text-[11px] font-semibold transition-colors ' +
        (active
          ? 'border-lightning-500 bg-lightning-500/15 text-chocolate-900'
          : 'border-gingerbread-300 bg-white text-chocolate-700 hover:bg-frosting-100')
      }
      title={label}
      aria-label={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
