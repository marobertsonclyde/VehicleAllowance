/**
 * POC dummy data — 5 scenarios covering the full lifecycle.
 * Switch scenarios via the floating banner in the bottom-right corner.
 */
import type {
  AllowanceApplication,
  Vehicle,
  InsurancePolicy,
  DocumentChecklist,
  VADocument,
  AllowanceRecord,
  EligibilityCheckResult,
} from '@/types'
import {
  ApplicationStatus,
  ApplicationType,
  AllowanceLevel,
  DocumentType,
  PolicyType,
  EndorsementType,
  AIProcessingStatus,
  AllowanceRecordStatus,
  BodyType,
} from '@/types'

// ─── Shared IDs ───────────────────────────────────────────────────────────────
export const IDS = {
  app:       'app-001',
  vehicle:   'veh-001',
  autoPolicy: 'pol-auto-001',
  umbrPolicy: 'pol-umbr-001',
  record:    'rec-001',
  docAuto:   'doc-auto-001',
  docUmbr:   'doc-umbr-001',
  docSticker: 'doc-sticker-001',
}

// ─── Scenario A: New employee, no application ─────────────────────────────────
export const SCENARIO_NEW: ScenarioData = {
  label: 'New Employee',
  description: 'No application yet. Home screen with Apply button.',
  application: null,
  vehicle: null,
  policies: [],
  checklist: [],
  documents: [],
  record: null,
  eligibility: {
    isEligible: true,
    personnelNumber: 'CCI-04821',
    jobTitle: 'Construction Manager',
    company: 'Geneva Rock Products, Inc.',
    defaultAllowanceLevel: AllowanceLevel.D,
    eligibilityDeadline: '2026-06-30',
  },
}

// ─── Scenario B: Application in progress — Insurance Documents step ───────────
export const SCENARIO_IN_PROGRESS: ScenarioData = {
  label: 'Applying — Insurance Step',
  description: 'Draft application with vehicle filled in. On Insurance Documents screen.',
  application: {
    va_allowanceapplicationid: IDS.app,
    va_name: 'VA-2026-00042',
    va_personnelnumber: 'CCI-04821',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.Draft,
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAllowanceAmount: 1500,
    va_isElectricVehicle: false,
    va_evChargingAllowance: 0,
    va_totalMonthlyAllowance: 1500,
    va_presidentApprovalRequired: true,
    va_aiAutoApprovalEligible: false,
    va_aiValidationScore: 0,
  },
  vehicle: {
    va_vehicleid: IDS.vehicle,
    va_applicationId: IDS.app,
    va_vin: '1FTFW1ET5EKE52178',
    va_make: 'Ram',
    va_model: '1500 Laramie',
    va_year: 2024,
    va_bodyType: BodyType.Pickup,
    va_msrpTotal: 62500,
    va_isElectric: false,
    va_meetsYearRequirement: true,
    va_meetsMsrpRequirement: true,
    va_meetsBodyTypeRequirement: true,
  },
  policies: [],
  checklist: [
    { va_documentchecklistid: 'chk-1', va_applicationId: IDS.app, va_name: 'Auto Declaration Page',    va_checklistItemType: DocumentType.AutoDecPage,    va_isRequired: true, va_isSatisfied: false },
    { va_documentchecklistid: 'chk-2', va_applicationId: IDS.app, va_name: 'Umbrella Declaration Page', va_checklistItemType: DocumentType.UmbrellaDecPage, va_isRequired: true, va_isSatisfied: false },
    { va_documentchecklistid: 'chk-3', va_applicationId: IDS.app, va_name: 'Window Sticker',           va_checklistItemType: DocumentType.WindowSticker,   va_isRequired: true, va_isSatisfied: true,  va_satisfiedByDocumentId: IDS.docSticker, va_satisfiedOn: '2026-04-08' },
    { va_documentchecklistid: 'chk-4', va_applicationId: IDS.app, va_name: 'Endorsement',              va_checklistItemType: DocumentType.Endorsement,     va_isRequired: true, va_isSatisfied: false },
  ],
  documents: [
    {
      va_documentid: IDS.docSticker,
      va_applicationId: IDS.app,
      va_name: '2024-Ram-1500-Window-Sticker.pdf',
      va_documentType: DocumentType.WindowSticker,
      va_uploadedOn: '2026-04-08T10:23:00Z',
      va_aiProcessingStatus: AIProcessingStatus.Completed,
      va_aiConfidenceScore: 0.94,
      va_reviewStatus: 'Accepted',
      va_aiExtractedData: JSON.stringify({
        vin: '1FTFW1ET5EKE52178',
        total_msrp: 62500,
        make: 'Ram',
        model: '1500 Laramie',
        model_year: 2024,
        powertrain_description: '5.7L HEMI V8',
        is_electric: false,
        confidence_scores: { vin: 0.99, total_msrp: 0.92, make: 0.99, model: 0.97 },
      }),
      va_linkedVehicleId: IDS.vehicle,
    },
  ],
  record: null,
  eligibility: {
    isEligible: true,
    personnelNumber: 'CCI-04821',
    jobTitle: 'Construction Manager',
    company: 'Geneva Rock Products, Inc.',
    defaultAllowanceLevel: AllowanceLevel.D,
  },
}

