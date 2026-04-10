# Flow 8: Document Upload AI Processing

**Trigger:** Dataverse — When va_Document is created with va_aiProcessingStatus = "Pending"

**Actions:**
1. Update document: va_aiProcessingStatus → "Processing"
2. Get document details + download file content from va_fileReference
3. **Classify** with `va_DocumentClassifier` AI model → get document type + confidence
4. Update document: va_documentType = classified type
5. **Switch on type:**
   - **Auto Dec Page:**
     a. Extract with `va_InsuranceDocumentExtractor`
     b. Get linked vehicle VIN from application's va_Vehicle
     c. Parse listed_vehicles from extraction, check if vehicle VIN exists
     d. Validate coverage: CSL >= $500K OR (BI/person >= $250K AND BI/accident >= $500K AND PD >= $100K)
     e. Create/update va_InsurancePolicy with extracted fields
     f. Set va_meetsLiabilityRequirement, va_qualifyingVehicleConfirmed
   - **Umbrella Dec Page:**
     a. Extract with `va_InsuranceDocumentExtractor`
     b. Validate: umbrella limit meets requirements
     c. Get application's company entity, validate endorsement entity matches
     d. Create/update va_InsurancePolicy
     e. Set va_meetsUmbrellaRequirement, va_meetsEndorsementRequirement
   - **Endorsement:**
     a. Extract endorsement details
     b. Validate entity name/address matches company entity
     c. Update linked InsurancePolicy with endorsement info
   - **Window Sticker:**
     a. Extract with `va_WindowStickerExtractor`
     b. Update va_Vehicle: MSRP, VIN, make, model, year, isElectric
     c. Set va_msrpConfirmed = true, va_vinConfirmed = (extracted VIN matches entered VIN)
6. Update document: va_aiProcessingStatus → "Completed", va_aiExtractedData = JSON, va_aiConfidenceScore
7. **Error handler (scope):** On failure → va_aiProcessingStatus → "Failed", notify Equipment Leader

**Key Validation Rules:**
- Auto liability: CSL >= $500,000 OR (BI/person >= $250K AND BI/accident >= $500K AND PD >= $100K)
- Umbrella: Additional Insured >= $1,000,000, Additional Interest >= $2,000,000
- VIN must appear in the policy's listed vehicles array
- Endorsement entity must match the application's company entity
