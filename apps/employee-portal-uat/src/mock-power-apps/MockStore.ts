/**
 * UAT Mock Store
 *
 * Central in-memory store that replaces Dataverse + Power Automate.
 * State is seeded with realistic data on first load and persisted to
 * localStorage so role switches and page reloads feel natural during UAT.
 *
 * Call mockStore.reset() (or click "Reset UAT Data" in the banner) to
 * wipe back to defaults at any time.
 */

import {
  UserRole,
  ApplicationStatus,
  ApplicationType,
  AllowanceLevel,
  AllowanceRecordStatus,
  BodyType,
  DocumentType,
  AIProcessingStatus,
  PolicyType,
  PayrollVerificationStatus,
} from '@/types'
import type {
  AllowanceApplication,
  AllowanceRecord,
  AllowanceLevelConfig,
  AuditLog,
  CompanyEntity,
  InsurancePolicy,
  ReminderConfig,
  VADocument,
  Vehicle,
} from '@/types'

// ─── Role → user identity mapping ─────────────────────────────────────────────

export const ROLE_USERS: Record<UserRole, { userId: string; displayName: string }> = {
  [UserRole.Employee]:        { userId: 'user-emp',     displayName: 'Alex Johnson' },
  [UserRole.EquipmentLeader]: { userId: 'user-leader',  displayName: 'Chris Martinez' },
  [UserRole.Director]:        { userId: 'user-director',displayName: 'Pat Wilson' },
  [UserRole.Admin]:           { userId: 'user-admin',   displayName: 'Jamie Admin' },
  [UserRole.Payroll]:         { userId: 'user-payroll', displayName: 'Casey Payroll' },
}

// ─── Employee personas ─────────────────────────────────────────────────────────
// Each persona represents a distinct employee scenario for UAT.

export interface EmployeePersona {
  key: string
  userId: string
  displayName: string
  description: string
}

export const EMPLOYEE_PERSONAS: EmployeePersona[] = [
  { key: 'active-renewal',      userId: 'user-emp',          displayName: 'Alex Johnson',  description: 'Active allowance — renewal due soon' },
  { key: 'expired-insurance',   userId: 'user-emp-expired',  displayName: 'Jordan Lee',    description: 'Active allowance — insurance lapsed' },
  { key: 'pending-review',      userId: 'user-emp-pending',  displayName: 'Sam Davis',     description: 'Application in Equipment Leader review' },
  { key: 'returned',            userId: 'user-emp-returned', displayName: 'Morgan Smith',  description: 'Application returned — needs resubmission' },
  { key: 'no-application',      userId: 'user-emp-new',      displayName: 'Taylor Brown',  description: 'New employee — no application yet' },
]

export const DEFAULT_PERSONA_KEY = EMPLOYEE_PERSONAS[0].key

// ─── Seed data ─────────────────────────────────────────────────────────────────

const SEED_LEVEL_CONFIGS: AllowanceLevelConfig[] = [
  { va_allowancelevelconfigid: 'level-a', va_name: 'Level A', va_level: AllowanceLevel.A, va_minimumMsrp: 30000, va_monthlyAllowance: 400,  va_evChargingAmount: 75,  va_isCurrentRate: true },
  { va_allowancelevelconfigid: 'level-b', va_name: 'Level B', va_level: AllowanceLevel.B, va_minimumMsrp: 45000, va_monthlyAllowance: 600,  va_evChargingAmount: 100, va_isCurrentRate: true },
  { va_allowancelevelconfigid: 'level-c', va_name: 'Level C', va_level: AllowanceLevel.C, va_minimumMsrp: 55000, va_monthlyAllowance: 800,  va_evChargingAmount: 125, va_isCurrentRate: true },
  { va_allowancelevelconfigid: 'level-d', va_name: 'Level D', va_level: AllowanceLevel.D, va_minimumMsrp: 70000, va_monthlyAllowance: 1000, va_evChargingAmount: 150, va_isCurrentRate: true },
]

const SEED_COMPANIES: CompanyEntity[] = [
  { va_companyentityid: 'co-001', va_name: 'Clyde Companies Inc.',        va_shortcode: 'CCI', va_endorsementaddressline1: '123 Main St',      va_endorsementaddressline2: 'Orem, UT 84097',           va_endorsementattn: 'Fleet Manager', va_isactive: true },
  { va_companyentityid: 'co-002', va_name: 'Geneva Rock Products',        va_shortcode: 'GRP', va_endorsementaddressline1: '456 Rock Rd',       va_endorsementaddressline2: 'Salt Lake City, UT 84101', va_endorsementattn: 'Risk Dept',     va_isactive: true },
  { va_companyentityid: 'co-003', va_name: 'Sunroc Corporation',          va_shortcode: 'SUN', va_endorsementaddressline1: '789 Sun Ave',       va_endorsementaddressline2: 'Springville, UT 84663',    va_endorsementattn: 'HR Dept',       va_isactive: true },
  { va_companyentityid: 'co-004', va_name: 'Intermountain Slurry Seal',   va_shortcode: 'ISS', va_endorsementaddressline1: '321 Highway Blvd',  va_endorsementaddressline2: 'Provo, UT 84601',          va_endorsementattn: 'Operations',    va_isactive: true },
  { va_companyentityid: 'co-005', va_name: 'Arrow Rock Quarry',           va_shortcode: 'ARQ', va_endorsementaddressline1: '654 Quarry Lane',   va_endorsementaddressline2: 'Lehi, UT 84043',           va_endorsementattn: 'Admin',         va_isactive: true },
  { va_companyentityid: 'co-006', va_name: 'Clyde Construction',          va_shortcode: 'CCO', va_endorsementaddressline1: '987 Builder Way',   va_endorsementaddressline2: 'Lindon, UT 84042',         va_endorsementattn: 'Fleet Manager', va_isactive: true },
  { va_companyentityid: 'co-007', va_name: 'Sunroc Building Materials',   va_shortcode: 'SBM', va_endorsementaddressline1: '112 Material Blvd', va_endorsementaddressline2: 'American Fork, UT 84003',  va_endorsementattn: 'HR Dept',       va_isactive: true },
  { va_companyentityid: 'co-008', va_name: 'Nu-Spec LLC',                 va_shortcode: 'NUS', va_endorsementaddressline1: '334 Spec Ct',       va_endorsementaddressline2: 'Pleasant Grove, UT 84062', va_endorsementattn: 'Mgmt',          va_isactive: true },
  { va_companyentityid: 'co-009', va_name: 'Clyde Equipment Inc.',        va_shortcode: 'CEI', va_endorsementaddressline1: '556 Equipment Dr',  va_endorsementaddressline2: 'Spanish Fork, UT 84660',   va_endorsementattn: 'Operations',    va_isactive: true },
]

