'use client';

/**
 * ListingResearchPanel — surfaces every meaningful workbook column for one
 * listing so the renter never has to guess. Inputs:
 *   - rank (1..79) — looks up the matching row from WORKBOOK_FULL_LISTINGS
 *
 * Theme-matched (gingerbread + lightning + caramel). Mobile-first: collapses
 * sections under a single tap, larger touch targets, no horizontal scroll.
 */
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  MapPinned,
} from 'lucide-react';
import {
  WORKBOOK_FULL_LISTINGS,
  WORKBOOK_FIELD_GROUPS,
  isUnknown,
  isYes,
  pickPrimaryLink,
  type WorkbookFullListing,
} from '@/lib/data/workbook-listings-full';
import { CandyCard } from '@/components/ui/CandyCard';

const LABELS: Record<string, string> = {
  rank: 'Rank',
  match: 'Match %',
  fit_tier: 'Fit tier',
  priority_city_match: 'Priority city match',
  budget_fit_score: 'Budget fit',
  best_feature: 'Best feature',
  missing_preferences: 'Missing preferences',
  property_name: 'Property',
  address: 'Address',
  neighborhood: 'Neighborhood',
  city: 'City',
  county: 'County',
  beds: 'Beds',
  baths: 'Baths',
  sq_ft_range: 'Sq ft',
  unit_floor: 'Unit / floor',
  floor_plan: 'Floor plan',
  availability: 'Availability',
  rent_low: 'Rent (low)',
  rent_high: 'Rent (high)',
  fees_deposit: 'Fees / deposit',
  washer_dryer: 'Washer / dryer',
  central_ac: 'Central AC',
  pool: 'Pool',
  jacuzzi_spa: 'Jacuzzi / spa',
  carpet_bedrooms: 'Carpet bedrooms',
  flooring_notes: 'Flooring notes',
  luxury_level: 'Luxury level',
  extra_amenities: 'Extra amenities',
  parking_ev: 'Parking / EV',
  pet_policy: 'Pet policy',
  safety_score: 'Safety score',
  traffic_freeway_score: 'Traffic / freeway score',
  nearby_freeways: 'Nearby freeways',
  screening_vendor: 'Screening vendor',
  screening_difficulty: 'Screening difficulty',
  screening_ease_pts: 'Screening ease pts',
  app_move_in_pts: 'App / move-in pts',
  approval_time: 'Approval time',
  move_in_timeline: 'Move-in timeline',
  mgmt_leasing_company: 'Mgmt / leasing co.',
  leasing_contact: 'Leasing contact',
  legal_lease_notes: 'Legal / lease notes',
  red_flags_verify: 'Red flags / verify',
  score_notes: 'Score notes',
  direct_unit_link: 'Direct unit link',
  floor_plan_link: 'Floor plan link',
  leasing_site: 'Leasing site',
  source_url: 'Source URL',
  source_date: 'Source date',
};

function formatValue(key: string, value: unknown): string {
  if (value == null || value === '') return '—';
  if (key === 'rent_low' || key === 'rent_high') {
    const n = typeof value === 'number' ? value : parseFloat(String(value));
    return Number.isFinite(n) ? `$${n.toLocaleString()}` : String(value);
  }
  if (key === 'match') {
    return `${Math.round(Number(value) || 0)}%`;
  }
  return String(value);
}