// ─── Scenario C: Application submitted — Equipment Leader Review ──────────────
export const SCENARIO_UNDER_REVIEW: ScenarioData = {
  label: 'Under Review',
  description: 'AI score 91, all docs accepted. Waiting on Equipment Leader.',
  application: {
    va_allowanceapplicationid: IDS.app,
    va_name: 'VA-2026-00042',
    va_personnelnumber: 'CCI-04821',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.EquipmentLeaderReview,
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAllowanceAmount: 1500,
    va_isElectricVehicle: false,
    va_evChargingAllowance: 0,
    va_totalMonthlyAllowance: 1500,
    va_presidentApprovalRequired: true,
    va_aiAutoApprovalEligible: true,
    va_aiValidationScore: 91,
    va_aiValidationSummary: 'All documents processed with high confidence. Auto liability meets CSL requirement ($1M). Umbrella limit meets Additional Insured minimum ($2M). Vehicle MSRP verified at $62,500, qualifies for Level B.',
    va_submittedOn: '2026-04-08T14:30:00Z',
  },
  vehicle: {
    va_vehicleid: IDS.vehicle,
    va_applicationId: IDS.app,
    va_vin: '1FTFW1ET5EKE52178',
    va_make: 'Ram',
    va_model: '1500 Laramie',
    va_year: 2024,
    va_bodyType: BodyType.Pickup,
    va_msrpTotal: 62500,
    va_isElectric: false,
    va_meetsYearRequirement: true,
    va_meetsMsrpRequirement: true,
    va_meetsBodyTypeRequirement: true,
  },
  policies: [
    {
      va_insurancepolicyid: IDS.autoPolicy,
      va_applicationId: IDS.app,
      va_policyType: PolicyType.Auto,
      va_carrierName: 'State Farm',
      va_policyNumber: 'SF-4921-AUT',
      va_effectiveDate: '2025-11-01',
      va_expirationDate: '2026-11-01',
      va_coverageLimitCSL: 1000000,
      va_meetsLiabilityRequirement: true,
      va_meetsEndorsementRequirement: true,
      va_aiExtractionConfidence: 0.93,
      va_status: 'Active',
    },
    {
      va_insurancepolicyid: IDS.umbrPolicy,
      va_applicationId: IDS.app,
      va_policyType: PolicyType.UmbrellaPersonalExcess,
      va_carrierName: 'Travelers',
      va_policyNumber: 'TR-7734-UMB',
      va_effectiveDate: '2025-11-01',
      va_expirationDate: '2026-11-01',
      va_umbrellaLimit: 2000000,
      va_endorsementType: EndorsementType.AdditionalInsured,
      va_meetsUmbrellaRequirement: true,
      va_meetsEndorsementRequirement: true,
      va_aiExtractionConfidence: 0.89,
      va_status: 'Active',
    },
  ],
  checklist: [
    { va_documentchecklistid: 'chk-1', va_applicationId: IDS.app, va_name: 'Auto Declaration Page',    va_checklistItemType: DocumentType.AutoDecPage,    va_isRequired: true, va_isSatisfied: true, va_satisfiedByDocumentId: IDS.docAuto,    va_satisfiedOn: '2026-04-08' },
    { va_documentchecklistid: 'chk-2', va_applicationId: IDS.app, va_name: 'Umbrella Declaration Page', va_checklistItemType: DocumentType.UmbrellaDecPage, va_isRequired: true, va_isSatisfied: true, va_satisfiedByDocumentId: IDS.docUmbr,    va_satisfiedOn: '2026-04-08' },
    { va_documentchecklistid: 'chk-3', va_applicationId: IDS.app, va_name: 'Window Sticker',           va_checklistItemType: DocumentType.WindowSticker,   va_isRequired: true, va_isSatisfied: true, va_satisfiedByDocumentId: IDS.docSticker, va_satisfiedOn: '2026-04-08' },
    { va_documentchecklistid: 'chk-4', va_applicationId: IDS.app, va_name: 'Endorsement',              va_checklistItemType: DocumentType.Endorsement,     va_isRequired: true, va_isSatisfied: true, va_satisfiedByDocumentId: IDS.docUmbr,    va_satisfiedOn: '2026-04-08' },
  ],
  documents: [
    {
      va_documentid: IDS.docAuto,
      va_applicationId: IDS.app,
      va_name: 'StateFarm-Auto-DecPage.pdf',
      va_documentType: DocumentType.AutoDecPage,
      va_uploadedOn: '2026-04-08T10:15:00Z',
      va_aiProcessingStatus: AIProcessingStatus.Completed,
      va_aiConfidenceScore: 0.93,
      va_reviewStatus: 'Accepted',
      va_aiExtractedData: JSON.stringify({
        carrier_name: 'State Farm',
        policy_number: 'SF-4921-AUT',
        insured_name: 'Alex Johnson',
        policy_period_end: '2026-11-01',
        csl_limit: 1000000,
        confidence_scores: { carrier_name: 0.99, policy_number: 0.97, csl_limit: 0.91 },
      }),
      va_linkedPolicyId: IDS.autoPolicy,
    },
    {
      va_documentid: IDS.docUmbr,
      va_applicationId: IDS.app,
      va_name: 'Travelers-Umbrella-DecPage.pdf',
      va_documentType: DocumentType.UmbrellaDecPage,
      va_uploadedOn: '2026-04-08T10:18:00Z',
      va_aiProcessingStatus: AIProcessingStatus.Completed,
      va_aiConfidenceScore: 0.89,
      va_reviewStatus: 'Accepted',
      va_aiExtractedData: JSON.stringify({
        carrier_name: 'Travelers',
        policy_number: 'TR-7734-UMB',
        umbrella_limit: 2000000,
        endorsement_type: 'Additional Insured',
        additional_insured_entity: 'Geneva Rock Products, Inc.',
        confidence_scores: { umbrella_limit: 0.94, endorsement_type: 0.87 },
      }),
      va_linkedPolicyId: IDS.umbrPolicy,
    },
    {
      va_documentid: IDS.docSticker,
      va_applicationId: IDS.app,
      va_name: '2024-Ram-1500-Window-Sticker.pdf',
      va_documentType: DocumentType.WindowSticker,
      va_uploadedOn: '2026-04-08T10:23:00Z',
      va_aiProcessingStatus: AIProcessingStatus.Completed,
      va_aiConfidenceScore: 0.94,
      va_reviewStatus: 'Accepted',
      va_aiExtractedData: JSON.stringify({ vin: '1FTFW1ET5EKE52178', total_msrp: 62500 }),
      va_linkedVehicleId: IDS.vehicle,
    },
  ],
  record: null,
  eligibility: {
    isEligible: true,
    personnelNumber: 'CCI-04821',
    jobTitle: 'Construction Manager',
    company: 'Geneva Rock Products, Inc.',
    defaultAllowanceLevel: AllowanceLevel.D,
  },
}