const SEED_REMINDER_CONFIG: ReminderConfig[] = [
  { va_reminderconfigid: 'reminder-1', va_reminderDays1: 45, va_reminderDays2: 30, va_reminderDays3: 14, va_gracePeriodDays: 7, va_isActive: true },
]

const SEED_APPLICATIONS: AllowanceApplication[] = [
  // app-001: In Equipment Leader review queue (belongs to user-emp for status tracker)
  {
    va_allowanceapplicationid: 'app-001',
    va_name: 'VA-2024-001',
    va_applicantid: 'user-emp',
    va_personnelnumber: 'EMP-10042',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.EquipmentLeaderReview,
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAllowanceAmount: 600,
    va_evChargingAllowance: 0,
    va_totalMonthlyAllowance: 600,
    va_submittedOn: '2024-11-01T09:00:00Z',
    va_companyEntityId: 'co-001',
    va_companyEntityName: 'Clyde Companies Inc.',
    va_aiValidationScore: 78,
    va_aiAutoApprovalEligible: false,
    va_aiValidationSummary: 'Vehicle year meets minimum requirement. Insurance documents extracted with high confidence. Umbrella coverage confirmed.',
    va_aiFlaggedIssues: 'Vehicle age near minimum threshold (2022 model year). Manual verification recommended.',
  },
  // app-002: In Director review queue
  {
    va_allowanceapplicationid: 'app-002',
    va_name: 'VA-2024-002',
    va_applicantid: 'user-emp-2',
    va_personnelnumber: 'EMP-10097',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.DirectorReview,
    va_allowanceLevel: AllowanceLevel.C,
    va_monthlyAllowanceAmount: 800,
    va_evChargingAllowance: 125,
    va_totalMonthlyAllowance: 925,
    va_submittedOn: '2024-10-28T14:30:00Z',
    va_companyEntityId: 'co-002',
    va_companyEntityName: 'Geneva Rock Products',
    va_aiValidationScore: 93,
    va_aiAutoApprovalEligible: true,
    va_aiValidationSummary: 'All documents verified with high confidence. Vehicle MSRP ($72,450) qualifies for Level C. EV charging supplement applicable.',
    va_equipmentLeaderDecision: 'Approved' as AllowanceApplication['va_equipmentLeaderDecision'],
    va_equipmentLeaderReviewDate: '2024-10-30T11:00:00Z',
    va_equipmentLeaderNotes: 'All documents in order. Vehicle verified as EV (Rivian R1T). Recommending Director approval.',
  },
  // app-003: In EL review queue (AI-flagged, low score)
  {
    va_allowanceapplicationid: 'app-003',
    va_name: 'VA-2024-003',
    va_applicantid: 'user-emp-3',
    va_personnelnumber: 'EMP-10115',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.EquipmentLeaderReview,
    va_allowanceLevel: AllowanceLevel.A,
    va_monthlyAllowanceAmount: 400,
    va_evChargingAllowance: 0,
    va_totalMonthlyAllowance: 400,
    va_submittedOn: '2024-11-03T08:15:00Z',
    va_companyEntityId: 'co-003',
    va_companyEntityName: 'Sunroc Corporation',
    va_aiValidationScore: 62,
    va_aiAutoApprovalEligible: false,
    va_aiValidationSummary: 'Low confidence on insurance extraction. Policy number unclear. Endorsement naming requires manual verification.',
    va_aiFlaggedIssues: 'Endorsement entity name does not exactly match company record; insurance policy number extraction confidence 58% (below 70% threshold).',
  },
  // app-004: Active (source of the AllowanceRecord for user-emp)
  {
    va_allowanceapplicationid: 'app-004',
    va_name: 'VA-2024-004',
    va_applicantid: 'user-emp',
    va_personnelnumber: 'EMP-10042',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.Active,
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAllowanceAmount: 600,
    va_evChargingAllowance: 100,
    va_totalMonthlyAllowance: 700,
    va_submittedOn: '2024-09-15T09:00:00Z',
    va_effectiveDate: '2024-10-01T00:00:00Z',
    va_companyEntityId: 'co-001',
    va_companyEntityName: 'Clyde Companies Inc.',
    va_aiValidationScore: 96,
    va_aiAutoApprovalEligible: true,
    va_payrollNotifiedDate: '2024-09-30T16:00:00Z',
  },
  // app-005: Rejected
  {
    va_allowanceapplicationid: 'app-005',
    va_name: 'VA-2024-005',
    va_applicantid: 'user-emp-5',
    va_personnelnumber: 'EMP-10078',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.Rejected,
    va_submittedOn: '2024-10-10T10:00:00Z',
    va_companyEntityId: 'co-004',
    va_companyEntityName: 'Intermountain Slurry Seal',
    va_aiValidationScore: 42,
    va_aiAutoApprovalEligible: false,
    va_directorDecision: 'Rejected' as AllowanceApplication['va_directorDecision'],
    va_directorReviewDate: '2024-10-20T15:00:00Z',
    va_directorNotes: 'Vehicle does not meet minimum MSRP threshold for any allowance tier. Applicant advised to reapply when acquiring a qualifying vehicle.',
  },
  // app-006: Returned to employee
  {
    va_allowanceapplicationid: 'app-006',
    va_name: 'VA-2024-006',
    va_applicantid: 'user-emp-6',
    va_personnelnumber: 'EMP-10210',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.ReturnedToEmployee,
    va_submittedOn: '2024-10-22T13:00:00Z',
    va_companyEntityId: 'co-005',
    va_companyEntityName: 'Arrow Rock Quarry',
    va_aiValidationScore: 71,
    va_aiAutoApprovalEligible: false,
    va_equipmentLeaderDecision: 'Returned' as AllowanceApplication['va_equipmentLeaderDecision'],
    va_equipmentLeaderReviewDate: '2024-10-25T09:30:00Z',
    va_equipmentLeaderNotes: 'Umbrella policy endorsement does not list all company entities. Please upload corrected endorsement.',
  },
]

