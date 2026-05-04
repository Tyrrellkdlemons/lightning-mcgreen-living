import raw from './generated/workbook-ranked-listings.json';

export interface WorkbookLinks {
  direct_unit_link?: string | null;
  floor_plan_link?: string | null;
  leasing_site?: string | null;
  source_url?: string | null;
  best_listing_url?: string | null;
  floor_plan_url?: string | null;
  leasing_url?: string | null;
  source_url_clickable?: string | null;
}

export interface WorkbookMapInfo {
  lat?: number | null;
  lng?: number | null;
  openstreetmap_url?: string | null;
  openstreetmap_embed_url?: string | null;
  google_maps_reference_url?: string | null;
}

export interface WorkbookDirectLinks {
  direct_listing_url?: string | null;
  official_property_search_url?: string | null;
  direct_platform_apply_url?: string | null;
  zillow_url?: string | null;
  rent_url?: string | null;
  realtor_url?: string | null;
  source_host?: string | null;
}

export interface WorkbookSourceLink {
  label: string;
  url: string;
  kind: 'primary' | 'deep-listing' | 'official-search' | 'deep-apply' | 'marketplace' | 'legacy' | string;
}

export interface WorkbookRankedListing {
  id: string;
  rank?: number | null;
  match_percent?: number | null;
  fit_tier?: string | null;
  property_name: string;
  city?: string | null;
  county?: string | null;
  priority_city_match?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  beds?: string | null;
  baths?: string | null;
  sqft_range?: string | null;
  rent_low?: number | null;
  rent_high?: number | null;
  unit_or_floor?: string | null;
  floor_plan?: string | null;
  availability?: string | null;
  management_company?: string | null;
  leasing_contact?: string | null;
  screening_vendor?: string | null;
  screening_difficulty?: number | null;
  screening_difficulty_label?: string | null;
  greystar_snappt_flag?: string | null;
  screening_precheck_note?: string | null;
  action_status?: string | null;
  score_notes?: string | null;
  best_feature?: string | null;
  missing_preferences?: string | null;
  questions_to_ask_leasing?: string | null;
  source_date?: string | null;
  application_platform_inferred?: string | null;
  map?: WorkbookMapInfo;
  direct_links?: WorkbookDirectLinks;
  source_links?: WorkbookSourceLink[];
  links: WorkbookLinks;
}

export const WORKBOOK_RANKED_LISTINGS = raw as WorkbookRankedListing[];

export const WORKBOOK_CITY_OPTIONS = Array.from(
  new Set(WORKBOOK_RANKED_LISTINGS.map((x) => x.city).filter(Boolean) as string[]),
).sort();

export function workbookPrimaryUrl(x: WorkbookRankedListing): string | null {
  return (
    x.direct_links?.direct_listing_url ??
    x.direct_links?.official_property_search_url ??
    x.direct_links?.direct_platform_apply_url ??
    x.links.best_listing_url ??
    x.links.leasing_url ??
    x.links.source_url_clickable ??
    x.links.source_url ??
    x.links.leasing_site ??
    null
  );
}

export function workbookMapUrl(x: WorkbookRankedListing): string | null {
  return x.map?.openstreetmap_url ?? null;
}
