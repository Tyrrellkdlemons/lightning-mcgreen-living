/**
 * Build-time + runtime configuration. Keep this file dependency-free so it can
 * be imported from both server and client without bloating the client bundle.
 */

export type DataMode = 'demo' | 'production';

export const config = {
  appName: 'Lightning McGreen Living',
  shortName: 'McGreen Living',
  tagline:
    'Southern California rentals + cars + work vehicles. Find what you can actually qualify for.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

  dataMode: (process.env.NEXT_PUBLIC_DATA_MODE ?? 'production') as DataMode,
  geofenceSocal: (process.env.NEXT_PUBLIC_GEOFENCE_SOCAL ?? 'true') === 'true',
} as const;

export const isDemo = () => config.dataMode === 'demo';
export const isProduction = () => config.dataMode === 'production';
