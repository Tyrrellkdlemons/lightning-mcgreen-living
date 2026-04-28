/**
 * Assistance-resource types — county overlays, statewide programs, and
 * auto-loan hardship guidance. Every resource carries the same source
 * metadata as listings (per docs/COMPLIANCE_NOTES.md §7).
 */

export type AssistanceTopic =
  | 'rent_relief'
  | 'voucher'
  | 'eviction_help'
  | 'tenant_rights'
  | 'auto_loan_hardship'
  | 'auto_repair_assistance'
  | 'utility_assistance'
  | 'legal_aid'
  | 'general_housing';

export type AssistanceJurisdiction =
  | 'California'
  | 'Los Angeles County'
  | 'Orange County'
  | 'Riverside County'
  | 'San Bernardino County'
  | 'Ventura County'
  | 'Federal';

export interface AssistanceResource {
  id: string;
  jurisdiction: AssistanceJurisdiction;
  topic: AssistanceTopic;
  agency: string;
  program_name: string;
  eligibility_summary: string;
  application_url: string;
  application_phone?: string;
  printable_docs?: { label: string; url: string }[];
  languages?: string[];
  reopen_date?: string;          // e.g. LA ERRP "2026-02-09"
  expires_at?: string;           // when known
  notes?: string;
  last_verified_at: string;      // ISO
  source_url: string;            // canonical URL we link to
}

/** Adverse-action notice record — used when a consumer report drives a denial / higher deposit. */
export interface AdverseActionNotice {
  applicant_email?: string;
  applicant_name?: string;
  decision: 'denied' | 'higher_deposit' | 'co_signer_required' | 'fees_increased';
  reason_short: string;
  consumer_report_vendor?: string;       // e.g. "Snappt", "Yardi ScreeningWorks"
  consumer_report_phone?: string;
  consumer_report_url?: string;
  decided_at: string;
  // Per FTC https://www.ftc.gov/business-guidance/resources/using-consumer-reports-what-landlords-need-know
  // notice MUST tell the applicant about their right to dispute and to a free copy.
}
