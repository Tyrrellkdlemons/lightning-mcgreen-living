'use client';

import { useMemo } from 'react';
import type { Dealer, VehicleListing } from '@/types';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { CookieCar } from '@/components/theme/CookieCar';
import { FitBadge, FitExplain } from '@/components/common/FitBadge';
import { SourcePanel } from '@/components/common/SourcePanel';
import { PhotoGallery } from '@/components/common/PhotoGallery';
import type { PhotoSet } from '@/lib/data/photo-sets';
import { PaymentEstimator } from './PaymentEstimator';
import { VinDecoderPanel } from './VinDecoderPanel';
import { BuyerProfilePanel, useBuyerProfile } from './BuyerProfilePanel';
import { scoreVehicle } from '@/lib/scoring';
import { usd } from '@/lib/calculators';
import { AutoHardshipCard } from '@/components/assistance/AutoHardshipCard';
import { caSosLookupUrl } from '@/lib/providers/ca-sos';
import { caDmvOlLookupUrl } from '@/lib/providers/ca-dmv-ol';
import { FinancePrepPacket } from '@/components/common/PrepPackets';
import { resolveVehicleFinanceLink } from '@/lib/links/resolver';

export function CarDetailClient({ vehicle, dealer }: { vehicle: VehicleListing & { photos?: PhotoSet }; dealer?: Dealer }) {
  const [profile, setProfile] = useBuyerProfile();
  const fit = useMemo(() => scoreVehicle(vehicle, profile), [vehicle, profile]);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {vehicle.photos && (
          <CandyCard className="!p-0 overflow-hidden">
            <PhotoGallery photos={vehicle.photos} height={340} rounded={false} />
          </CandyCard>
        )}
        <CandyCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Gumdrop tone="mute">{vehicle.condition.toUpperCase()}</Gumdrop>
              <h1 className="mt-1 font-display text-3xl font-extrabold text-chocolate-900">
                {vehicle.year} {vehicle.make} {vehicle.model} <span className="text-chocolate-700">{vehicle.trim ?? ''}</span>
              </h1>
              <p className="mt-1 text-sm text-chocolate-700">
                VIN <span className="font-mono">{vehicle.vin}</span> · {vehicle.mileage.toLocaleString()} mi
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <FitBadge fit={fit} />
                {dealer && <Gumdrop tone="info">Dealer: {dealer.dealer_name}</Gumdrop>}
              </div>
            </div>
            <CookieCar className="h-16 w-auto" />
          </div>
        </CandyCard>

        <PaymentEstimator
          initialPrice={vehicle.price}
          initialDown={vehicle.down_payment_estimate ?? Math.round(vehicle.price * 0.1)}
          initialApr={vehicle.apr_estimate ?? 8.99}
          initialTerm={vehicle.term_months ?? 60}
          mpg={vehicle.fuel_economy_mpg_combined}
        />

        <VinDecoderPanel initialVin={vehicle.vin} />

        <CandyCard>
          <h2 className="font-display text-xl font-extrabold text-chocolate-900">Why this may fit</h2>
          <div className="mt-2"><FitExplain fit={fit} /></div>
        </CandyCard>

        <FinancePrepPacket
          vehicle={vehicle}
          dealer={dealer}
          profile={profile}
          link={resolveVehicleFinanceLink(vehicle as any, dealer)}
        />

        <AutoHardshipCard />

        <BuyerProfilePanel profile={profile} onChange={setProfile} />
      </div>

      <aside className="space-y-4">
        <CandyCard>
          <h3 className="font-display text-lg font-extrabold text-chocolate-900">Vehicle details</h3>
          <ul className="mt-2 space-y-1 text-sm text-chocolate-800">
            <li className="flex justify-between"><span>Price</span><span className="num">{usd(vehicle.price)}</span></li>
            <li className="flex justify-between"><span>Body type</span><span>{vehicle.body_type ?? '—'}</span></li>
            <li className="flex justify-between"><span>Drive</span><span>{vehicle.drive ?? '—'}</span></li>
            <li className="flex justify-between"><span>Transmission</span><span>{vehicle.transmission ?? '—'}</span></li>
            <li className="flex justify-between"><span>Fuel</span><span>{vehicle.fuel_type ?? '—'}</span></li>
            <li className="flex justify-between"><span>Combined MPG</span><span>{vehicle.fuel_economy_mpg_combined ?? '—'}</span></li>
            <li className="flex justify-between"><span>Safety stars</span><span>{vehicle.safety_rating_overall ? `${vehicle.safety_rating_overall} / 5` : '—'}</span></li>
            <li className="flex justify-between"><span>Status</span><span>{vehicle.availability_status}</span></li>
          </ul>
        </CandyCard>

        {dealer && (
          <CandyCard>
            <h3 className="font-display text-lg font-extrabold text-chocolate-900">Dealer transparency</h3>
            <p className="text-sm font-semibold text-chocolate-900">{dealer.dealer_name}</p>
            {dealer.legal_name && <p className="text-xs text-chocolate-600">Legal: {dealer.legal_name}</p>}
            <p className="text-xs text-chocolate-700">
              {dealer.address_line} · {dealer.city}, CA {dealer.zip}
            </p>
            <p className="mt-2 text-xs">
              Phone: <a href={`tel:${dealer.phone}`} className="underline decoration-lightning-500 underline-offset-2">{dealer.phone}</a>
            </p>
            {dealer.dealer_license_number && (
              <p className="text-xs text-chocolate-700">CA DMV license #{dealer.dealer_license_number}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <a className="underline decoration-lightning-500 underline-offset-2"
                 target="_blank" rel="noopener noreferrer"
                 href={caDmvOlLookupUrl(dealer.dealer_license_number)}>
                Verify CA DMV license ↗
              </a>
              {dealer.legal_name && (
                <a className="underline decoration-lightning-500 underline-offset-2"
                   target="_blank" rel="noopener noreferrer"
                   href={caSosLookupUrl(dealer.legal_name)}>
                  Verify LLC on CA SOS ↗
                </a>
              )}
            </div>
            {dealer.public_promos?.length ? (
              <div className="mt-3">
                <p className="text-xs font-bold uppercase text-chocolate-700">Public promos</p>
                <ul className="mt-1 space-y-1 text-xs text-chocolate-800">
                  {dealer.public_promos.map((p, i) => <li key={i}>· {p.label}</li>)}
                </ul>
                <p className="mt-1 text-[11px] text-chocolate-600">Always verify with the dealer before relying on a promo.</p>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={dealer.website} target="_blank" rel="noopener noreferrer" className="bolt-btn text-sm">Dealer website</a>
              {dealer.financing_application_url && (
                <a href={dealer.financing_application_url} target="_blank" rel="noopener noreferrer" className="cinnamon-btn text-sm">
                  Open dealer financing
                </a>
              )}
            </div>
            <p className="mt-2 text-[11px] text-chocolate-600">
              We never auto-submit a credit application. The buttons just open the dealer's official page.
            </p>
          </CandyCard>
        )}

        <SourcePanel meta={vehicle.meta} />

        <CandyCard>
          <h3 className="font-display text-lg font-extrabold text-chocolate-900">Disclaimers</h3>
          <ul className="mt-2 space-y-1 text-xs text-chocolate-700">
            <li>· Lightning McGreen Living is not a lender or dealer.</li>
            <li>· APR, term, and approval are decided by the lender — not by us.</li>
            <li>· "Zero-down" only appears when publicly listed by the dealer.</li>
            <li>· Always verify price, fees, and availability before visiting.</li>
          </ul>
        </CandyCard>
      </aside>
    </div>
  );
}
