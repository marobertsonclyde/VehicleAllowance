# Dataverse Tables — Build Reference

Publisher prefix: `va_`. All tables UserOwned unless noted.

---

## 1. va_AllowanceApplication

Core entity tracking an employee's allowance application through its lifecycle.

| Field | Type | Required | Notes |
|---|---|---|---|
| va_allowanceapplicationid | PK GUID | Auto | |
| va_name | Text(100) | Auto | Format: VA-YYYY-NNNNN (set by Flow 1) |
| va_applicantid | Lookup → SystemUser | Yes | Owner/applicant |
| va_personnelnumber | Text(20) | Yes | From Fabric SQL |
| va_applicationType | Choice | Yes | Options: New Opt-In, Vehicle Update, Annual Renewal |
| va_status | Choice | Yes | Options: Draft, Submitted, AI Review, Equipment Leader Review, Director Review, Payroll Notification, Active, Rejected, Returned to Employee, Withdrawn, Terminated |
| va_allowanceLevel | Choice | No | Options: A, B, C, D |
| va_monthlyAllowanceAmount | Currency | No | |
| va_isElectricVehicle | Boolean | No | Default: No |
| va_evChargingAllowance | Currency | No | $330 when EV |
| va_totalMonthlyAllowance | Currency | No | Calculated: monthly + EV charging |
| va_effectiveDate | Date | No | Set by Flow 6 (15th/16th rule) |
| va_submittedOn | DateTime | No | Set by Flow 1 |
| va_eligibilityDeadline | Date | No | From eligibility check flow |
| va_companyEntityId | Lookup → va_CompanyEntity | No | |
| va_equipmentLeaderDecision | Choice | No | Options: Approved, Returned, Rejected |
| va_equipmentLeaderReviewDate | DateTime | No | |
| va_equipmentLeaderNotes | Multiline Text | No | Field-level security: hidden from Employee role |
| va_directorDecision | Choice | No | Options: Approved, Returned, Rejected |
| va_directorReviewDate | DateTime | No | |
| va_directorNotes | Multiline Text | No | Field-level security: hidden from Employee role |
| va_payrollNotifiedDate | DateTime | No | |
| va_aiValidationScore | Decimal(0-100) | No | |
| va_aiValidationSummary | Multiline Text | No | |
| va_aiFlaggedIssues | Multiline Text | No | |
| va_aiAutoApprovalEligible | Boolean | No | |
| va_parentApplicationId | Lookup → self | No | Links renewals/updates to original |

---

## 2. va_Vehicle

Vehicle details for an application.

| Field | Type | Required | Notes |
|---|---|---|---|
| va_vehicleid | PK GUID | Auto | |
| va_name | Text(100) | Auto | |
| va_applicationId | Lookup → va_AllowanceApplication | Yes | |
| va_vin | Text(17) | Yes | |
| va_vinConfirmed | Boolean | No | Set by AI (VIN found on policy) |
| va_make | Text(50) | Yes | |
| va_model | Text(50) | Yes | |
| va_year | Whole Number | Yes | |
| va_bodyType | Choice | Yes | Options: Pickup, SUV, Other |
| va_msrpTotal | Currency | Yes | |
| va_msrpConfirmed | Boolean | No | Set by AI (window sticker extraction) |
| va_isElectric | Boolean | No | |
| va_meetsYearRequirement | Boolean | No | |
| va_meetsMsrpRequirement | Boolean | No | |
| va_meetsBodyTypeRequirement | Boolean | No | |
| va_preApprovedByEquipmentLeader | Boolean | No | |
| va_preApprovalDate | DateTime | No | |
| va_dynamicsAssetId | Text(50) | No | Dynamics 365 asset reference |

---

## 3. va_InsurancePolicy

Insurance policy details, created/updated by AI document processing.

