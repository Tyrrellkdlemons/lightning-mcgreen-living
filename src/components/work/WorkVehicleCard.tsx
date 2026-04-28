import Link from 'next/link';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { WorkVan } from '@/components/theme/CookieCar';
import { FitBadge } from '@/components/common/FitBadge';
import { SourcePanel } from '@/components/common/SourcePanel';
import { usd } from '@/lib/calculators';
import { scoreWorkRental } from '@/lib/scoring';
import type { WorkRentalProfile, WorkVehicleRental } from '@/types';

const TYPE_LABEL: Record<WorkVehicleRental['vehicle_type'], string> = {
  'cargo-van': 'Cargo van',
  'box-truck': 'Box truck',
  pickup: 'Pickup truck',
  'stake-bed': 'Stake-bed truck',
  flatbed: 'Flatbed truck',
  'passenger-van': 'Passenger van',
  refrigerated: 'Refrigerated truck',
};

export function WorkVehicleCard({ rental, profile }: { rental: WorkVehicleRental; profile: WorkRentalProfile }) {
  const fit = scoreWorkRental(rental, profile);

  return (
    <CandyCard interactive className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Gumdrop tone="mute">{TYPE_LABEL[rental.vehicle_type]}</Gumdrop>
          <h3 className="mt-1 truncate font-display text-lg font-extrabold text-chocolate-900">{rental.provider_name}</h3>
          <p className="text-xs text-chocolate-700">
            {rental.branch_address} · {rental.city}, CA {rental.zip}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <FitBadge fit={fit} />
            {rental.business_account_available && <Gumdrop tone="ok">Business account</Gumdrop>}
            {rental.one_way_available && <Gumdrop tone="info">One-way</Gumdrop>}
          </div>
        </div>
        <WorkVan className="h-12 w-auto shrink-0" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat label="Daily" value={usd(rental.daily_rate)} />
        <Stat label="Weekly" value={usd(rental.weekly_rate)} />
        <Stat label="Monthly" value={usd(rental.monthly_rate)} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat label="Deposit" value={usd(rental.deposit)} />
        <Stat label="Mileage fee" value={rental.mileage_fee_per_mile != null ? `$${rental.mileage_fee_per_mile.toFixed(2)}/mi` : '—'} />
        <Stat label="Incl miles/day" value={rental.included_miles_per_day != null ? String(rental.included_miles_per_day) : '—'} />
      </div>

      <SourcePanel meta={rental.meta} dense />

      <div className="flex items-center justify-between">
        <Link href={`/work-vehicles/${rental.id}`} className="bolt-btn text-sm">See details</Link>
        <a href={rental.website} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-chocolate-700 underline decoration-lightning-500 underline-offset-2">
          Provider site →
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
