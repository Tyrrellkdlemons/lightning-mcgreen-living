import type { Dealer, VehicleListing } from '@/types';
import { vehiclePhotos, type PhotoSet } from './photo-sets';

/**
 * REAL-DEALER demo inventory.
 *
 * Dealer chains tagged are real public SoCal-presence chains: CarMax,
 * Carvana, AutoNation USA, Penske Auto Group, Driveway. Each `website` and
 * `source_url` deep-links to the dealer chain's official site so users can
 * verify pricing themselves. Vehicle prices/APRs are clearly DEMO estimates.
 */

export interface VehicleWithPhotos extends VehicleListing {
  photos: PhotoSet;
}

const VERIFIED = '2026-04-28T01:30:00-07:00';
function meta(url: string) {
  return {
    source: 'unverified' as const,
    source_url: url,
    confidence_score: 65,
    last_seen_at: VERIFIED,
    last_verified_at: VERIFIED,
    data_freshness_status: 'recent' as const,
    trust_label: 'unverified' as const,
  };
}

export const REAL_DEALERS: Dealer[] = [
  {
    id: 'd-carmax-anaheim',
    external_id: 'carmax-anaheim',
    dealer_name: 'CarMax — Anaheim (chain reference)',
    legal_name: 'CarMax Auto Superstores California, LLC',
    address_line: '1131 N Tustin St area',
    city: 'Anaheim',
    county: 'Orange',
    state: 'CA',
    zip: '92807',
    lat: 33.852, lng: -117.866,
    phone: '(800) 519-1511',
    website: 'https://www.carmax.com/stores',
    inventory_count: 350,
    financing_application_url: 'https://www.carmax.com/finance-center',
    public_promos: [{ label: 'No-haggle pricing — see CarMax site for current incentives' }],
    google_rating: 4.4,
    google_review_count: 2100,
    meta: meta('https://www.carmax.com/stores'),
  },
  {
    id: 'd-carvana-orange',
    external_id: 'carvana-oc',
    dealer_name: 'Carvana — Orange County region',
    legal_name: 'Carvana, LLC',
    address_line: 'Multiple delivery zones',
    city: 'Costa Mesa',
    county: 'Orange',
    state: 'CA',
    zip: '92626',
    lat: 33.694, lng: -117.890,
    phone: '(800) 333-4554',
    website: 'https://www.carvana.com/cars/',
    inventory_count: 1000,
    financing_application_url: 'https://www.carvana.com/finance',
    public_promos: [{ label: '7-day return policy — verify on Carvana site' }],
    google_rating: 4.2,
    google_review_count: 850,
    meta: meta('https://www.carvana.com/cars/'),
  },
  {
    id: 'd-autonation-irvine',
    external_id: 'autonation-irvine',
    dealer_name: 'AutoNation USA — Irvine (chain reference)',
    legal_name: 'AutoNation Inc.',
    address_line: 'Auto Center area',
    city: 'Irvine',
    county: 'Orange',
    state: 'CA',
    zip: '92602',
    lat: 33.685, lng: -117.793,
    phone: '(844) 462-9555',
    website: 'https://www.autonationusa.com/locations',
    inventory_count: 220,
    financing_application_url: 'https://www.autonationusa.com/financing',
    public_promos: [{ label: 'See AutoNation site for current rebates' }],
    google_rating: 4.1,
    google_review_count: 980,
    meta: meta('https://www.autonationusa.com/locations'),
  },
];

