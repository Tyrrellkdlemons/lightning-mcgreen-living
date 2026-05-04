/**
 * Operator profiles — publicly known positioning of each apartment management
 * company we tag listings to.
 *
 * IMPORTANT: tier labels reflect the OPERATOR's typical SoCal portfolio
 * positioning (e.g. "Greystar runs from value through luxury but the
 * Stadium Park stylistic name aligns with their mid-market product"). They
 * do NOT claim a specific unit is luxury / refurbished / etc. — that's a
 * unit-level attribute we cannot assert without a verified feed.
 *
 * Where positioning is genuinely mixed across the operator's portfolio, we
 * label it `'mixed'` and tell the user which tiers exist.
 *
 * Sources for positioning:
 *   - Operator's own website (publicly published)
 *   - Public investor materials (REIT 10-Ks where applicable)
 *   - Multifamily industry trade press (NMHC top-50 rankings, RealPage data)
 *
 * No invented stats. If a number isn't publicly reported, the field is
 * absent.
 */

export type Tier = 'luxury' | 'upscale' | 'mid-market' | 'value' | 'mixed';
export type OperatorKind = 'REIT' | 'Third-party manager' | 'In-house owner-operator' | 'Master-planned developer';

export interface OperatorProfile {
  name: string;
  kind: OperatorKind;
  /** Typical positioning of the operator's SoCal portfolio. */
  typical_tier: Tier;
  tier_notes?: string;
  /** What leasing platform this operator typically uses on their public sites. */
  typical_platform: 'RentCafe' | 'Entrata' | 'AppFolio' | 'RealPage' | 'Knock' | 'On-Site' | 'G5/Knock' | 'In-house portal';
  /** What screening vendors are publicly associated with the operator. */
  typical_screening: string[];
  /** Publicly reported portfolio size (units), if known. */
  units_reported?: string;
  /** HQ city (publicly reported). */
  headquarters?: string;
  /** Real public homepage. */
  website: string;
  /** A short, factual paragraph users can read before applying. */
  what_to_expect: string;
  /** Match patterns used to map a listing's `manager` field to this profile. */
  match: RegExp;
}

