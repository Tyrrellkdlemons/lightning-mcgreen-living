/**
 * Screening-stack inference for SoCal rental properties.
 *
 * The application platform that hosts a property's apply form is a strong
 * public signal of which screening vendor will see your documents:
 *
 *   - RentCafe          → Yardi ScreeningWorks Pro (often + Snappt for income docs)
 *   - Entrata           → Entrata Verification of Income + PreciseID
 *   - AppFolio          → AppFolio Tenant Screening (powered by CoreLogic)
 *   - RealPage / OneSite/ Knock → RealPage LeasingDesk Screening
 *   - Other / Unknown   → Operator may use TransUnion SmartMove or proprietary
 *
 * Some operators publicly disclose extra vendors in their tech stack (e.g.
 * Greystar publicly references Snappt for income-document fraud detection at
 * many of their communities). When that's known, we layer it on.
 *
 * Per docs/COMPLIANCE_NOTES.md §6/7: every line below points users at the
 * vendor's official page so they can verify what gets done with their data.
 * Strictness is INFERRED guidance, not a guarantee.
 */

import type { ApplicationPlatform } from '@/types';

export type Strictness = 'soft' | 'standard' | 'strict' | 'premium';

export interface ScreeningStack {
  vendors: { name: string; url: string; role: string }[];
  strictness: Strictness;
  steps_likely: string[];
  documents_likely_checked: string[];
  notes: string;
}

const SNAPPT = {
  name: 'Snappt',
  url: 'https://snappt.com/applicants/',
  role: 'income-document fraud detection (pay stubs / bank statements)',
};
const YARDI_SW = {
  name: 'Yardi ScreeningWorks Pro',
  url: 'https://www.yardi.com/product/screeningworks-pro/',
  role: 'identity, credit, criminal, eviction screening',
};
const ENTRATA_PRECISEID = {
  name: 'Entrata PreciseID',
  url: 'https://www.entrata.com/products/leasing-center/verification-of-income',
  role: 'identity verification + Verification of Income',
};
const APPFOLIO_TS = {
  name: 'AppFolio Tenant Screening',
  url: 'https://www.appfolio.com/property-management-software/tenant-screening',
  role: 'credit, criminal, eviction (CoreLogic-backed)',
};
const REALPAGE_LD = {
  name: 'RealPage LeasingDesk Screening',
  url: 'https://www.realpage.com/products/leasingdesk-screening/',
  role: 'credit, criminal, eviction, lease compliance',
};
const TU_SMARTMOVE = {
  name: 'TransUnion SmartMove',
  url: 'https://www.mysmartmove.com/',
  role: 'credit + criminal + eviction (renter pays)',
};
const PLAID_INCOME = {
  name: 'Plaid Income',
  url: 'https://plaid.com/products/income/',
  role: 'bank-linked income verification',
};
const CORELOGIC = {
  name: 'CoreLogic Rental Property Solutions',
  url: 'https://www.corelogic.com/intelligence/rental-property-solutions/',
  role: 'tenant screening + risk scoring',
};