// ─── Scenario D: Active allowance, insurance is fine ─────────────────────────
export const SCENARIO_ACTIVE_OK: ScenarioData = {
  label: 'Active — Insurance OK',
  description: 'Approved and active. No warnings.',
  application: {
    va_allowanceapplicationid: IDS.app,
    va_name: 'VA-2025-00031',
    va_personnelnumber: 'CCI-04821',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.Active,
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAllowanceAmount: 1500,
    va_isElectricVehicle: false,
    va_totalMonthlyAllowance: 1500,
    va_effectiveDate: '2025-11-01',
    va_presidentApprovalRequired: true,
    va_aiAutoApprovalEligible: true,
    va_aiValidationScore: 91,
  },
  vehicle: {
    va_vehicleid: IDS.vehicle,
    va_applicationId: IDS.app,
    va_vin: '1FTFW1ET5EKE52178',
    va_make: 'Ram',
    va_model: '1500 Laramie',
    va_year: 2024,
    va_msrpTotal: 62500,
    va_dynamicsAssetId: 'GRP-FA-2025-1082',
  },
  policies: [
    {
      va_insurancepolicyid: IDS.autoPolicy,
      va_applicationId: IDS.app,
      va_policyType: PolicyType.Auto,
      va_carrierName: 'State Farm',
      va_policyNumber: 'SF-4921-AUT',
      va_expirationDate: '2026-11-01',  // 7 months out — no warning
      va_meetsLiabilityRequirement: true,
      va_status: 'Active',
    },
    {
      va_insurancepolicyid: IDS.umbrPolicy,
      va_applicationId: IDS.app,
      va_policyType: PolicyType.UmbrellaPersonalExcess,
      va_carrierName: 'Travelers',
      va_policyNumber: 'TR-7734-UMB',
      va_expirationDate: '2026-11-01',
      va_meetsUmbrellaRequirement: true,
      va_status: 'Active',
    },
  ],
  checklist: [],
  documents: [],
  record: {
    va_allowancerecordid: IDS.record,
    va_personnelnumber: 'CCI-04821',
    va_originalApplicationId: IDS.app,
    va_currentVehicleId: IDS.vehicle,
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAmount: 1500,
    va_evChargingAmount: 0,
    va_totalMonthlyAmount: 1500,
    va_effectiveDate: '2025-11-01',
    va_status: AllowanceRecordStatus.Active,
    va_nextRenewalDue: '2026-08-01',
  },
  eligibility: {
    isEligible: true,
    personnelNumber: 'CCI-04821',
    jobTitle: 'Construction Manager',
    company: 'Geneva Rock Products, Inc.',
  },
}

