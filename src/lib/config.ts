/**
 * Build-time + runtime configuration. Keep this file dependency-free so it can
 * be imported from both server and client without bloating the client bundle.
 */

export type DataMode = 'demo' | 'production';

export const config = {
  appName: 'Lightning McGreen Living',
  shortName: 'McGreen Living',
  tagline:
    'Explore California and Arizona city guides, housing resources, rentals, cars, and work vehicles. Plan your next move with clear sources and practical tools.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lightning-mcgreen-living.netlify.app',

  dataMode: (process.env.NEXT_PUBLIC_DATA_MODE ?? 'production') as DataMode,
  geofenceSocal: (process.env.NEXT_PUBLIC_GEOFENCE_SOCAL ?? 'true') === 'true',
} as const;

export const isDemo = () => config.dataMode === 'demo';
export const isProduction = () => config.dataMode === 'production';
