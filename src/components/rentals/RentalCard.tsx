'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { FitBadge } from '@/components/common/FitBadge';
import { SourcePanel } from '@/components/common/SourcePanel';
import { GingerbreadApartment, GingerbreadTownhome } from '@/components/theme/GingerbreadHouse';
import { PhotoGallery } from '@/components/common/PhotoGallery';
import { ScreeningBadge } from './ScreeningPanel';
import { SaveHeart } from '@/components/common/SaveHeart';
import { findOperatorProfile, TIER_LABEL, TIER_TONE } from '@/lib/data/operator-profiles';
import { ApartmentLinkBadge, VerifiedAtBadge } from '@/components/common/LinkConfidenceBadge';
import { resolveApartmentApplicationLink } from '@/lib/links/resolver';
import { usd } from '@/lib/calculators';
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
  const [warnOpen, setWarnOpen] = useState(false);
  const fit = scoreRental(rental, profile);
  const isTownhome = rental.unit_type === 'townhouse';
  const link = resolveApartmentApplicationLink(rental as any);
  const stack = inferScreeningStack(rental.application_platform, rental.manager, rental.screening_vendor);
  const strictEntry = stack.strictness === 'strict' || stack.strictness === 'premium';
  const detailHref = isTownhome ? `/townhomes/${rental.id}` : `/apartments/${rental.id}`;
  const preferredPlatform = rental.application_platform === 'AppFolio' || rental.application_platform === 'On-Site';

  return (
    <CandyCard interactive className="relative flex flex-col gap-3">
      <div className="absolute right-3 top-3 z-10">
        <SaveHeart kind="rental" id={rental.id} />
      </div>
      {rental.photos && <PhotoGallery photos={rental.photos} height={180} />}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Gumdrop tone="mute">{UNIT_LABEL[rental.unit_type]}</Gumdrop>
            <FitBadge fit={fit} />
          </div>
          <h3 className="mt-1 truncate font-display text-lg font-extrabold text-chocolate-900">
            {rental.property_name}
          </h3>
          <p className="text-xs text-chocolate-700">
            {rental.address_line} · {rental.city}, CA {rental.zip}
          </p>
        </div>
        {isTownhome ? (
          <GingerbreadTownhome className="h-14 w-auto shrink-0" />
        ) : (
          <GingerbreadApartment className="h-14 w-auto shrink-0" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat label="Rent" value={`${usd(rental.min_rent)} – ${usd(rental.max_rent)}`} />
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
        {rental.unit_number && <Gumdrop tone="ok" title="Verified unit number">Unit #{rental.unit_number}</Gumdrop>}
        {rental.available_date && <Gumdrop tone="ok" title="Available date">Available {formatDate(rental.available_date)}</Gumdrop>}
        {rental.move_in_specials && (
          <Gumdrop tone="ok" title="Special">Special: {rental.move_in_specials}</Gumdrop>
        )}
        <ScreeningBadge platform={rental.application_platform} manager={rental.manager} publiclyDisclosed={rental.screening_vendor} />
        <ApartmentLinkBadge kind={link.kind} confidence={link.confidence} />
        <VerifiedAtBadge iso={rental.meta.last_verified_at} />
      </div>

      <SourcePanel meta={rental.meta} dense />

      <div className="mt-1 flex items-center justify-between gap-2">
        {strictEntry ? (
          <button type="button" onClick={() => setWarnOpen(true)} className="bolt-btn text-sm">
            See details
          </button>
        ) : (
          <Link href={detailHref} className="bolt-btn text-sm">
            See details
          </Link>
        )}
        <a
          href={rental.official_property_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-chocolate-700 underline decoration-lightning-500 underline-offset-2"
        >
          Official property page →
        </a>
      </div>
      <ListingNoticeModal
        open={warnOpen}
        onClose={() => setWarnOpen(false)}
        href={detailHref}
        platform={rental.application_platform}
        strictnessLabel={STRICTNESS_LABEL[stack.strictness]}
        vendorSummary={stack.vendors.map((v) => v.name).join(' + ') || 'Not publicly verified yet'}
        manager={rental.manager}
      />
    </CandyCard>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-frosting-100 px-2 py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-chocolate-600">{label}</p>
      <p className="num text-sm font-bold text-chocolate-900">{value}</p>
    </div>
  );
}

function ListingNoticeModal({
  open,
  onClose,
  href,
  platform,
  strictnessLabel,
  vendorSummary,
  manager,
}: {
  open: boolean;
  onClose: () => void;
  href: string;
  platform: RentalListing['application_platform'];
  strictnessLabel: string;
  vendorSummary: string;
  manager: string;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-label="Screening notice"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <CandyCard className="w-full max-w-lg">
        <Gumdrop tone="warn">Screening notice before opening</Gumdrop>
        <h3 className="mt-2 font-display text-lg font-extrabold text-chocolate-900">
          This listing may use stricter application checks
        </h3>
        <p className="mt-2 text-sm text-chocolate-800">
          Manager: {manager}
          <br />
          Portal: {platform}
          <br />
          Strictness: {strictnessLabel}
          <br />
          Likely vendors: {vendorSummary}
        </p>
        <p className="mt-2 text-xs text-chocolate-700">
          AppFolio and On-Site are preferred in your ranking, but strict operators are still included.
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} className="cinnamon-btn text-sm">
            Stay on results
          </button>
          <Link href={href} onClick={onClose} className="bolt-btn text-sm">
            Continue to listing
          </Link>
        </div>
      </CandyCard>
    </div>
  );
}
