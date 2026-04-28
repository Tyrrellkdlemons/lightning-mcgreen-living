/**
 * Additional 12 vehicle listings — bumps total from 16 → 28.
 * Same SeedV shape, real chain dealers, real chain URLs, real VIN format.
 */

export interface SeedVExtra {
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

export const VEHICLES_EXTRA: SeedVExtra[] = [
  { id: 'v-honda-accord-cmx', vin: '1HGCV1F19LA112345', dealer_id: 'd-carmax-anaheim', year: 2020, make: 'Honda', model: 'Accord', trim: 'EX-L', mileage: 33500, price: 24990, down_payment_estimate: 2600, apr_estimate: 8.79, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'CVT', body_type: 'Sedan', condition: 'used', fuel_economy_mpg_combined: 33, safety_rating_overall: 5, listing_url: 'https://www.carmax.com/cars/honda/accord' },
  { id: 'v-toyota-corolla-cmx', vin: '5YFEPMAEXNP223456', dealer_id: 'd-carmax-buena', year: 2022, make: 'Toyota', model: 'Corolla', trim: 'LE', mileage: 22100, price: 21450, down_payment_estimate: 2200, apr_estimate: 8.49, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'CVT', body_type: 'Sedan', condition: 'used', fuel_economy_mpg_combined: 32, safety_rating_overall: 5, listing_url: 'https://www.carmax.com/cars/toyota/corolla' },
  { id: 'v-tesla-modely-cvn', vin: '7SAYGDEEXNF334567', dealer_id: 'd-carvana-orange', year: 2022, make: 'Tesla', model: 'Model Y', trim: 'Long Range', mileage: 26800, price: 36990, down_payment_estimate: 4000, apr_estimate: 8.29, term_months: 72, fuel_type: 'Electric', drive: 'AWD', transmission: '1-speed', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 122, safety_rating_overall: 5, listing_url: 'https://www.carvana.com/cars/tesla/model-y' },
  { id: 'v-ford-mustang-cvn', vin: '1FA6P8CF8M5445678', dealer_id: 'd-carvana-orange', year: 2021, make: 'Ford', model: 'Mustang', trim: 'GT Premium', mileage: 31200, price: 35490, down_payment_estimate: 3800, apr_estimate: 9.19, term_months: 72, fuel_type: 'Gasoline', drive: 'RWD', transmission: 'Automatic', body_type: 'Coupe', condition: 'used', fuel_economy_mpg_combined: 19, safety_rating_overall: 4, listing_url: 'https://www.carvana.com/cars/ford/mustang' },
  { id: 'v-chevy-equinox-anu', vin: '3GNAXKEV0NL556789', dealer_id: 'd-autonation-irvine', year: 2022, make: 'Chevrolet', model: 'Equinox', trim: 'LT', mileage: 28400, price: 23890, down_payment_estimate: 2400, apr_estimate: 8.69, term_months: 60, fuel_type: 'Gasoline', drive: 'AWD', transmission: 'Automatic', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 27, safety_rating_overall: 5, listing_url: 'https://www.autonationusa.com/cars/chevrolet/equinox' },
  { id: 'v-nissan-altima-anu', vin: '1N4BL4BV3PC667890', dealer_id: 'd-autonation-irvine', year: 2023, make: 'Nissan', model: 'Altima', trim: 'SV', mileage: 14200, price: 22980, down_payment_estimate: 2300, apr_estimate: 8.49, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'CVT', body_type: 'Sedan', condition: 'cpo', fuel_economy_mpg_combined: 31, safety_rating_overall: 5, listing_url: 'https://www.autonationusa.com/cars/nissan/altima' },
  { id: 'v-jeep-grandcherokee-drv', vin: '1C4RJFAG0NC778901', dealer_id: 'd-driveway-la', year: 2022, make: 'Jeep', model: 'Grand Cherokee', trim: 'Limited', mileage: 32800, price: 36890, down_payment_estimate: 4000, apr_estimate: 9.09, term_months: 72, fuel_type: 'Gasoline', drive: '4WD', transmission: 'Automatic', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 21, safety_rating_overall: 5, listing_url: 'https://www.driveway.com/cars/jeep/grand-cherokee' },
  { id: 'v-mazda-mazda3-drv', vin: '3MZBPACL5MM889012', dealer_id: 'd-driveway-la', year: 2021, make: 'Mazda', model: 'Mazda3', trim: 'Preferred', mileage: 24500, price: 22490, down_payment_estimate: 2300, apr_estimate: 8.59, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'Automatic', body_type: 'Hatchback', condition: 'used', fuel_economy_mpg_combined: 30, safety_rating_overall: 5, listing_url: 'https://www.driveway.com/cars/mazda/mazda3' },
  { id: 'v-hyundai-elantra-echo', vin: 'KMHLM4AG9NU990123', dealer_id: 'd-echopark-cathedral', year: 2022, make: 'Hyundai', model: 'Elantra', trim: 'SEL', mileage: 25600, price: 19880, down_payment_estimate: 2000, apr_estimate: 8.79, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'Automatic', body_type: 'Sedan', condition: 'used', fuel_economy_mpg_combined: 35, safety_rating_overall: 5, listing_url: 'https://www.echopark.com/inventory/hyundai/elantra' },
  { id: 'v-kia-forte-echo', vin: '3KPF24AD7PE001234', dealer_id: 'd-echopark-cathedral', year: 2023, make: 'Kia', model: 'Forte', trim: 'LXS', mileage: 11800, price: 19990, down_payment_estimate: 2000, apr_estimate: 8.49, term_months: 60, fuel_type: 'Gasoline', drive: 'FWD', transmission: 'CVT', body_type: 'Sedan', condition: 'cpo', fuel_economy_mpg_combined: 35, safety_rating_overall: 5, listing_url: 'https://www.echopark.com/inventory/kia/forte' },
  { id: 'v-vw-tiguan-cmx', vin: '3VV2B7AX4MM012345', dealer_id: 'd-carmax-buena', year: 2021, make: 'Volkswagen', model: 'Tiguan', trim: 'SE', mileage: 36400, price: 23890, down_payment_estimate: 2400, apr_estimate: 8.99, term_months: 60, fuel_type: 'Gasoline', drive: 'AWD', transmission: 'Automatic', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 25, safety_rating_overall: 4, listing_url: 'https://www.carmax.com/cars/volkswagen/tiguan' },
  { id: 'v-bmw-x3-anu', vin: '5UXTY3C00M9112456', dealer_id: 'd-autonation-irvine', year: 2021, make: 'BMW', model: 'X3', trim: 'xDrive30i', mileage: 34900, price: 35990, down_payment_estimate: 4000, apr_estimate: 9.29, term_months: 72, fuel_type: 'Gasoline', drive: 'AWD', transmission: 'Automatic', body_type: 'SUV', condition: 'used', fuel_economy_mpg_combined: 25, safety_rating_overall: 5, listing_url: 'https://www.autonationusa.com/cars/bmw/x3' },
];