const SEED_VEHICLES: Vehicle[] = [
  {
    va_vehicleid: 'veh-001',
    va_name: '2022 Ford F-150',
    va_applicationId: 'app-001',
    va_vin: '1FTFW1E53NFC12345',
    va_vinConfirmed: true,
    va_make: 'Ford',
    va_model: 'F-150',
    va_year: 2022,
    va_bodyType: BodyType.Pickup,
    va_msrpTotal: 52000,
    va_msrpConfirmed: true,
    va_isElectric: false,
    va_meetsYearRequirement: true,
    va_meetsMsrpRequirement: true,
    va_meetsBodyTypeRequirement: true,
  },
  {
    va_vehicleid: 'veh-002',
    va_name: '2024 Rivian R1T',
    va_applicationId: 'app-002',
    va_vin: '7PDSGDBA4NN000789',
    va_vinConfirmed: true,
    va_make: 'Rivian',
    va_model: 'R1T',
    va_year: 2024,
    va_bodyType: BodyType.Pickup,
    va_msrpTotal: 72450,
    va_msrpConfirmed: true,
    va_isElectric: true,
    va_meetsYearRequirement: true,
    va_meetsMsrpRequirement: true,
    va_meetsBodyTypeRequirement: true,
  },
  {
    va_vehicleid: 'veh-003',
    va_name: '2023 Chevrolet Colorado',
    va_applicationId: 'app-003',
    va_vin: '1GCPTFEK3N1234567',
    va_vinConfirmed: true,
    va_make: 'Chevrolet',
    va_model: 'Colorado',
    va_year: 2023,
    va_bodyType: BodyType.Pickup,
    va_msrpTotal: 34500,
    va_msrpConfirmed: false,
    va_isElectric: false,
    va_meetsYearRequirement: true,
    va_meetsMsrpRequirement: true,
    va_meetsBodyTypeRequirement: true,
  },
  {
    va_vehicleid: 'veh-004',
    va_name: '2024 Ford F-150 Lightning',
    va_applicationId: 'app-004',
    va_vin: '1FT6W1EV5PW000123',
    va_vinConfirmed: true,
    va_make: 'Ford',
    va_model: 'F-150 Lightning',
    va_year: 2024,
    va_bodyType: BodyType.Pickup,
    va_msrpTotal: 62000,
    va_msrpConfirmed: true,
    va_isElectric: true,
    va_meetsYearRequirement: true,
    va_meetsMsrpRequirement: true,
    va_meetsBodyTypeRequirement: true,
  },
]

