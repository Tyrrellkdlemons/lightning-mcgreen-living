/**
 * Partner-only / paid stub providers.
 *
 * Each one throws `ProviderRequiresContractError` when called without a
 * configured key, and reports `partner-required` / `paid-required` in
 * `getProviderRegistry()`. The aggregator catches the error and surfaces a
 * "Provider not yet connected" notice — never a silent fallback to scraping.
 */

import { ProviderRequiresContractError } from '@/lib/compliance/guards';
import type { Provider, ProviderInfo } from './base';

function makeStub(info: ProviderInfo): Provider<unknown, unknown> {
  return {
    info,
    async search() {
      throw new ProviderRequiresContractError(info.label);
    },
    async fetchDetails() {
      throw new ProviderRequiresContractError(info.label);
    },
  };
}

export const ZillowBridgeProvider = makeStub({
  id: 'zillow-bridge',
  label: 'Zillow Bridge Interactive',
  status: 'partner-required',
  legal_status: 'partner',
  homepage: 'https://bridgedataoutput.com/',
});
export const ApartmentsComProvider = makeStub({
  id: 'apartments-com',
  label: 'Apartments.com (CoStar)',
  status: 'partner-required',
  legal_status: 'partner',
});
export const RentDotComProvider = makeStub({
  id: 'rent-dot-com',
  label: 'Rent.com',
  status: 'partner-required',
  legal_status: 'partner',
});
export const YardiRentCafeProvider = makeStub({
  id: 'yardi-rentcafe',
  label: 'Yardi RentCafe / ScreeningWorks',
  status: 'partner-required',
  legal_status: 'partner',
});
export const EntrataProvider = makeStub({
  id: 'entrata',
  label: 'Entrata',
  status: 'partner-required',
  legal_status: 'partner',
});
export const AppFolioProvider = makeStub({
  id: 'appfolio',
  label: 'AppFolio',
  status: 'partner-required',
  legal_status: 'partner',
});
export const RealPageProvider = makeStub({
  id: 'realpage',
  label: 'RealPage / OneSite / Knock',
  status: 'partner-required',
  legal_status: 'partner',
});
export const CarsComProvider = makeStub({
  id: 'cars-com',
  label: 'Cars.com',
  status: 'partner-required',
  legal_status: 'partner',
});
export const AutotraderProvider = makeStub({
  id: 'autotrader',
  label: 'Autotrader (Cox)',
  status: 'partner-required',
  legal_status: 'partner',
});
export const CarGurusProvider = makeStub({
  id: 'cargurus',
  label: 'CarGurus',
  status: 'partner-required',
  legal_status: 'partner',
});
export const MarketCheckProvider = makeStub({
  id: 'marketcheck',
  label: 'MarketCheck Inventory API',
  status: 'paid-required',
  legal_status: 'paid',
});
export const UHaulProvider = makeStub({
  id: 'uhaul',
  label: 'U-Haul',
  status: 'partner-required',
  legal_status: 'partner',
});
export const PenskeProvider = makeStub({
  id: 'penske',
  label: 'Penske Truck Rental',
  status: 'partner-required',
  legal_status: 'partner',
});
export const BudgetTruckProvider = makeStub({
  id: 'budget-truck',
  label: 'Budget Truck Rental (Avis)',
  status: 'partner-required',
  legal_status: 'partner',
});
export const EnterpriseTruckProvider = makeStub({
  id: 'enterprise-truck',
  label: 'Enterprise Truck Rental',
  status: 'partner-required',
  legal_status: 'partner',
});
export const RyderProvider = makeStub({
  id: 'ryder',
  label: 'Ryder Commercial Rental',
  status: 'partner-required',
  legal_status: 'partner',
});
export const FluidTruckProvider = makeStub({
  id: 'fluid-truck',
  label: 'Fluid Truck',
  status: 'partner-required',
  legal_status: 'partner',
});
export const HomeDepotTruckProvider = makeStub({
  id: 'home-depot-truck',
  label: 'Home Depot Truck Rental',
  status: 'partner-required',
  legal_status: 'partner',
});
