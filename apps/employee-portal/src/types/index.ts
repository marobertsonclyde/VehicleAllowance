// ─── Choice field enums ────────────────────────────────────────────────────────
// Values must match the option set integer values in Dataverse.

export enum ApplicationType {
  NewOptIn = 'New Opt-In',
  VehicleUpdate = 'Vehicle Update',
  AnnualRenewal = 'Annual Renewal',
}

export enum ApplicationStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  AIReview = 'AI Review',
  EquipmentLeaderReview = 'Equipment Leader Review',
  DirectorReview = 'Director Review',
  PayrollNotification = 'Payroll Notification',
  Active = 'Active',
  Rejected = 'Rejected',
  ReturnedToEmployee = 'Returned to Employee',
  Withdrawn = 'Withdrawn',
  Terminated = 'Terminated',
}

export enum AllowanceLevel {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export enum DocumentType {
  AutoDecPage = 'Auto Dec Page',
  UmbrellaDecPage = 'Umbrella Dec Page',
  WindowSticker = 'Window Sticker',
  Endorsement = 'Endorsement',
  Other = 'Other',
}

export enum PolicyType {
  Auto = 'Auto',
  UmbrellaPersonalExcess = 'Umbrella-Personal Excess',
}

export enum EndorsementType {
  AdditionalInsured = 'Additional Insured',
  AdditionalInterest = 'Additional Interest',
}

export enum BodyType {
  Pickup = 'Pickup',
  SUV = 'SUV',
  Other = 'Other',
}

export enum AIProcessingStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Failed = 'Failed',
}

export enum DecisionType {
  Approved = 'Approved',
  Returned = 'Returned',
  Rejected = 'Rejected',
}

export enum AllowanceRecordStatus {
  Active = 'Active',
  Suspended = 'Suspended',
  Terminated = 'Terminated',
}

export enum PayrollVerificationStatus {
  Pending = 'Pending',
  Verified = 'Verified',
  NotFound = 'Not Found',
  AmountMismatch = 'Amount Mismatch',
  Failed = 'Failed',
}

export enum UserRole {
  Employee = 'Employee',
  EquipmentLeader = 'EquipmentLeader',
  Director = 'Director',
  Admin = 'Admin',
  Payroll = 'Payroll',
}

// ─── Dataverse table types (9-table model) ────────────────────────────────────

export interface AllowanceApplication {
  va_allowanceapplicationid?: string
  va_name?: string
  va_applicantid?: string
  va_personnelnumber?: string
  va_applicationType?: ApplicationType
  va_status?: ApplicationStatus
  va_allowanceLevel?: AllowanceLevel
  va_monthlyAllowanceAmount?: number
  va_isElectricVehicle?: boolean
  va_evChargingAllowance?: number
  va_totalMonthlyAllowance?: number
  va_effectiveDate?: string
  va_submittedOn?: string
  va_eligibilityDeadline?: string
  va_companyEntityId?: string
  va_companyEntityName?: string
  va_equipmentLeaderDecision?: DecisionType
  va_equipmentLeaderReviewDate?: string
  va_equipmentLeaderNotes?: string
  va_directorDecision?: DecisionType
  va_directorReviewDate?: string
  va_directorNotes?: string
  va_payrollNotifiedDate?: string
  va_aiValidationScore?: number
  va_aiValidationSummary?: string
  va_aiFlaggedIssues?: string
  va_aiAutoApprovalEligible?: boolean
  va_parentApplicationId?: string
}

export interface Vehicle {
  va_vehicleid?: string
  va_name?: string
  va_applicationId?: string
  va_vin?: string
  va_vinConfirmed?: boolean
  va_make?: string
  va_model?: string
  va_year?: number
  va_bodyType?: BodyType
  va_msrpTotal?: number
  va_msrpConfirmed?: boolean
  va_isElectric?: boolean
  va_meetsYearRequirement?: boolean
  va_meetsMsrpRequirement?: boolean
  va_meetsBodyTypeRequirement?: boolean
  va_preApprovedByEquipmentLeader?: boolean
  va_preApprovalDate?: string
  va_dynamicsAssetId?: string
}

export interface InsurancePolicy {
  va_insurancepolicyid?: string
  va_name?: string
  va_applicationId?: string
  va_employeeId?: string
  va_personnelnumber?: string
  va_policyType?: PolicyType
  va_carrierName?: string
  va_policyNumber?: string
  va_effectiveDate?: string
  va_expirationDate?: string
  va_coverageLimitCSL?: number
  va_coverageLimitBiPerPerson?: number
  va_coverageLimitBiPerAccident?: number
  va_coverageLimitPd?: number
  va_umbrellaLimit?: number
  va_endorsementType?: EndorsementType
  va_meetsLiabilityRequirement?: boolean
  va_meetsUmbrellaRequirement?: boolean
  va_meetsEndorsementRequirement?: boolean
  va_listedVehicles?: string
  va_qualifyingVehicleConfirmed?: boolean
  va_checkedVin?: string
  va_aiExtractionConfidence?: number
  va_status?: 'Active' | 'Expired' | 'Superseded'
  va_lastReminderSentDate?: string
  va_lastReminderType?: string
}

