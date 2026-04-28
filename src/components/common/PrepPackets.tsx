'use client';

import { useState } from 'react';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { RedirectScreen } from './RedirectScreen';
import type { ResolvedLink } from '@/lib/links/resolver';
import type { RenterProfile, BuyerProfile, WorkRentalProfile, RentalListing, VehicleListing, Dealer, WorkVehicleRental } from '@/types';
import { ApartmentLinkBadge, FinanceLinkBadge, ReservationLinkBadge, VerifiedAtBadge } from './LinkConfidenceBadge';

/**
 * Inline prep packets — required by the L spec. Surfaces the user's
 * prepared info BEFORE the redirect screen, so they can confirm what
 * they're sending out.
 */

// ---- Apartment ----------------------------------------------------------

export function ApartmentPrepPacket({
  rental,
  profile,
  link,
}: {
  rental: RentalListing;
  profile: RenterProfile;
  link: ResolvedLink;
}) {
  const [open, setOpen] = useState(false);
  const summary = apartmentSummary(rental, profile);

  return (
    <CandyCard>
      <Gumdrop tone="info">Application prep</Gumdrop>
      <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">Application Prep Packet</h2>
      <p className="mt-1 text-sm text-chocolate-700">
        We prepare your packet inline. Copy/paste-ready before the redirect.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ApartmentLinkBadge kind={link.kind as any} confidence={link.confidence} />
        <VerifiedAtBadge iso={rental.meta.last_verified_at} />
        {link.platform_name && (
          <Gumdrop tone="info" title={link.platform_owner ? `${link.platform_name} · ${link.platform_owner}` : link.platform_name}>
            via {link.platform_name}
          </Gumdrop>
        )}
      </div>
      <p className="mt-2 rounded-md bg-frosting-100 p-2 text-xs text-chocolate-700">
        <strong className="text-chocolate-900">Application goes through:</strong> {link.platform_name ?? rental.manager}
        {link.platform_owner && link.platform_owner !== link.platform_name ? ` (${link.platform_owner})` : ''}.
        {' '}
        <span className="text-chocolate-700">{link.reason}</span>
      </p>
      <PacketTable rows={summary} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setOpen(true)} className="bolt-btn">
          Start official application →
        </button>
        <span className="text-[11px] text-chocolate-600">Opens the closest verified link.</span>
      </div>
      <RedirectScreen
        open={open}
        onClose={() => setOpen(false)}
        href={link.url}
        destinationLabel={`${link.platform_name ?? rental.manager} · ${rental.property_name}`}
        packetSummary={summary}
      />
    </CandyCard>
  );
}

function apartmentSummary(rental: RentalListing, p: RenterProfile) {
  return [
    { label: 'Property', value: rental.property_name },
    { label: 'City', value: `${rental.city}, CA ${rental.zip}` },
    { label: 'Manager', value: rental.manager },
    { label: 'Applicant name', value: p.contact?.name ?? '' },
    { label: 'Email', value: p.contact?.email ?? '' },
    { label: 'Phone', value: p.contact?.phone ?? '' },
    { label: 'Move-in date', value: p.desired_move_in ?? '' },
    { label: 'Household size', value: String(p.household_size ?? '') },
    { label: 'Gross monthly income', value: p.gross_monthly_income ? `$${p.gross_monthly_income.toLocaleString()}` : '' },
    { label: 'Pets', value: p.pets ? `dogs ${p.pets.dogs ?? 0} / cats ${p.pets.cats ?? 0}` : 'none' },
    { label: 'Documents ready', value: (p.documents_ready ?? []).join(', ') },
  ];
}

// ---- Vehicle finance ----------------------------------------------------

export function FinancePrepPacket({
  vehicle,
  dealer,
  profile,
  link,
}: {
  vehicle: VehicleListing;
  dealer?: Dealer;
  profile: BuyerProfile;
  link: ResolvedLink;
}) {
  const [open, setOpen] = useState(false);
  const summary = financeSummary(vehicle, dealer, profile);

  return (
    <CandyCard>
      <Gumdrop tone="ok">Finance prep</Gumdrop>
      <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">Car Finance Prep Packet</h2>
      <p className="mt-1 text-sm text-chocolate-700">
        Copy/paste-ready packet for the dealer's official credit flow.
        We never submit financing on your behalf.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FinanceLinkBadge kind={link.kind as any} confidence={link.confidence} />
        <VerifiedAtBadge iso={vehicle.meta.last_verified_at} />
        <Gumdrop tone="mute" title={link.reason}>{link.reason.split('.')[0]}.</Gumdrop>
      </div>
      <PacketTable rows={summary} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setOpen(true)} className="bolt-btn">
          Start dealer finance application →
        </button>
        <span className="text-[11px] text-chocolate-600">No credit pull from us — the dealer's lender decides.</span>
      </div>
      <RedirectScreen
        open={open}
        onClose={() => setOpen(false)}
        href={link.url}
        destinationLabel={dealer ? `${dealer.dealer_name}` : 'Dealer'}
        packetSummary={summary}
      />
    </CandyCard>
  );
}

