'use client';

import Link from 'next/link';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { FitBadge } from '@/components/common/FitBadge';
import { SourcePanel } from '@/components/common/SourcePanel';
import { GingerbreadApartment, GingerbreadTownhome } from '@/components/theme/GingerbreadHouse';
import { ScreeningBadge } from './ScreeningPanel';
import { RentalPlanningActions } from './RentalPlanningActions';
import { findOperatorProfile, TIER_LABEL, TIER_TONE } from '@/lib/data/operator-profiles';
import { ApartmentLinkBadge } from '@/components/common/LinkConfidenceBadge';
import { resolveApartmentApplicationLink } from '@/lib/links/resolver';
import { recordedRent } from '@/lib/places/property-view';
import type { RentalListing, RenterProfile } from '@/types';
import type { PhotoSet } from '@/lib/data/photo-sets';
import { scoreRental } from '@/lib/scoring';
import { inferScreeningStack, STRICTNESS_LABEL } from '@/lib/data/screening-stacks';

const UNIT_LABEL: Record<RentalListing['unit_type'], string> = {
  apartment: 'Apartment unit',
  townhouse: 'Townhouse rental',
  'townhome-style-apartment': 'Townhome-style apartment',
};

export function RentalCard({
  rental,
  profile,
}: {
  rental: RentalListing & { photos?: PhotoSet };
  profile: RenterProfile;
}) {
  const fit = scoreRental(rental, profile);
  const isTownhome = rental.unit_type === 'townhouse';
  const link = resolveApartmentApplicationLink(rental as any);
  const stack = inferScreeningStack(rental.application_platform, rental.manager, rental.screening_vendor);
  const strictEntry = stack.strictness === 'strict' || stack.strictness === 'premium';
  const detailHref = isTownhome ? `/townhomes/${rental.id}` : `/apartments/${rental.id}`;
  const preferredPlatform = rental.application_platform === 'AppFolio' || rental.application_platform === 'On-Site';

  return (
    <CandyCard className="rental-card flex flex-col gap-3">
      {rental.photos?.urls[0] && (
        <figure className="rental-card-preview">
          {/* Catalog preview sets begin with an original decorative SVG. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={rental.photos.urls[0]} alt="" loading="lazy" decoding="async" width={600} height={180} />
          <figcaption>Illustration · property evidence in details</figcaption>
        </figure>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Gumdrop tone="mute">{UNIT_LABEL[rental.unit_type]}</Gumdrop>
            <FitBadge fit={fit} />
          </div>
          <h3 className="mt-2 font-display text-xl font-extrabold leading-snug text-chocolate-900 [overflow-wrap:anywhere]">
            <Link href={detailHref} className="rental-card-title">{rental.property_name}</Link>
          </h3>
          <p className="text-xs text-chocolate-700">
            {rental.address_line} · {rental.city}, {rental.state} {rental.zip}
          </p>
        </div>
        {isTownhome ? (
          <GingerbreadTownhome className="h-14 w-auto shrink-0" />
        ) : (
          <GingerbreadApartment className="h-14 w-auto shrink-0" />
        )}
      </div>

      <div className="rental-card-stats">
        <Stat label="Recorded rent" value={recordedRent(rental.min_rent, rental.max_rent)} />
        <Stat
          label="Beds"
          value={rental.beds_min === rental.beds_max ? `${rental.beds_min}` : `${rental.beds_min}–${rental.beds_max}`}
        />
        <Stat
          label="Baths"
          value={rental.baths_min === rental.baths_max ? `${rental.baths_min}` : `${rental.baths_min}–${rental.baths_max}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Gumdrop tone="info" title="Manager">Managed by {rental.manager}</Gumdrop>
        {(() => {
          const op = findOperatorProfile(rental.manager);
          return op ? (
            <Gumdrop tone={TIER_TONE[op.typical_tier]} title={`Operator portfolio tier: ${op.tier_notes ?? TIER_LABEL[op.typical_tier]}`}>
              {TIER_LABEL[op.typical_tier]} portfolio
            </Gumdrop>
          ) : null;
        })()}
        {rental.application_platform !== 'Unknown' && (
          <Gumdrop tone="mute" title="Application platform">via {rental.application_platform}</Gumdrop>
        )}
        {preferredPlatform && <Gumdrop tone="ok">Preferred portal</Gumdrop>}
        {rental.unit_number && <Gumdrop tone="mute" title="Unit number in the stored record">Recorded unit #{rental.unit_number}</Gumdrop>}
        {rental.available_date && <Gumdrop tone="mute" title="Historical availability date from the stored record">Recorded availability: {formatDate(rental.available_date)}</Gumdrop>}
        {rental.move_in_specials && (
          <Gumdrop tone="mute" title="Recorded offer; confirm whether it still applies">Recorded offer: {rental.move_in_specials}</Gumdrop>
        )}
        <ScreeningBadge platform={rental.application_platform} manager={rental.manager} publiclyDisclosed={rental.screening_vendor} />
        <ApartmentLinkBadge kind={link.kind} confidence={link.confidence} />
        <Gumdrop tone="mute">Record date: {formatDate(rental.meta.last_verified_at.slice(0, 10))}</Gumdrop>
      </div>

      <p className="text-xs leading-relaxed text-chocolate-700">Current availability is not confirmed. Check the exact unit, rent and fees with the provider.</p>
      <SourcePanel meta={rental.meta} dense />

      {strictEntry && (
        <details className="rental-screening-notes">
          <summary>Screening estimate: {STRICTNESS_LABEL[stack.strictness]}</summary>
          <p>Recorded portal: {rental.application_platform}. Manager: {rental.manager}. This estimate does not establish the current screening rules or your eligibility. Ask the property for its written criteria before paying a fee.</p>
        </details>
      )}
      <div className="rental-card-links">
        <Link href={detailHref} className="bolt-btn" aria-label={`View details for ${rental.property_name}`}>View details <span aria-hidden="true">→</span></Link>
        <a href={rental.official_property_url} target="_blank" rel="noopener noreferrer">Property source <span aria-hidden="true">↗</span></a>
      </div>
      <RentalPlanningActions id={rental.id} name={rental.property_name} />
    </CandyCard>
  );
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isFinite(parsed.getTime()) ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed) : 'Not recorded';
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-frosting-100 px-2 py-1.5">
      <p className="text-xs font-semibold text-chocolate-700">{label}</p>
      <p className="num text-sm font-bold text-chocolate-900">{value}</p>
    </div>
  );
}
