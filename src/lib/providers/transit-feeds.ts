/**
 * Free transit feeds for the SoCal commute layer.
 *
 *   - LA Metro:   https://api.metro.net  (GTFS-RT trip updates / vehicle positions / alerts)
 *   - Metrolink:  https://metrolinktrains.com/about/gtfs/  (static GTFS + RT alerts)
 *   - OCTA:       https://www.octa.net/about/about-octa/open-data/  (GTFS + GIS)
 *
 * We don't decode protobuf in the browser — we just deep-link the
 * authoritative data so commute scores and "near transit" badges have a
 * verifiable source URL until a backend RT consumer is built.
 */

import { nowIso, type Provider, type ProviderInfo } from './base';

export interface TransitFeedRef {
  agency: string;
  feed_url: string;
  realtime_url?: string;
  notes?: string;
}

const FEEDS: TransitFeedRef[] = [
  {
    agency: 'LA Metro',
    feed_url: 'https://gitlab.com/LACMTA/gtfs_bus',
    realtime_url: 'https://api.metro.net/',
    notes: 'GTFS + GTFS-RT (TripUpdate, VehiclePositions, Alerts).',
  },
  {
    agency: 'Metrolink',
    feed_url: 'https://metrolinktrains.com/about/gtfs/',
    realtime_url: 'https://rtt.metrolinktrains.com/feed/gtfs-rt',
    notes: 'Static GTFS public; some RT feeds need a free key.',
  },
  {
    agency: 'OCTA',
    feed_url: 'https://www.octa.net/about/about-octa/open-data/',
    notes: 'Static GTFS + GIS open data portal.',
  },
];

export const TransitFeedsProvider: Provider<{ agency?: string }, TransitFeedRef> = {
  info: {
    id: 'socal-transit',
    label: 'SoCal transit feeds (LA Metro / Metrolink / OCTA)',
    status: 'live',
    legal_status: 'free',
    homepage: 'https://api.metro.net/',
    notes: 'Reference + deep-links; full GTFS-RT consumer is roadmap.',
  },

  async search({ agency } = {}) {
    const data = agency
      ? FEEDS.filter((f) => f.agency.toLowerCase() === agency.toLowerCase())
      : FEEDS;
    return {
      data,
      meta: {
        source: 'public-open-data' as const,
        source_url: 'https://api.metro.net/',
        last_seen_at: nowIso(),
        trust_label: 'official' as const,
      },
    };
  },
};

export function listSoCalTransitFeeds(): TransitFeedRef[] {
  return FEEDS;
}

export const TRANSIT_PROVIDER_INFO: ProviderInfo = TransitFeedsProvider.info;
