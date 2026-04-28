'use client';

import { useMemo, useState } from 'react';
import type { RentalListing } from '@/types';
import { useRenterProfile, ProfilePanel } from './ProfilePanel';
import { calcMoveInCost, calcAffordability, calcRequiredIncome, usd } from '@/lib/calculators';
import { scoreRental } from '@/lib/scoring';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { CandyCard } from '@/components/ui/CandyCard';
import { FitBadge, FitExplain } from '@/components/common/FitBadge';
import { SourcePanel } from '@/components/common/SourcePanel';
import { GingerbreadApartment, GingerbreadTownhome } from '@/components/theme/GingerbreadHouse';
import { PhotoGallery } from '@/components/common/PhotoGallery';
import type { PhotoSet } from '@/lib/data/photo-sets';
import { SourceOfIncomeNotice } from '@/components/assistance/SourceOfIncomeNotice';
import { ScreeningPanel } from './ScreeningPanel';
import { ApartmentPrepPacket } from '@/components/common/PrepPackets';
import { resolveApartmentApplicationLink } from '@/lib/links/resolver';
import { AdverseActionPanel } from '@/components/assistance/AdverseActionPanel';
import { resourcesForCountyAndState } from '@/lib/data/assistance';
import { AssistanceCard } from '@/components/assistance/AssistanceCard';
import { MapPanel } from '@/components/maps/MapPanel';

const APP_PLATFORM_NOTES: Record<string, string> = {
  RentCafe: "RentCafe applications usually require online ID, income docs, and a screening fee. Hosted by Yardi.",
  Entrata: "Entrata leasing flows are common with Class-A communities — expect online application, income verification, and pet screening.",
  AppFolio: "AppFolio is common with mid-market managers — single online form + screening fee.",
  RealPage: "RealPage / OneSite / Knock — multi-step online application; some properties use guest cards first.",
  Knock: "Knock often handles tour scheduling and chat; the application itself is usually on the manager's portal.",
  Other: "Process varies by property — open the official page to confirm steps.",
  Unknown: "Application platform not yet identified — call the property to confirm.",
};

