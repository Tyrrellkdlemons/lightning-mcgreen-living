import Link from 'next/link';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { FitBadge } from '@/components/common/FitBadge';
import { SourcePanel } from '@/components/common/SourcePanel';
import { GingerbreadApartment, GingerbreadTownhome } from '@/components/theme/GingerbreadHouse';
import { PhotoGallery } from '@/components/common/PhotoGallery';
import { usd } from '@/lib/calculators';
import type { RentalListing, RenterProfile } from '@/types';
import type { PhotoSet } from '@/lib/data/photo-sets';
import { scoreRental } from '@/lib/scoring';

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
  const isTownhome = rental.unit_type !== 'apartment';

  return (
    <CandyCard interactive className="flex flex-col gap-3">
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
        {rental.application_platform !== 'Unknown' && (
          <Gumdrop tone="mute" title="Application platform">via {rental.application_platform}</Gumdrop>
        )}
        {rental.move_in_specials && (
          <Gumdrop tone="ok" title="Special">Special: {rental.move_in_specials}</Gumdrop>
        )}
        {rental.attached_garage && <Gumdrop tone="mute">Attached garage</Gumdrop>}
        {rental.private_entrance && <Gumdrop tone="mute">Private entrance</Gumdrop>}
        {rental.yard_or_patio && <Gumdrop tone="mute">Yard / patio</Gumdrop>}
      </div>

      <SourcePanel meta={rental.meta} dense />

      <div className="mt-1 flex items-center justify-between gap-2">
        <Link
          href={isTownhome ? `/townhomes/${rental.id}` : `/apartments/${rental.id}`}
          className="bolt-btn text-sm"
        >
          See details
        </Link>
        <a
          href={rental.official_property_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-chocolate-700 underline decoration-lightning-500 underline-offset-2"
        >
          Official property page →
        </a>
      </div>
    </CandyCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-frosting-100 px-2 py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-chocolate-600">{label}</p>
      <p className="num text-sm font-bold text-chocolate-900">{value}</p>
    </div>
  );
}
