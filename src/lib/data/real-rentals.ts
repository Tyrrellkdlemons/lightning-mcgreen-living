import type { ApplicationPlatform, RentalListing, RentalUnitType, SourceMeta } from '@/types';
import type { ApartmentLinkSet } from '@/types/links';
import { rentalPhotos, type PhotoSet } from './photo-sets';

/**
 * REAL-OPERATOR listings across LA / OC / SB / Riverside / Ventura.
 *
 * The first rows are official unit-level apartment-side records gathered from
 * the property sources the user supplied. The remaining rows are broad SoCal
 * operator examples; their metadata stays labelled as unverified.
 *
 * Operators tagged are real publicly-known SoCal rental managers — Greystar,
 * Irvine Company Apartments, Equity Residential, Essex Property Trust,
 * AvalonBay, Camden, FPI Management, Western National, ConAm, MG Properties,
 * Alliance Residential, Prime Residential, UDR, Decron, Lyon Living. Each
 * `source_url` deep-links to the operator's official site search for that
 * city. Demo banner stays on; no specific real unit/price is asserted.
 */

export interface RentalWithPhotos extends RentalListing {
  photos: PhotoSet;
}

const DEMO_VERIFIED = '2026-04-28T01:30:00-07:00';
const OFFICIAL_VERIFIED = '2026-05-02T12:00:00-07:00';

function meta(source_url: string): SourceMeta {
  return {
    source: 'unverified' as const,
    source_url,
    confidence_score: 65,
    last_seen_at: DEMO_VERIFIED,
    last_verified_at: DEMO_VERIFIED,
    data_freshness_status: 'recent' as const,
    trust_label: 'unverified' as const,
  };
}

function officialMeta(source_url: string, confidence_score = 97): SourceMeta {
  return {
    source: 'official',
    source_url,
    confidence_score,
    last_seen_at: OFFICIAL_VERIFIED,
    last_verified_at: OFFICIAL_VERIFIED,
    data_freshness_status: 'live',
    trust_label: 'official',
  };
}

const solimarApply = (unitId: number, moveInDate: string) => {
  const searchUrl = encodeURIComponent('https://www.livesolimar.com/apartments/ca/wilmington/floor-plans#/bedrooms');
  return `https://www.livesolimar.com/apartments/ca/wilmington/apply?siteId=4523245&unitId=${unitId}&SearchUrl=${searchUrl}&MoveInDate=${moveInDate}`;
};

interface SeedRow {
  id: string;
  property_name: string;
  unit_type: RentalUnitType;
  address_line: string;
  city: string;
  county: string;
  zip: string;
  lat: number;
  lng: number;
  manager: string;
  owner_operator?: string;
  application_platform: ApplicationPlatform;
  application_url: string;
  official_property_url?: string;
  application_route?: string;
  links?: Partial<ApartmentLinkSet>;
  min_rent: number;
  max_rent: number;
  beds_min: number;
  beds_max: number;
  baths_min: number;
  baths_max: number;
  sqft_min?: number;
  sqft_max?: number;
  deposit?: number;
  application_fee?: number;
  admin_fee?: number;
  holding_deposit?: number;
  pet_policy?: string;
  pet_fee?: number;
  parking_type?: string;
  parking_fee?: number;
  income_multiplier?: number;
  screening_vendor?: string | null;
  move_in_specials?: string;
  unit_number?: string;
  floor_plan_name?: string;
  available_date?: string;
  listing_visual_note?: string;
  amenities?: string[];
  meta?: SourceMeta;
  levels?: number;
  private_entrance?: boolean;
  attached_garage?: boolean;
  yard_or_patio?: boolean;
  lower_density_community?: boolean;
  accessibility_features?: string[];
}