const PLATFORM_BASELINE: Record<ApplicationPlatform, ScreeningStack> = {
  RentCafe: {
    vendors: [YARDI_SW],
    strictness: 'standard',
    steps_likely: [
      'Online ID upload (driver\'s license / state ID)',
      'Soft credit check (credit history pulled)',
      'Income proof upload (pay stubs / offer letter)',
      'Eviction + criminal background search',
      'Application fee charged before review',
    ],
    documents_likely_checked: [
      'Photo ID', 'Recent pay stubs (2–3 months)', 'Rental history (last 2 addresses)', 'References',
    ],
    notes: 'Yardi-hosted RentCafe portal — ScreeningWorks Pro typically runs the report.',
  },
  Entrata: {
    vendors: [ENTRATA_PRECISEID],
    strictness: 'strict',
    steps_likely: [
      'PreciseID identity verification (knowledge-based questions)',
      'Verification of Income (pay stub OCR + sometimes bank link)',
      'Credit + criminal + eviction pull',
      'Pet screening (separate vendor — often PetScreening.com)',
      'Application + admin fee charged before review',
    ],
    documents_likely_checked: [
      'Photo ID', 'Pay stubs', 'Bank statements (sometimes Plaid link)',
      'Rental history', 'Pet records (vaccination + photo)',
    ],
    notes: 'Entrata is common with Class-A communities; expect a multi-step flow.',
  },
  AppFolio: {
    vendors: [APPFOLIO_TS, CORELOGIC],
    strictness: 'standard',
    steps_likely: [
      'Single online application form',
      'Identity check',
      'Credit pull (CoreLogic-backed)',
      'Criminal + eviction search',
      'Income verification via uploaded docs',
    ],
    documents_likely_checked: [
      'Photo ID', 'Pay stubs', 'Rental history', 'References',
    ],
    notes: 'AppFolio is common with mid-market managers — single-form flow.',
  },
  RealPage: {
    vendors: [REALPAGE_LD],
    strictness: 'strict',
    steps_likely: [
      'Guest card / pre-qualification first',
      'Full application with ID + income docs',
      'LeasingDesk credit + criminal + eviction',
      'Lease compliance check (subsidy / voucher friendly?)',
    ],
    documents_likely_checked: [
      'Photo ID', 'Pay stubs', 'Bank statements', 'Rental history', 'References',
    ],
    notes: 'RealPage / OneSite / Knock — multi-step flow.',
  },
  Knock: {
    vendors: [REALPAGE_LD],
    strictness: 'standard',
    steps_likely: [
      'Knock handles tour scheduling & chat',
      'Application redirects to property\'s manager portal',
      'Screening handled by RealPage stack typically',
    ],
    documents_likely_checked: [
      'Photo ID', 'Pay stubs', 'Rental history',
    ],
    notes: 'Knock CRM is the front door; the screening usually happens on a different portal.',
  },
  Other: {
    vendors: [TU_SMARTMOVE],
    strictness: 'standard',
    steps_likely: [
      'Manager-specified application',
      'Credit + criminal + eviction (often TransUnion SmartMove)',
      'Income proof review',
    ],
    documents_likely_checked: [
      'Photo ID', 'Pay stubs', 'Rental history',
    ],
    notes: 'Process varies by property — open the official page to confirm.',
  },
  Unknown: {
    vendors: [],
    strictness: 'standard',
    steps_likely: [
      'Application platform not yet identified',
      'Call the property to confirm document and screening expectations',
    ],
    documents_likely_checked: [
      'Photo ID', 'Pay stubs', 'Rental history',
    ],
    notes: 'Screening vendor not publicly verified for this property.',
  },
};

/**
 * Per-manager additions on top of the platform baseline.
 *
 * Match is by case-insensitive substring of the manager string.
 */
const MANAGER_ADDITIONS: { match: RegExp; add: ScreeningStack['vendors']; bumpStrictness?: Strictness; extraSteps?: string[] }[] = [
  {
    match: /greystar/i,
    add: [SNAPPT],
    bumpStrictness: 'strict',
    extraSteps: ['Snappt scans uploaded pay stubs / bank statements for tampering'],
  },
  {
    match: /equity\s*residential|essex|avalonbay|camden/i,
    add: [PLAID_INCOME],
    bumpStrictness: 'strict',
    extraSteps: ['Bank-linked income check via Plaid is common at large operators'],
  },
  {
    match: /irvine\s*company/i,
    add: [],
    bumpStrictness: 'strict',
    extraSteps: [
      'Irvine Company runs an internal screening flow on irvinecompanyapartments.com',
      'Expect ID, income proof, rental history, and pet screening',
    ],
  },
];

const RANK: Record<Strictness, number> = { soft: 0, standard: 1, strict: 2, premium: 3 };
const max = (a: Strictness, b: Strictness): Strictness => (RANK[a] >= RANK[b] ? a : b);

export function inferScreeningStack(
  platform: ApplicationPlatform,
  manager: string,
  publicly_disclosed_vendor?: string | null,
): ScreeningStack {
  const base = PLATFORM_BASELINE[platform] ?? PLATFORM_BASELINE.Unknown;
  let stack: ScreeningStack = {
    ...base,
    vendors: [...base.vendors],
    steps_likely: [...base.steps_likely],
    documents_likely_checked: [...base.documents_likely_checked],
  };
  for (const rule of MANAGER_ADDITIONS) {
    if (rule.match.test(manager)) {
      // Dedupe vendor adds by name
      for (const v of rule.add) {
        if (!stack.vendors.some((x) => x.name === v.name)) stack.vendors.push(v);
      }
      if (rule.bumpStrictness) stack.strictness = max(stack.strictness, rule.bumpStrictness);
      if (rule.extraSteps) stack.steps_likely = [...stack.steps_likely, ...rule.extraSteps];
    }
  }
  if (publicly_disclosed_vendor) {
    stack.notes = `Operator publicly references "${publicly_disclosed_vendor}" — verified.`;
  } else {
    stack.notes = stack.notes + ' Vendor inference is guidance — confirm with the property.';
  }
  return stack;
}

export const STRICTNESS_LABEL: Record<Strictness, string> = {
  soft:     'Soft check',
  standard: 'Standard screening',
  strict:   'Strict screening',
  premium:  'Premium / multi-vendor',
};

export const STRICTNESS_TONE: Record<Strictness, 'ok' | 'info' | 'warn' | 'mute'> = {
  soft:     'ok',
  standard: 'info',
  strict:   'warn',
  premium:  'warn',
};
