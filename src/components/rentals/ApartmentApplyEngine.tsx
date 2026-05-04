'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  Images,
  MapPinned,
  Route,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ApartmentPrepPacket } from '@/components/common/PrepPackets';
import { PhotoGallery } from '@/components/common/PhotoGallery';
import { FitBadge } from '@/components/common/FitBadge';
import { CandyCard } from '@/components/ui/CandyCard';
import { Gumdrop } from '@/components/ui/Gumdrop';
import { usd } from '@/lib/calculators';
import { REAL_RENTALS, type RentalWithPhotos } from '@/lib/data/real-rentals';
import { inferScreeningStack, STRICTNESS_LABEL, STRICTNESS_TONE } from '@/lib/data/screening-stacks';
import {
  WORKBOOK_CITY_OPTIONS,
  WORKBOOK_RANKED_LISTINGS,
  workbookMapUrl,
  workbookPrimaryUrl,
  type WorkbookRankedListing,
} from '@/lib/data/workbook-ranked-listings';
import { resolveApartmentApplicationLink } from '@/lib/links/resolver';
import { scoreRental } from '@/lib/scoring';
import { ProfilePanel, useRenterProfile } from './ProfilePanel';

const APPLY_READY = REAL_RENTALS.filter(
  (r) =>
    (r.unit_type === 'apartment' || r.unit_type === 'townhome-style-apartment') &&
    r.links?.exact_application_url,
).sort((a, b) => {
  const ad = a.available_date ? +new Date(`${a.available_date}T12:00:00`) : Number.MAX_SAFE_INTEGER;
  const bd = b.available_date ? +new Date(`${b.available_date}T12:00:00`) : Number.MAX_SAFE_INTEGER;
  return ad - bd || a.min_rent - b.min_rent;
});

