import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    '/', '/rentals', '/apartments', '/townhomes',
    '/cars', '/work-vehicles', '/life-budget',
    '/compare', '/saved', '/data-sources',
    '/privacy', '/terms', '/accessibility',
  ];
  return routes.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: r === '/' ? 1 : 0.7,
  }));
}
