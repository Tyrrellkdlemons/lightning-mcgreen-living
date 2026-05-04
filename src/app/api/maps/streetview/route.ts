import { NextRequest, NextResponse } from 'next/server';
import { preferredSatelliteFallback } from '@/lib/assets/static-osm-tile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const METADATA_ENDPOINT = 'https://maps.googleapis.com/maps/api/streetview/metadata';
const IMAGE_ENDPOINT = 'https://maps.googleapis.com/maps/api/streetview';
const DEFAULT_FOV = 55;
const DEFAULT_PITCH = 2;
const DEFAULT_RADIUS = 90;
const DEFAULT_HEADING = 0;
const IMAGE_SIZE = '640x360';

function toFiniteNumber(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function inBounds(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function fallback(lat: number, lng: number) {
  return preferredSatelliteFallback(lat, lng, {
    mapTilerKey: process.env.NEXT_PUBLIC_MAPTILER_API_KEY,
    mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    zoom: 18,
  }).url;
}

function buildStreetViewImageUrl(lat: number, lng: number, key: string, heading: number, fov: number) {
  const url = new URL(IMAGE_ENDPOINT);
  url.searchParams.set('size', IMAGE_SIZE);
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('fov', String(fov));
  url.searchParams.set('pitch', String(DEFAULT_PITCH));
  url.searchParams.set('radius', String(DEFAULT_RADIUS));
  url.searchParams.set('source', 'outdoor');
  url.searchParams.set('heading', String(heading));
  url.searchParams.set('return_error_code', 'true');
  url.searchParams.set('key', key);
  return url.toString();
}

function buildMetadataUrl(lat: number, lng: number, key: string) {
  const url = new URL(METADATA_ENDPOINT);
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('radius', String(DEFAULT_RADIUS));
  url.searchParams.set('source', 'outdoor');
  url.searchParams.set('key', key);
  return url.toString();
}

interface StreetViewMetadata {
  status?: string;
  location?: { lat?: number; lng?: number };
}

async function hasStreetView(lat: number, lng: number, key: string): Promise<StreetViewMetadata | null> {
  const url = buildMetadataUrl(lat, lng, key);
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) return null;
  try {
    return (await res.json()) as StreetViewMetadata;
  } catch {
    return null;
  }
}

function deriveHeading(sourceLat: number, sourceLng: number, panoLat?: number, panoLng?: number): number {
  if (panoLat == null || panoLng == null) return DEFAULT_HEADING;

  const dy = panoLat - sourceLat;
  const dx = panoLng - sourceLng;
  if (dy === 0 && dx === 0) return DEFAULT_HEADING;

  // 0 = North, 90 = East.
  const theta = (Math.atan2(dx, dy) * 180) / Math.PI;
  const heading = Math.round((theta + 360) % 360);
  return heading;
}

export async function GET(req: NextRequest) {
  const lat = toFiniteNumber(req.nextUrl.searchParams.get('lat'));
  const lng = toFiniteNumber(req.nextUrl.searchParams.get('lng'));
  const requestedFov = toFiniteNumber(req.nextUrl.searchParams.get('fov'));
  const fov = requestedFov == null ? DEFAULT_FOV : clampNumber(Math.round(requestedFov), 20, 100);

  if (lat == null || lng == null || !inBounds(lat, lng)) {
    return NextResponse.json({ error: 'lat,lng required' }, { status: 400 });
  }

  const googleKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!googleKey) {
    return NextResponse.redirect(fallback(lat, lng), { status: 302 });
  }

  try {
    const metadata = await hasStreetView(lat, lng, googleKey);
    if (!metadata || metadata.status !== 'OK') {
      return NextResponse.redirect(fallback(lat, lng), { status: 302 });
    }

    const heading = deriveHeading(lat, lng, metadata.location?.lat, metadata.location?.lng);
    return NextResponse.redirect(buildStreetViewImageUrl(lat, lng, googleKey, heading, fov), { status: 302 });
  } catch {
    return NextResponse.redirect(fallback(lat, lng), { status: 302 });
  }
}
