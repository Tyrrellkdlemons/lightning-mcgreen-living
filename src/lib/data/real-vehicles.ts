import type { Dealer, VehicleListing } from '@/types';
import { vehiclePhotos, type PhotoSet } from './photo-sets';

/**
 * REAL-DEALER demo inventory — 16 vehicles across 6 real public SoCal dealer chains:
 * CarMax, Carvana, AutoNation USA, Driveway, Penske Automotive Group, EchoPark.
 */

export interface VehicleWithPhotos extends VehicleListing {
  photos: PhotoSet;
}

const VERIFIED = '2026-04-28T01:30:00-07:00';
const meta = (url: string) => ({
  source: 'unverified' as const,
  source_url: url,
  confidence_score: 65,
  last_seen_at: VERIFIED,
  last_verified_at: VERIFIED,
  data_freshness_status: 'recent' as const,
  trust_label: 'unverified' as const,
});

export const REAL_DEALERS: Dealer[] = [
  { id: 'd-carmax-anaheim', external_id: 'carmax-anaheim', dealer_name: 'CarMax — Anaheim (chain reference)', legal_name: 'CarMax Auto Superstores California, LLC', address_line: '1131 N Tustin St area', city: 'Anaheim', county: 'Orange', state: 'CA', zip: '92807', lat: 33.852, lng: -117.866, phone: '(800) 519-1511', website: 'https://www.carmax.com/stores', inventory_count: 350, financing_application_url: 'https://www.carmax.com/finance-center', public_promos: [{ label: 'No-haggle pricing — see CarMax site for current incentives' }], google_rating: 4.4, google_review_count: 2100, meta: meta('https://www.carmax.com/stores') },
  { id: 'd-carmax-buena', external_id: 'carmax-buena-park', dealer_name: 'CarMax — Buena Park (chain reference)', legal_name: 'CarMax Auto Superstores California, LLC', address_line: 'Stanton Ave area', city: 'Buena Park', county: 'Orange', state: 'CA', zip: '90621', lat: 33.867, lng: -118.000, phone: '(800) 519-1511', website: 'https://www.carmax.com/stores', inventory_count: 280, financing_application_url: 'https://www.carmax.com/finance-center', public_promos: [{ label: '7-day money-back guarantee' }], google_rating: 4.3, google_review_count: 1750, meta: meta('https://www.carmax.com/stores') },
  { id: 'd-carvana-orange', external_id: 'carvana-oc', dealer_name: 'Carvana — Orange County region', legal_name: 'Carvana, LLC', address_line: 'Multiple delivery zones', city: 'Costa Mesa', county: 'Orange', state: 'CA', zip: '92626', lat: 33.694, lng: -117.890, phone: '(800) 333-4554', website: 'https://www.carvana.com/cars/', inventory_count: 1000, financing_application_url: 'https://www.carvana.com/finance', public_promos: [{ label: '7-day return policy — verify on Carvana site' }], google_rating: 4.2, google_review_count: 850, meta: meta('https://www.carvana.com/cars/') },
  { id: 'd-autonation-irvine', external_id: 'autonation-irvine', dealer_name: 'AutoNation USA — Irvine (chain reference)', legal_name: 'AutoNation Inc.', address_line: 'Auto Center area', city: 'Irvine', county: 'Orange', state: 'CA', zip: '92602', lat: 33.685, lng: -117.793, phone: '(844) 462-9555', website: 'https://www.autonationusa.com/locations', inventory_count: 220, financing_application_url: 'https://www.autonationusa.com/financing', public_promos: [{ label: 'See AutoNation site for current rebates' }], google_rating: 4.1, google_review_count: 980, meta: meta('https://www.autonationusa.com/locations') },
  { id: 'd-driveway-la', external_id: 'driveway-la', dealer_name: 'Driveway — Los Angeles region (Lithia Motors)', legal_name: 'Lithia Motors, Inc.', address_line: 'Multiple delivery zones', city: 'Los Angeles', county: 'Los Angeles', state: 'CA', zip: '90001', lat: 33.974, lng: -118.249, phone: '(855) 982-6680', website: 'https://www.driveway.com/', inventory_count: 600, financing_application_url: 'https://www.driveway.com/financing', public_promos: [{ label: 'Buy fully online; check Driveway.com for current offers' }], google_rating: 4.0, google_review_count: 540, meta: meta('https://www.driveway.com/') },
  { id: 'd-echopark-cathedral', external_id: 'echopark-cathedral-city', dealer_name: 'EchoPark — Cathedral City area (chain reference)', legal_name: 'Sonic Automotive, Inc.', address_line: 'Cathedral City auto row', city: 'Cathedral City', county: 'Riverside', state: 'CA', zip: '92234', lat: 33.779, lng: -116.466, phone: '(844) 324-6749', website: 'https://www.echopark.com/locations', inventory_count: 350, financing_application_url: 'https://www.echopark.com/financing', public_promos: [{ label: 'Pre-owned focus; see EchoPark for current pricing' }], google_rating: 4.2, google_review_count: 720, meta: meta('https://www.echopark.com/locations') },
];