// ─── Scenario E: Active allowance, auto policy expiring in 12 days ────────────
const EXPIRY_DATE = new Date()
EXPIRY_DATE.setDate(EXPIRY_DATE.getDate() + 12)
const EXPIRY_ISO = EXPIRY_DATE.toISOString().split('T')[0]

export const SCENARIO_EXPIRING: ScenarioData = {
  label: 'Active — Insurance Expiring',
  description: `Auto policy expires ${EXPIRY_ISO}. Urgent renewal banner.`,
  application: SCENARIO_ACTIVE_OK.application,
  vehicle: SCENARIO_ACTIVE_OK.vehicle,
  policies: [
    {
      va_insurancepolicyid: IDS.autoPolicy,
      va_applicationId: IDS.app,
      va_policyType: PolicyType.Auto,
      va_carrierName: 'State Farm',
      va_policyNumber: 'SF-4921-AUT',
      va_expirationDate: EXPIRY_ISO,  // 12 days — urgent!
      va_meetsLiabilityRequirement: true,
      va_status: 'Active',
    },
    {
      va_insurancepolicyid: IDS.umbrPolicy,
      va_applicationId: IDS.app,
      va_policyType: PolicyType.UmbrellaPersonalExcess,
      va_carrierName: 'Travelers',
      va_policyNumber: 'TR-7734-UMB',
      va_expirationDate: EXPIRY_ISO,
      va_meetsUmbrellaRequirement: true,
      va_status: 'Active',
    },
  ],
  checklist: [],
  documents: [],
  record: SCENARIO_ACTIVE_OK.record,
  eligibility: SCENARIO_ACTIVE_OK.eligibility,
}

// ─── Scenario registry ────────────────────────────────────────────────────────
export type ScenarioKey =
  | 'new'
  | 'in-progress'
  | 'under-review'
  | 'active-ok'
  | 'expiring'

export interface ScenarioData {
  label: string
  description: string
  application: AllowanceApplication | null
  vehicle: Vehicle | null
  policies: InsurancePolicy[]
  checklist: DocumentChecklist[]
  documents: VADocument[]
  record: AllowanceRecord | null
  eligibility: EligibilityCheckResult
}

export const SCENARIOS: Record<ScenarioKey, ScenarioData> = {
  'new':          SCENARIO_NEW,
  'in-progress':  SCENARIO_IN_PROGRESS,
  'under-review': SCENARIO_UNDER_REVIEW,
  'active-ok':    SCENARIO_ACTIVE_OK,
  'expiring':     SCENARIO_EXPIRING,
}

export const DEFAULT_SCENARIO: ScenarioKey = 'under-review'
