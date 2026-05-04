/**
 * Full 50-column workbook dataset, parsed directly from
 * `data/uploads/socal_apartment_ranked_research_workbook.xlsx`.
 *
 * This complements the existing `workbook-ranked-listings.ts` (which is
 * the link-resolved, geocoded variant Codex generates from
 * `scripts/import-ranked-workbook.py`). This file exposes the raw
 * spreadsheet truth so the listing detail panel and inline workbook
 * table never have to be vague — every column the user filled in is
 * directly readable in the UI.
 *
 * To regenerate, drop a fresh .xlsx in `data/uploads/` and run:
 *   npm run import:workbook-full
 */
import raw from './generated/workbook-listings-full.json';
import manifest from './generated/workbook-fields-manifest.json';

export interface WorkbookFullListing {
  id: string;
  rank: number;
  match?: number;
  fit_tier?: string;
  property_name: string;
  city?: string;
  county?: string;
  priority_city_match?: string;
  neighborhood?: string;
  address?: string;
  beds?: string;
  baths?: string;
  sq_ft_range?: string;
  rent_low?: number;
  rent_high?: number;
  budget_fit_score?: number;
  unit_floor?: string;
  floor_plan?: string;
  availability?: string;
  washer_dryer?: string;
  central_ac?: string;
  pool?: string;
  jacuzzi_spa?: string;
  carpet_bedrooms?: string;
  flooring_notes?: string;
  luxury_level?: string;
  safety_score?: number;
  traffic_freeway_score?: number;
  nearby_freeways?: string;
  screening_vendor?: string;
  screening_difficulty?: number;
  screening_ease_pts?: number;
  app_move_in_pts?: number;
  approval_time?: string;
  move_in_timeline?: string;
  fees_deposit?: string;
  mgmt_leasing_company?: string;
  leasing_contact?: string;
  pet_policy?: string;
  parking_ev?: string;
  extra_amenities?: string;
  legal_lease_notes?: string;
  red_flags_verify?: string;
  best_feature?: string;
  missing_preferences?: string;
  direct_unit_link?: string;
  floor_plan_link?: string;
  leasing_site?: string;
  source_url?: string;
  source_date?: string;
  score_notes?: string;
  // Allow any extra columns to pass through safely
  [key: string]: unknown;
}

export interface WorkbookField {
  key: string;
  label: string;
}

export const WORKBOOK_FULL_LISTINGS = raw as WorkbookFullListing[];
export const WORKBOOK_FIELDS = manifest as WorkbookField[];

export const WORKBOOK_CITIES = Array.from(
  new Set(
    WORKBOOK_FULL_LISTINGS.map((x) => x.city).filter(Boolean) as string[],
  ),
).sort();

export const WORKBOOK_FIT_TIERS = Array.from(
  new Set(
    WORKBOOK_FULL_LISTINGS.map((x) => x.fit_tier).filter(Boolean) as string[],
  ),
).sort();

/** Boolean-ish helpers for "Yes / Unknown/Verify" cells. */
export function isYes(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  return /^(yes|y|in[- ]unit|community|hookups?)/i.test(v.trim());
}
export function isUnknown(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v !== 'string') return false;
  return /unknown|verify|n\/?a|tbd/i.test(v);
}

/** First non-empty link for a listing, in priority order. */
export function pickPrimaryLink(x: WorkbookFullListing): string | null {
  const candidates = [
    x.direct_unit_link,
    x.leasing_site,
    x.source_url,
    x.floor_plan_link,
  ];
  return candidates.find((u) => typeof u === 'string' && u.startsWith('http')) ?? null;
}

/** Field groups for the rich detail panel — keeps the panel structured. */
export const WORKBOOK_FIELD_GROUPS: { title: string; keys: (keyof WorkbookFullListing)[] }[] = [
  {
    title: 'Match & Fit',
    keys: ['rank', 'match', 'fit_tier', 'priority_city_match', 'budget_fit_score', 'best_feature', 'missing_preferences'],
  },
  {
    title: 'Place',
    keys: ['property_name', 'address', 'neighborhood', 'city', 'county'],
  },
  {
    title: 'Layout',
    keys: ['beds', 'baths', 'sq_ft_range', 'unit_floor', 'floor_plan', 'availability'],
  },
  {
    title: 'Money',
    keys: ['rent_low', 'rent_high', 'fees_deposit'],
  },
  {
    title: 'Amenities',
    keys: ['washer_dryer', 'central_ac', 'pool', 'jacuzzi_spa', 'carpet_bedrooms', 'flooring_notes', 'luxury_level', 'extra_amenities', 'parking_ev', 'pet_policy'],
  },
  {
    title: 'Location quality',
    keys: ['safety_score', 'traffic_freeway_score', 'nearby_freeways'],
  },
  {
    title: 'Screening & application',
    keys: ['screening_vendor', 'screening_difficulty', 'screening_ease_pts', 'app_move_in_pts', 'approval_time', 'move_in_timeline'],
  },
  {
    title: 'Operator',
    keys: ['mgmt_leasing_company', 'leasing_contact'],
  },
  {
    title: 'Heads-up',
    keys: ['legal_lease_notes', 'red_flags_verify', 'score_notes'],
  },
  {
    title: 'Links',
    keys: ['direct_unit_link', 'floor_plan_link', 'leasing_site', 'source_url', 'source_date'],
  },
];