const SEED_POLICIES: InsurancePolicy[] = [
  {
    va_insurancepolicyid: 'pol-001-auto',
    va_name: 'Auto Policy – FA2024-8833',
    va_applicationId: 'app-001',
    va_employeeId: 'user-emp',
    va_personnelnumber: 'EMP-10042',
    va_policyType: PolicyType.Auto,
    va_carrierName: 'State Farm',
    va_policyNumber: 'FA2024-8833',
    va_effectiveDate: '2024-01-01T00:00:00Z',
    va_expirationDate: '2025-01-01T00:00:00Z',
    va_coverageLimitCSL: 500000,
    va_meetsLiabilityRequirement: true,
    va_meetsEndorsementRequirement: true,
    va_status: 'Active',
    va_aiExtractionConfidence: 0.87,
  },
  {
    va_insurancepolicyid: 'pol-001-umb',
    va_name: 'Umbrella Policy – UMB-2024-001',
    va_applicationId: 'app-001',
    va_employeeId: 'user-emp',
    va_policyType: PolicyType.UmbrellaPersonalExcess,
    va_carrierName: 'State Farm',
    va_policyNumber: 'UMB-2024-001',
    va_effectiveDate: '2024-01-01T00:00:00Z',
    va_expirationDate: '2025-01-01T00:00:00Z',
    va_umbrellaLimit: 1000000,
    va_meetsUmbrellaRequirement: true,
    va_status: 'Active',
    va_aiExtractionConfidence: 0.91,
  },
  {
    va_insurancepolicyid: 'pol-002-auto',
    va_name: 'Auto Policy – RVN-2024-7721',
    va_applicationId: 'app-002',
    va_employeeId: 'user-emp-2',
    va_policyType: PolicyType.Auto,
    va_carrierName: 'Allstate',
    va_policyNumber: 'RVN-2024-7721',
    va_effectiveDate: '2024-03-15T00:00:00Z',
    va_expirationDate: '2025-03-15T00:00:00Z',
    va_coverageLimitCSL: 750000,
    va_meetsLiabilityRequirement: true,
    va_meetsEndorsementRequirement: true,
    va_status: 'Active',
    va_aiExtractionConfidence: 0.95,
  },
  {
    va_insurancepolicyid: 'pol-002-umb',
    va_name: 'Umbrella Policy – ALL-UMB-2024',
    va_applicationId: 'app-002',
    va_employeeId: 'user-emp-2',
    va_policyType: PolicyType.UmbrellaPersonalExcess,
    va_carrierName: 'Allstate',
    va_policyNumber: 'ALL-UMB-2024',
    va_effectiveDate: '2024-03-15T00:00:00Z',
    va_expirationDate: '2025-03-15T00:00:00Z',
    va_umbrellaLimit: 2000000,
    va_meetsUmbrellaRequirement: true,
    va_status: 'Active',
    va_aiExtractionConfidence: 0.98,
  },
  // Active employee's current policies (linked to their AllowanceRecord)
  {
    va_insurancepolicyid: 'pol-active-auto',
    va_name: 'Auto Policy – PRG-2024-4421',
    va_applicationId: 'app-004',
    va_employeeId: 'user-emp',
    va_personnelnumber: 'EMP-10042',
    va_policyType: PolicyType.Auto,
    va_carrierName: 'Progressive',
    va_policyNumber: 'PRG-2024-4421',
    va_effectiveDate: '2024-03-01T00:00:00Z',
    va_expirationDate: '2025-03-01T00:00:00Z',
    va_coverageLimitCSL: 750000,
    va_meetsLiabilityRequirement: true,
    va_meetsEndorsementRequirement: true,
    va_status: 'Active',
    va_aiExtractionConfidence: 0.95,
  },
  {
    va_insurancepolicyid: 'pol-active-umb',
    va_name: 'Umbrella Policy – PRG-UMB-2024',
    va_applicationId: 'app-004',
    va_employeeId: 'user-emp',
    va_policyType: PolicyType.UmbrellaPersonalExcess,
    va_carrierName: 'Progressive',
    va_policyNumber: 'PRG-UMB-2024',
    va_effectiveDate: '2024-03-01T00:00:00Z',
    va_expirationDate: '2025-03-01T00:00:00Z',
    va_umbrellaLimit: 1000000,
    va_meetsUmbrellaRequirement: true,
    va_status: 'Active',
    va_aiExtractionConfidence: 0.93,
  },
]

const SEED_DOCUMENTS: VADocument[] = [
  {
    va_documentid: 'doc-001-auto',
    va_name: 'Auto_Dec_Page_FA2024-8833.pdf',
    va_applicationId: 'app-001',
    va_documentType: DocumentType.AutoDecPage,
    va_uploadedOn: '2024-11-01T08:55:00Z',
    va_aiProcessingStatus: AIProcessingStatus.Completed,
    va_aiConfidenceScore: 0.87,
    va_reviewStatus: 'Accepted',
    va_aiExtractedData: JSON.stringify({ carrier_name: 'State Farm', policy_number: 'FA2024-8833', csl_limit: 500000 }),
  },
  {
    va_documentid: 'doc-001-umb',
    va_name: 'Umbrella_Dec_UMB-2024-001.pdf',
    va_applicationId: 'app-001',
    va_documentType: DocumentType.UmbrellaDecPage,
    va_uploadedOn: '2024-11-01T08:56:00Z',
    va_aiProcessingStatus: AIProcessingStatus.Completed,
    va_aiConfidenceScore: 0.91,
    va_reviewStatus: 'Accepted',
    va_aiExtractedData: JSON.stringify({ carrier_name: 'State Farm', policy_number: 'UMB-2024-001', umbrella_limit: 1000000 }),
  },
  {
    va_documentid: 'doc-001-end',
    va_name: 'Endorsement_Additional_Insured.pdf',
    va_applicationId: 'app-001',
    va_documentType: DocumentType.Endorsement,
    va_uploadedOn: '2024-11-01T08:57:00Z',
    va_aiProcessingStatus: AIProcessingStatus.Completed,
    va_aiConfidenceScore: 0.79,
    va_reviewStatus: 'Accepted',
    va_aiExtractedData: JSON.stringify({ endorsement_type: 'Additional Insured', additional_insured_entity: 'Clyde Companies Inc.' }),
  },
  {
    va_documentid: 'doc-001-ws',
    va_name: 'Window_Sticker_F150_2022.pdf',
    va_applicationId: 'app-001',
    va_documentType: DocumentType.WindowSticker,
    va_uploadedOn: '2024-11-01T08:58:00Z',
    va_aiProcessingStatus: AIProcessingStatus.Completed,
    va_aiConfidenceScore: 0.94,
    va_reviewStatus: 'Accepted',
    va_aiExtractedData: JSON.stringify({ vin: '1FTFW1E53NFC12345', total_msrp: 52000, model_year: 2022, make: 'Ford', model: 'F-150' }),
  },
  {
    va_documentid: 'doc-002-auto',
    va_name: 'Auto_Dec_RVN-2024-7721.pdf',
    va_applicationId: 'app-002',
    va_documentType: DocumentType.AutoDecPage,
    va_uploadedOn: '2024-10-28T14:20:00Z',
    va_aiProcessingStatus: AIProcessingStatus.Completed,
    va_aiConfidenceScore: 0.95,
    va_reviewStatus: 'Accepted',
    va_aiExtractedData: JSON.stringify({ carrier_name: 'Allstate', policy_number: 'RVN-2024-7721', csl_limit: 750000 }),
  },
  {
    va_documentid: 'doc-002-umb',
    va_name: 'Umbrella_ALL-UMB-2024.pdf',
    va_applicationId: 'app-002',
    va_documentType: DocumentType.UmbrellaDecPage,
    va_uploadedOn: '2024-10-28T14:21:00Z',
    va_aiProcessingStatus: AIProcessingStatus.Completed,
    va_aiConfidenceScore: 0.98,
    va_reviewStatus: 'Accepted',
    va_aiExtractedData: JSON.stringify({ carrier_name: 'Allstate', policy_number: 'ALL-UMB-2024', umbrella_limit: 2000000 }),
  },
  {
    va_documentid: 'doc-002-end',
    va_name: 'Endorsement_R1T_AddlInsured.pdf',
    va_applicationId: 'app-002',
    va_documentType: DocumentType.Endorsement,
    va_uploadedOn: '2024-10-28T14:22:00Z',
    va_aiProcessingStatus: AIProcessingStatus.Completed,
    va_aiConfidenceScore: 0.96,
    va_reviewStatus: 'Accepted',
    va_aiExtractedData: JSON.stringify({ endorsement_type: 'Additional Insured', additional_insured_entity: 'Geneva Rock Products' }),
  },
  {
    va_documentid: 'doc-002-ws',
    va_name: 'Window_Sticker_R1T_2024.pdf',
    va_applicationId: 'app-002',
    va_documentType: DocumentType.WindowSticker,
    va_uploadedOn: '2024-10-28T14:23:00Z',
    va_aiProcessingStatus: AIProcessingStatus.Completed,
    va_aiConfidenceScore: 0.97,
    va_reviewStatus: 'Accepted',
    va_aiExtractedData: JSON.stringify({ vin: '7PDSGDBA4NN000789', total_msrp: 72450, model_year: 2024, make: 'Rivian', model: 'R1T', is_electric: true }),
  },
]