const ROWS: SeedRow[] = [
  // ---------------- OFFICIAL UNIT-LEVEL SOURCES FROM USER LINKS ----------------
  {
    id: 'r-presidio-anaheim-129',
    property_name: 'Presidio Townhomes #129',
    unit_type: 'townhome-style-apartment',
    address_line: '2726 West Lincoln Avenue Unit #129',
    city: 'Anaheim',
    county: 'Orange',
    zip: '92801',
    lat: 33.83156,
    lng: -117.981375,
    manager: 'CONAM',
    owner_operator: 'CONAM / Presidio Townhomes',
    application_platform: 'On-Site',
    application_url: 'https://www.on-site.com/apply/property/349965/unit_number/129',
    official_property_url: 'https://www.presidioanaheim.com/floorplans/',
    application_route: 'Presidio official Apartments247 feed -> On-Site property 349965 -> unit 129 application',
    links: {
      exact_listing_url: 'https://www.presidioanaheim.com/floorplans/',
      exact_floorplan_url: 'https://www.presidioanaheim.com/floorplans/',
      exact_application_url: 'https://www.on-site.com/apply/property/349965/unit_number/129',
      property_application_url: 'https://www.on-site.com/web/online_app3/349965/step/floorplan',
      application_link_type: 'exact-unit-application',
      application_link_confidence: 'verified',
      application_redirect_required: true,
      prefill_supported: false,
      unit_number_public: '129',
      floor_plan_name: '2 Bedroom 2.5 Bathroom Townhome',
      available_date: '2026-05-04',
      listing_status: 'available',
      verification_status: 'official-source',
    },
    min_rent: 3195,
    max_rent: 3195,
    beds_min: 2,
    beds_max: 2,
    baths_min: 2.5,
    baths_max: 2.5,
    sqft_min: 1063,
    sqft_max: 1063,
    deposit: 1000,
    application_fee: 52,
    holding_deposit: 300,
    pet_policy: 'Max 2 pets, 35 lb limit, breed restrictions; $50/mo pet rent per pet; service animals handled by the property process.',
    parking_type: 'Direct access garage; uncovered parking optional',
    parking_fee: 100,
    screening_vendor: 'On-Site.com',
    unit_number: '129',
    floor_plan_name: '2 Bedroom 2.5 Bathroom Townhome',
    available_date: '2026-05-04',
    listing_visual_note: 'Uses original editable illustrations plus a Street View card (with satellite fallback); Presidio site photos and floorplan images remain third-party copyrighted assets.',
    amenities: [
      'Direct Access Garage',
      '3-Story Townhome Floorplan',
      'Quartz Countertops',
      'Stainless Steel Appliance Package',
      'Vibrant Quartz Backsplash in Kitchen',
      'Vinyl Flooring',
      'Large Pantry',
      'Dual Primary Bedrooms',
      'In-Home Washer/Dryer',
    ],
    meta: officialMeta('https://www.presidioanaheim.com/floorplans/', 98),
    levels: 3,
    private_entrance: true,
    attached_garage: true,
    lower_density_community: true,
  },
  {
    id: 'r-presidio-anaheim-118',
    property_name: 'Presidio Townhomes #118',
    unit_type: 'townhome-style-apartment',
    address_line: '2726 West Lincoln Avenue Unit #118',
    city: 'Anaheim',
    county: 'Orange',
    zip: '92801',
    lat: 33.83156,
    lng: -117.981375,
    manager: 'CONAM',
    owner_operator: 'CONAM / Presidio Townhomes',
    application_platform: 'On-Site',
    application_url: 'https://www.on-site.com/apply/property/349965/unit_number/118',
    official_property_url: 'https://www.presidioanaheim.com/floorplans/',
    application_route: 'Presidio official Apartments247 feed -> On-Site property 349965 -> unit 118 application',
    links: {
      exact_listing_url: 'https://www.presidioanaheim.com/floorplans/',
      exact_floorplan_url: 'https://www.presidioanaheim.com/floorplans/',
      exact_application_url: 'https://www.on-site.com/apply/property/349965/unit_number/118',
      property_application_url: 'https://www.on-site.com/web/online_app3/349965/step/floorplan',
      application_link_type: 'exact-unit-application',
      application_link_confidence: 'verified',
      application_redirect_required: true,
      prefill_supported: false,
      unit_number_public: '118',
      floor_plan_name: '2 Bedroom 2.5 Bathroom Townhome',
      available_date: '2026-05-25',
      listing_status: 'available',
      verification_status: 'official-source',
    },
    min_rent: 3195,
    max_rent: 3195,
    beds_min: 2,
    beds_max: 2,
    baths_min: 2.5,
    baths_max: 2.5,
    sqft_min: 1063,
    sqft_max: 1063,
    deposit: 1000,
    application_fee: 52,
    holding_deposit: 300,
    pet_policy: 'Max 2 pets, 35 lb limit, breed restrictions; $50/mo pet rent per pet; service animals handled by the property process.',
    parking_type: 'Direct access garage; uncovered parking optional',
    parking_fee: 100,
    screening_vendor: 'On-Site.com',
    unit_number: '118',
    floor_plan_name: '2 Bedroom 2.5 Bathroom Townhome',
    available_date: '2026-05-25',
    listing_visual_note: 'Uses original editable illustrations plus a Street View card (with satellite fallback); Presidio site photos and floorplan images remain third-party copyrighted assets.',
    amenities: [
      'Direct Access Garage',
      '3-Story Townhome Floorplan',
      'Quartz Countertops',
      'Stainless Steel Appliance Package',
      'Vibrant Quartz Backsplash in Kitchen',
      'Vinyl Flooring',
      'Large Pantry',
      'Dual Primary Bedrooms',
      'In-Home Washer/Dryer',
    ],
    meta: officialMeta('https://www.presidioanaheim.com/floorplans/', 98),
    levels: 3,
    private_entrance: true,
    attached_garage: true,
    lower_density_community: true,
  },
  {
    id: 'r-solimar-wilmington-0217',
    property_name: 'Solimar Luxury Homes #0217',
    unit_type: 'apartment',
    address_line: '1500 West Pacific Coast Highway Unit 0217',
    city: 'Wilmington',
    county: 'Los Angeles',
    zip: '90744',
    lat: 33.790626,
    lng: -118.284981,
    manager: 'FPI Management / TruAmerica',
    owner_operator: 'TruAmerica Multifamily; FPI-linked property management',
    application_platform: 'G5/Knock',
    application_url: solimarApply(5, '2026-06-07'),
    official_property_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
    application_route: 'Solimar official G5 inventory -> siteId 4523245 -> unitId 5 apply page; Knock handles tours/chat on the property site',
    links: {
      exact_listing_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
      exact_floorplan_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
      exact_application_url: solimarApply(5, '2026-06-07'),
      property_application_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
      application_link_type: 'exact-unit-application',
      application_link_confidence: 'verified',
      application_redirect_required: true,
      prefill_supported: false,
      unit_number_public: '0217',
      floor_plan_name: 'One bedroom floor plan A',
      available_date: '2026-06-07',
      listing_status: 'available',
      verification_status: 'official-source',
    },
    min_rent: 2525,
    max_rent: 2534,
    beds_min: 1,
    beds_max: 1,
    baths_min: 1,
    baths_max: 1,
    sqft_min: 721,
    sqft_max: 721,
    unit_number: '0217',
    floor_plan_name: 'One bedroom floor plan A',
    available_date: '2026-06-07',
    listing_visual_note: 'Uses original editable illustrations plus a Street View card (with satellite fallback); official Solimar marketing photos stay linked, not copied.',
    amenities: [
      'Central air and heat',
      'Newly Renovated Apartments',
      'Quartz Countertops',
      'Stainless steel appliances',
      'Vinyl wood floorings',
      'Washer and Dryer in Unit',
    ],
    meta: officialMeta('https://www.livesolimar.com/apartments/ca/wilmington/floor-plans', 96),
  },
  {
    id: 'r-solimar-wilmington-0281',
    property_name: 'Solimar Luxury Homes #0281',
    unit_type: 'apartment',
    address_line: '1500 West Pacific Coast Highway Unit 0281',
    city: 'Wilmington',
    county: 'Los Angeles',
    zip: '90744',
    lat: 33.790626,
    lng: -118.284981,
    manager: 'FPI Management / TruAmerica',
    owner_operator: 'TruAmerica Multifamily; FPI-linked property management',
    application_platform: 'G5/Knock',
    application_url: solimarApply(122, '2026-04-22'),
    official_property_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
    application_route: 'Solimar official G5 inventory -> siteId 4523245 -> unitId 122 apply page; Knock handles tours/chat on the property site',
    links: {
      exact_listing_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
      exact_floorplan_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
      exact_application_url: solimarApply(122, '2026-04-22'),
      property_application_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
      application_link_type: 'exact-unit-application',
      application_link_confidence: 'verified',
      application_redirect_required: true,
      prefill_supported: false,
      unit_number_public: '0281',
      floor_plan_name: 'Two bedroom floor plan C',
      available_date: '2026-04-22',
      listing_status: 'available',
      verification_status: 'official-source',
    },
    min_rent: 2947,
    max_rent: 2956,
    beds_min: 2,
    beds_max: 2,
    baths_min: 2,
    baths_max: 2,
    sqft_min: 988,
    sqft_max: 988,
    unit_number: '0281',
    floor_plan_name: 'Two bedroom floor plan C',
    available_date: '2026-04-22',
    listing_visual_note: 'Uses original editable illustrations plus a Street View card (with satellite fallback); official Solimar marketing photos stay linked, not copied.',
    amenities: [
      'Central air and heat',
      'Newly Renovated Apartments',
      'Quartz Countertops',
      'Stainless steel appliances',
      'Vinyl wood floorings',
      'Washer and Dryer in Unit',
    ],
    meta: officialMeta('https://www.livesolimar.com/apartments/ca/wilmington/floor-plans', 96),
  },
  {
    id: 'r-solimar-wilmington-0115',
    property_name: 'Solimar Luxury Homes #0115',
    unit_type: 'apartment',
    address_line: '1500 West Pacific Coast Highway Unit 0115',
    city: 'Wilmington',
    county: 'Los Angeles',
    zip: '90744',
    lat: 33.790626,
    lng: -118.284981,
    manager: 'FPI Management / TruAmerica',
    owner_operator: 'TruAmerica Multifamily; FPI-linked property management',
    application_platform: 'G5/Knock',
    application_url: solimarApply(190, '2026-06-08'),
    official_property_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
    application_route: 'Solimar official G5 inventory -> siteId 4523245 -> unitId 190 apply page; Knock handles tours/chat on the property site',
    links: {
      exact_listing_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
      exact_floorplan_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
      exact_application_url: solimarApply(190, '2026-06-08'),
      property_application_url: 'https://www.livesolimar.com/apartments/ca/wilmington/floor-plans',
      application_link_type: 'exact-unit-application',
      application_link_confidence: 'verified',
      application_redirect_required: true,
      prefill_supported: false,
      unit_number_public: '0115',
      floor_plan_name: 'Three bedroom floor plan A',
      available_date: '2026-06-08',
      listing_status: 'available',
      verification_status: 'official-source',
    },
    min_rent: 3762,
    max_rent: 3771,
    beds_min: 3,
    beds_max: 3,
    baths_min: 2,
    baths_max: 2,
    sqft_min: 1280,
    sqft_max: 1280,
    unit_number: '0115',
    floor_plan_name: 'Three bedroom floor plan A',
    available_date: '2026-06-08',
    listing_visual_note: 'Uses original editable illustrations plus a Street View card (with satellite fallback); official Solimar marketing photos stay linked, not copied.',
    amenities: [
      'Central air and heat',
      'Newly Renovated Apartments',
      'Quartz Countertops',
      'Stainless steel appliances',
      'Vinyl wood floorings',
      'Washer and Dryer in Unit',
    ],
    meta: officialMeta('https://www.livesolimar.com/apartments/ca/wilmington/floor-plans', 96),
  },

  // ---------------- LOS ANGELES COUNTY ----------------
  { id: 'r-greystar-northridge', property_name: 'MODA at Northridge Walk', unit_type: 'apartment', address_line: 'Reseda Blvd corridor', city: 'Northridge', county: 'Los Angeles', zip: '91325', lat: 34.241, lng: -118.535, manager: 'Greystar', application_platform: 'RentCafe', application_url: 'https://www.greystar.com/find-apartments?location=Northridge%2C+CA', min_rent: 2350, max_rent: 3100, beds_min: 1, beds_max: 3, baths_min: 1, baths_max: 2, sqft_min: 720, sqft_max: 1280, deposit: 1000, application_fee: 50, admin_fee: 250, pet_policy: 'Pet friendly with deposit', pet_fee: 500, parking_type: 'Covered, 1 included', income_multiplier: 2.5, move_in_specials: 'See current Greystar specials' },
  { id: 'r-equity-koreatown', property_name: 'Wilshire La Brea-style Highrise', unit_type: 'apartment', address_line: 'Wilshire Blvd corridor', city: 'Los Angeles', county: 'Los Angeles', zip: '90036', lat: 34.062, lng: -118.344, manager: 'Equity Residential', application_platform: 'Other', application_url: 'https://www.equityapartments.com/los-angeles/', min_rent: 2890, max_rent: 4200, beds_min: 0, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 540, sqft_max: 1180, deposit: 0, application_fee: 50, admin_fee: 350, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Covered, $200/mo', income_multiplier: 2.5 },
  { id: 'r-essex-burbank', property_name: 'Studio Plaza-style Apartments', unit_type: 'apartment', address_line: 'Olive Ave corridor', city: 'Burbank', county: 'Los Angeles', zip: '91505', lat: 34.193, lng: -118.328, manager: 'Essex Property Trust', application_platform: 'RealPage', application_url: 'https://www.essexapartmenthomes.com/california/burbank-apartments', min_rent: 2675, max_rent: 3850, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 680, sqft_max: 1120, deposit: 750, application_fee: 50, admin_fee: 250, pet_policy: 'Cats and dogs OK with deposit', pet_fee: 500, parking_type: 'Garage included', income_multiplier: 2.75 },
  { id: 'r-avalon-toluca', property_name: 'AVA Toluca Hills-style Community', unit_type: 'apartment', address_line: 'Cahuenga Blvd corridor', city: 'Los Angeles', county: 'Los Angeles', zip: '90068', lat: 34.143, lng: -118.358, manager: 'AvalonBay Communities', application_platform: 'Other', application_url: 'https://www.avaloncommunities.com/california/los-angeles-apartments', min_rent: 2450, max_rent: 3950, beds_min: 0, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 520, sqft_max: 1140, deposit: 500, application_fee: 50, admin_fee: 200, pet_policy: 'Pet friendly with breed restrictions', pet_fee: 500, parking_type: 'Covered', income_multiplier: 2.5, accessibility_features: ['elevator', 'roll-in shower (select units)'] },
  { id: 'r-camden-glendale', property_name: 'Camden Glendale-style Towers', unit_type: 'apartment', address_line: 'Brand Blvd corridor', city: 'Glendale', county: 'Los Angeles', zip: '91203', lat: 34.149, lng: -118.255, manager: 'Camden Property Trust', application_platform: 'Other', application_url: 'https://www.camdenliving.com/glendale-ca-apartments', min_rent: 2750, max_rent: 4350, beds_min: 1, beds_max: 3, baths_min: 1, baths_max: 2, sqft_min: 720, sqft_max: 1410, deposit: 500, application_fee: 50, admin_fee: 250, pet_policy: 'Cats and dogs OK', pet_fee: 500, parking_type: 'Garage included', income_multiplier: 2.5 },
  { id: 'r-fpi-longbeach', property_name: 'East Village-style Apartments', unit_type: 'apartment', address_line: 'E Ocean Blvd corridor', city: 'Long Beach', county: 'Los Angeles', zip: '90802', lat: 33.766, lng: -118.190, manager: 'FPI Management', application_platform: 'AppFolio', application_url: 'https://www.fpimgt.com/communities/california/', min_rent: 2050, max_rent: 3050, beds_min: 0, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 480, sqft_max: 1080, deposit: 750, application_fee: 45, admin_fee: 175, pet_policy: 'Cats only', pet_fee: 350, parking_type: 'Open lot', income_multiplier: 2.5 },
  { id: 'r-greystar-pasadena', property_name: 'Old Town Pasadena-style Lofts', unit_type: 'apartment', address_line: 'Colorado Blvd corridor', city: 'Pasadena', county: 'Los Angeles', zip: '91103', lat: 34.146, lng: -118.149, manager: 'Greystar', application_platform: 'RentCafe', application_url: 'https://www.greystar.com/find-apartments?location=Pasadena%2C+CA', min_rent: 2780, max_rent: 4100, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 740, sqft_max: 1280, deposit: 1000, application_fee: 50, admin_fee: 250, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Covered', income_multiplier: 2.5 },
  { id: 'r-udr-marina', property_name: 'Marina Promenade-style Apartments', unit_type: 'apartment', address_line: 'Admiralty Way corridor', city: 'Los Angeles', county: 'Los Angeles', zip: '90292', lat: 33.978, lng: -118.452, manager: 'UDR', application_platform: 'Other', application_url: 'https://www.udr.com/los-angeles-apartments/', min_rent: 2950, max_rent: 4750, beds_min: 0, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 580, sqft_max: 1240, deposit: 500, application_fee: 50, admin_fee: 250, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Covered', income_multiplier: 2.5 },
  { id: 'r-decron-westla', property_name: 'Westwood-style Apartments', unit_type: 'apartment', address_line: 'Wilshire / Westwood corridor', city: 'Los Angeles', county: 'Los Angeles', zip: '90024', lat: 34.062, lng: -118.444, manager: 'Decron Properties', application_platform: 'AppFolio', application_url: 'https://www.decron.com/properties', min_rent: 2580, max_rent: 3950, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 660, sqft_max: 1180, deposit: 800, application_fee: 50, admin_fee: 200, pet_policy: 'Cats and small dogs OK', pet_fee: 400, parking_type: 'Covered, $150/mo', income_multiplier: 2.5 },
  { id: 'r-greystar-anaheim-ca-too', property_name: 'Inglewood Square-style Townhomes', unit_type: 'townhouse', address_line: 'Manchester Blvd corridor', city: 'Inglewood', county: 'Los Angeles', zip: '90301', lat: 33.962, lng: -118.353, manager: 'Greystar', application_platform: 'RentCafe', application_url: 'https://www.greystar.com/find-apartments?location=Inglewood%2C+CA', min_rent: 3100, max_rent: 3950, beds_min: 2, beds_max: 3, baths_min: 2, baths_max: 2.5, sqft_min: 1180, sqft_max: 1480, deposit: 1100, application_fee: 50, admin_fee: 250, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Attached garage', income_multiplier: 2.5, levels: 2, private_entrance: true, attached_garage: true, yard_or_patio: true },
  { id: 'r-prime-parklabrea', property_name: 'Park La Brea-style Mid-Wilshire', unit_type: 'apartment', address_line: '3rd St / Fairfax corridor', city: 'Los Angeles', county: 'Los Angeles', zip: '90036', lat: 34.063, lng: -118.357, manager: 'Prime Residential', application_platform: 'Other', application_url: 'https://www.primeresidential.com/communities/', min_rent: 2350, max_rent: 4200, beds_min: 0, beds_max: 3, baths_min: 1, baths_max: 2, sqft_min: 480, sqft_max: 1380, deposit: 750, application_fee: 50, admin_fee: 200, pet_policy: 'Cats and dogs OK', pet_fee: 500, parking_type: 'Covered, $200/mo', income_multiplier: 2.5 },
  { id: 'r-essex-westhollywood', property_name: 'West Hollywood-style Apartments', unit_type: 'apartment', address_line: 'Sunset Blvd corridor', city: 'Los Angeles', county: 'Los Angeles', zip: '90069', lat: 34.090, lng: -118.385, manager: 'Essex Property Trust', application_platform: 'RealPage', application_url: 'https://www.essexapartmenthomes.com/california/west-hollywood-apartments', min_rent: 2950, max_rent: 4750, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 720, sqft_max: 1180, deposit: 800, application_fee: 50, admin_fee: 250, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Covered', income_multiplier: 2.75 },

  // ---------------- ORANGE COUNTY ----------------
  { id: 'r-irvineco-irvine', property_name: 'Promenade-style Townhomes', unit_type: 'townhouse', address_line: 'Spectrum Center Dr', city: 'Irvine', county: 'Orange', zip: '92618', lat: 33.652, lng: -117.745, manager: 'Irvine Company Apartments', application_platform: 'Other', application_url: 'https://www.irvinecompanyapartments.com/locations/orange-county.html', min_rent: 3450, max_rent: 4500, beds_min: 2, beds_max: 3, baths_min: 2.5, baths_max: 2.5, sqft_min: 1320, sqft_max: 1680, deposit: 1500, application_fee: 50, admin_fee: 300, pet_policy: 'Pet friendly', pet_fee: 600, parking_type: '2-car attached garage', income_multiplier: 3, levels: 2, private_entrance: true, attached_garage: true, yard_or_patio: true, lower_density_community: true, accessibility_features: ['ramped path of travel'], move_in_specials: 'Lease term flexibility — see Irvine Company site' },
  { id: 'r-irvineco-newport', property_name: 'Bayview-style Apartments', unit_type: 'apartment', address_line: 'Newport Center Dr', city: 'Newport Beach', county: 'Orange', zip: '92660', lat: 33.616, lng: -117.872, manager: 'Irvine Company Apartments', application_platform: 'Other', application_url: 'https://www.irvinecompanyapartments.com/locations/orange-county.html', min_rent: 3150, max_rent: 4900, beds_min: 1, beds_max: 3, baths_min: 1, baths_max: 2, sqft_min: 760, sqft_max: 1480, deposit: 1200, application_fee: 50, admin_fee: 300, pet_policy: 'Pet friendly', pet_fee: 600, parking_type: 'Covered, 1 included', income_multiplier: 3 },
  { id: 'r-irvineco-tustin', property_name: 'Tustin Field-style Apartments', unit_type: 'apartment', address_line: 'Edinger Ave corridor', city: 'Tustin', county: 'Orange', zip: '92782', lat: 33.747, lng: -117.812, manager: 'Irvine Company Apartments', application_platform: 'Other', application_url: 'https://www.irvinecompanyapartments.com/locations/orange-county.html', min_rent: 2850, max_rent: 3950, beds_min: 1, beds_max: 3, baths_min: 1, baths_max: 2, sqft_min: 740, sqft_max: 1320, deposit: 1100, application_fee: 50, admin_fee: 300, pet_policy: 'Pet friendly', pet_fee: 600, parking_type: 'Covered', income_multiplier: 3 },
  { id: 'r-irvineco-mv', property_name: 'Mission Viejo-style Townhomes', unit_type: 'townhouse', address_line: 'La Paz Rd corridor', city: 'Mission Viejo', county: 'Orange', zip: '92691', lat: 33.604, lng: -117.671, manager: 'Irvine Company Apartments', application_platform: 'Other', application_url: 'https://www.irvinecompanyapartments.com/locations/orange-county.html', min_rent: 3250, max_rent: 4200, beds_min: 2, beds_max: 3, baths_min: 2, baths_max: 2.5, sqft_min: 1280, sqft_max: 1580, deposit: 1300, application_fee: 50, admin_fee: 300, pet_policy: 'Pet friendly', pet_fee: 600, parking_type: 'Attached garage', income_multiplier: 3, levels: 2, private_entrance: true, attached_garage: true, yard_or_patio: true },
  { id: 'r-greystar-anaheim', property_name: 'Stadium Park-style Apartments', unit_type: 'apartment', address_line: 'Katella Ave corridor', city: 'Anaheim', county: 'Orange', zip: '92802', lat: 33.823, lng: -117.886, manager: 'Greystar', application_platform: 'RentCafe', application_url: 'https://www.greystar.com/find-apartments?location=Anaheim%2C+CA', min_rent: 2390, max_rent: 3250, beds_min: 1, beds_max: 3, baths_min: 1, baths_max: 2, sqft_min: 700, sqft_max: 1300, deposit: 800, application_fee: 50, admin_fee: 250, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Covered', income_multiplier: 2.5 },
  { id: 'r-avalon-huntington', property_name: 'Pacific City-style Apartments', unit_type: 'apartment', address_line: 'Pacific Coast Hwy corridor', city: 'Huntington Beach', county: 'Orange', zip: '92648', lat: 33.659, lng: -117.999, manager: 'AvalonBay Communities', application_platform: 'Other', application_url: 'https://www.avaloncommunities.com/california/orange-county-apartments', min_rent: 2950, max_rent: 4250, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 740, sqft_max: 1280, deposit: 500, application_fee: 50, admin_fee: 200, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Covered', income_multiplier: 2.5 },
  { id: 'r-essex-santaana', property_name: 'Mainplace-style Townhomes', unit_type: 'townhouse', address_line: 'N Main St corridor', city: 'Santa Ana', county: 'Orange', zip: '92701', lat: 33.751, lng: -117.867, manager: 'Essex Property Trust', application_platform: 'RealPage', application_url: 'https://www.essexapartmenthomes.com/california/santa-ana-apartments', min_rent: 2850, max_rent: 3650, beds_min: 2, beds_max: 3, baths_min: 2, baths_max: 2.5, sqft_min: 1160, sqft_max: 1480, deposit: 1100, application_fee: 50, admin_fee: 250, pet_policy: 'Pets OK', pet_fee: 500, parking_type: 'Garage', income_multiplier: 2.75, levels: 2, private_entrance: true, attached_garage: true },
  { id: 'r-equity-fullerton', property_name: 'Fullerton Town Center-style', unit_type: 'apartment', address_line: 'E Wilshire Ave corridor', city: 'Fullerton', county: 'Orange', zip: '92832', lat: 33.871, lng: -117.925, manager: 'Equity Residential', application_platform: 'Other', application_url: 'https://www.equityapartments.com/orange-county/', min_rent: 2380, max_rent: 3500, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 700, sqft_max: 1180, deposit: 0, application_fee: 50, admin_fee: 250, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Covered', income_multiplier: 2.5 },
  { id: 'r-camden-mainplace', property_name: 'Camden Main-style Lofts', unit_type: 'apartment', address_line: 'Edinger / Bristol area', city: 'Costa Mesa', county: 'Orange', zip: '92626', lat: 33.694, lng: -117.890, manager: 'Camden Property Trust', application_platform: 'Other', application_url: 'https://www.camdenliving.com/orange-county-apartments', min_rent: 2580, max_rent: 3650, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 720, sqft_max: 1180, deposit: 500, application_fee: 50, admin_fee: 250, pet_policy: 'Cats and dogs OK', pet_fee: 500, parking_type: 'Garage included', income_multiplier: 2.5 },
  { id: 'r-lyon-orange', property_name: 'The City-style Apartments', unit_type: 'apartment', address_line: 'The City Dr corridor', city: 'Orange', county: 'Orange', zip: '92868', lat: 33.787, lng: -117.881, manager: 'Lyon Living', application_platform: 'AppFolio', application_url: 'https://www.lyonliving.com/communities', min_rent: 2150, max_rent: 3100, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 660, sqft_max: 1080, deposit: 800, application_fee: 50, admin_fee: 200, pet_policy: 'Pet friendly', pet_fee: 400, parking_type: 'Open lot', income_multiplier: 2.5 },
  { id: 'r-fpi-gardengrove', property_name: 'Garden Grove-style Apartments', unit_type: 'apartment', address_line: 'Garden Grove Blvd corridor', city: 'Garden Grove', county: 'Orange', zip: '92843', lat: 33.776, lng: -117.945, manager: 'FPI Management', application_platform: 'AppFolio', application_url: 'https://www.fpimgt.com/communities/california/', min_rent: 1980, max_rent: 2750, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 640, sqft_max: 980, deposit: 700, application_fee: 45, admin_fee: 175, pet_policy: 'Cats only', pet_fee: 350, parking_type: 'Open lot', income_multiplier: 2.5 },
  { id: 'r-greystar-laguna', property_name: 'Laguna Niguel-style Townhomes', unit_type: 'townhouse', address_line: 'Crown Valley Pkwy corridor', city: 'Laguna Niguel', county: 'Orange', zip: '92677', lat: 33.523, lng: -117.706, manager: 'Greystar', application_platform: 'RentCafe', application_url: 'https://www.greystar.com/find-apartments?location=Laguna+Niguel%2C+CA', min_rent: 3450, max_rent: 4350, beds_min: 2, beds_max: 3, baths_min: 2.5, baths_max: 2.5, sqft_min: 1320, sqft_max: 1620, deposit: 1300, application_fee: 50, admin_fee: 250, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Attached garage', income_multiplier: 2.5, levels: 2, private_entrance: true, attached_garage: true, yard_or_patio: true },

  // ---------------- SAN BERNARDINO ----------------
  { id: 'r-conam-ontario', property_name: 'Vineyard Crossing-style Apartments', unit_type: 'apartment', address_line: 'S Vineyard Ave corridor', city: 'Ontario', county: 'San Bernardino', zip: '91761', lat: 34.041, lng: -117.642, manager: 'ConAm Management', application_platform: 'AppFolio', application_url: 'https://www.conam.com/properties/california/', min_rent: 1990, max_rent: 2950, beds_min: 1, beds_max: 3, baths_min: 1, baths_max: 2, sqft_min: 700, sqft_max: 1280, deposit: 700, application_fee: 45, admin_fee: 200, pet_policy: 'Pet friendly', pet_fee: 400, parking_type: 'Open lot', income_multiplier: 2.5 },
  { id: 'r-western-rancho', property_name: 'Vineyard Walk-style Townhomes', unit_type: 'townhouse', address_line: 'Foothill Blvd corridor', city: 'Rancho Cucamonga', county: 'San Bernardino', zip: '91730', lat: 34.106, lng: -117.589, manager: 'Western National Property Management', application_platform: 'AppFolio', application_url: 'https://www.wnpm.com/properties', min_rent: 2450, max_rent: 3100, beds_min: 2, beds_max: 3, baths_min: 2, baths_max: 2.5, sqft_min: 1180, sqft_max: 1520, deposit: 950, application_fee: 45, admin_fee: 200, pet_policy: 'Pets considered', pet_fee: 500, parking_type: 'Attached garage', income_multiplier: 2.5, levels: 2, private_entrance: true, attached_garage: true, yard_or_patio: true },
  { id: 'r-greystar-fontana', property_name: 'Fontana Sierra-style Apartments', unit_type: 'apartment', address_line: 'Sierra Ave corridor', city: 'Fontana', county: 'San Bernardino', zip: '92335', lat: 34.092, lng: -117.435, manager: 'Greystar', application_platform: 'RentCafe', application_url: 'https://www.greystar.com/find-apartments?location=Fontana%2C+CA', min_rent: 2050, max_rent: 2850, beds_min: 1, beds_max: 3, baths_min: 1, baths_max: 2, sqft_min: 720, sqft_max: 1280, deposit: 800, application_fee: 50, admin_fee: 200, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Open lot', income_multiplier: 2.5 },
  { id: 'r-fpi-pomona', property_name: 'Pomona Valley-style Apartments', unit_type: 'apartment', address_line: 'W Mission Blvd corridor', city: 'Pomona', county: 'Los Angeles', zip: '91766', lat: 34.061, lng: -117.760, manager: 'FPI Management', application_platform: 'AppFolio', application_url: 'https://www.fpimgt.com/communities/california/', min_rent: 1850, max_rent: 2680, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 640, sqft_max: 1040, deposit: 700, application_fee: 45, admin_fee: 175, pet_policy: 'Pet friendly', pet_fee: 400, parking_type: 'Open lot', income_multiplier: 2.5 },
  { id: 'r-mg-sb', property_name: 'San Bernardino Promenade-style', unit_type: 'apartment', address_line: 'Hospitality Lane corridor', city: 'San Bernardino', county: 'San Bernardino', zip: '92408', lat: 34.066, lng: -117.270, manager: 'MG Properties', application_platform: 'Entrata', application_url: 'https://www.mgproperties.com/communities', min_rent: 1980, max_rent: 2750, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 660, sqft_max: 1080, deposit: 800, application_fee: 50, admin_fee: 200, pet_policy: 'Pet friendly', pet_fee: 400, parking_type: 'Covered', income_multiplier: 2.5 },

  // ---------------- RIVERSIDE ----------------
  { id: 'r-mg-corona', property_name: 'Eagle Glen-style Apartments', unit_type: 'apartment', address_line: 'Eagle Glen Pkwy corridor', city: 'Corona', county: 'Riverside', zip: '92883', lat: 33.852, lng: -117.566, manager: 'MG Properties', application_platform: 'Entrata', application_url: 'https://www.mgproperties.com/communities', min_rent: 2150, max_rent: 3050, beds_min: 1, beds_max: 3, baths_min: 1, baths_max: 2, sqft_min: 720, sqft_max: 1280, deposit: 800, application_fee: 50, admin_fee: 200, pet_policy: 'Pet friendly', pet_fee: 400, parking_type: 'Covered', income_multiplier: 2.5 },
  { id: 'r-conam-riverside', property_name: 'Riverside Plaza-style Apartments', unit_type: 'apartment', address_line: 'Magnolia Ave corridor', city: 'Riverside', county: 'Riverside', zip: '92506', lat: 33.953, lng: -117.396, manager: 'ConAm Management', application_platform: 'AppFolio', application_url: 'https://www.conam.com/properties/california/', min_rent: 1950, max_rent: 2780, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 660, sqft_max: 1080, deposit: 700, application_fee: 45, admin_fee: 200, pet_policy: 'Pet friendly', pet_fee: 400, parking_type: 'Open lot', income_multiplier: 2.5 },
  { id: 'r-greystar-temecula', property_name: 'Temecula Vineyards-style Townhomes', unit_type: 'townhouse', address_line: 'Promenade Mall area', city: 'Temecula', county: 'Riverside', zip: '92591', lat: 33.534, lng: -117.151, manager: 'Greystar', application_platform: 'RentCafe', application_url: 'https://www.greystar.com/find-apartments?location=Temecula%2C+CA', min_rent: 2580, max_rent: 3450, beds_min: 2, beds_max: 3, baths_min: 2, baths_max: 2.5, sqft_min: 1180, sqft_max: 1520, deposit: 1000, application_fee: 50, admin_fee: 250, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Attached garage', income_multiplier: 2.5, levels: 2, private_entrance: true, attached_garage: true, yard_or_patio: true, lower_density_community: true },
  { id: 'r-fpi-mreno', property_name: 'Moreno Valley-style Apartments', unit_type: 'apartment', address_line: 'Sunnymead Ranch Pkwy area', city: 'Moreno Valley', county: 'Riverside', zip: '92553', lat: 33.937, lng: -117.231, manager: 'FPI Management', application_platform: 'AppFolio', application_url: 'https://www.fpimgt.com/communities/california/', min_rent: 1850, max_rent: 2580, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 640, sqft_max: 980, deposit: 700, application_fee: 45, admin_fee: 175, pet_policy: 'Pet friendly', pet_fee: 350, parking_type: 'Open lot', income_multiplier: 2.5 },
  { id: 'r-western-murrieta', property_name: 'Murrieta Hot Springs-style Townhomes', unit_type: 'townhouse', address_line: 'Murrieta Hot Springs Rd', city: 'Murrieta', county: 'Riverside', zip: '92563', lat: 33.572, lng: -117.165, manager: 'Western National Property Management', application_platform: 'AppFolio', application_url: 'https://www.wnpm.com/properties', min_rent: 2450, max_rent: 3150, beds_min: 2, beds_max: 3, baths_min: 2, baths_max: 2.5, sqft_min: 1180, sqft_max: 1480, deposit: 950, application_fee: 45, admin_fee: 200, pet_policy: 'Pet friendly', pet_fee: 450, parking_type: 'Attached garage', income_multiplier: 2.5, levels: 2, private_entrance: true, attached_garage: true, yard_or_patio: true },

  // ---------------- VENTURA ----------------
  { id: 'r-alliance-thousand-oaks', property_name: 'Hillcrest-style Apartments', unit_type: 'apartment', address_line: 'Thousand Oaks Blvd corridor', city: 'Thousand Oaks', county: 'Ventura', zip: '91362', lat: 34.170, lng: -118.837, manager: 'Alliance Residential', application_platform: 'RentCafe', application_url: 'https://www.allresco.com/communities', min_rent: 2550, max_rent: 3550, beds_min: 1, beds_max: 3, baths_min: 1, baths_max: 2, sqft_min: 720, sqft_max: 1300, deposit: 800, application_fee: 50, admin_fee: 250, pet_policy: 'Pet friendly', pet_fee: 500, parking_type: 'Covered', income_multiplier: 2.5 },
  { id: 'r-fpi-oxnard', property_name: 'Oxnard Channel Islands-style', unit_type: 'apartment', address_line: 'Channel Islands Blvd', city: 'Oxnard', county: 'Ventura', zip: '93033', lat: 34.166, lng: -119.182, manager: 'FPI Management', application_platform: 'AppFolio', application_url: 'https://www.fpimgt.com/communities/california/', min_rent: 1980, max_rent: 2780, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 660, sqft_max: 1080, deposit: 700, application_fee: 45, admin_fee: 175, pet_policy: 'Pet friendly', pet_fee: 400, parking_type: 'Open lot', income_multiplier: 2.5 },
  { id: 'r-mg-simi', property_name: 'Simi Valley Town Center-style', unit_type: 'apartment', address_line: 'Simi Town Center Way', city: 'Simi Valley', county: 'Ventura', zip: '93065', lat: 34.262, lng: -118.738, manager: 'MG Properties', application_platform: 'Entrata', application_url: 'https://www.mgproperties.com/communities', min_rent: 2280, max_rent: 3150, beds_min: 1, beds_max: 2, baths_min: 1, baths_max: 2, sqft_min: 720, sqft_max: 1180, deposit: 850, application_fee: 50, admin_fee: 200, pet_policy: 'Pet friendly', pet_fee: 400, parking_type: 'Covered', income_multiplier: 2.5 },
  { id: 'r-western-ventura', property_name: 'Ventura Harbor-style Townhomes', unit_type: 'townhouse', address_line: 'Harbor Blvd corridor', city: 'Ventura', county: 'Ventura', zip: '93001', lat: 34.273, lng: -119.293, manager: 'Western National Property Management', application_platform: 'AppFolio', application_url: 'https://www.wnpm.com/properties', min_rent: 2680, max_rent: 3450, beds_min: 2, beds_max: 3, baths_min: 2, baths_max: 2.5, sqft_min: 1180, sqft_max: 1480, deposit: 1000, application_fee: 45, admin_fee: 200, pet_policy: 'Pet friendly', pet_fee: 450, parking_type: 'Attached garage', income_multiplier: 2.5, levels: 2, private_entrance: true, attached_garage: true, yard_or_patio: true },
];

export const REAL_RENTALS: RentalWithPhotos[] = ROWS.map((row) => ({
  ...row,
  external_id: row.id,
  state: 'CA' as const,
  official_property_url: row.official_property_url ?? row.application_url,
  meta: row.meta ?? meta(row.application_url),
  photos: rentalPhotos({
    id: row.id,
    unit_type: row.unit_type,
    property_name: row.property_name,
    city: row.city,
    lat: row.lat,
    lng: row.lng,
  }),
}));