export const OPERATOR_PROFILES: OperatorProfile[] = [
  {
    name: 'Greystar',
    kind: 'Third-party manager',
    typical_tier: 'mixed',
    tier_notes: 'Manages everything from value-add infill to brand-new luxury high-rises. The specific tier of any given Greystar property depends on the asset, not on Greystar itself.',
    typical_platform: 'RentCafe',
    typical_screening: ['Yardi ScreeningWorks Pro', 'Snappt'],
    units_reported: '900,000+ units globally; largest US apartment manager',
    headquarters: 'Charleston, SC',
    website: 'https://www.greystar.com',
    what_to_expect: 'Application happens through RentCafe (Yardi). Income-document fraud detection by Snappt is common — bring originals from your employer or be ready for a Plaid bank link. Pet screening usually runs through PetScreening.com.',
    match: /greystar/i,
  },
  {
    name: 'Irvine Company Apartments',
    kind: 'Master-planned developer',
    typical_tier: 'upscale',
    tier_notes: 'Master-planned Orange County communities. Typically newer construction, amenity-heavy, gated, with shared community pools / clubhouses.',
    typical_platform: 'In-house portal',
    typical_screening: ['Internal screening flow', 'Plaid Income (typical)'],
    headquarters: 'Newport Beach, CA',
    website: 'https://www.irvinecompanyapartments.com',
    what_to_expect: 'Apply on irvinecompanyapartments.com (no third-party platform). Strict 3× income rule, robust rental-history check, pet screening separate. Application fee + admin fee on most properties.',
    match: /irvine\s*company/i,
  },
  {
    name: 'Equity Residential',
    kind: 'REIT',
    typical_tier: 'upscale',
    tier_notes: 'Public REIT (NYSE: EQR). Urban high-rise + transit-oriented mid-rise, mostly. Property finishes are consistent and brand-managed.',
    typical_platform: 'In-house portal',
    typical_screening: ['Internal screening', 'Plaid Income (typical)'],
    units_reported: '~80,000 units in 11 metros',
    headquarters: 'Chicago, IL',
    website: 'https://www.equityapartments.com',
    what_to_expect: 'Apply on equityapartments.com. Often $0 deposit with a higher admin fee. Bank-linked income verification is common.',
    match: /equity\s*residential/i,
  },
  {
    name: 'Essex Property Trust',
    kind: 'REIT',
    typical_tier: 'upscale',
    tier_notes: 'Public REIT (NYSE: ESS) focused on West Coast. Mostly mid-rise, suburban + transit-oriented urban.',
    typical_platform: 'RealPage',
    typical_screening: ['RealPage LeasingDesk', 'Plaid Income (typical)'],
    units_reported: '~62,000 apartment homes, West Coast only',
    headquarters: 'San Mateo, CA',
    website: 'https://www.essexapartmenthomes.com',
    what_to_expect: 'Application + screening through RealPage / Essex portal. Multi-step flow, eviction + criminal lookup, lease compliance check.',
    match: /essex/i,
  },
  {
    name: 'AvalonBay Communities',
    kind: 'REIT',
    typical_tier: 'upscale',
    tier_notes: 'Public REIT (NYSE: AVB). AVA (urban smaller-unit), Avalon (premium suburban), Eaves (value-add) sub-brands.',
    typical_platform: 'In-house portal',
    typical_screening: ['Internal screening', 'Plaid Income (typical)'],
    units_reported: '~89,000 units across 12 states',
    headquarters: 'Arlington, VA',
    website: 'https://www.avaloncommunities.com',
    what_to_expect: 'Apply on avaloncommunities.com. The sub-brand (AVA / Avalon / Eaves) usually signals tier — AVA = urban / younger demographic; Avalon = premium suburban; Eaves = value-add.',
    match: /avalonbay|avalon\s*communities/i,
  },
  {
    name: 'Camden Property Trust',
    kind: 'REIT',
    typical_tier: 'upscale',
    tier_notes: 'Public REIT (NYSE: CPT). Suburban garden-style + urban mid-rise. Top employee-rated apartment manager (Fortune 100 Best Companies to Work For).',
    typical_platform: 'In-house portal',
    typical_screening: ['Internal screening', 'TransUnion-backed credit'],
    units_reported: '~58,000 apartment homes',
    headquarters: 'Houston, TX',
    website: 'https://www.camdenliving.com',
    what_to_expect: 'Apply on camdenliving.com. Strong customer service reputation. Standard credit + criminal + eviction + income docs.',
    match: /camden/i,
  },
  {
    name: 'UDR',
    kind: 'REIT',
    typical_tier: 'upscale',
    tier_notes: 'Public REIT (NYSE: UDR). Mostly urban mid-rise + high-rise.',
    typical_platform: 'In-house portal',
    typical_screening: ['Internal screening', 'Plaid Income (typical)'],
    units_reported: '~58,000 apartments',
    headquarters: 'Highlands Ranch, CO',
    website: 'https://www.udr.com',
    what_to_expect: 'Apply on udr.com. Tech-forward leasing flow with self-tour scheduling and digital key handover at many properties.',
    match: /^udr$/i,
  },
  {
    name: 'TruAmerica / FPI Management',
    kind: 'Third-party manager',
    typical_tier: 'mid-market',
    tier_notes: 'TruAmerica-owned or branded communities often use property-level marketing sites, with FPI-linked management or resident service workflows depending on the asset.',
    typical_platform: 'G5/Knock',
    typical_screening: ['G5 Marketing Cloud inventory', 'Knock Doorway', 'Property-controlled screening'],
    headquarters: 'Los Angeles, CA / Folsom, CA',
    website: 'https://www.fpimgt.com',
    what_to_expect: 'Start on the property site. G5 shows floorplan/unit inventory and routes Apply links with siteId/unitId. Knock may handle tours or chat. Final screening details are confirmed inside the official apply flow.',
    match: /truamerica|fpi\s*management\s*\/\s*truamerica/i,
  },
  {
    name: 'FPI Management',
    kind: 'Third-party manager',
    typical_tier: 'mid-market',
    tier_notes: 'Large third-party fee manager. Mostly mid-market and affordable / LIHTC product. Many properties accept Section 8 vouchers.',
    typical_platform: 'AppFolio',
    typical_screening: ['AppFolio Tenant Screening', 'CoreLogic'],
    units_reported: '~150,000 units',
    headquarters: 'Folsom, CA',
    website: 'https://www.fpimgt.com',
    what_to_expect: 'Application through AppFolio Online Portal. Single-form flow. Income proof + ID + rental history. Broadly Section-8 friendly.',
    match: /fpi\s*management/i,
  },
  {
    name: 'Western National Property Management',
    kind: 'Third-party manager',
    typical_tier: 'mid-market',
    tier_notes: 'Southern California-focused third-party manager. Mid-market garden-style and townhome-style apartments.',
    typical_platform: 'AppFolio',
    typical_screening: ['AppFolio Tenant Screening', 'CoreLogic'],
    headquarters: 'Irvine, CA',
    website: 'https://www.wnpm.com',
    what_to_expect: 'AppFolio-based application. Standard credit / criminal / eviction.',
    match: /western\s*national/i,
  },
  {
    name: 'ConAm Management',
    kind: 'Third-party manager',
    typical_tier: 'mid-market',
    tier_notes: 'San Diego-based third-party + investor. Garden-style and mid-rise across SoCal. Some affordable / LIHTC product.',
    typical_platform: 'On-Site',
    typical_screening: ['On-Site.com', 'Property-selected screening vendors'],
    units_reported: '~50,000 units',
    headquarters: 'San Diego, CA',
    website: 'https://www.conam.com',
    what_to_expect: 'ConAm properties use property-selected application platforms. For Presidio Anaheim, the official site routes exact units into On-Site. Standard documents still apply: ID, income proof, rental history, fees, and pet/vehicle details if relevant.',
    match: /conam/i,
  },
  {
    name: 'MG Properties',
    kind: 'In-house owner-operator',
    typical_tier: 'mid-market',
    tier_notes: 'San Diego-based owner-operator. Value-add renovations on acquired assets — many properties are in the middle of unit-level renovation programs (interior upgrades over time).',
    typical_platform: 'Entrata',
    typical_screening: ['Entrata PreciseID', 'Entrata Verification of Income'],
    headquarters: 'San Diego, CA',
    website: 'https://www.mgproperties.com',
    what_to_expect: 'Entrata flow with PreciseID identity verification. Acquired-then-renovated portfolio means a given unit may be "newly renovated" or "classic" — confirm on the property page.',
    match: /mg\s*properties/i,
  },
  {
    name: 'Alliance Residential',
    kind: 'In-house owner-operator',
    typical_tier: 'upscale',
    tier_notes: 'Developer-operator. Mid-rise + garden-style + mixed-use. Newer construction tends to lean upscale.',
    typical_platform: 'RentCafe',
    typical_screening: ['Yardi ScreeningWorks Pro'],
    headquarters: 'Phoenix, AZ',
    website: 'https://www.allresco.com',
    what_to_expect: 'RentCafe application. Newer-construction product is common.',
    match: /alliance\s*resi(dential)?/i,
  },
  {
    name: 'Decron Properties',
    kind: 'In-house owner-operator',
    typical_tier: 'upscale',
    tier_notes: 'LA-based owner-operator. Mostly West LA / Westwood / Sherman Oaks / Venice. Value-add renovations + selective new construction.',
    typical_platform: 'AppFolio',
    typical_screening: ['AppFolio Tenant Screening'],
    headquarters: 'Los Angeles, CA',
    website: 'https://www.decron.com',
    what_to_expect: 'AppFolio flow. Older buildings often have renovated kitchens / bathrooms — confirm finish level on the listing page.',
    match: /decron/i,
  },
  {
    name: 'Prime Residential',
    kind: 'In-house owner-operator',
    typical_tier: 'upscale',
    tier_notes: 'LA-based. Operator of some of the largest mid-Wilshire / 3rd-Fairfax assets (e.g. Park-La-Brea-style portfolios).',
    typical_platform: 'In-house portal',
    typical_screening: ['Internal screening', 'TransUnion'],
    headquarters: 'Los Angeles, CA',
    website: 'https://www.primeresidential.com',
    what_to_expect: 'Operator-direct application. Long-tenant culture; some properties have generations of residents.',
    match: /prime\s*residential/i,
  },
  {
    name: 'Lyon Living',
    kind: 'In-house owner-operator',
    typical_tier: 'mid-market',
    tier_notes: 'SoCal-based owner-developer. Garden-style + townhome-style across Orange County and Inland Empire.',
    typical_platform: 'AppFolio',
    typical_screening: ['AppFolio Tenant Screening'],
    headquarters: 'Newport Beach, CA',
    website: 'https://www.lyonliving.com',
    what_to_expect: 'AppFolio application. Family-friendly garden-style properties dominate the portfolio.',
    match: /lyon\s*living/i,
  },
];

export function findOperatorProfile(manager: string): OperatorProfile | undefined {
  return OPERATOR_PROFILES.find((p) => p.match.test(manager));
}

export const TIER_LABEL: Record<Tier, string> = {
  luxury: 'Luxury',
  upscale: 'Upscale',
  'mid-market': 'Mid-market',
  value: 'Value',
  mixed: 'Mixed portfolio',
};

export const TIER_TONE: Record<Tier, 'ok' | 'info' | 'warn' | 'mute'> = {
  luxury: 'warn',
  upscale: 'info',
  'mid-market': 'mute',
  value: 'ok',
  mixed: 'mute',
};
