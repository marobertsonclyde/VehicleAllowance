# Flow 2: AI Document Validation (Child Flow)

**Trigger:** Manual (child flow) — Input: `applicationId` (string)

**Actions:**
1. Get all va_Document records for this application
2. Get application record (need company entity for endorsement validation)
3. Get va_CompanyEntity for the application's company
4. **For each document** (parallel, max concurrency 4):
   a. Classify document with `va_DocumentClassifier` AI model
   b. Switch on classified type:
      - **Auto Dec Page:** Extract with `va_InsuranceDocumentExtractor`. Create/update va_InsurancePolicy (policyType=Auto). Validate: CSL >= $500K OR (BI/person >= $250K AND BI/accident >= $500K AND PD >= $100K). Check VIN in listed_vehicles array. Set `va_meetsLiabilityRequirement`, `va_qualifyingVehicleConfirmed`.
      - **Umbrella Dec Page:** Extract with `va_InsuranceDocumentExtractor`. Create/update va_InsurancePolicy (policyType=Umbrella). Validate: Additional Insured >= $1M, Additional Interest >= $2M. Set `va_meetsUmbrellaRequirement`, `va_meetsEndorsementRequirement`.
      - **Endorsement:** Extract. Validate endorsement entity matches company entity address/name. Set `va_meetsEndorsementRequirement`.
      - **Window Sticker:** Extract with `va_WindowStickerExtractor`. Update va_Vehicle with extracted MSRP, VIN, make, model, year. Set `va_msrpConfirmed`, `va_vinConfirmed`.
   c. Update va_Document: set `va_aiProcessingStatus = Completed`, `va_aiExtractedData`, `va_aiConfidenceScore`
   d. On error: set `va_aiProcessingStatus = Failed`
5. Calculate composite AI score: average of all document confidence scores, weighted by validation pass/fail
6. Update application: `va_aiValidationScore`, `va_aiValidationSummary`, `va_aiFlaggedIssues`, `va_aiAutoApprovalEligible` (true if score >= threshold env var AND all requirements met)
7. Call Flow 3 with `applicationId`, `aiScore`, `aiAutoApprovalEligible`

**Outputs:** None
