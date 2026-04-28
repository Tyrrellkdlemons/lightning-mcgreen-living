import type { AssistanceResource } from '@/types/assistance';

/**
 * Verified county + state + federal assistance resources.
 *
 * Sources verified during the 2026-04-28 research pass. Always link to the
 * official URL; we never rehost assistance forms or PDFs.
 *
 * Reopening / re-verification cadence:
 *   - LA ERRP: monthly during reopen window
 *   - OCHA payment standards: every January
 *   - State guides: annually
 */

const VERIFIED_AT = '2026-04-28T00:00:00-07:00';

export const ASSISTANCE_RESOURCES: AssistanceResource[] = [
  // -------------------- LOS ANGELES COUNTY --------------------
  {
    id: 'la-errp-2026',
    jurisdiction: 'Los Angeles County',
    topic: 'rent_relief',
    agency: 'LA County Department of Consumer & Business Affairs',
    program_name: 'Emergency Rent Relief Program (ERRP)',
    eligibility_summary:
      'LA County tenants with past-due rent due to a documented financial hardship; tenants can self-initiate.',
    application_url: 'https://lacountyrentrelief.com',
    application_phone: '(800) 593-8222',
    printable_docs: [
      { label: 'Tenant application guide (PDF)', url: 'https://lacountyrentrelief.com/wp-content/uploads/Tenant-Application-Guide.pdf' },
      { label: 'Landlord application guide (PDF)', url: 'https://lacountyrentrelief.com/wp-content/uploads/Landlord-Application-Guide.pdf' },
      { label: 'Program overview (PDF)', url: 'https://lacountyrentrelief.com/wp-content/uploads/Program-Overview.pdf' },
    ],
    languages: ['en', 'es'],
    reopen_date: '2026-02-09',
    notes: 'Reopened 2026-02-09 with tenant-initiated applications.',
    last_verified_at: VERIFIED_AT,
    source_url: 'https://lacountyrentrelief.com',
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
    program_name: 'Free legal help + eviction prevention',
    eligibility_summary: 'LA County renters at risk of eviction; legal services + counseling.',
    application_url: 'https://www.stayhousedla.org',
    application_phone: '(213) child-of-help — see site',
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.stayhousedla.org',
  },

  // -------------------- ORANGE COUNTY --------------------
  {
    id: 'oc-housing-authority',
    jurisdiction: 'Orange County',
    topic: 'voucher',
    agency: 'Orange County Housing Authority',
    program_name: 'Housing Choice Voucher (Section 8) + 2026 forms',
    eligibility_summary:
      'OC Housing Authority documents-and-forms hub; current 2026 payment standards and utility-allowance schedule.',
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
    program_name: "Residential Tenants' & Landlords' Rights and Responsibilities",
    eligibility_summary: 'Statewide tenant/landlord rights guide; print-friendly.',
    application_url: 'https://www.dre.ca.gov/files/pdf/recent/2024/calresidentialtenantsright.pdf',
    printable_docs: [
      { label: 'Tenant guide (PDF)', url: 'https://www.dre.ca.gov/files/pdf/recent/2024/calresidentialtenantsright.pdf' },
    ],
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://www.dre.ca.gov/',
  },
  {
    id: 'ca-crd-source-of-income',
    jurisdiction: 'California',
    topic: 'tenant_rights',
    agency: 'California Civil Rights Department',
    program_name: 'Source-of-Income Discrimination FAQ',
    eligibility_summary:
      'California prohibits "no Section 8 / no voucher" rejection patterns; FAQ explains how source-of-income protection works.',
    application_url:
      'https://calcivilrights.ca.gov/wp-content/uploads/sites/32/2020/02/SourceofIncomeFAQ_ENG.pdf',
    printable_docs: [
      { label: 'CRD source-of-income FAQ (PDF)', url: 'https://calcivilrights.ca.gov/wp-content/uploads/sites/32/2020/02/SourceofIncomeFAQ_ENG.pdf' },
    ],
    languages: ['en', 'es'],
    last_verified_at: VERIFIED_AT,
    source_url: 'https://calcivilrights.ca.gov/',
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

export function resourcesForCountyAndState(county: 'Los Angeles' | 'Orange' | 'Riverside' | 'San Bernardino' | 'Ventura') {
  const byCounty = ASSISTANCE_RESOURCES.filter((r) => r.jurisdiction === `${county} County`);
  const statewide = ASSISTANCE_RESOURCES.filter((r) => r.jurisdiction === 'California');
  const federal = ASSISTANCE_RESOURCES.filter((r) => r.jurisdiction === 'Federal');
  return { byCounty, statewide, federal };
}
