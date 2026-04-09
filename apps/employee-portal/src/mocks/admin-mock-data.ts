/**
 * Admin portal mock data — multiple applications at different stages,
 * active allowance records, and expiring insurance.
 */
import {
  ApplicationStatus,
  ApplicationType,
  AllowanceLevel,
  PolicyType,
  EndorsementType,
  AllowanceRecordStatus,
  BodyType,
} from '@/types'
import type {
  AllowanceApplication,
  Vehicle,
  InsurancePolicy,
  DocumentChecklist,
  VADocument,
  AllowanceRecord,
} from '@/types'
import { DocumentType, AIProcessingStatus } from '@/types'

// ─── Applications in the review queue ────────────────────────────────────────

export interface AdminApplication extends AllowanceApplication {
  _vehicle?: Vehicle
  _policies?: InsurancePolicy[]
  _checklist?: DocumentChecklist[]
  _documents?: VADocument[]
  _auditLog?: AuditEntry[]
}

export interface AuditEntry {
  id: string
  eventType: string
  previousStatus: string
  newStatus: string
  performedBy: string
  notes?: string
  eventDate: string
}

export const ADMIN_APPLICATIONS: AdminApplication[] = [
  // ── 1. Alex Johnson — Equipment Leader Review, AI score 91, clean ──────────
  {
    va_allowanceapplicationid: 'app-001',
    va_name: 'VA-2026-00042',
    va_personnelnumber: 'CCI-04821',
    va_applicantName: 'Alex Johnson',
    va_applicantCompany: 'Geneva Rock Products, Inc.',
    va_applicantJobTitle: 'Construction Manager',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.EquipmentLeaderReview,
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAllowanceAmount: 1500,
    va_isElectricVehicle: false,
    va_totalMonthlyAllowance: 1500,
    va_presidentApprovalRequired: true,
    va_aiAutoApprovalEligible: true,
    va_aiValidationScore: 91,
    va_aiValidationSummary: 'All documents validated with high confidence. Auto CSL $1M exceeds requirement. Umbrella $2M meets Additional Insured minimum. Vehicle MSRP $62,500 qualifies for Level B.',
    va_submittedOn: '2026-04-07T14:30:00Z',
    _vehicle: {
      va_vehicleid: 'veh-001', va_make: 'Ram', va_model: '1500 Laramie',
      va_year: 2024, va_bodyType: BodyType.Pickup, va_msrpTotal: 62500,
      va_vin: '1FTFW1ET5EKE52178', va_meetsYearRequirement: true,
      va_meetsMsrpRequirement: true, va_meetsBodyTypeRequirement: true,
    },
    _policies: [
      {
        va_insurancepolicyid: 'pol-001-auto', va_policyType: PolicyType.Auto,
        va_carrierName: 'State Farm', va_policyNumber: 'SF-4921-AUT',
        va_expirationDate: '2026-11-01', va_coverageLimitCSL: 1000000,
        va_meetsLiabilityRequirement: true, va_aiExtractionConfidence: 0.93, va_status: 'Active',
      },
      {
        va_insurancepolicyid: 'pol-001-umbr', va_policyType: PolicyType.UmbrellaPersonalExcess,
        va_carrierName: 'Travelers', va_policyNumber: 'TR-7734-UMB',
        va_expirationDate: '2026-11-01', va_umbrellaLimit: 2000000,
        va_endorsementType: EndorsementType.AdditionalInsured,
        va_meetsUmbrellaRequirement: true, va_aiExtractionConfidence: 0.89, va_status: 'Active',
      },
    ],
    _checklist: [
      { va_documentchecklistid: 'c1-1', va_name: 'Auto Declaration Page',    va_checklistItemType: DocumentType.AutoDecPage,    va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c1-2', va_name: 'Umbrella Declaration Page', va_checklistItemType: DocumentType.UmbrellaDecPage, va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c1-3', va_name: 'Window Sticker',           va_checklistItemType: DocumentType.WindowSticker,   va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c1-4', va_name: 'Endorsement',              va_checklistItemType: DocumentType.Endorsement,     va_isRequired: true, va_isSatisfied: true },
    ],
    _documents: [
      { va_documentid: 'd1-1', va_name: 'StateFarm-Auto-Dec.pdf',     va_documentType: DocumentType.AutoDecPage,    va_aiProcessingStatus: AIProcessingStatus.Completed, va_aiConfidenceScore: 0.93, va_reviewStatus: 'Accepted', va_uploadedOn: '2026-04-07T10:15:00Z' },
      { va_documentid: 'd1-2', va_name: 'Travelers-Umbrella-Dec.pdf', va_documentType: DocumentType.UmbrellaDecPage, va_aiProcessingStatus: AIProcessingStatus.Completed, va_aiConfidenceScore: 0.89, va_reviewStatus: 'Accepted', va_uploadedOn: '2026-04-07T10:18:00Z' },
      { va_documentid: 'd1-3', va_name: 'Ram1500-WindowSticker.pdf',  va_documentType: DocumentType.WindowSticker,   va_aiProcessingStatus: AIProcessingStatus.Completed, va_aiConfidenceScore: 0.94, va_reviewStatus: 'Accepted', va_uploadedOn: '2026-04-07T10:23:00Z' },
    ],
    _auditLog: [
      { id: 'al-1-1', eventType: 'StatusChange', previousStatus: 'Draft',     newStatus: 'Submitted',                performedBy: 'Alex Johnson',       eventDate: '2026-04-07T14:30:00Z' },
      { id: 'al-1-2', eventType: 'StatusChange', previousStatus: 'Submitted', newStatus: 'AI Review',                performedBy: 'System',             eventDate: '2026-04-07T14:31:00Z' },
      { id: 'al-1-3', eventType: 'StatusChange', previousStatus: 'AI Review', newStatus: 'Equipment Leader Review',  performedBy: 'System',             notes: 'AI score 91 — pre-validated', eventDate: '2026-04-07T14:35:00Z' },
    ],
  },

  // ── 2. Maria Garcia — AI FLAGGED, umbrella limit too low ───────────────────
  {
    va_allowanceapplicationid: 'app-002',
    va_name: 'VA-2026-00043',
    va_personnelnumber: 'CCI-03847',
    va_applicantName: 'Maria Garcia',
    va_applicantCompany: 'W.W. Clyde & Co.',
    va_applicantJobTitle: 'Senior Estimator',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.EquipmentLeaderReview,
    va_allowanceLevel: AllowanceLevel.C,
    va_monthlyAllowanceAmount: 1260,
    va_isElectricVehicle: false,
    va_totalMonthlyAllowance: 1260,
    va_presidentApprovalRequired: true,
    va_aiAutoApprovalEligible: false,
    va_aiValidationScore: 58,
    va_aiValidationSummary: 'Auto liability confirmed. ISSUE: Umbrella limit $500K is below the $1M minimum for Additional Insured endorsements. Employee must obtain higher umbrella coverage or upgrade to $2M for Additional Interest.',
    va_aiFlaggedIssues: 'Umbrella limit $500K < $1M minimum',
    va_submittedOn: '2026-04-06T09:15:00Z',
    _vehicle: {
      va_vehicleid: 'veh-002', va_make: 'Ford', va_model: 'F-150 Lariat',
      va_year: 2023, va_bodyType: BodyType.Pickup, va_msrpTotal: 52000,
      va_vin: '1FTFW1E87NKE09241', va_meetsYearRequirement: true,
      va_meetsMsrpRequirement: true, va_meetsBodyTypeRequirement: true,
    },
    _policies: [
      {
        va_insurancepolicyid: 'pol-002-auto', va_policyType: PolicyType.Auto,
        va_carrierName: 'Allstate', va_policyNumber: 'AL-8823-AUT',
        va_expirationDate: '2026-09-15', va_coverageLimitCSL: 500000,
        va_meetsLiabilityRequirement: false, va_aiExtractionConfidence: 0.91, va_status: 'Active',
      },
      {
        va_insurancepolicyid: 'pol-002-umbr', va_policyType: PolicyType.UmbrellaPersonalExcess,
        va_carrierName: 'Allstate', va_policyNumber: 'AL-8823-UMB',
        va_expirationDate: '2026-09-15', va_umbrellaLimit: 500000,
        va_endorsementType: EndorsementType.AdditionalInsured,
        va_meetsUmbrellaRequirement: false, va_aiExtractionConfidence: 0.87, va_status: 'Active',
      },
    ],
    _checklist: [
      { va_documentchecklistid: 'c2-1', va_name: 'Auto Declaration Page',    va_checklistItemType: DocumentType.AutoDecPage,    va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c2-2', va_name: 'Umbrella Declaration Page', va_checklistItemType: DocumentType.UmbrellaDecPage, va_isRequired: true, va_isSatisfied: true, va_validationNote: 'Limit $500K below $1M minimum' },
      { va_documentchecklistid: 'c2-3', va_name: 'Window Sticker',           va_checklistItemType: DocumentType.WindowSticker,   va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c2-4', va_name: 'Endorsement',              va_checklistItemType: DocumentType.Endorsement,     va_isRequired: true, va_isSatisfied: false },
    ],
    _documents: [
      { va_documentid: 'd2-1', va_name: 'Allstate-Auto-Dec.pdf',     va_documentType: DocumentType.AutoDecPage,    va_aiProcessingStatus: AIProcessingStatus.Completed, va_aiConfidenceScore: 0.91, va_reviewStatus: 'Accepted', va_uploadedOn: '2026-04-06T09:00:00Z' },
      { va_documentid: 'd2-2', va_name: 'Allstate-Umbrella-Dec.pdf', va_documentType: DocumentType.UmbrellaDecPage, va_aiProcessingStatus: AIProcessingStatus.Completed, va_aiConfidenceScore: 0.87, va_reviewStatus: 'Pending Review', va_uploadedOn: '2026-04-06T09:02:00Z' },
      { va_documentid: 'd2-3', va_name: 'F150-WindowSticker.pdf',    va_documentType: DocumentType.WindowSticker,   va_aiProcessingStatus: AIProcessingStatus.Completed, va_aiConfidenceScore: 0.96, va_reviewStatus: 'Accepted', va_uploadedOn: '2026-04-06T09:05:00Z' },
    ],
    _auditLog: [
      { id: 'al-2-1', eventType: 'StatusChange', previousStatus: 'Draft',     newStatus: 'Submitted',               performedBy: 'Maria Garcia', eventDate: '2026-04-06T09:15:00Z' },
      { id: 'al-2-2', eventType: 'StatusChange', previousStatus: 'Submitted', newStatus: 'AI Review',               performedBy: 'System',       eventDate: '2026-04-06T09:16:00Z' },
      { id: 'al-2-3', eventType: 'StatusChange', previousStatus: 'AI Review', newStatus: 'Equipment Leader Review', performedBy: 'System',       notes: 'AI score 58 — manual review required. Umbrella limit below minimum.', eventDate: '2026-04-06T09:21:00Z' },
    ],
  },

  // ── 3. Chris Peterson — Director Review, EV ────────────────────────────────
  {
    va_allowanceapplicationid: 'app-003',
    va_name: 'VA-2026-00040',
    va_personnelnumber: 'CCI-05293',
    va_applicantName: 'Chris Peterson',
    va_applicantCompany: 'Sunroc Corporation',
    va_applicantJobTitle: 'Project Manager',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.DirectorReview,
    va_allowanceLevel: AllowanceLevel.D,
    va_monthlyAllowanceAmount: 1180,
    va_isElectricVehicle: true,
    va_evChargingAllowance: 310,
    va_totalMonthlyAllowance: 1490,
    va_presidentApprovalRequired: true,
    va_aiAutoApprovalEligible: true,
    va_aiValidationScore: 88,
    va_aiValidationSummary: 'All documents validated. Vehicle is a 2024 Ford F-150 Lightning (EV). MSRP $75,000 qualifies for Level A but applicant selected Level D. EV charging allowance $310/mo applies.',
    va_submittedOn: '2026-04-04T11:00:00Z',
    va_equipmentLeaderDecision: 'Approved' as never,
    va_equipmentLeaderNotes: 'Reviewed and approved. EV flag confirmed from window sticker.',
    _vehicle: {
      va_vehicleid: 'veh-003', va_make: 'Ford', va_model: 'F-150 Lightning Lariat',
      va_year: 2024, va_bodyType: BodyType.Pickup, va_msrpTotal: 75000,
      va_vin: '1FTVW1EV0NWA01123', va_isElectric: true,
      va_meetsYearRequirement: true, va_meetsMsrpRequirement: true,
    },
    _policies: [
      {
        va_insurancepolicyid: 'pol-003-auto', va_policyType: PolicyType.Auto,
        va_carrierName: 'USAA', va_policyNumber: 'UA-3310-AUT',
        va_expirationDate: '2026-12-01', va_coverageLimitCSL: 750000,
        va_meetsLiabilityRequirement: true, va_aiExtractionConfidence: 0.95, va_status: 'Active',
      },
      {
        va_insurancepolicyid: 'pol-003-umbr', va_policyType: PolicyType.UmbrellaPersonalExcess,
        va_carrierName: 'USAA', va_policyNumber: 'UA-3310-UMB',
        va_expirationDate: '2026-12-01', va_umbrellaLimit: 1000000,
        va_endorsementType: EndorsementType.AdditionalInsured,
        va_meetsUmbrellaRequirement: true, va_aiExtractionConfidence: 0.90, va_status: 'Active',
      },
    ],
    _checklist: [
      { va_documentchecklistid: 'c3-1', va_name: 'Auto Declaration Page',    va_checklistItemType: DocumentType.AutoDecPage,    va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c3-2', va_name: 'Umbrella Declaration Page', va_checklistItemType: DocumentType.UmbrellaDecPage, va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c3-3', va_name: 'Window Sticker',           va_checklistItemType: DocumentType.WindowSticker,   va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c3-4', va_name: 'Endorsement',              va_checklistItemType: DocumentType.Endorsement,     va_isRequired: true, va_isSatisfied: true },
    ],
    _documents: [],
    _auditLog: [
      { id: 'al-3-1', eventType: 'StatusChange', previousStatus: 'Draft',                   newStatus: 'Submitted',              performedBy: 'Chris Peterson', eventDate: '2026-04-04T11:00:00Z' },
      { id: 'al-3-2', eventType: 'StatusChange', previousStatus: 'Submitted',               newStatus: 'AI Review',              performedBy: 'System',         eventDate: '2026-04-04T11:01:00Z' },
      { id: 'al-3-3', eventType: 'StatusChange', previousStatus: 'AI Review',               newStatus: 'Equipment Leader Review', performedBy: 'System',         notes: 'AI score 88', eventDate: '2026-04-04T11:06:00Z' },
      { id: 'al-3-4', eventType: 'DecisionMade', previousStatus: 'Equipment Leader Review', newStatus: 'Director Review',         performedBy: 'Equipment Leader', notes: 'EV flag confirmed from window sticker.', eventDate: '2026-04-05T09:30:00Z' },
    ],
  },

  // ── 4. Taylor Brooks — President Review ───────────────────────────────────
  {
    va_allowanceapplicationid: 'app-004',
    va_name: 'VA-2026-00038',
    va_personnelnumber: 'CCI-06124',
    va_applicantName: 'Taylor Brooks',
    va_applicantCompany: 'Geneva Rock Products, Inc.',
    va_applicantJobTitle: 'Project Controls Manager',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.PresidentReview,
    va_allowanceLevel: AllowanceLevel.D,
    va_monthlyAllowanceAmount: 1180,
    va_isElectricVehicle: false,
    va_totalMonthlyAllowance: 1180,
    va_presidentApprovalRequired: true,
    va_aiAutoApprovalEligible: true,
    va_aiValidationScore: 94,
    va_aiValidationSummary: 'All documents validated with high confidence.',
    va_submittedOn: '2026-04-02T08:00:00Z',
    va_equipmentLeaderDecision: 'Approved' as never,
    va_directorDecision: 'Approved' as never,
    _vehicle: {
      va_vehicleid: 'veh-004', va_make: 'Toyota', va_model: '4Runner TRD Pro',
      va_year: 2024, va_bodyType: BodyType.SUV, va_msrpTotal: 54500,
      va_vin: 'JTEBU5JR4L5800441',
      va_meetsYearRequirement: true, va_meetsMsrpRequirement: true,
    },
    _policies: [],
    _checklist: [
      { va_documentchecklistid: 'c4-1', va_name: 'Auto Declaration Page',    va_checklistItemType: DocumentType.AutoDecPage,    va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c4-2', va_name: 'Umbrella Declaration Page', va_checklistItemType: DocumentType.UmbrellaDecPage, va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c4-3', va_name: 'Window Sticker',           va_checklistItemType: DocumentType.WindowSticker,   va_isRequired: true, va_isSatisfied: true },
      { va_documentchecklistid: 'c4-4', va_name: 'Endorsement',              va_checklistItemType: DocumentType.Endorsement,     va_isRequired: true, va_isSatisfied: true },
    ],
    _documents: [],
    _auditLog: [
      { id: 'al-4-1', eventType: 'StatusChange', previousStatus: 'Director Review',         newStatus: 'President Review',  performedBy: 'Director of Equipment', eventDate: '2026-04-03T16:00:00Z' },
    ],
  },
]

// ─── Active allowance records ─────────────────────────────────────────────────

const EXPIRY_12 = new Date(); EXPIRY_12.setDate(EXPIRY_12.getDate() + 12)
const EXPIRY_12_ISO = EXPIRY_12.toISOString().split('T')[0]

export const ADMIN_ALLOWANCE_RECORDS: Array<AllowanceRecord & { _policies?: InsurancePolicy[] }> = [
  {
    va_allowancerecordid: 'rec-jordan',
    va_name: 'AR-2025-00014',
    va_applicantName: 'Jordan Smith',
    va_personnelnumber: 'CCI-02841',
    va_applicantCompany: 'Sunpro Corporation',
    va_allowanceLevel: AllowanceLevel.A,
    va_monthlyAmount: 1760,
    va_evChargingAmount: 0,
    va_totalMonthlyAmount: 1760,
    va_effectiveDate: '2025-06-01',
    va_status: AllowanceRecordStatus.Active,
    va_nextRenewalDue: '2026-08-01',
    _policies: [
      { va_insurancepolicyid: 'p-j1', va_policyType: PolicyType.Auto,                 va_carrierName: 'Liberty Mutual', va_policyNumber: 'LM-2291', va_expirationDate: '2026-10-15', va_meetsLiabilityRequirement: true, va_status: 'Active' },
      { va_insurancepolicyid: 'p-j2', va_policyType: PolicyType.UmbrellaPersonalExcess, va_carrierName: 'Liberty Mutual', va_policyNumber: 'LM-2291-U', va_expirationDate: '2026-10-15', va_meetsUmbrellaRequirement: true, va_status: 'Active' },
    ],
  },
  {
    va_allowancerecordid: 'rec-sam',
    va_name: 'AR-2025-00019',
    va_applicantName: 'Sam Williams',
    va_personnelnumber: 'CCI-03215',
    va_applicantCompany: 'W.W. Clyde & Co.',
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAmount: 1500,
    va_evChargingAmount: 0,
    va_totalMonthlyAmount: 1500,
    va_effectiveDate: '2025-09-01',
    va_status: AllowanceRecordStatus.Active,
    va_nextRenewalDue: '2026-08-01',
    _policies: [
      { va_insurancepolicyid: 'p-s1', va_policyType: PolicyType.Auto,                 va_carrierName: 'Farmers', va_policyNumber: 'FA-8812', va_expirationDate: EXPIRY_12_ISO, va_meetsLiabilityRequirement: true, va_status: 'Active' },
      { va_insurancepolicyid: 'p-s2', va_policyType: PolicyType.UmbrellaPersonalExcess, va_carrierName: 'Farmers', va_policyNumber: 'FA-8812-U', va_expirationDate: EXPIRY_12_ISO, va_meetsUmbrellaRequirement: true, va_status: 'Active' },
    ],
  },
  {
    va_allowancerecordid: 'rec-pat',
    va_name: 'AR-2025-00022',
    va_applicantName: 'Pat Davis',
    va_personnelnumber: 'CCI-04182',
    va_applicantCompany: 'Geneva Rock Products, Inc.',
    va_isElectricVehicle: true,
    va_allowanceLevel: AllowanceLevel.D,
    va_monthlyAmount: 1180,
    va_evChargingAmount: 310,
    va_totalMonthlyAmount: 1490,
    va_effectiveDate: '2025-11-01',
    va_status: AllowanceRecordStatus.Active,
    va_nextRenewalDue: '2026-08-01',
    _policies: [
      { va_insurancepolicyid: 'p-p1', va_policyType: PolicyType.Auto,                 va_carrierName: 'Geico', va_policyNumber: 'GC-4418', va_expirationDate: '2026-08-20', va_meetsLiabilityRequirement: true, va_status: 'Active' },
      { va_insurancepolicyid: 'p-p2', va_policyType: PolicyType.UmbrellaPersonalExcess, va_carrierName: 'Geico', va_policyNumber: 'GC-4418-U', va_expirationDate: '2026-08-20', va_meetsUmbrellaRequirement: true, va_status: 'Active' },
    ],
  },
]