export function ApartmentApplyEngine() {
  const [profile, setProfile] = useRenterProfile();
  const [selectedId, setSelectedId] = useState(APPLY_READY[0]?.id ?? '');
  const [copied, setCopied] = useState(false);
  const [workbookQuery, setWorkbookQuery] = useState('');
  const [workbookCity, setWorkbookCity] = useState('all');
  const [workbookLimit, setWorkbookLimit] = useState(15);

  const selected = useMemo(
    () => APPLY_READY.find((r) => r.id === selectedId) ?? APPLY_READY[0],
    [selectedId],
  );
  const workbookFiltered = useMemo(() => {
    const q = workbookQuery.trim().toLowerCase();
    return WORKBOOK_RANKED_LISTINGS.filter((x) => {
      if (workbookCity !== 'all' && x.city !== workbookCity) return false;
      if (!q) return true;
      const blob = [
        x.property_name,
        x.city,
        x.county,
        x.address,
        x.screening_vendor,
        x.application_platform_inferred,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }, [workbookQuery, workbookCity]);
  const workbookVisible = useMemo(
    () => workbookFiltered.slice(0, workbookLimit),
    [workbookFiltered, workbookLimit],
  );

  if (!selected) {
    return (
      <CandyCard className="mt-6">
        <Gumdrop tone="warn">No verified units</Gumdrop>
        <p className="mt-2 text-sm text-chocolate-700">
          No exact apartment-side application links are loaded yet.
        </p>
      </CandyCard>
    );
  }

  const link = resolveApartmentApplicationLink(selected);
  const stack = inferScreeningStack(selected.application_platform, selected.manager, selected.screening_vendor);
  const fit = scoreRental(selected, profile);
  const routeRows = buildRouteRows(selected, stack, link.platform_name ?? selected.application_platform);

  async function copyPacket() {
    const text = [
      'AUTO APARTMENT APPLY ENGINE - COPY SHEET',
      `Property: ${selected.property_name}`,
      `Unit: ${selected.unit_number ?? ''}`,
      `Floor plan: ${selected.floor_plan_name ?? ''}`,
      `Address: ${selected.address_line}, ${selected.city}, CA ${selected.zip}`,
      `Available: ${selected.available_date ?? ''}`,
      `Rent: ${usd(selected.min_rent)} - ${usd(selected.max_rent)}`,
      `Owner/operator: ${selected.owner_operator ?? ''}`,
      `Manager: ${selected.manager}`,
      `Application platform: ${link.platform_name ?? selected.application_platform}`,
      `Application route: ${selected.application_route ?? link.reason}`,
      `Official application: ${link.url ?? ''}`,
      `Official source: ${selected.official_property_url}`,
      '',
      'Applicant',
      `Name: ${profile.contact?.name ?? ''}`,
      `Email: ${profile.contact?.email ?? ''}`,
      `Phone: ${profile.contact?.phone ?? ''}`,
      `Desired move-in: ${profile.desired_move_in ?? ''}`,
      `Household size: ${profile.household_size ?? ''}`,
      `Gross monthly income: ${profile.gross_monthly_income ?? ''}`,
      `Documents ready: ${(profile.documents_ready ?? []).join(', ')}`,
    ].join('\n');
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="mt-6 grid gap-5 xl:grid-cols-[370px_1fr]">
      <aside className="space-y-4">
        <CandyCard>
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-lightning-700" aria-hidden />
            <div>
              <Gumdrop tone="ok">Exact-unit queue</Gumdrop>
              <h2 className="mt-1 font-display text-xl font-extrabold text-chocolate-900">
                Apply-ready listings
              </h2>
            </div>
          </div>
          <p className="mt-2 text-xs text-chocolate-700">
            Official unit links only. These prepare and launch the property portal; they do not auto-submit.
          </p>
          <ul className="mt-4 space-y-2">
            {APPLY_READY.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={
                    'w-full rounded-md border px-3 py-2 text-left transition-colors ' +
                    (r.id === selected.id
                      ? 'border-lightning-500 bg-lightning-500/15'
                      : 'border-gingerbread-300 bg-frosting-100 hover:bg-frosting-200')
                  }
                >
                  <span className="block truncate text-sm font-extrabold text-chocolate-900">{r.property_name}</span>
                  <span className="mt-1 flex flex-wrap gap-1 text-[11px] text-chocolate-700">
                    <span>{r.city}</span>
                    <span>Unit {r.unit_number ?? 'selected'}</span>
                    <span>{usd(r.min_rent)}</span>
                    {r.available_date && <span>{formatDate(r.available_date)}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </CandyCard>

        <CandyCard>
          <div className="flex items-center gap-2">
            <Images className="h-5 w-5 text-lightning-700" aria-hidden />
            <div>
              <Gumdrop tone="info">Workbook feed</Gumdrop>
              <h2 className="mt-1 font-display text-lg font-extrabold text-chocolate-900">Spreadsheet coverage</h2>
            </div>
          </div>
          <ul className="mt-3 grid gap-2 text-xs text-chocolate-800">
            <li className="rounded-md bg-frosting-100 px-3 py-2">Listings loaded: {WORKBOOK_RANKED_LISTINGS.length}</li>
            <li className="rounded-md bg-frosting-100 px-3 py-2">
              AppFolio or On-Site inferred: {WORKBOOK_RANKED_LISTINGS.filter((x) => x.application_platform_inferred === 'AppFolio' || x.application_platform_inferred === 'On-Site').length}
            </li>
            <li className="rounded-md bg-frosting-100 px-3 py-2">
              Greystar/Snappt flagged: {WORKBOOK_RANKED_LISTINGS.filter((x) => /greystar|snappt/i.test(x.greystar_snappt_flag ?? '')).length}
            </li>
          </ul>
        </CandyCard>

        <ProfilePanel profile={profile} onChange={setProfile} />
      </aside>

      <div className="space-y-5">
        <CandyCard className="overflow-hidden !p-0">
          <PhotoGallery photos={selected.photos} height={280} rounded={false} interval={6500} />
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Gumdrop tone="ok">Official source</Gumdrop>
                  <FitBadge fit={fit} />
                  <Gumdrop tone={STRICTNESS_TONE[stack.strictness]}>
                    {STRICTNESS_LABEL[stack.strictness]}
                  </Gumdrop>
                </div>
                <h1 className="mt-2 font-display text-3xl font-extrabold text-chocolate-900">
                  {selected.property_name}
                </h1>
                <p className="mt-1 text-sm text-chocolate-700">
                  {selected.address_line} - {selected.city}, CA {selected.zip}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyPacket} className="cinnamon-btn">
                  <ClipboardCheck className="h-4 w-4" aria-hidden />
                  {copied ? 'Copied' : 'Copy packet'}
                </button>
                {link.url && (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="bolt-btn">
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Official apply
                  </a>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <MiniStat label="Rent" value={`${usd(selected.min_rent)} - ${usd(selected.max_rent)}`} />
              <MiniStat label="Beds / baths" value={`${selected.beds_min} bd / ${selected.baths_min} ba`} />
              <MiniStat label="Sq ft" value={selected.sqft_min ? selected.sqft_min.toLocaleString() : 'Verify'} />
              <MiniStat label="Available" value={selected.available_date ? formatDate(selected.available_date) : 'Verify'} />
            </div>

            <p className="mt-3 rounded-md bg-frosting-100 p-2 text-xs text-chocolate-700">
              <strong className="text-chocolate-900">Visuals:</strong>{' '}
              {selected.listing_visual_note ?? 'Original editable illustrations and open map tiles are used instead of copied third-party listing photos.'}
            </p>
          </div>
        </CandyCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <CandyCard>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-lightning-700" aria-hidden />
              <h2 className="font-display text-xl font-extrabold text-chocolate-900">
                Who owns what
              </h2>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              {routeRows.map((row) => (
                <div key={row.label} className="rounded-md bg-frosting-100 px-3 py-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-chocolate-600">{row.label}</dt>
                  <dd className="mt-0.5 text-chocolate-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </CandyCard>

          <CandyCard>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-lightning-700" aria-hidden />
              <h2 className="font-display text-xl font-extrabold text-chocolate-900">
                Application path
              </h2>
            </div>
            <ol className="mt-3 space-y-2 text-sm text-chocolate-800">
              {workflowSteps(selected).map((step, idx) => (
                <li key={step} className="flex gap-2 rounded-md bg-frosting-100 px-3 py-2">
                  <span className="num font-extrabold text-lightning-700">{idx + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-chocolate-600">
              The engine prepares, copies, and routes. Final submission, fee payment, consent, and uploads stay inside the official property portal.
            </p>
          </CandyCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <CandyCard>
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-lightning-700" aria-hidden />
              <h2 className="font-display text-xl font-extrabold text-chocolate-900">
                Prep checklist
              </h2>
            </div>
            <ul className="mt-3 grid gap-2 text-sm text-chocolate-800">
              {prepChecklist(selected).map((item) => (
                <li key={item} className="rounded-md bg-frosting-100 px-3 py-2">{item}</li>
              ))}
            </ul>
          </CandyCard>

          <CandyCard>
            <div className="flex items-center gap-2">
              <Images className="h-5 w-5 text-lightning-700" aria-hidden />
              <h2 className="font-display text-xl font-extrabold text-chocolate-900">
                Source links
              </h2>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <a href={selected.official_property_url} target="_blank" rel="noopener noreferrer" className="block rounded-md bg-frosting-100 px-3 py-2 font-semibold text-chocolate-900 underline decoration-lightning-500 underline-offset-2">
                Official property listing
              </a>
              {link.url && (
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="block rounded-md bg-frosting-100 px-3 py-2 font-semibold text-chocolate-900 underline decoration-lightning-500 underline-offset-2">
                  Exact official application
                </a>
              )}
              <Link href={`/apartments/${selected.id}`} className="block rounded-md bg-frosting-100 px-3 py-2 font-semibold text-chocolate-900 underline decoration-lightning-500 underline-offset-2">
                Full in-app detail page
              </Link>
            </div>
          </CandyCard>
        </div>

        <ApartmentPrepPacket rental={selected} profile={profile} link={link} />

        <CandyCard>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-lightning-700" aria-hidden />
                <Gumdrop tone="info">Workbook import active</Gumdrop>
              </div>
              <h2 className="mt-2 font-display text-xl font-extrabold text-chocolate-900">
                Ranked workbook listings and sources
              </h2>
              <p className="mt-1 text-xs text-chocolate-700">
                Compact view from `socal_apartment_ranked_research_workbook_ENHANCED_LINKED.xlsx` so the site stays clean while every source remains accessible.{' '}
                <Link
                  href="/apartments/workbook"
                  className="font-semibold underline decoration-lightning-500 underline-offset-2"
                >
                  Open the inline workbook table
                </Link>
              </p>
            </div>
            <span className="rounded-md bg-frosting-100 px-3 py-2 text-xs font-bold text-chocolate-800">
              Showing {workbookVisible.length} of {workbookFiltered.length}
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              value={workbookQuery}
              onChange={(e) => {
                setWorkbookQuery(e.target.value);
                setWorkbookLimit(15);
              }}
              placeholder="Search property, city, county, vendor, platform"
              className="w-full rounded-md border border-gingerbread-300 bg-white px-3 py-2 text-sm"
            />
            <select
              value={workbookCity}
              onChange={(e) => {
                setWorkbookCity(e.target.value);
                setWorkbookLimit(15);
              }}
              className="w-full rounded-md border border-gingerbread-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All cities</option>
              {WORKBOOK_CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <ul className="mt-4 space-y-2">
            {workbookVisible.map((item) => (
              <WorkbookRow key={item.id} item={item} />
            ))}
          </ul>

          {workbookVisible.length === 0 && (
            <p className="mt-4 rounded-md bg-frosting-100 px-3 py-2 text-sm text-chocolate-700">
              No workbook rows match this filter.
            </p>
          )}

          {workbookFiltered.length > workbookVisible.length && (
            <button
              type="button"
              onClick={() => setWorkbookLimit((n) => n + 25)}
              className="cinnamon-btn mt-4 text-sm"
            >
              Show 25 more
            </button>
          )}
        </CandyCard>
      </div>
    </div>
  );
}

function buildRouteRows(
  rental: RentalWithPhotos,
  stack: ReturnType<typeof inferScreeningStack>,
  platformName: string,
) {
  return [
    { label: 'Property', value: rental.property_name },
    { label: 'Owner/operator', value: rental.owner_operator ?? 'Verify with property records' },
    { label: 'Manager', value: rental.manager },
    { label: 'Application platform', value: platformName },
    { label: 'Application route', value: rental.application_route ?? 'Open the official property page and use its Apply CTA.' },
    { label: 'Likely screening path', value: stack.vendors.map((v) => v.name).join(' + ') || 'Not publicly verified' },
  ];
}

function workflowSteps(rental: RentalWithPhotos) {
  return [
    `Confirm ${rental.unit_number ? `unit #${rental.unit_number}` : 'the unit'} and availability on the official source.`,
    'Copy the prepared packet so the same applicant data is ready for every portal screen.',
    `Open ${rental.application_platform} through the exact official application link.`,
    'Pay fees and upload documents only after the portal shows the correct property, unit, and rent.',
    'Save confirmation numbers, receipts, and adverse-action notices if the decision is not approved.',
  ];
}

function prepChecklist(rental: RentalWithPhotos) {
  const rows = [
    'Photo ID for every adult applicant',
    'Recent pay stubs, offer letter, or bank-linked income proof',
    'Last 2 addresses and landlord contact details',
    'Application fee payment method',
  ];
  if (rental.holding_deposit) rows.push(`Holding deposit awareness: ${usd(rental.holding_deposit)} listed for this property`);
  if (rental.pet_policy) rows.push('Pet records, photo, vaccination details, and service-animal documentation if applicable');
  if (rental.parking_type) rows.push('Vehicle registration and parking details');
  return rows;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-frosting-100 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-chocolate-600">{label}</p>
      <p className="num mt-0.5 text-sm font-extrabold text-chocolate-900">{value}</p>
    </div>
  );
}

function WorkbookRow({ item }: { item: WorkbookRankedListing }) {
  const href = workbookPrimaryUrl(item);
  const mapUrl = workbookMapUrl(item);
  const sourceLinks = (item.source_links ?? []).filter((x) => urlLike(x.url));
  const strictByDifficulty = typeof item.screening_difficulty === 'number' && item.screening_difficulty >= 4;
  const precheckNote = item.screening_precheck_note ??
    (strictByDifficulty
      ? 'Screening warning: this listing is ranked as strict screening. Review criteria before applying.'
      : null);
  return (
    <li className="rounded-md border border-gingerbread-300 bg-frosting-100 px-3 py-2">
      <details>
        <summary className="cursor-pointer list-none">
          <div className="grid gap-1 sm:grid-cols-[56px_minmax(0,1fr)_120px_128px] sm:items-center">
            <span className="num text-xs font-extrabold text-chocolate-700">#{item.rank ?? 'n/a'}</span>
            <span className="truncate text-sm font-extrabold text-chocolate-900">{item.property_name}</span>
            <span className="truncate text-xs text-chocolate-700">{item.city ?? 'City n/a'}</span>
            <span className="num text-xs text-chocolate-800">{workbookRent(item)}</span>
            <span className="text-[11px] font-semibold text-chocolate-700 sm:col-start-4">
              {item.screening_difficulty_label ?? 'Verify'}
            </span>
          </div>
        </summary>
        <div className="mt-2 grid gap-2 text-xs text-chocolate-800 sm:grid-cols-2">
          <InfoLine label="Address" value={item.address} />
          <InfoLine label="Beds / baths" value={`${item.beds ?? 'Verify'} / ${item.baths ?? 'Verify'}`} />
          <InfoLine label="Management" value={item.management_company} />
          <InfoLine label="Leasing contact" value={item.leasing_contact} />
          <InfoLine label="Inferred platform" value={item.application_platform_inferred ?? 'Other'} />
          <InfoLine label="Screening vendor" value={item.screening_vendor} />
          <InfoLine label="Action status" value={item.action_status} />
          <InfoLine label="Greystar/Snappt flag" value={item.greystar_snappt_flag} />
        </div>
        {precheckNote && (
          <p className="mt-2 rounded-md bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">
            {precheckNote}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer" className="bolt-btn text-xs">
              Open direct listing
            </a>
          )}
          {urlLike(item.direct_links?.direct_platform_apply_url) && (
            <a href={item.direct_links!.direct_platform_apply_url!} target="_blank" rel="noopener noreferrer" className="cinnamon-btn text-xs">
              Portal apply route
            </a>
          )}
          {mapUrl && (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="cinnamon-btn text-xs">
              <MapPinned className="h-3.5 w-3.5" aria-hidden />
              Open map
            </a>
          )}
          {urlLike(item.links.floor_plan_url) && (
            <a href={item.links.floor_plan_url!} target="_blank" rel="noopener noreferrer" className="cinnamon-btn text-xs">
              Floor plan source
            </a>
          )}
          {urlLike(item.links.leasing_url) && (
            <a href={item.links.leasing_url!} target="_blank" rel="noopener noreferrer" className="cinnamon-btn text-xs">
              Leasing source
            </a>
          )}
        </div>
        {sourceLinks.length > 0 && (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {sourceLinks.slice(0, 6).map((link) => (
              <a
                key={`${item.id}-${link.label}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-gingerbread-300 bg-white px-2 py-1 text-[11px] font-semibold text-chocolate-800 underline decoration-lightning-500 underline-offset-2"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
        {(item.best_feature || item.questions_to_ask_leasing) && (
          <div className="mt-2 space-y-1 text-xs text-chocolate-700">
            {item.best_feature && <p><strong className="text-chocolate-900">Best feature:</strong> {item.best_feature}</p>}
            {item.questions_to_ask_leasing && <p><strong className="text-chocolate-900">Ask leasing:</strong> {item.questions_to_ask_leasing}</p>}
          </div>
        )}
      </details>
    </li>
  );
}

function InfoLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <p>
      <strong className="text-chocolate-900">{label}:</strong> {value ?? 'Verify'}
    </p>
  );
}

function workbookRent(item: WorkbookRankedListing) {
  if (item.rent_low == null && item.rent_high == null) return 'Verify';
  if (item.rent_low != null && item.rent_high != null && item.rent_low !== item.rent_high) {
    return `${usd(item.rent_low)}-${usd(item.rent_high)}`;
  }
  return usd(item.rent_low ?? item.rent_high ?? undefined);
}

function urlLike(s?: string | null) {
  return !!s && /^https?:\/\//i.test(s);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
}