const SEED_ALLOWANCE_RECORDS: AllowanceRecord[] = [
  {
    va_allowancerecordid: 'rec-001',
    va_name: 'AR-EMP-10042-2024',
    va_employeeId: 'user-emp',
    va_personnelnumber: 'EMP-10042',
    va_originalApplicationId: 'app-004',
    va_currentVehicleId: 'veh-004',
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAmount: 600,
    va_evChargingAmount: 100,
    va_totalMonthlyAmount: 700,
    va_effectiveDate: '2024-10-01T00:00:00Z',
    va_status: AllowanceRecordStatus.Active,
    va_companyEntityId: 'co-001',
    va_nextRenewalDue: '2025-03-01T00:00:00Z',
    va_payrollVerificationStatus: PayrollVerificationStatus.Verified,
    va_payrollEarnCode: 'VEHALLOW',
    va_payrollAmount: 700,
  },
  {
    va_allowancerecordid: 'rec-002',
    va_name: 'AR-EMP-10097-2024',
    va_employeeId: 'user-emp-2',
    va_personnelnumber: 'EMP-10097',
    va_allowanceLevel: AllowanceLevel.C,
    va_monthlyAmount: 800,
    va_evChargingAmount: 125,
    va_totalMonthlyAmount: 925,
    va_effectiveDate: '2024-11-01T00:00:00Z',
    va_status: AllowanceRecordStatus.Active,
    va_companyEntityId: 'co-002',
    va_nextRenewalDue: '2025-11-01T00:00:00Z',
    va_payrollVerificationStatus: PayrollVerificationStatus.Verified,
    va_payrollEarnCode: 'VEHALLOW',
    va_payrollAmount: 925,
  },
  {
    va_allowancerecordid: 'rec-003',
    va_name: 'AR-EMP-10201-2024',
    va_employeeId: 'user-emp-4',
    va_personnelnumber: 'EMP-10201',
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAmount: 600,
    va_evChargingAmount: 100,
    va_totalMonthlyAmount: 700,
    va_effectiveDate: '2024-10-01T00:00:00Z',
    va_status: AllowanceRecordStatus.Active,
    va_companyEntityId: 'co-001',
    va_nextRenewalDue: '2025-10-01T00:00:00Z',
    va_payrollVerificationStatus: PayrollVerificationStatus.AmountMismatch,
    va_payrollEarnCode: 'VEHALLOW',
    va_payrollAmount: 650,
    va_payrollAmountMismatch: true,
    va_payrollVerificationNotes: 'System shows $650 but record indicates $700. HR investigating discrepancy.',
  },
  {
    va_allowancerecordid: 'rec-004',
    va_name: 'AR-EMP-10115-2023',
    va_employeeId: 'user-emp-3',
    va_personnelnumber: 'EMP-10115',
    va_allowanceLevel: AllowanceLevel.A,
    va_monthlyAmount: 400,
    va_evChargingAmount: 0,
    va_totalMonthlyAmount: 400,
    va_effectiveDate: '2023-07-01T00:00:00Z',
    va_status: AllowanceRecordStatus.Active,
    va_companyEntityId: 'co-003',
    va_nextRenewalDue: '2025-06-01T00:00:00Z',
    va_payrollVerificationStatus: PayrollVerificationStatus.Verified,
    va_payrollEarnCode: 'VEHALLOW',
    va_payrollAmount: 400,
  },
  {
    va_allowancerecordid: 'rec-005',
    va_name: 'AR-EMP-10078-2023',
    va_employeeId: 'user-emp-5',
    va_personnelnumber: 'EMP-10078',
    va_allowanceLevel: AllowanceLevel.D,
    va_monthlyAmount: 1000,
    va_evChargingAmount: 150,
    va_totalMonthlyAmount: 1150,
    va_effectiveDate: '2023-04-16T00:00:00Z',
    va_status: AllowanceRecordStatus.Active,
    va_companyEntityId: 'co-004',
    va_nextRenewalDue: '2025-04-01T00:00:00Z',
    va_payrollVerificationStatus: PayrollVerificationStatus.Pending,
    va_payrollEarnCode: 'VEHALLOW',
    va_payrollAmount: 1150,
  },
]

