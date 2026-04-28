import { NhtsaVpicProvider } from './nhtsa-vpic';
import { FuelEconomyProvider } from './fuel-economy';
import { OverpassProvider } from './overpass';
import { CensusAcsProvider } from './census-acs';
import { HudFmrProvider } from './hud-fmr';
import { GooglePlacesProvider } from './google-places';
import { CaSosProvider } from './ca-sos';
import { CaDmvOlProvider } from './ca-dmv-ol';
import { YelpFusionProvider } from './yelp-fusion';
import { NominatimProvider } from './nominatim';
import { TransitFeedsProvider } from './transit-feeds';
import { NhtsaSafetyProvider } from './nhtsa-safety';
import { OpenChargeMapProvider } from './open-charge-map';
import {
  ZillowBridgeProvider,
  ApartmentsComProvider,
  RentDotComProvider,
  YardiRentCafeProvider,
  EntrataProvider,
  AppFolioProvider,
  RealPageProvider,
  CarsComProvider,
  AutotraderProvider,
  CarGurusProvider,
  MarketCheckProvider,
  UHaulProvider,
  PenskeProvider,
  BudgetTruckProvider,
  EnterpriseTruckProvider,
  RyderProvider,
  FluidTruckProvider,
  HomeDepotTruckProvider,
} from './partner-stubs';

import type { Provider, ProviderInfo } from './base';

/** Single registry of every provider. Used by /data-sources and /admin. */
export const PROVIDERS: Provider<any, any>[] = [
  // Live, free, no key
  NhtsaVpicProvider,
  FuelEconomyProvider,
  OverpassProvider,
  CensusAcsProvider,
  HudFmrProvider,
  NominatimProvider,
  TransitFeedsProvider,
  NhtsaSafetyProvider,
  OpenChargeMapProvider,

  // Manual-link / verified-link adapters (open source workarounds)
  CaSosProvider,
  CaDmvOlProvider,

  // Env-key gated
  GooglePlacesProvider,
  YelpFusionProvider,

  // Partner / paid stubs
  ZillowBridgeProvider,
  ApartmentsComProvider,
  RentDotComProvider,
  YardiRentCafeProvider,
  EntrataProvider,
  AppFolioProvider,
  RealPageProvider,
  CarsComProvider,
  AutotraderProvider,
  CarGurusProvider,
  MarketCheckProvider,
  UHaulProvider,
  PenskeProvider,
  BudgetTruckProvider,
  EnterpriseTruckProvider,
  RyderProvider,
  FluidTruckProvider,
  HomeDepotTruckProvider,
];

export function getProviderRegistry(): ProviderInfo[] {
  return PROVIDERS.map((p) => p.info);
}