function ValueChip({ k, v }: { k: string; v: unknown }) {
  const isLink = typeof v === 'string' && /^https?:\/\//.test(v);
  if (isLink) {
    return (
      <a
        href={v as string}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full bg-lightning-50 px-2.5 py-1 text-xs font-medium text-lightning-800 underline decoration-lightning-500 underline-offset-2 hover:bg-lightning-100"
      >
        Open <ExternalLink className="h-3 w-3" aria-hidden />
      </a>
    );
  }
  const tone = isYes(v)
    ? 'bg-lightning-50 text-lightning-800 ring-1 ring-lightning-200'
    : isUnknown(v)
    ? 'bg-frosting-100 text-chocolate-700 ring-1 ring-caramel-400/40'
    : 'bg-frosting-50 text-chocolate-800 ring-1 ring-gingerbread-200';
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${tone}`}>
      {isYes(v) && <CheckCircle2 className="h-3 w-3" aria-hidden />}
      {isUnknown(v) && <HelpCircle className="h-3 w-3" aria-hidden />}
      {formatValue(k, v)}
    </span>
  );
}

export interface ListingResearchPanelProps {
  rank: number | string;
  className?: string;
}

export function ListingResearchPanel({ rank, className }: ListingResearchPanelProps) {
  const listing: WorkbookFullListing | undefined = useMemo(() => {
    const r = typeof rank === 'string' ? Number(rank) : rank;
    return WORKBOOK_FULL_LISTINGS.find((x) => x.rank === r);
  }, [rank]);
  const [open, setOpen] = useState<Record<string, boolean>>({
    'Match & Fit': true,
    Layout: true,
    Money: true,
    Amenities: true,
    'Heads-up': true,
    Links: true,
  });

  if (!listing) {
    return (
      <CandyCard className={className}>
        <p className="text-sm text-chocolate-700">No workbook entry for rank {String(rank)}.</p>
      </CandyCard>
    );
  }

  const primary = pickPrimaryLink(listing);
  const heads = listing.red_flags_verify || listing.legal_lease_notes;

  return (
    <CandyCard className={className}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gingerbread-200 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gingerbread-600">
            Rank #{listing.rank} · {listing.fit_tier || 'Fit'}{' '}
            {typeof listing.match === 'number' && (
              <span className="ml-1 text-lightning-700">{Math.round(listing.match)}% match</span>
            )}
          </p>
          <h3 className="text-lg font-bold text-chocolate-900">{listing.property_name}</h3>
          <p className="text-sm text-chocolate-700">
            {listing.address || `${listing.city || ''}${listing.county ? `, ${listing.county}` : ''}`}
          </p>
        </div>
        {primary && (
          <a
            href={primary}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-lightning-500 px-3 py-1.5 text-sm font-semibold text-chocolate-900 shadow-sm hover:bg-lightning-400"
          >
            Apply / view <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </header>

      {heads && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-peppermint-500/10 p-2 text-xs text-peppermint-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{heads}</span>
        </div>
      )}

      <div className="mt-3 space-y-2">
        {WORKBOOK_FIELD_GROUPS.map((group) => {
          const isOpen = open[group.title] ?? false;
          const hasAnyValue = group.keys.some((k) => {
            const v = listing[k as keyof WorkbookFullListing];
            return v != null && v !== '';
          });
          if (!hasAnyValue) return null;
          return (
            <section key={group.title} className="rounded-md ring-1 ring-gingerbread-200">
              <button
                type="button"
                onClick={() =>
                  setOpen((prev) => ({ ...prev, [group.title]: !isOpen }))
                }
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-chocolate-900"
              >
                <span>{group.title}</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" aria-hidden />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden />
                )}
              </button>
              {isOpen && (
                <dl className="grid gap-x-3 gap-y-1 border-t border-gingerbread-200 px-3 py-2 text-xs sm:grid-cols-2">
                  {group.keys.map((k) => {
                    const key = String(k);
                    const v = listing[k as keyof WorkbookFullListing];
                    if (v == null || v === '') return null;
                    return (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-2 border-b border-dashed border-gingerbread-100 py-1 last:border-b-0"
                      >
                        <dt className="text-chocolate-700">{LABELS[key] || key}</dt>
                        <dd className="text-right text-chocolate-900">
                          <ValueChip k={key} v={v} />
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </section>
          );
        })}
      </div>

      {(listing.address || listing.city) && (
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
              listing.address || `${listing.property_name}, ${listing.city}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-frosting-100 px-3 py-1 text-xs text-chocolate-800 ring-1 ring-gingerbread-200 hover:bg-frosting-200"
          >
            <MapPinned className="h-3.5 w-3.5" /> OpenStreetMap
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              listing.address || `${listing.property_name}, ${listing.city}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-frosting-100 px-3 py-1 text-xs text-chocolate-800 ring-1 ring-gingerbread-200 hover:bg-frosting-200"
          >
            <MapPinned className="h-3.5 w-3.5" /> Google Maps
          </a>
        </div>
      )}
    </CandyCard>
  );
}
