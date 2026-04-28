import Link from 'next/link';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { CookieCar } from '@/components/theme/CookieCar';
import { FitBadge } from '@/components/common/FitBadge';
import { SourcePanel } from '@/components/common/SourcePanel';
import { PhotoGallery } from '@/components/common/PhotoGallery';
import { SaveHeart } from '@/components/common/SaveHeart';
import { calcPaymentEstimate, usd } from '@/lib/calculators';
import { scoreVehicle } from '@/lib/scoring';
import type { BuyerProfile, Dealer, VehicleListing } from '@/types';
import type { PhotoSet } from '@/lib/data/photo-sets';

export function CarCard({
  vehicle,
  dealer,
  profile,
}: {
  vehicle: VehicleListing & { photos?: PhotoSet };
  dealer?: Dealer;
  profile: BuyerProfile;
}) {
  const fit = scoreVehicle(vehicle, profile);
  const pay = calcPaymentEstimate({
    price: vehicle.price,
    down_payment: vehicle.down_payment_estimate,
    apr_percent: vehicle.apr_estimate,
    term_months: vehicle.term_months,
  });

  return (
    <CandyCard interactive className="relative flex flex-col gap-3">
      <div className="absolute right-3 top-3 z-10">
        <SaveHeart kind="car" id={vehicle.id} />
      </div>
      {vehicle.photos && <PhotoGallery photos={vehicle.photos} height={180} />}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Gumdrop tone="mute">{vehicle.condition.toUpperCase()}</Gumdrop>
          <h3 className="mt-1 truncate font-display text-lg font-extrabold text-chocolate-900">
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim ?? ''}
          </h3>
          <p className="text-xs text-chocolate-700">
            {vehicle.mileage.toLocaleString()} mi · {vehicle.body_type ?? '—'} · {vehicle.fuel_type ?? '—'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <FitBadge fit={fit} />
            {dealer && <Gumdrop tone="info">{dealer.dealer_name}</Gumdrop>}
          </div>
        </div>
        <CookieCar className="h-12 w-auto shrink-0" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat label="Price" value={usd(vehicle.price)} />
        <Stat label="Est. monthly" value={usd(pay.monthly_payment)} />
        <Stat label="Est. down" value={usd(vehicle.down_payment_estimate)} />
      </div>

      <SourcePanel meta={vehicle.meta} dense />

      <div className="flex items-center justify-between">
        <Link href={`/cars/${vehicle.id}`} className="bolt-btn text-sm">See details</Link>
        <a href={vehicle.listing_url} target="_blank" rel="noopener noreferrer"
           className="text-xs font-semibold text-chocolate-700 underline decoration-lightning-500 underline-offset-2">
          Dealer listing →
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