function financeSummary(v: VehicleListing, dealer: Dealer | undefined, p: BuyerProfile) {
  return [
    { label: 'Vehicle', value: `${v.year} ${v.make} ${v.model} ${v.trim ?? ''}`.trim() },
    { label: 'VIN', value: v.vin },
    { label: 'Stock #', value: (v as any).links?.stock_number ?? '' },
    { label: 'Dealer', value: dealer?.dealer_name ?? '' },
    { label: 'Dealer LLC', value: dealer?.legal_name ?? '' },
    { label: 'Price', value: `$${v.price.toLocaleString()}` },
    { label: 'Down payment', value: p.down_payment_available ? `$${p.down_payment_available.toLocaleString()}` : '' },
    { label: 'Monthly target', value: p.monthly_payment_target ? `$${p.monthly_payment_target.toLocaleString()}` : '' },
    { label: 'Self-selected credit range', value: p.credit_range ?? '' },
    { label: 'Trade-in', value: p.trade_in ? 'yes' : 'no' },
    { label: 'Co-signer', value: p.cosigner ? 'yes' : 'no' },
    { label: 'Buyer name', value: p.contact?.name ?? '' },
    { label: 'Buyer email', value: p.contact?.email ?? '' },
    { label: 'Buyer phone', value: p.contact?.phone ?? '' },
  ];
}

// ---- Work vehicle rental ------------------------------------------------

export function WorkRentalPrepPacket({
  rental,
  profile,
  link,
  estimatedTotal,
}: {
  rental: WorkVehicleRental;
  profile: WorkRentalProfile;
  link: ResolvedLink;
  estimatedTotal?: number;
}) {
  const [open, setOpen] = useState(false);
  const summary = workSummary(rental, profile, estimatedTotal);

  return (
    <CandyCard>
      <Gumdrop tone="ok">Rental prep</Gumdrop>
      <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">Work Vehicle Rental Prep Packet</h2>
      <p className="mt-1 text-sm text-chocolate-700">
        Copy/paste-ready for the rental provider's reservation flow.
        We never reserve on your behalf.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ReservationLinkBadge kind={link.kind as any} confidence={link.confidence} />
        <VerifiedAtBadge iso={rental.meta.last_verified_at} />
        <Gumdrop tone="mute" title={link.reason}>{link.reason.split('.')[0]}.</Gumdrop>
      </div>
      <PacketTable rows={summary} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setOpen(true)} className="bolt-btn">
          Reserve through official provider →
        </button>
        <span className="text-[11px] text-chocolate-600">Verify availability before relying on this rental.</span>
      </div>
      <RedirectScreen
        open={open}
        onClose={() => setOpen(false)}
        href={link.url}
        destinationLabel={rental.provider_name}
        packetSummary={summary}
      />
    </CandyCard>
  );
}

function workSummary(r: WorkVehicleRental, p: WorkRentalProfile, estimatedTotal?: number) {
  return [
    { label: 'Provider', value: r.provider_name },
    { label: 'Branch', value: `${r.city}, CA ${r.zip}` },
    { label: 'Vehicle type', value: r.vehicle_type.replace('-', ' ') },
    { label: 'Daily rate', value: r.daily_rate ? `$${r.daily_rate}` : '' },
    { label: 'Job type', value: p.job_type ?? '' },
    { label: 'Term', value: p.term_pref ?? '' },
    { label: 'Pickup city', value: p.pickup_city ?? '' },
    { label: 'Mileage estimate', value: p.mileage_estimate ? `${p.mileage_estimate} mi` : '' },
    { label: 'Insurance status', value: p.insurance_status ?? '' },
    { label: 'Business account needed', value: p.business_account_needed ? 'yes' : 'no' },
    { label: 'Estimated total', value: estimatedTotal != null ? `$${estimatedTotal.toLocaleString()}` : '' },
  ];
}

// ---- Shared table -------------------------------------------------------

function PacketTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <table className="mt-3 w-full text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-b border-gingerbread-300/30 last:border-b-0">
            <td className="py-1 pr-3 text-chocolate-700">{r.label}</td>
            <td className="py-1 font-semibold text-chocolate-900">{r.value || <span className="text-chocolate-500">—</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