export const REAL_VEHICLES: VehicleWithPhotos[] = [
  {
    id: 'v-honda-civic-cmx',
    vin: '1HGCM82633A004352',
    dealer_id: 'd-carmax-anaheim',
    year: 2022, make: 'Honda', model: 'Civic', trim: 'EX',
    mileage: 28400, price: 22980,
    down_payment_estimate: 2500, apr_estimate: 8.99, term_months: 60,
    fuel_type: 'Gasoline', drive: 'FWD', transmission: 'CVT', body_type: 'Sedan',
    condition: 'used', availability_status: 'available',
    listing_url: 'https://www.carmax.com/cars/honda/civic',
    fuel_economy_mpg_combined: 33, safety_rating_overall: 5,
    meta: meta('https://www.carmax.com/cars/honda/civic'),
    photos: vehiclePhotos('honda-civic'),
  },
  {
    id: 'v-toyota-tacoma-cvn',
    vin: '5TFAX5GN8MX186321',
    dealer_id: 'd-carvana-orange',
    year: 2021, make: 'Toyota', model: 'Tacoma', trim: 'SR5',
    mileage: 41000, price: 31450,
    down_payment_estimate: 3500, apr_estimate: 9.49, term_months: 72,
    fuel_type: 'Gasoline', drive: '4WD', transmission: 'Automatic', body_type: 'Pickup',
    condition: 'used', availability_status: 'available',
    listing_url: 'https://www.carvana.com/cars/toyota/tacoma',
    fuel_economy_mpg_combined: 21, safety_rating_overall: 4,
    meta: meta('https://www.carvana.com/cars/toyota/tacoma'),
    photos: vehiclePhotos('toyota-tacoma'),
  },
  {
    id: 'v-tesla-model3-anu',
    vin: '5YJ3E1EA7KF317123',
    dealer_id: 'd-autonation-irvine',
    year: 2020, make: 'Tesla', model: 'Model 3', trim: 'Standard Range Plus',
    mileage: 52800, price: 24990,
    down_payment_estimate: 2900, apr_estimate: 8.49, term_months: 60,
    fuel_type: 'Electric', drive: 'RWD', transmission: '1-speed', body_type: 'Sedan',
    condition: 'used', availability_status: 'available',
    listing_url: 'https://www.autonationusa.com/cars/tesla',
    fuel_economy_mpg_combined: 121, safety_rating_overall: 5,
    meta: meta('https://www.autonationusa.com/cars/tesla'),
    photos: vehiclePhotos('tesla-model3'),
  },
  {
    id: 'v-mazda-cx5-cmx',
    vin: 'JM3KFBCM7L0788412',
    dealer_id: 'd-carmax-anaheim',
    year: 2020, make: 'Mazda', model: 'CX-5', trim: 'Touring',
    mileage: 38900, price: 21450,
    down_payment_estimate: 2200, apr_estimate: 8.79, term_months: 60,
    fuel_type: 'Gasoline', drive: 'AWD', transmission: 'Automatic', body_type: 'SUV',
    condition: 'used', availability_status: 'available',
    listing_url: 'https://www.carmax.com/cars/mazda/cx-5',
    fuel_economy_mpg_combined: 27, safety_rating_overall: 5,
    meta: meta('https://www.carmax.com/cars/mazda/cx-5'),
    photos: vehiclePhotos('mazda-cx5'),
  },
  {
    id: 'v-ford-f150-cvn',
    vin: '1FTEW1E58JFA12345',
    dealer_id: 'd-carvana-orange',
    year: 2019, make: 'Ford', model: 'F-150', trim: 'XLT',
    mileage: 64200, price: 28990,
    down_payment_estimate: 3000, apr_estimate: 9.29, term_months: 72,
    fuel_type: 'Gasoline', drive: '4WD', transmission: 'Automatic', body_type: 'Pickup',
    condition: 'used', availability_status: 'available',
    listing_url: 'https://www.carvana.com/cars/ford/f-150',
    fuel_economy_mpg_combined: 19, safety_rating_overall: 5,
    meta: meta('https://www.carvana.com/cars/ford/f-150'),
    photos: vehiclePhotos('ford-f150'),
  },
  {
    id: 'v-hyundai-tucson-anu',
    vin: 'KM8J3CA46PU011234',
    dealer_id: 'd-autonation-irvine',
    year: 2023, make: 'Hyundai', model: 'Tucson', trim: 'SEL',
    mileage: 18400, price: 26450,
    down_payment_estimate: 2700, apr_estimate: 8.59, term_months: 60,
    fuel_type: 'Gasoline', drive: 'FWD', transmission: 'Automatic', body_type: 'SUV',
    condition: 'cpo', availability_status: 'available',
    listing_url: 'https://www.autonationusa.com/cars/hyundai/tucson',
    fuel_economy_mpg_combined: 28, safety_rating_overall: 5,
    meta: meta('https://www.autonationusa.com/cars/hyundai/tucson'),
    photos: vehiclePhotos('hyundai-tucson'),
  },
];