export function RentalDetailClient({ rental }: { rental: RentalListing & { photos?: PhotoSet } }) {
  const [profile, setProfile] = useRenterProfile();
  const [overrideRent, setOverrideRent] = useState(rental.min_rent);

  const fit = useMemo(() => scoreRental(rental, profile), [rental, profile]);
  const moveIn = useMemo(
    () => calcMoveInCost({
      rent: overrideRent,
      deposit: rental.deposit,
      first_month: true,
      admin_fee: rental.admin_fee,
      application_fee: rental.application_fee,
      pet_fee: rental.pet_fee,
      parking_fee: rental.parking_fee,
    }),
    [overrideRent, rental],
  );
  const aff = profile.gross_monthly_income ? calcAffordability(profile.gross_monthly_income) : null;
  const requiredIncome = rental.income_multiplier ? calcRequiredIncome(overrideRent, rental.income_multiplier) : null;

  const isTownhome = rental.unit_type !== 'apartment';

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {rental.photos && (
          <CandyCard className="!p-0 overflow-hidden">
            <PhotoGallery photos={rental.photos} height={340} rounded={false} />
          </CandyCard>
        )}
        <CandyCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Gumdrop tone="mute">{isTownhome ? 'Townhouse rental' : 'Apartment unit'}</Gumdrop>
              <h1 className="mt-1 font-display text-3xl font-extrabold text-chocolate-900">
                {rental.property_name}
              </h1>
              <p className="mt-1 text-sm text-chocolate-700">
                {rental.address_line} · {rental.city}, CA {rental.zip}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <FitBadge fit={fit} />
                <Gumdrop tone="info">Managed by {rental.manager}</Gumdrop>
                {rental.application_platform !== 'Unknown' && <Gumdrop tone="mute">via {rental.application_platform}</Gumdrop>}
              </div>
            </div>
            {isTownhome ? <GingerbreadTownhome className="h-20 w-auto" /> : <GingerbreadApartment className="h-20 w-auto" />}
          </div>
        </CandyCard>

        <CandyCard>
          <h2 className="font-display text-xl font-extrabold text-chocolate-900">Move-in cost calculator</h2>
          <p className="text-xs text-chocolate-700">Adjust rent to model what your specific unit would cost up-front.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-bold uppercase text-chocolate-700">Rent (USD)</span>
              <input type="number" inputMode="numeric" value={overrideRent}
                     onChange={(e) => setOverrideRent(Number(e.target.value) || 0)}
                     className="mt-1 w-full rounded-md border border-gingerbread-300 bg-white px-2 py-1.5 text-sm" />
            </label>
            <Stat label="Move-in total" value={usd(moveIn.total)} />
            <Stat label="Affordable?" value={profile.gross_monthly_income ? `${Math.round((overrideRent / profile.gross_monthly_income) * 100)}% of income` : 'Add income'} />
          </div>
          <ul className="mt-3 space-y-1 text-sm text-chocolate-800">
            {moveIn.lines.map((l) => (
              <li key={l.label} className="flex justify-between"><span>{l.label}</span><span className="num">{usd(l.amount)}</span></li>
            ))}
          </ul>
        </CandyCard>

        {(aff || requiredIncome) && (
          <CandyCard>
            <h2 className="font-display text-xl font-extrabold text-chocolate-900">Income guidance</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
              {aff && <Stat label="Healthy max rent (30%)" value={usd(aff.healthy_max_rent)} />}
              {aff && <Stat label="Stretch max rent (35%)" value={usd(aff.stretch_max_rent)} />}
              {requiredIncome && (
                <Stat label={`Required income (${rental.income_multiplier}×)`} value={usd(requiredIncome)} />
              )}
            </div>
          </CandyCard>
        )}

        <CandyCard>
          <h2 className="font-display text-xl font-extrabold text-chocolate-900">Application process</h2>
          <p className="mt-1 text-sm text-chocolate-700">{APP_PLATFORM_NOTES[rental.application_platform]}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-chocolate-800">
            <li>· ID (driver's license / state ID)</li>
            <li>· Income proof (recent pay stubs / offer letter)</li>
            <li>· Rental history (last 2 addresses + landlord refs)</li>
            <li>· References (1–2 personal)</li>
            {rental.pet_policy && <li>· Pet documentation (vaccination + photo)</li>}
            {rental.parking_type && <li>· Vehicle registration (if parking included)</li>}
            <li className="sm:col-span-2 text-xs text-chocolate-600">
              Screening vendor: {rental.screening_vendor ?? 'not publicly verified yet — call to confirm'}
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={rental.application_url} target="_blank" rel="noopener noreferrer" className="bolt-btn">
              Open official application
            </a>
            <a href={rental.official_property_url} target="_blank" rel="noopener noreferrer" className="cinnamon-btn">
              Official property page
            </a>
            <button
              type="button"
              onClick={() => copyApplicationSheet(rental, profile)}
              className="cinnamon-btn"
              title="Copy a clean application sheet to your clipboard"
            >
              Copy my application sheet
            </button>
          </div>
          <p className="mt-3 text-xs text-chocolate-600">
            We never auto-submit applications. The buttons above just open the official site.
          </p>
        </CandyCard>

        <CandyCard>
          <h2 className="font-display text-xl font-extrabold text-chocolate-900">Why this may fit</h2>
          <div className="mt-2"><FitExplain fit={fit} /></div>
        </CandyCard>

        <CandyCard>
          <h2 className="font-display text-xl font-extrabold text-chocolate-900">Where it is</h2>
          <p className="mt-1 text-xs text-chocolate-700">Open vector map · CARTO Voyager basemap · no Google Maps key required.</p>
          <div className="mt-3"><MapPanel lat={rental.lat} lng={rental.lng} zoom={14} height={300} markers={[{ lat: rental.lat, lng: rental.lng, label: rental.property_name, tone: 'rental' }]} /></div>
        </CandyCard>

        <ApartmentPrepPacket
          rental={rental}
          profile={profile}
          link={resolveApartmentApplicationLink(rental as any)}
        />

        <ScreeningPanel
          platform={rental.application_platform}
          manager={rental.manager}
          publiclyDisclosed={rental.screening_vendor}
        />

        <SourceOfIncomeNotice />

        <AdverseActionPanel />

        <CountyHelp county={rental.county} />

        <ProfilePanel profile={profile} onChange={setProfile} />
      </div>

      <aside className="space-y-4">
        <CandyCard>
          <h3 className="font-display text-lg font-extrabold text-chocolate-900">Fee transparency</h3>
          <ul className="mt-2 space-y-1 text-sm text-chocolate-800">
            <li className="flex justify-between"><span>Rent range</span><span className="num">{usd(rental.min_rent)} – {usd(rental.max_rent)}</span></li>
            <li className="flex justify-between"><span>Deposit</span><span className="num">{usd(rental.deposit)}</span></li>
            <li className="flex justify-between"><span>Application fee</span><span className="num">{usd(rental.application_fee)}</span></li>
            <li className="flex justify-between"><span>Admin fee</span><span className="num">{usd(rental.admin_fee)}</span></li>
            <li className="flex justify-between"><span>Pet fee</span><span className="num">{usd(rental.pet_fee)}</span></li>
            <li className="flex justify-between"><span>Parking fee</span><span className="num">{usd(rental.parking_fee)}</span></li>
          </ul>
        </CandyCard>

        {(rental.attached_garage || rental.private_entrance || rental.yard_or_patio || rental.levels) && (
          <CandyCard>
            <h3 className="font-display text-lg font-extrabold text-chocolate-900">Townhome features</h3>
            <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {rental.levels && <Stat label="Levels" value={String(rental.levels)} />}
              {rental.private_entrance && <Stat label="Entrance" value="Private" />}
              {rental.attached_garage && <Stat label="Garage" value="Attached" />}
              {rental.yard_or_patio && <Stat label="Yard / patio" value="Yes" />}
              {rental.lower_density_community && <Stat label="Density" value="Lower" />}
            </ul>
          </CandyCard>
        )}

        <SourcePanel meta={rental.meta} />

        <CandyCard>
          <h3 className="font-display text-lg font-extrabold text-chocolate-900">Disclaimers</h3>
          <ul className="mt-2 space-y-1 text-xs text-chocolate-700">
            <li>· We help prepare and compare. Final approval is controlled by the property and its screening provider.</li>
            <li>· Prices, fees, promos, and availability can change — verify with the property before applying.</li>
            <li>· Lightning McGreen Living is not a property manager or screening provider.</li>
          </ul>
          <p className="mt-2 text-xs">
            <a className="underline decoration-lightning-500 underline-offset-2" href="https://www.hud.gov/program_offices/fair_housing_equal_opp/online-complaint" target="_blank" rel="noopener noreferrer">
              File a Fair Housing complaint with HUD
            </a>
          </p>
        </CandyCard>
      </aside>
    </div>
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

function CountyHelp({ county }: { county: string }) {
  const SUPPORTED = ['Los Angeles', 'Orange', 'Riverside', 'San Bernardino', 'Ventura'] as const;
  if (!SUPPORTED.includes(county as any)) return null;
  const { byCounty, statewide } = resourcesForCountyAndState(county as any);
  const top = [...byCounty, ...statewide].slice(0, 3);
  if (top.length === 0) return null;
  return (
    <CandyCard>
      <h2 className="font-display text-xl font-extrabold text-chocolate-900">If you need more time to stay</h2>
      <p className="mt-1 text-sm text-chocolate-700">Verified {county} County and statewide programs. Always confirm eligibility on the agency&apos;s site.</p>
      <ul className="mt-3 grid gap-3 md:grid-cols-3">
        {top.map((r) => <li key={r.id}><AssistanceCard resource={r} /></li>)}
      </ul>
      <p className="mt-3 text-xs"><a href="/assistance" className="underline decoration-lightning-500 underline-offset-2">See all assistance resources →</a></p>
    </CandyCard>
  );
}

function copyApplicationSheet(rental: RentalListing, profile: any) {
  const sheet = [
    `LIGHTNING MCGREEN LIVING — APPLICATION COPY SHEET`,
    `Property: ${rental.property_name}`,
    `Address: ${rental.address_line}, ${rental.city}, CA ${rental.zip}`,
    `Manager: ${rental.manager}  |  Application platform: ${rental.application_platform}`,
    ``,
    `Applicant`,
    `Name: ${profile.contact?.name ?? ''}`,
    `Email: ${profile.contact?.email ?? ''}`,
    `Phone: ${profile.contact?.phone ?? ''}`,
    `Move-in date: ${profile.desired_move_in ?? ''}`,
    `Household size: ${profile.household_size ?? ''}`,
    `Gross monthly income: ${profile.gross_monthly_income ?? ''}`,
    `Pets: ${profile.pets ? JSON.stringify(profile.pets) : 'none'}`,
    `Vehicles: ${profile.vehicles ?? ''}`,
    `Documents ready: ${(profile.documents_ready ?? []).join(', ')}`,
    `Notes: ${profile.notes ?? ''}`,
  ].join('\n');
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(sheet).catch(() => {});
  }
}