const SEED_AUDIT_LOGS: AuditLog[] = [
  { va_auditlogid: 'log-001', va_name: 'Application Submitted',      va_eventType: 'ApplicationSubmitted',    va_newStatus: ApplicationStatus.Submitted,              va_performedByName: 'Alex Johnson (Employee)',         va_eventDate: '2024-11-01T09:00:00Z', va_applicationId: 'app-001' },
  { va_auditlogid: 'log-002', va_name: 'AI Validation Completed',    va_eventType: 'AIValidationCompleted',   va_previousStatus: ApplicationStatus.Submitted, va_newStatus: ApplicationStatus.EquipmentLeaderReview,  va_performedByName: 'AI Builder System',               va_eventDate: '2024-11-01T09:05:00Z', va_applicationId: 'app-001', va_notes: 'AI score: 78%. Flagged for manual review (vehicle age threshold).' },
  { va_auditlogid: 'log-003', va_name: 'EL Approved',                va_eventType: 'EquipmentLeaderDecision', va_previousStatus: ApplicationStatus.EquipmentLeaderReview, va_newStatus: ApplicationStatus.DirectorReview,    va_performedByName: 'Chris Martinez (Equipment Leader)', va_eventDate: '2024-10-30T11:00:00Z', va_applicationId: 'app-002', va_notes: 'All documents in order. Vehicle verified as EV.' },
  { va_auditlogid: 'log-004', va_name: 'Allowance Activated',        va_eventType: 'AllowanceActivated',      va_previousStatus: ApplicationStatus.PayrollNotification, va_newStatus: ApplicationStatus.Active,             va_performedByName: 'System',                          va_eventDate: '2024-09-30T16:00:00Z', va_applicationId: 'app-004', va_notes: 'AllowanceRecord created. Effective: Oct 1 2024. Payroll notified.' },
  { va_auditlogid: 'log-005', va_name: 'Application Rejected',       va_eventType: 'DirectorDecision',        va_previousStatus: ApplicationStatus.DirectorReview, va_newStatus: ApplicationStatus.Rejected,              va_performedByName: 'Pat Wilson (Director)',           va_eventDate: '2024-10-20T15:00:00Z', va_applicationId: 'app-005', va_notes: 'Vehicle does not meet minimum MSRP threshold.' },
  { va_auditlogid: 'log-006', va_name: 'Application Returned',       va_eventType: 'EquipmentLeaderDecision', va_previousStatus: ApplicationStatus.EquipmentLeaderReview, va_newStatus: ApplicationStatus.ReturnedToEmployee, va_performedByName: 'Chris Martinez (Equipment Leader)', va_eventDate: '2024-10-25T09:30:00Z', va_applicationId: 'app-006', va_notes: 'Endorsement does not list all company entities.' },
  { va_auditlogid: 'log-007', va_name: 'Application Submitted',      va_eventType: 'ApplicationSubmitted',    va_newStatus: ApplicationStatus.Submitted,              va_performedByName: 'Sam Davis (Employee)',           va_eventDate: '2024-10-28T14:30:00Z', va_applicationId: 'app-002' },
  { va_auditlogid: 'log-008', va_name: 'AI Validation Completed',    va_eventType: 'AIValidationCompleted',   va_previousStatus: ApplicationStatus.Submitted, va_newStatus: ApplicationStatus.EquipmentLeaderReview,  va_performedByName: 'AI Builder System',               va_eventDate: '2024-10-28T14:35:00Z', va_applicationId: 'app-002', va_notes: 'AI score: 93%. Auto-approval eligible.' },
]

// ─── Persona seed data (additional employees) ─────────────────────────────────

/** Extra applications for personas beyond the shared queue */
const PERSONA_APPLICATIONS: AllowanceApplication[] = [
  // Sam Davis — pending EL review (user-emp-pending)
  {
    va_allowanceapplicationid: 'app-sam',
    va_name: 'VA-2024-007',
    va_applicantid: 'user-emp-pending',
    va_personnelnumber: 'EMP-10312',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.EquipmentLeaderReview,
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAllowanceAmount: 600,
    va_evChargingAllowance: 0,
    va_totalMonthlyAllowance: 600,
    va_submittedOn: '2024-11-05T10:30:00Z',
    va_companyEntityId: 'co-006',
    va_companyEntityName: 'Clyde Construction',
    va_aiValidationScore: 81,
    va_aiAutoApprovalEligible: false,
    va_aiValidationSummary: 'Documents extracted with good confidence. One endorsement field extraction borderline.',
    va_aiFlaggedIssues: 'Endorsement entity name confidence 67% — recommend manual confirmation.',
  },
  // Morgan Smith — returned to employee (user-emp-returned)
  {
    va_allowanceapplicationid: 'app-morgan',
    va_name: 'VA-2024-008',
    va_applicantid: 'user-emp-returned',
    va_personnelnumber: 'EMP-10388',
    va_applicationType: ApplicationType.NewOptIn,
    va_status: ApplicationStatus.ReturnedToEmployee,
    va_allowanceLevel: AllowanceLevel.A,
    va_monthlyAllowanceAmount: 400,
    va_evChargingAllowance: 0,
    va_totalMonthlyAllowance: 400,
    va_submittedOn: '2024-10-18T09:00:00Z',
    va_companyEntityId: 'co-007',
    va_companyEntityName: 'Sunroc Building Materials',
    va_aiValidationScore: 70,
    va_aiAutoApprovalEligible: false,
    va_equipmentLeaderDecision: 'Returned' as AllowanceApplication['va_equipmentLeaderDecision'],
    va_equipmentLeaderReviewDate: '2024-10-22T14:00:00Z',
    va_equipmentLeaderNotes: 'Umbrella policy does not list the vehicle VIN. Please upload a corrected umbrella declarations page that includes the insured vehicle.',
  },
]

