import type { AssistanceResource, AssistanceState } from '@/types/assistance';

/**
 * Source-linked help directory. Legacy dates are preserved until their actual
 * source is reviewed again; a source review does not establish available funding.
 * The November 3 review covers LA Rent Relief, Stay Housed LA, CA DRE/CRD and
 * the five Arizona entries. Source URLs below are the inspected primary pages.
 */

const VERIFIED_AT = '2026-04-28T00:00:00-07:00';
const REVIEWED_AT = '2026-11-03T00:00:00-08:00';

export const ASSISTANCE_RESOURCES: AssistanceResource[] = [
  // -------------------- LOS ANGELES COUNTY --------------------
  {
    id: 'la-errp-2026',
    jurisdiction: 'Los Angeles County',
    topic: 'rent_relief',
    agency: 'LA County Department of Consumer & Business Affairs',
    program_name: 'LA County Rent Relief - application status',
    eligibility_summary:
      'The provider reports that the application window is closed. Existing applicants can use its status portal; check other referral services for current assistance.',
    application_url: 'https://www.lacountyrentrelief.com/',
    application_status: 'closed',
    notes: 'Applications were reported closed on November 3, 2026. Follow the provider page for any later changes.',
    last_verified_at: REVIEWED_AT,
    source_url: 'https://www.lacountyrentrelief.com/',
  },
  {
    id: 'la-housing-search',
    jurisdiction: 'Los Angeles County',
    topic: 'general_housing',
    agency: 'LA County Development Authority',
    program_name: 'Housing.LACounty.gov rental search',
    eligibility_summary: 'Search affordable / special-needs LA County rentals; free public.',
    application_url: 'https://housing.lacounty.gov/',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://housing.lacounty.gov/',
  },
  {
    id: 'la-stay-housed-la',
    jurisdiction: 'Los Angeles County',
    topic: 'eviction_help',
    agency: 'Stay Housed L.A.',
    program_name: 'Tenant education and eviction legal help',
    eligibility_summary: 'Tenant workshops, legal clinics and legal services for eligible tenants facing eviction in Los Angeles County. The provider determines eligibility.',
    application_url: 'https://www.stayhousedla.org/',
    application_phone: '1-888-694-0040',
    notes: 'The published hotline can help people use the Stay Housed LA website.',
    languages: ['en', 'es'],
    last_verified_at: REVIEWED_AT,
    source_url: 'https://www.stayhousedla.org/',
  },

  // -------------------- ORANGE COUNTY --------------------
  {
    id: 'oc-housing-authority',
    jurisdiction: 'Orange County',
    topic: 'voucher',
    agency: 'Orange County Housing Authority',
    program_name: 'Housing Choice Voucher (Section 8) documents and forms',
    eligibility_summary:
      'OC Housing Authority documents-and-forms hub. Confirm the applicable payment standards, utility allowance and application status with the authority.',
    application_url: 'https://www.ochousing.org/documents/',
    printable_docs: [
      { label: 'OCHA documents & forms hub', url: 'https://www.ochousing.org/documents/' },
    ],
    languages: ['en', 'es', 'vi'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.ochousing.org/',
  },
  {
    id: 'oc-211',
    jurisdiction: 'Orange County',
    topic: 'general_housing',
    agency: '211 Orange County',
    program_name: '211OC housing & emergency-services line',
    eligibility_summary: 'Centralized OC housing & emergency-aid information line.',
    application_url: 'https://211oc.org/',
    application_phone: '211',
    languages: ['en', 'es', 'vi'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://211oc.org/',
  },
  {
    id: 'santa-ana-tenant-rights',
    jurisdiction: 'Orange County',
    topic: 'tenant_rights',
    agency: 'City of Santa Ana',
    program_name: 'Rent stabilization + tenant-rights workshops',
    eligibility_summary: 'Santa Ana residents under the city Rent Stabilization Ordinance.',
    application_url: 'https://www.santa-ana.org/community-development/rent-stabilization/',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.santa-ana.org/community-development/rent-stabilization/',
  },

  // -------------------- RIVERSIDE COUNTY --------------------
  {
    id: 'riverside-dpss-housing-support',
    jurisdiction: 'Riverside County',
    topic: 'rent_relief',
    agency: 'Riverside County DPSS',
    program_name: 'Housing Support Program (CalWORKs)',
    eligibility_summary:
      'CalWORKs households at risk of eviction; rental assistance, deposits, moving costs.',
    application_url: 'https://dpss.rivco.org/services/housing-support-program',
    application_phone: '(877) 410-8829',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://dpss.rivco.org/',
  },
  {
    id: 'riverside-housing-authority',
    jurisdiction: 'Riverside County',
    topic: 'voucher',
    agency: 'Housing Authority of the County of Riverside',
    program_name: 'Section 8 / public housing entry point',
    eligibility_summary: 'Voucher and public-housing programs in Riverside County.',
    application_url: 'https://harivco.org/',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://harivco.org/',
  },
  {
    id: 'riverside-legal-aid',
    jurisdiction: 'Riverside County',
    topic: 'legal_aid',
    agency: 'Inland Counties Legal Services',
    program_name: 'Tenant legal help (Riverside / SB)',
    eligibility_summary: 'Low/no-cost legal services for tenants facing instability.',
    application_url: 'https://inlandlegal.org/',
    application_phone: '(888) 245-4257',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://inlandlegal.org/',
  },

  // -------------------- SAN BERNARDINO COUNTY --------------------
  {
    id: 'sb-cdh',
    jurisdiction: 'San Bernardino County',
    topic: 'general_housing',
    agency: 'San Bernardino County Community Development & Housing',
    program_name: 'Affordable housing project list',
    eligibility_summary: 'Discover affordable / restricted-income communities across SB County.',
    application_url: 'https://www.sbcounty.gov/cdh/',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.sbcounty.gov/cdh/',
  },
  {
    id: 'sb-housing-authority',
    jurisdiction: 'San Bernardino County',
    topic: 'voucher',
    agency: 'Housing Authority of the County of San Bernardino',
    program_name: 'Housing Choice Voucher (Section 8)',
    eligibility_summary: 'Voucher and special programs in SB County.',
    application_url: 'https://www.hacsb.com/',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.hacsb.com/',
  },
  {
    id: 'sb-court-tenant-assistance',
    jurisdiction: 'San Bernardino County',
    topic: 'eviction_help',
    agency: 'Superior Court of San Bernardino County',
    program_name: 'Tenant-Landlord Assistance Center',
    eligibility_summary: 'Court-linked help for tenants and landlords already in dispute.',
    application_url: 'https://www.sb-court.org/general-info/self-help/landlord-tenant',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.sb-court.org/general-info/self-help/landlord-tenant',
  },

  // -------------------- STATEWIDE --------------------
  {
    id: 'ca-calworks-housing-support',
    jurisdiction: 'California',
    topic: 'rent_relief',
    agency: 'California Department of Social Services',
    program_name: 'CalWORKs Housing Support Program',
    eligibility_summary:
      'CalWORKs participants experiencing or at risk of homelessness; rental, deposit, utility, moving, and motel-voucher help.',
    application_url: 'https://www.cdss.ca.gov/inforesources/calworks-housing-support-program',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.cdss.ca.gov/inforesources/calworks-housing-support-program',
  },
  {
    id: 'ca-tenants-guide',
    jurisdiction: 'California',
    topic: 'tenant_rights',
    agency: 'California Department of Real Estate',
    program_name: 'California Tenants guide',
    eligibility_summary: 'State landlord-tenant guide with English and Spanish editions. Use the current edition and get advice about your own situation from a qualified legal service.',
    application_url: 'https://www.dre.ca.gov/publications/ResourceGuidebook/Index.html',
    languages: ['en', 'es'],
    last_verified_at: REVIEWED_AT,
    source_url: 'https://www.dre.ca.gov/publications/ResourceGuidebook/Index.html',
  },
  {
    id: 'ca-crd-source-of-income',
    jurisdiction: 'California',
    topic: 'tenant_rights',
    agency: 'California Civil Rights Department',
    program_name: 'California housing discrimination guidance',
    eligibility_summary:
      'CRD explains California housing protections, including source-of-income protections, and how to seek help or submit a complaint. State and local rules differ.',
    application_url: 'https://calcivilrights.ca.gov/housing/',
    last_verified_at: REVIEWED_AT,
    source_url: 'https://calcivilrights.ca.gov/housing/',
  },

  // -------------------- ARIZONA --------------------
  {
    id: 'az-211', jurisdiction: 'Arizona', topic: 'general_housing',
    agency: '211 Arizona / Solari', program_name: 'Arizona housing and community-service referrals',
    eligibility_summary: 'Find local shelter, housing, utility and other community resources through the statewide referral service. Each provider determines eligibility and availability.',
    application_url: 'https://211arizona.org/', application_phone: '211', languages: ['en', 'es'],
    last_verified_at: REVIEWED_AT, source_url: 'https://211arizona.org/',
  },
  {
    id: 'az-community-action', jurisdiction: 'Arizona', topic: 'general_housing',
    agency: 'Arizona Department of Economic Security', program_name: 'Find your Community Action Agency',
    eligibility_summary: 'County and local contacts for housing instability, rental deposits, emergency shelter and utility help. Ask the agency about its service area, documents and current resources.',
    application_url: 'https://des.az.gov/CommunityActionAgencies',
    last_verified_at: REVIEWED_AT, source_url: 'https://des.az.gov/CommunityActionAgencies',
  },
  {
    id: 'az-short-term-crisis', jurisdiction: 'Arizona', topic: 'rent_relief',
    agency: 'Arizona Department of Economic Security', program_name: 'Short-Term Crisis Services',
    eligibility_summary: 'Emergency support for qualifying Arizona families with a dependent child. Contact your local Community Action Agency for the current criteria; assistance is not guaranteed.',
    application_url: 'https://des.az.gov/services/basic-needs/shelter-housing/short-term-crisis-services',
    last_verified_at: REVIEWED_AT, source_url: 'https://des.az.gov/services/basic-needs/shelter-housing/short-term-crisis-services',
  },
  {
    id: 'az-fair-housing', jurisdiction: 'Arizona', topic: 'tenant_rights',
    agency: 'Arizona Attorney General', program_name: 'Arizona fair-housing guidance and complaints',
    eligibility_summary: 'Learn about Arizona housing-discrimination protections and the Civil Rights Division complaint process. Check the rules and deadlines that apply to your situation.',
    application_url: 'https://www.azag.gov/civil-rights/fair-housing',
    last_verified_at: REVIEWED_AT, source_url: 'https://www.azag.gov/civil-rights/fair-housing',
  },
  {
    id: 'az-arap-status', jurisdiction: 'Arizona', topic: 'rent_relief',
    agency: 'Arizona Department of Economic Security', program_name: 'Arizona Rental Assistance - closed program information',
    eligibility_summary: 'DES reports that ARAP has ended and is no longer accepting applications. The page supports prior applicants and points to other community resources.',
    application_url: 'https://des.az.gov/ARAP', application_status: 'closed',
    notes: 'Closed status recorded November 3, 2026. Do not use this page as an open application opportunity.',
    last_verified_at: REVIEWED_AT, source_url: 'https://des.az.gov/ARAP',
  },

  // -------------------- FEDERAL / AUTO --------------------
  {
    id: 'cfpb-auto-hardship',
    jurisdiction: 'Federal',
    topic: 'auto_loan_hardship',
    agency: 'Consumer Financial Protection Bureau',
    program_name: 'I can\'t make my auto loan payment — what do I do?',
    eligibility_summary:
      'Step-by-step on contacting the lender, asking for forbearance, due-date changes, or a payment plan.',
    application_url: 'https://www.consumerfinance.gov/ask-cfpb/i-cant-make-my-auto-loan-payment-what-should-i-do-en-845/',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.consumerfinance.gov/',
  },
  {
    id: 'ftc-auto-repo-rescue',
    jurisdiction: 'Federal',
    topic: 'auto_loan_hardship',
    agency: 'Federal Trade Commission',
    program_name: 'Avoiding repossession-rescue scams',
    eligibility_summary:
      'Warns against paid third parties promising to stop repossession; recommends working directly with the lender.',
    application_url: 'https://consumer.ftc.gov/articles/car-loans',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://consumer.ftc.gov/',
  },
  {
    id: 'ca-bar-cap',
    jurisdiction: 'California',
    topic: 'auto_repair_assistance',
    agency: 'California Bureau of Automotive Repair',
    program_name: 'Consumer Assistance Program (repair / retire)',
    eligibility_summary:
      'Repair or vehicle-retirement assistance for qualifying owners; useful when the vehicle itself is the underlying problem.',
    application_url: 'https://www.bar.ca.gov/services/consumer-assistance-program',
    application_phone: '(866) 272-9642',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.bar.ca.gov/',
  },
  {
    id: 'ca-dfpi-complaint',
    jurisdiction: 'California',
    topic: 'auto_loan_hardship',
    agency: 'California Department of Financial Protection & Innovation',
    program_name: 'File a consumer-loan complaint',
    eligibility_summary: 'CA borrowers with consumer-loan issues; complaint + assistance pathway.',
    application_url: 'https://dfpi.ca.gov/file-a-complaint/',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://dfpi.ca.gov/',
  },
  {
    id: 'ftc-landlord-consumer-reports',
    jurisdiction: 'Federal',
    topic: 'tenant_rights',
    agency: 'Federal Trade Commission',
    program_name: 'Using consumer reports — what landlords need to know',
    eligibility_summary:
      'When a screening report drives a denial / higher deposit / cosigner requirement, FCRA requires an adverse-action notice with dispute rights.',
    application_url: 'https://www.ftc.gov/business-guidance/resources/using-consumer-reports-what-landlords-need-know',
    languages: ['en'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.ftc.gov/',
  },
];

export function resourcesForJurisdiction(j: AssistanceResource['jurisdiction']) {
  return ASSISTANCE_RESOURCES.filter((r) => r.jurisdiction === j);
}

/** State is explicit for new callers. The CA default preserves legacy callers. */
export function resourcesForCountyAndState(county: string, state: AssistanceState = 'CA') {
  const countyName = county.trim().replace(/\s+County$/i, '').toLowerCase();
  // Existing county-specific entries belong to California. Never infer state
  // from a county name: counties with the same name can exist in both states.
  const byCounty = state === 'CA' ? ASSISTANCE_RESOURCES.filter(
    (r) => r.jurisdiction.toLowerCase() === `${countyName} county`,
  ) : [];
  const jurisdiction = state === 'AZ' ? 'Arizona' : 'California';
  const statewide = ASSISTANCE_RESOURCES.filter((r) => r.jurisdiction === jurisdiction);
  const federal = ASSISTANCE_RESOURCES.filter((r) => r.jurisdiction === 'Federal');
  return { byCounty, statewide, federal };
}

/** Reject incomplete or placeholder phones instead of producing a bad tel link. */
export function assistancePhoneHref(phone?: string): string | null {
  if (!phone || !/^[+\d\s().-]+$/.test(phone)) return null;
  const number = phone.replace(/[^\d+]/g, '');
  if (number === '211' || /^\d{10}$/.test(number) || /^1\d{10}$/.test(number) || /^\+[1-9]\d{7,14}$/.test(number)) return `tel:${number}`;
  return null;
}