export interface VADocument {
  va_documentid?: string
  va_name?: string
  va_applicationId?: string
  va_documentType?: DocumentType
  va_uploadedOn?: string
  va_uploadedByUserId?: string
  va_aiProcessingStatus?: AIProcessingStatus
  va_aiExtractedData?: string
  va_aiConfidenceScore?: number
  va_reviewStatus?: 'Pending Review' | 'Accepted' | 'Rejected'
  va_rejectionReason?: string
  va_linkedPolicyId?: string
  va_linkedVehicleId?: string
}

export interface AllowanceRecord {
  va_allowancerecordid?: string
  va_name?: string
  va_employeeId?: string
  va_personnelnumber?: string
  va_originalApplicationId?: string
  va_currentVehicleId?: string
  va_allowanceLevel?: AllowanceLevel
  va_monthlyAmount?: number
  va_evChargingAmount?: number
  va_totalMonthlyAmount?: number
  va_effectiveDate?: string
  va_status?: AllowanceRecordStatus
  va_companyEntityId?: string
  va_nextRenewalDue?: string
  va_optOutRequestedDate?: string
  va_optOutEffectiveDate?: string
  va_terminationReason?: string
  // Payroll earn code verification
  va_payrollVerificationStatus?: PayrollVerificationStatus
  va_payrollVerifiedDate?: string
  va_payrollEarnCode?: string
  va_payrollAmount?: number
  va_payrollAmountMismatch?: boolean
  va_payrollVerificationNotes?: string
}

export interface AuditLog {
  va_auditlogid?: string
  va_name?: string
  va_eventType?: string
  va_previousStatus?: string
  va_newStatus?: string
  va_performedByName?: string
  va_notes?: string
  va_eventDate?: string
  va_applicationId?: string
}

export interface CompanyEntity {
  va_companyentityid?: string
  va_name?: string
  va_shortcode?: string
  va_endorsementaddressline1?: string
  va_endorsementaddressline2?: string
  va_endorsementattn?: string
  va_isactive?: boolean
}

export interface AllowanceLevelConfig {
  va_allowancelevelconfigid?: string
  va_name?: string
  va_level?: AllowanceLevel
  va_minimumMsrp?: number
  va_monthlyAllowance?: number
  va_evChargingAmount?: number
  va_effectiveFrom?: string
  va_isCurrentRate?: boolean
}

export interface ReminderConfig {
  va_reminderconfigid?: string
  va_reminderDays1?: number
  va_reminderDays2?: number
  va_reminderDays3?: number
  va_gracePeriodDays?: number
  va_isActive?: boolean
}

// ─── AI extraction result shapes ──────────────────────────────────────────────

export interface ListedVehicle {
  vin?: string
  year?: number
  make?: string
  model?: string
}

export interface InsuranceExtractionResult {
  carrier_name?: string
  policy_number?: string
  insured_name?: string
  policy_period_start?: string
  policy_period_end?: string
  csl_limit?: number
  bi_per_person?: number
  bi_per_accident?: number
  pd_limit?: number
  umbrella_limit?: number
  endorsement_type?: 'Additional Insured' | 'Additional Interest'
  additional_insured_entity?: string
  listed_vehicles?: ListedVehicle[]
  confidence_scores?: Record<string, number>
}

export interface WindowStickerExtractionResult {
  vin?: string
  total_msrp?: number
  vehicle_description?: string
  model_year?: number
  make?: string
  model?: string
  powertrain_description?: string
  is_electric?: boolean
  confidence_scores?: Record<string, number>
}

// ─── Flow action payloads ────────────────────────────────────────────────────

export interface EligibilityCheckResult {
  isEligible: boolean
  personnelNumber?: string
  jobTitle?: string
  company?: string
  defaultAllowanceLevel?: AllowanceLevel
  eligibilityDeadline?: string
  ineligibilityReason?: string
}

// ─── UI-only types ───────────────────────────────────────────────────────────

export interface ApplicationStep {
  label: string
  status: ApplicationStatus
  completedAt?: string
  notes?: string
}

export type ValidationResult = {
  field: string
  passes: boolean
  message: string
}

export interface ChecklistItemState {
  documentType: DocumentType
  label: string
  required: boolean
  satisfied: boolean
  documentId?: string
  aiStatus?: AIProcessingStatus
}
