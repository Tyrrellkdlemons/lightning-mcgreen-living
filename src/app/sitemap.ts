import type { MetadataRoute } from 'next';
import { PLACES, stateSlug } from '@/lib/places';
import { RESOURCE_SOURCES } from '@/lib/resources';
import { WORKBOOK_RANKED_LISTINGS } from '@/lib/data/workbook-ranked-listings';
import { REAL_RENTALS } from '@/lib/data/real-rentals';
import { REAL_VEHICLES, REAL_DEALERS } from '@/lib/data/real-vehicles';
import { REAL_WORK_VEHICLES } from '@/lib/data/real-work-vehicles';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lightning-mcgreen-living.netlify.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    '/', '/help', '/assistant', '/resources', '/properties', '/places', '/places/california', '/places/arizona', '/rentals', '/apartments', '/apartments/apply-engine', '/townhomes',
    '/cars', '/work-vehicles', '/life-budget',
    '/compare', '/saved', '/search',
    '/data-sources', '/assistance', '/templates',
    '/privacy', '/terms', '/accessibility',
  ];

  const rentalRoutes = REAL_RENTALS.map((r) =>
    r.unit_type === 'townhouse' ? `/townhomes/${r.id}` : `/apartments/${r.id}`,
  );
  const vehicleRoutes = REAL_VEHICLES.map((v) => `/cars/${v.id}`);
  const dealerRoutes = REAL_DEALERS.map((d) => `/dealers/${d.id}`);
  const workRoutes = REAL_WORK_VEHICLES.map((w) => `/work-vehicles/${w.id}`);

  const placeRoutes = PLACES.map(p => `/places/${stateSlug(p.state)}/${p.slug}`);
  const all = [...RESOURCE_SOURCES.map(s => `/resources/${s.id}`), ...WORKBOOK_RANKED_LISTINGS.map(w => `/properties/${w.id}`), ...placeRoutes, ...staticRoutes, ...rentalRoutes, ...vehicleRoutes, ...dealerRoutes, ...workRoutes];

  return all.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path.includes('/') && path.split('/').length > 2 ? 0.6 : 0.8,
  }));
}