/** Vehicles for persona applications */
const PERSONA_VEHICLES: Vehicle[] = [
  {
    va_vehicleid: 'veh-sam',
    va_name: '2023 Toyota Tacoma',
    va_applicationId: 'app-sam',
    va_vin: '3TMCZ5AN7PM123456',
    va_vinConfirmed: true,
    va_make: 'Toyota',
    va_model: 'Tacoma',
    va_year: 2023,
    va_bodyType: BodyType.Pickup,
    va_msrpTotal: 46500,
    va_msrpConfirmed: true,
    va_isElectric: false,
    va_meetsYearRequirement: true,
    va_meetsMsrpRequirement: true,
    va_meetsBodyTypeRequirement: true,
  },
  {
    va_vehicleid: 'veh-morgan',
    va_name: '2022 Ram 1500',
    va_applicationId: 'app-morgan',
    va_vin: '1C6SRFFT5NN123789',
    va_vinConfirmed: true,
    va_make: 'Ram',
    va_model: '1500',
    va_year: 2022,
    va_bodyType: BodyType.Pickup,
    va_msrpTotal: 38000,
    va_msrpConfirmed: true,
    va_isElectric: false,
    va_meetsYearRequirement: true,
    va_meetsMsrpRequirement: true,
    va_meetsBodyTypeRequirement: true,
  },
  {
    va_vehicleid: 'veh-jordan',
    va_name: '2023 Ford Expedition',
    va_applicationId: 'app-jordan-orig',
    va_vin: '1FMJU2AT3PEA00001',
    va_vinConfirmed: true,
    va_make: 'Ford',
    va_model: 'Expedition',
    va_year: 2023,
    va_bodyType: BodyType.SUV,
    va_msrpTotal: 58000,
    va_msrpConfirmed: true,
    va_isElectric: false,
    va_meetsYearRequirement: true,
    va_meetsMsrpRequirement: true,
    va_meetsBodyTypeRequirement: true,
  },
]

/** AllowanceRecord for Jordan Lee — active but with lapsed insurance */
const PERSONA_RECORDS: AllowanceRecord[] = [
  {
    va_allowancerecordid: 'rec-jordan',
    va_name: 'AR-EMP-10271-2024',
    va_employeeId: 'user-emp-expired',
    va_personnelnumber: 'EMP-10271',
    va_currentVehicleId: 'veh-jordan',
    va_allowanceLevel: AllowanceLevel.B,
    va_monthlyAmount: 600,
    va_evChargingAmount: 0,
    va_totalMonthlyAmount: 600,
    va_effectiveDate: '2024-01-16T00:00:00Z',
    va_status: AllowanceRecordStatus.Active,
    va_companyEntityId: 'co-003',
    // Renewal was due in September — now overdue
    va_nextRenewalDue: '2024-09-15T00:00:00Z',
    va_payrollVerificationStatus: PayrollVerificationStatus.Verified,
    va_payrollEarnCode: 'VEHALLOW',
    va_payrollAmount: 600,
  },
]

/** Insurance policies for Jordan Lee — expired */
const PERSONA_POLICIES: InsurancePolicy[] = [
  {
    va_insurancepolicyid: 'pol-jordan-auto',
    va_name: 'Auto Policy – SF-2023-JL-4491 (EXPIRED)',
    va_applicationId: 'app-jordan-orig',
    va_employeeId: 'user-emp-expired',
    va_personnelnumber: 'EMP-10271',
    va_policyType: PolicyType.Auto,
    va_carrierName: 'State Farm',
    va_policyNumber: 'SF-2023-JL-4491',
    va_effectiveDate: '2023-09-15T00:00:00Z',
    va_expirationDate: '2024-09-15T00:00:00Z',   // expired Sep 2024
    va_coverageLimitCSL: 500000,
    va_meetsLiabilityRequirement: true,
    va_meetsEndorsementRequirement: true,
    va_status: 'Expired',
    va_aiExtractionConfidence: 0.92,
  },
  {
    va_insurancepolicyid: 'pol-jordan-umb',
    va_name: 'Umbrella Policy – SF-UMB-2023-JL (EXPIRED)',
    va_applicationId: 'app-jordan-orig',
    va_employeeId: 'user-emp-expired',
    va_policyType: PolicyType.UmbrellaPersonalExcess,
    va_carrierName: 'State Farm',
    va_policyNumber: 'SF-UMB-2023-JL',
    va_effectiveDate: '2023-09-15T00:00:00Z',
    va_expirationDate: '2024-09-15T00:00:00Z',   // expired Sep 2024
    va_umbrellaLimit: 1000000,
    va_meetsUmbrellaRequirement: true,
    va_status: 'Expired',
    va_aiExtractionConfidence: 0.89,
  },
]

// ─── State shape ───────────────────────────────────────────────────────────────

export interface UATState {
  currentRole: UserRole
  currentUserId: string
  currentPersonaKey: string
  applications: AllowanceApplication[]
  vehicles: Vehicle[]
  insurancePolicies: InsurancePolicy[]
  documents: VADocument[]
  allowanceRecords: AllowanceRecord[]
  auditLogs: AuditLog[]
  levelConfigs: AllowanceLevelConfig[]
  reminderConfigs: ReminderConfig[]
  companies: CompanyEntity[]
}