| Field | Type | Required | Notes |
|---|---|---|---|
| va_insurancepolicyid | PK GUID | Auto | |
| va_name | Text(100) | Auto | |
| va_applicationId | Lookup → va_AllowanceApplication | No | |
| va_employeeId | Lookup → SystemUser | Yes | |
| va_personnelnumber | Text(20) | No | |
| va_policyType | Choice | Yes | Options: Auto, Umbrella-Personal Excess |
| va_carrierName | Text(100) | No | AI-extracted |
| va_policyNumber | Text(50) | No | AI-extracted |
| va_effectiveDate | Date | No | AI-extracted |
| va_expirationDate | Date | No | AI-extracted — used by Flow 7 |
| va_coverageLimitCSL | Currency | No | Combined Single Limit |
| va_coverageLimitBiPerPerson | Currency | No | |
| va_coverageLimitBiPerAccident | Currency | No | |
| va_coverageLimitPd | Currency | No | Property Damage |
| va_umbrellaLimit | Currency | No | |
| va_endorsementType | Choice | No | Options: Additional Insured, Additional Interest |
| va_meetsLiabilityRequirement | Boolean | No | Computed by Flow 2/8 |
| va_meetsUmbrellaRequirement | Boolean | No | Computed by Flow 2/8 |
| va_meetsEndorsementRequirement | Boolean | No | Computed by Flow 2/8 |
| va_listedVehicles | Multiline Text | No | JSON: [{vin, year, make, model}] |
| va_qualifyingVehicleConfirmed | Boolean | No | VIN found in listed vehicles |
| va_checkedVin | Text(17) | No | VIN that was looked up |
| va_aiExtractionConfidence | Decimal | No | |
| va_status | Choice | No | Options: Active, Expired, Superseded |
| va_lastReminderSentDate | DateTime | No | Tracks last reminder to prevent duplicates |
| va_lastReminderType | Text(50) | No | e.g. "Reminder1", "Reminder2", "GracePeriod" |

---

## 4. va_Document

Uploaded documents with AI processing status and extraction results.

| Field | Type | Required | Notes |
|---|---|---|---|
| va_documentid | PK GUID | Auto | |
| va_name | Text(100) | Auto | |
| va_applicationId | Lookup → va_AllowanceApplication | Yes | |
| va_documentType | Choice | Yes | Options: Auto Dec Page, Umbrella Dec Page, Window Sticker, Endorsement, Other |
| va_fileReference | File | Yes | Binary file column |
| va_uploadedOn | DateTime | Auto | |
| va_uploadedByUserId | Lookup → SystemUser | Auto | |
| va_aiProcessingStatus | Choice | Yes | Options: Pending, Processing, Completed, Failed |
| va_aiExtractedData | Multiline Text | No | JSON blob of extraction results |
| va_aiConfidenceScore | Decimal | No | 0-100 |
| va_reviewStatus | Choice | No | Options: Pending Review, Accepted, Rejected |
| va_rejectionReason | Multiline Text | No | |
| va_linkedPolicyId | Lookup → va_InsurancePolicy | No | |
| va_linkedVehicleId | Lookup → va_Vehicle | No | |

---

## 5. va_AllowanceRecord

The "living" active allowance state for an enrolled employee.

| Field | Type | Required | Notes |
|---|---|---|---|
| va_allowancerecordid | PK GUID | Auto | |
| va_name | Text(100) | Auto | |
| va_employeeId | Lookup → SystemUser | Yes | |
| va_personnelnumber | Text(20) | Yes | |
| va_originalApplicationId | Lookup → va_AllowanceApplication | Yes | |
| va_currentVehicleId | Lookup → va_Vehicle | No | |
| va_allowanceLevel | Choice | Yes | A, B, C, D |
| va_monthlyAmount | Currency | Yes | |
| va_evChargingAmount | Currency | No | |
| va_totalMonthlyAmount | Currency | Yes | |
| va_effectiveDate | Date | Yes | |
| va_status | Choice | Yes | Options: Active, Suspended, Terminated |
| va_companyEntityId | Lookup → va_CompanyEntity | No | |
| va_nextRenewalDue | Date | No | Next Aug 1 |
| va_optOutRequestedDate | Date | No | |
| va_optOutEffectiveDate | Date | No | Jan 1 of following year |
| va_terminationReason | Multiline Text | No | |