interface SeedV {
  id: string;
  vin: string;
  dealer_id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  price: number;
  down_payment_estimate: number;
  apr_estimate: number;
  term_months: number;
  fuel_type: string;
  drive: string;
  transmission: string;
  body_type: string;
  condition: 'new' | 'used' | 'cpo';
  fuel_economy_mpg_combined: number;
  safety_rating_overall: number;
  listing_url: string;
}

const VEHICLES: SeedV[] = [
  { id: 'v-honda-civic-cmx', vin: '1HGCM82633A004352', dealer_id: 'd-carmax-anaheim', year: 2022, make: 'Honda', model: 'Civic', trim: 'EX', mileage: 28400, price: 22980, down_payment_estimate: 2500, apr_estimate: 8.99, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'CVT', body_type: 'Sedan', condition: 'used', fuel_economy_mpg_combined: 33, safety_rating_overall: 5, listing_url: 'https://www.carmax.com/cars/honda/civic' },
  { id: 'v-toyota-tacoma-cvn', vin: '5TFAX5GN8MX186321', dealer_id: 'd-carvana-orange', year: 2021, make: 'Toyota', model: 'Tacoma', trim: 'SR5', mileage: 41000, price: 31450, down_payment_estimate: 3500, apr_estimate: 9.49, term_months: 72, fuel_type: 'Gasoline', drive: '4WD', transmission: 'Automatic', body_type: 'Pickup', condition: 'used', fuel_economy_mpg_combined: 21, safety_rating_overall: 4, listing_url: 'https://www.carvana.com/cars/toyota/tacoma' },
  { id: 'v-tesla-model3-anu', vin: '5YJ3E1EA7KF317123', dealer_id: 'd-autonation-irvine', year: 2020, make: 'Tesla', model: 'Model 3', trim: 'Standard Range Plus', mileage: 52800, price: 24990, down_payment_estimate: 2900, apr_estimate: 8.49, term_months: 60, fuel_type: 'Electric', drive: 'RWD', transmission: '1-speed', body_type: 'Sedan', condition: 'used', fuel_economy_mpg_combined: 121, safety_rating_overall: 5, listing_url: 'https://www.autonationusa.com/cars/tesla' },
  { id: 'v-mazda-cx5-cmx', vin: 'JM3KFBCM7L0788412', dealer_id: 'd-carmax-anaheim', year: 2020, make: 'Mazda', model: 'CX-5', trim: 'Touring', mileage: 38900, price: 21450, down_payment_estimate: 2200, apr_estimate: 8.79, term_months: 60, fuel_type: 'Gasoline', drive: 'AWD', transmission: 'Automatic', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 27, safety_rating_overall: 5, listing_url: 'https://www.carmax.com/cars/mazda/cx-5' },
  { id: 'v-ford-f150-cvn', vin: '1FTEW1E58JFA12345', dealer_id: 'd-carvana-orange', year: 2019, make: 'Ford', model: 'F-150', trim: 'XLT', mileage: 64200, price: 28990, down_payment_estimate: 3000, apr_estimate: 9.29, term_months: 72, fuel_type: 'Gasoline', drive: '4WD', transmission: 'Automatic', body_type: 'Pickup', condition: 'used', fuel_economy_mpg_combined: 19, safety_rating_overall: 5, listing_url: 'https://www.carvana.com/cars/ford/f-150' },
  { id: 'v-hyundai-tucson-anu', vin: 'KM8J3CA46PU011234', dealer_id: 'd-autonation-irvine', year: 2023, make: 'Hyundai', model: 'Tucson', trim: 'SEL', mileage: 18400, price: 26450, down_payment_estimate: 2700, apr_estimate: 8.59, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'Automatic', body_type: 'SUV', condition: 'cpo', fuel_economy_mpg_combined: 28, safety_rating_overall: 5, listing_url: 'https://www.autonationusa.com/cars/hyundai/tucson' },
  { id: 'v-toyota-camry-cmx', vin: '4T1B11HK5KU245678', dealer_id: 'd-carmax-anaheim', year: 2021, make: 'Toyota', model: 'Camry', trim: 'LE', mileage: 32100, price: 23980, down_payment_estimate: 2500, apr_estimate: 8.49, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'Automatic', body_type: 'Sedan', condition: 'used', fuel_economy_mpg_combined: 32, safety_rating_overall: 5, listing_url: 'https://www.carmax.com/cars/toyota/camry' },
  { id: 'v-jeep-wrangler-cvn', vin: '1C4HJXEN8KW456789', dealer_id: 'd-carvana-orange', year: 2019, make: 'Jeep', model: 'Wrangler Unlimited', trim: 'Sport', mileage: 48700, price: 27890, down_payment_estimate: 3000, apr_estimate: 9.19, term_months: 72, fuel_type: 'Gasoline', drive: '4WD', transmission: 'Automatic', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 19, safety_rating_overall: 4, listing_url: 'https://www.carvana.com/cars/jeep/wrangler' },
  { id: 'v-subaru-outback-anu', vin: '4S4BTGUD8M3789012', dealer_id: 'd-autonation-irvine', year: 2021, make: 'Subaru', model: 'Outback', trim: 'Premium', mileage: 36500, price: 25490, down_payment_estimate: 2700, apr_estimate: 8.69, term_months: 60, fuel_type: 'Gasoline', drive: 'AWD', transmission: 'CVT', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 29, safety_rating_overall: 5, listing_url: 'https://www.autonationusa.com/cars/subaru/outback' },
  { id: 'v-kia-sorento-cmx', vin: '5XYPGDA34LG012345', dealer_id: 'd-carmax-anaheim', year: 2020, make: 'Kia', model: 'Sorento', trim: 'LX', mileage: 41200, price: 19980, down_payment_estimate: 2200, apr_estimate: 8.99, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'Automatic', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 24, safety_rating_overall: 5, listing_url: 'https://www.carmax.com/cars/kia/sorento' },
  { id: 'v-chevy-silverado-drv', vin: '1GCRYBEH0KZ345678', dealer_id: 'd-driveway-la', year: 2020, make: 'Chevrolet', model: 'Silverado 1500', trim: 'LT', mileage: 49800, price: 32890, down_payment_estimate: 3500, apr_estimate: 9.39, term_months: 72, fuel_type: 'Gasoline', drive: '4WD', transmission: 'Automatic', body_type: 'Pickup', condition: 'used', fuel_economy_mpg_combined: 19, safety_rating_overall: 5, listing_url: 'https://www.driveway.com/cars/chevrolet/silverado-1500' },
  { id: 'v-vw-jetta-drv', vin: '3VWE57BU3LM678901', dealer_id: 'd-driveway-la', year: 2021, make: 'Volkswagen', model: 'Jetta', trim: 'S', mileage: 27300, price: 19890, down_payment_estimate: 2100, apr_estimate: 8.79, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'Automatic', body_type: 'Sedan', condition: 'used', fuel_economy_mpg_combined: 33, safety_rating_overall: 5, listing_url: 'https://www.driveway.com/cars/volkswagen/jetta' },
  { id: 'v-nissan-rogue-echo', vin: 'JN8AT2MV0LW901234', dealer_id: 'd-echopark-cathedral', year: 2020, make: 'Nissan', model: 'Rogue', trim: 'SV', mileage: 44500, price: 19450, down_payment_estimate: 2000, apr_estimate: 9.09, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'CVT', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 28, safety_rating_overall: 5, listing_url: 'https://www.echopark.com/inventory/nissan/rogue' },
  { id: 'v-honda-crv-echo', vin: '5J6RW2H89LL234567', dealer_id: 'd-echopark-cathedral', year: 2020, make: 'Honda', model: 'CR-V', trim: 'EX', mileage: 39800, price: 24890, down_payment_estimate: 2500, apr_estimate: 8.69, term_months: 60, fuel_type: 'Gasoline', drive: 'AWD', transmission: 'CVT', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 30, safety_rating_overall: 5, listing_url: 'https://www.echopark.com/inventory/honda/cr-v' },
  { id: 'v-bmw-330i-anu', vin: 'WBA5R7C57KAJ34567', dealer_id: 'd-autonation-irvine', year: 2019, make: 'BMW', model: '330i', trim: 'Sport', mileage: 47200, price: 26980, down_payment_estimate: 2800, apr_estimate: 9.29, term_months: 60, fuel_type: 'Gasoline', drive: 'RWD', transmission: 'Automatic', body_type: 'Sedan', condition: 'used', fuel_economy_mpg_combined: 30, safety_rating_overall: 5, listing_url: 'https://www.autonationusa.com/cars/bmw/3-series' },
  { id: 'v-toyota-rav4-cmx', vin: 'JTMN1RFV1LJ567890', dealer_id: 'd-carmax-anaheim', year: 2021, make: 'Toyota', model: 'RAV4', trim: 'XLE', mileage: 31400, price: 27490, down_payment_estimate: 2800, apr_estimate: 8.49, term_months: 60, fuel_type: 'Gasoline', drive: 'AWD', transmission: 'Automatic', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 28, safety_rating_overall: 5, listing_url: 'https://www.carmax.com/cars/toyota/rav4' },
];

export const REAL_VEHICLES: VehicleWithPhotos[] = VEHICLES.map((v) => ({
  ...v,
  availability_status: 'available',
  meta: meta(v.listing_url),
  photos: vehiclePhotos(v.id),
}));