function buildDefaultState(): UATState {
  return {
    currentRole:       UserRole.Employee,
    currentUserId:     ROLE_USERS[UserRole.Employee].userId,
    currentPersonaKey: DEFAULT_PERSONA_KEY,
    // Merge shared queue apps with persona-specific apps
    applications:   structuredClone([...SEED_APPLICATIONS, ...PERSONA_APPLICATIONS]),
    vehicles:       structuredClone([...SEED_VEHICLES, ...PERSONA_VEHICLES]),
    insurancePolicies: structuredClone([...SEED_POLICIES, ...PERSONA_POLICIES]),
    documents:      structuredClone(SEED_DOCUMENTS),
    allowanceRecords: structuredClone([...SEED_ALLOWANCE_RECORDS, ...PERSONA_RECORDS]),
    auditLogs:      structuredClone(SEED_AUDIT_LOGS),
    levelConfigs:   structuredClone(SEED_LEVEL_CONFIGS),
    reminderConfigs: structuredClone(SEED_REMINDER_CONFIG),
    companies:      structuredClone(SEED_COMPANIES),
  }
}

// ─── Store class ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'va-uat-store'

class MockDataStore {
  private state: UATState
  private listeners: Set<() => void> = new Set()

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        this.state = JSON.parse(saved) as UATState
      } catch {
        this.state = buildDefaultState()
      }
    } else {
      this.state = buildDefaultState()
    }
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  private notify() {
    this.listeners.forEach(fn => fn())
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
  }

  private save() {
    this.persist()
    this.notify()
  }

  // ── Role / identity ──────────────────────────────────────────────────────────

  getRole()        { return this.state.currentRole }
  getUserId()      { return this.state.currentUserId }
  getPersonaKey()  { return this.state.currentPersonaKey }

  getDisplayName() {
    if (this.state.currentRole === UserRole.Employee) {
      const persona = EMPLOYEE_PERSONAS.find(p => p.key === this.state.currentPersonaKey)
      return persona?.displayName ?? ROLE_USERS[UserRole.Employee].displayName
    }
    return ROLE_USERS[this.state.currentRole].displayName
  }

  setRole(role: UserRole) {
    this.state.currentRole = role
    if (role === UserRole.Employee) {
      // Reset to default employee persona when switching back to Employee
      const defaultPersona = EMPLOYEE_PERSONAS.find(p => p.key === DEFAULT_PERSONA_KEY)!
      this.state.currentPersonaKey = defaultPersona.key
      this.state.currentUserId     = defaultPersona.userId
    } else {
      this.state.currentPersonaKey = ''
      this.state.currentUserId     = ROLE_USERS[role].userId
    }
    this.save()
  }

  setPersona(key: string) {
    const persona = EMPLOYEE_PERSONAS.find(p => p.key === key)
    if (!persona) return
    this.state.currentPersonaKey = persona.key
    this.state.currentUserId     = persona.userId
    this.save()
  }

  reset() {
    this.state = buildDefaultState()
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('va-uat-wizard')
    this.notify()
  }

  // ── Generic table access ─────────────────────────────────────────────────────

  getTable(entityName: string): Record<string, unknown>[] {
    const map: Record<string, keyof UATState> = {
      va_allowanceapplications: 'applications',
      va_vehicles:              'vehicles',
      va_insurancepolicies:     'insurancePolicies',
      va_documents:             'documents',
      va_allowancerecords:      'allowanceRecords',
      va_auditlogs:             'auditLogs',
      va_allowancelevelconfigs: 'levelConfigs',
      va_reminderconfigs:       'reminderConfigs',
      va_companyentities:       'companies',
    }
    const key = map[entityName]
    if (!key) return []
    return this.state[key] as Record<string, unknown>[]
  }

  // Returns the id field name for a given table
  getIdField(entityName: string): string {
    const idFields: Record<string, string> = {
      va_allowanceapplications: 'va_allowanceapplicationid',
      va_vehicles:              'va_vehicleid',
      va_insurancepolicies:     'va_insurancepolicyid',
      va_documents:             'va_documentid',
      va_allowancerecords:      'va_allowancerecordid',
      va_auditlogs:             'va_auditlogid',
      va_allowancelevelconfigs: 'va_allowancelevelconfigid',
      va_reminderconfigs:       'va_reminderconfigid',
      va_companyentities:       'va_companyentityid',
    }
    return idFields[entityName] ?? 'id'
  }

  findById(entityName: string, id: string): Record<string, unknown> | undefined {
    const idField = this.getIdField(entityName)
    return this.getTable(entityName).find(r => r[idField] === id)
  }

  createRecord(entityName: string, data: Record<string, unknown>): string {
    const id   = crypto.randomUUID()
    const idField = this.getIdField(entityName)
    const record  = { ...data, [idField]: id, createdon: new Date().toISOString() }

    const map: Record<string, keyof UATState> = {
      va_allowanceapplications: 'applications',
      va_vehicles:              'vehicles',
      va_insurancepolicies:     'insurancePolicies',
      va_documents:             'documents',
      va_allowancerecords:      'allowanceRecords',
      va_auditlogs:             'auditLogs',
      va_allowancelevelconfigs: 'levelConfigs',
      va_reminderconfigs:       'reminderConfigs',
      va_companyentities:       'companies',
    }
    const key = map[entityName]
    if (key) {
      (this.state[key] as Record<string, unknown>[]).push(record)
      this.save()
    }
    return id
  }

  updateRecord(entityName: string, id: string, data: Record<string, unknown>) {
    const idField = this.getIdField(entityName)
    const table   = this.getTable(entityName)
    const idx     = table.findIndex(r => r[idField] === id)
    if (idx >= 0) {
      table[idx] = { ...table[idx], ...data }
      this.save()
    }
  }
}

export const mockStore = new MockDataStore()
