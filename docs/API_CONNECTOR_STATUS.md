# API Connector Status

| Connector | File | Status | Mode | TODO |
| --- | --- | --- | --- | --- |
| `NhtsaVpicProvider` | `src/lib/providers/nhtsa-vpic.ts` | ✅ Live | Free, no key | — |
| `FuelEconomyProvider` | `src/lib/providers/fuel-economy.ts` | ✅ Live | Free, no key | — |
| `OverpassProvider` | `src/lib/providers/overpass.ts` | ✅ Live | Free, no key | Cache responses |
| `CensusAcsProvider` | `src/lib/providers/census-acs.ts` | ✅ Live | Free; key recommended | Add ZIP geo lookup |
| `HudFmrProvider` | `src/lib/providers/hud-fmr.ts` | ✅ Live | Free; token recommended | Cache county results |
| `GooglePlacesProvider` | `src/lib/providers/google-places.ts` | 🔑 Env-key gated | Throws gracefully without key | Add session tokens |
| `ManualCsvProvider` | `src/lib/providers/manual-csv.ts` | ✅ Live | Admin-uploaded CSV | Wire `/admin` upload |
| `ZillowBridgeProvider` | `src/lib/providers/zillow-bridge.ts` | 💼 Partner-only stub | Throws `ProviderRequiresContractError` | Sign contract |
| `ApartmentsComProvider` | `src/lib/providers/apartments-com.ts` | 💼 Partner-only stub | Throws | Partner approval |
| `RentDotComProvider` | `src/lib/providers/rent-dot-com.ts` | 💼 Partner-only stub | Throws | Partner approval |
| `YardiRentCafeProvider` | `src/lib/providers/yardi-rentcafe.ts` | 💼 Partner stub | Throws | Yardi MTX agreement |
| `EntrataProvider` | `src/lib/providers/entrata.ts` | 💼 Partner stub | Throws | Entrata API agreement |
| `AppFolioProvider` | `src/lib/providers/appfolio.ts` | 💼 Partner stub | Throws | AppFolio API access |
| `RealPageProvider` | `src/lib/providers/realpage.ts` | 💼 Partner stub | Throws | RealPage agreement |
| `CarsComProvider` | `src/lib/providers/cars-com.ts` | 💼 Partner stub | Throws | Cox/Cars.com partner |
| `AutotraderProvider` | `src/lib/providers/autotrader.ts` | 💼 Partner stub | Throws | Cox partner |
| `CarGurusProvider` | `src/lib/providers/cargurus.ts` | 💼 Partner stub | Throws | CarGurus partner |
| `MarketCheckProvider` | `src/lib/providers/marketcheck.ts` | 💰 Paid stub | Throws without key | Buy plan |
| `UHaulProvider` | `src/lib/providers/uhaul.ts` | 💼 Partner stub | Throws | Affiliate or partner |
| `PenskeProvider` | `src/lib/providers/penske.ts` | 💼 Partner stub | Throws | Partner |
| `BudgetTruckProvider` | `src/lib/providers/budget-truck.ts` | 💼 Partner stub | Throws | Partner |
| `EnterpriseTruckProvider` | `src/lib/providers/enterprise-truck.ts` | 💼 Partner stub | Throws | Partner |
| `RyderProvider` | `src/lib/providers/ryder.ts` | 💼 Partner stub | Throws | Partner |
| `FluidTruckProvider` | `src/lib/providers/fluid-truck.ts` | 💼 Partner stub | Throws | Partner |
| `HomeDepotTruckProvider` | `src/lib/providers/home-depot-truck.ts` | 💼 Partner stub | Throws | Partner |

**Rule:** every stub provider throws `ProviderRequiresContractError` when
called without a configured key. The app catches this and renders a
"Provider not yet connected — using manual import / public data instead"
notice in the UI. **No silent retries, no scraping fallback.**