---

## 6. va_AuditLog

**Ownership: Organization-owned** (immutable compliance record).

| Field | Type | Required | Notes |
|---|---|---|---|
| va_auditlogid | PK GUID | Auto | |
| va_name | Text(100) | Auto | |
| va_eventType | Text(100) | Yes | e.g. "StatusChange", "Decision", "Submission" |
| va_previousStatus | Text(100) | No | |
| va_newStatus | Text(100) | No | |
| va_performedByName | Text(200) | Yes | |
| va_notes | Multiline Text | No | |
| va_eventDate | DateTime | Yes | |
| va_applicationId | Lookup → va_AllowanceApplication | Yes | |

---

## 7. va_CompanyEntity

**Ownership: Organization-owned.** Pre-seeded with 9 company entities.

| Field | Type | Required | Notes |
|---|---|---|---|
| va_companyentityid | PK GUID | Auto | |
| va_name | Text(100) | Yes | e.g. "Clyde Companies, Inc." |
| va_shortcode | Text(10) | Yes | e.g. "CCI" |
| va_endorsementaddressline1 | Text(200) | No | |
| va_endorsementaddressline2 | Text(200) | No | |
| va_endorsementattn | Text(200) | No | |
| va_isactive | Boolean | Yes | Default: Yes |

---

## 8. va_AllowanceLevelConfig

**Ownership: Organization-owned.** Updated annually by Director/Admin.

| Field | Type | Required | Notes |
|---|---|---|---|
| va_allowancelevelconfigid | PK GUID | Auto | |
| va_name | Text(100) | Auto | |
| va_level | Choice | Yes | A, B, C, D |
| va_minimumMsrp | Currency | Yes | MSRP threshold for this level |
| va_monthlyAllowance | Currency | Yes | Monthly payment amount |
| va_evChargingAmount | Currency | No | EV supplement ($330 default) |
| va_effectiveFrom | Date | No | Supports future-dated rates |
| va_isCurrentRate | Boolean | Yes | Only one set of current rates |

---

## 9. va_ReminderConfig

**Ownership: Organization-owned.** Single active record.

| Field | Type | Required | Notes |
|---|---|---|---|
| va_reminderconfigid | PK GUID | Auto | |
| va_reminderDays1 | Whole Number | Yes | e.g. 45 |
| va_reminderDays2 | Whole Number | Yes | e.g. 30 |
| va_reminderDays3 | Whole Number | Yes | e.g. 14 |
| va_gracePeriodDays | Whole Number | Yes | e.g. 30 |
| va_isActive | Boolean | Yes | |

---

## Global Option Sets

Create these as global option sets (reusable across tables):

| Name | Values |
|---|---|
| va_applicationstatus | Draft(0), Submitted(1), AI Review(2), Equipment Leader Review(3), Director Review(4), Payroll Notification(5), Active(6), Rejected(7), Returned to Employee(8), Withdrawn(9), Terminated(10) |
| va_applicationtype | New Opt-In(0), Vehicle Update(1), Annual Renewal(2) |
| va_allowancelevel | A(0), B(1), C(2), D(3) |
| va_reviewerdecision | Approved(0), Returned(1), Rejected(2) |
| va_aiprocessingstatus | Pending(0), Processing(1), Completed(2), Failed(3) |
| va_documenttype | Auto Dec Page(0), Umbrella Dec Page(1), Window Sticker(2), Endorsement(3), Other(4) |
| va_policytype | Auto(0), Umbrella-Personal Excess(1) |
| va_endorsementtype | Additional Insured(0), Additional Interest(1) |
| va_bodytype | Pickup(0), SUV(1), Other(2) |
| va_allowancerecordstatus | Active(0), Suspended(1), Terminated(2) |
| va_policystatus | Active(0), Expired(1), Superseded(2) |
| va_documentreviewstatus | Pending Review(0), Accepted(1), Rejected(2) |
