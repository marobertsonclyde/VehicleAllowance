# AI Model Training Guide

## Overview

The Vehicle Allowance solution uses four AI Builder models. Three require custom training with real document samples. Training data is **not stored in this git repository** due to PII in insurance documents and vehicle records.

**Training data location:** SharePoint document library — contact the CCI Equipment Department for access.

---

## Model 1: va_InsuranceDocumentExtractor

**Type:** AI Builder Custom Form Processing  
**What it extracts:** Structured fields from auto insurance and umbrella/excess liability declaration pages

### Training Data Requirements

| Requirement | Target |
|---|---|
| Minimum samples | 25 documents |
| Recommended samples | 50+ documents |
| Document formats | PDF (preferred), JPEG, PNG |
| Carriers to include | State Farm, GEICO, Progressive, Allstate, Farmers, Nationwide, Liberty Mutual, Travelers, USAA |

**Where to get samples:** Request anonymized/redacted dec page samples from the Equipment Department. Employees who consent can provide copies of their current dec pages. Use at least 3 different carriers' layouts.

### Fields to Label in AI Builder Studio

Label these field regions in every training document:

| Field Name | What to Highlight | Notes |
|---|---|---|
| `carrier_name` | Insurance company name (header/logo area) | Usually top of page |
| `policy_number` | Policy number | Often "Policy No." or "Policy #" |
| `insured_name` | Named insured | Employee's name |
| `policy_period_start` | Policy effective date | Look for "Effective Date" or "Policy Period" start |
| `policy_period_end` | Policy expiration date | **Most critical field** — drives reminder schedule |
| `csl_limit` | Combined Single Limit | For auto policies listing CSL rather than split limits |
| `bi_per_person` | Bodily Injury per person | For split-limit auto policies |
| `bi_per_accident` | Bodily Injury per occurrence | For split-limit auto policies |
| `pd_limit` | Property Damage | For split-limit auto policies |
| `umbrella_limit` | Umbrella/excess limit | For umbrella dec pages |
| `endorsement_type` | Additional Insured or Additional Interest | May appear as text label or form checkbox |
| `additional_insured_entity` | Name of the additional insured entity | Should match one of the 8 legal entity names |

### Validation Logic (applied after extraction in Flow 2)

**Auto Dec Page — passes if:**
- `csl_limit` ≥ 500,000  
  **OR**
- `bi_per_person` ≥ 250,000 AND `bi_per_accident` ≥ 500,000 AND `pd_limit` ≥ 100,000

**Umbrella Dec Page — passes if:**
- Endorsement type = Additional Insured → `umbrella_limit` ≥ 1,000,000
- Endorsement type = Additional Interest → `umbrella_limit` ≥ 2,000,000

**Endorsement check — passes if:**
- `additional_insured_entity` fuzzy-matches one of the 8 company legal entity names
  (normalize punctuation, handle "LLC" vs "LLC.", "Inc" vs "Inc.", etc.)

### Confidence Thresholds

- ≥ 0.70 per field: auto-populate field in Dataverse
- < 0.70: flag field as "AI uncertain" — Equipment Leader reviews raw document
- Application composite score below threshold: route to Equipment Leader (no fast-track)

### Training Process

1. Go to [make.powerapps.com](https://make.powerapps.com) → AI Builder → Models → + New model → Document processing
2. Select "Structured and semi-structured documents"
3. Create 2 collections: "Auto Dec Page" and "Umbrella Dec Page"
4. Upload 15+ sample documents per collection
5. Label all fields listed above in each document
6. Click Train — training takes 20–60 minutes
7. Test with 5 unseen documents; verify field-level accuracy ≥ 80%
8. If accuracy is low on a specific field, add more training documents with diverse layouts for that field
9. Publish when accuracy is acceptable

---

## Model 2: va_WindowStickerExtractor

**Type:** AI Builder Custom Form Processing  
**What it extracts:** Vehicle details from Manufacturer's Window Sticker (Monroney label)

### Training Data Requirements

| Requirement | Target |
|---|---|
| Minimum samples | 30 documents |
| Recommended samples | 50+ documents |
| Document formats | PDF, JPEG, PNG (phone photos acceptable) |
| Makes to include | Ford, GM (Chevy/GMC/Cadillac), RAM, Toyota, Lexus, Jeep (at minimum) |

**Where to get samples:** Request window sticker images from current allowance recipients (with consent) or from the Equipment Department's records. Manufacturer dealer websites sometimes provide sample stickers for common models.

### Fields to Label

| Field Name | What to Highlight | Notes |
|---|---|---|
| `vin` | Vehicle Identification Number | 17 characters, appears as barcode + text |
| `total_msrp` | Total Suggested Retail Price | **Bottom box on the sticker** — labeled "Total Suggested Retail Price" or "Total MSRP". Do NOT use intermediate subtotals |
| `vehicle_description` | Year, Make, Model, Trim | Usually large text near top |
| `model_year` | Model year | Often part of vehicle_description |
| `powertrain_description` | Engine/powertrain description | Look for "Electric", "EV", "Plug-In Hybrid", "PHEV", "BEV" |

### Validation Logic (applied after extraction in Flow 2)

- **VIN format:** 17 alphanumeric characters, no I, O, or Q
- **Model year:** (current calendar year) − year ≤ 5
  - Example for 2026: vehicles from 2021+ are eligible
- **Body type:** Cannot be determined from window sticker; rely on employee-entered field. AI warns if model name contains "Sedan", "Coupe", "Hatchback", "Cargo Van"
- **MSRP:** total_msrp ≥ minimum for selected allowance level (from va_AllowanceLevelConfig)
- **Electric:** flag `va_isElectric = true` if powertrain_description contains: Electric, EV, BEV, PHEV, Plug-In Hybrid (case-insensitive)

---

## Model 3: va_DocumentClassifier

**Type:** AI Builder Custom Classification  
**What it does:** Classifies uploaded files by document type before extraction

### Training Data Requirements

| Class | Minimum Samples | Notes |
|---|---|---|
| Auto Dec Page | 10 | Varies by carrier |
| Umbrella Dec Page | 10 | Often shorter/simpler than auto |
| Window Sticker | 10 | Various makes |
| Endorsement | 10 | Additional insured/interest endorsement forms |
| Unknown/Other | 5 | Intentionally wrong document types |

### Training Process

1. AI Builder → + New model → Category classification
2. Create 5 categories (class labels above)
3. Upload and label training documents per class
4. Train and evaluate
5. Minimum acceptable accuracy: 0.80 overall; 0.60 per class before routing to manual review

### Usage in Flow 8

- Run classifier FIRST on every uploaded document
- If classified type ≠ declared type: flag for Equipment Leader review (don't auto-reject)
- If confidence < 0.60: set `va_documentType = 'Other'`, notify Equipment Leader to reclassify

---

## Model 4: va_EmailDraftingPrompt (No Training Required)

**Type:** AI Builder Prompt (GPT-based)  
**No custom training needed** — uses base GPT capabilities with structured prompts

### Prompt Templates

Store these as Power Platform Prompts in the solution. Each prompt is used in the listed flows.

**Template: Approval Notification (Flow 6)**
```
You are the Vehicle Allowance program coordinator at Clyde Companies.
Draft a professional Teams message to {EmployeeName} confirming their
vehicle allowance application {ApplicationNumber} has been approved.

Details:
- Allowance Level: {AllowanceLevel}
- Monthly Allowance: ${MonthlyAmount}/month
- Effective Date: {EffectiveDate}
{if EVehicle: - EV Charging Allowance: $330/month (no fuel card will be issued)}

Remind them they must maintain required insurance coverage and submit
updated declaration pages on every policy renewal. Keep the tone
professional and warm. 150-200 words. Do not include any information
not provided above.
```

**Template: Return to Employee (Flows 4, 5)**
```
You are the Vehicle Allowance program coordinator at Clyde Companies.
Draft a professional Teams message to {EmployeeName} explaining their
vehicle allowance application {ApplicationNumber} has been returned
for corrections.

Reviewer notes: {ReviewerNotes}

Request the specific corrections noted above. Tell them to resubmit
through the Vehicle Allowance Portal. Keep tone constructive and helpful.
100-150 words.
```

**Template: Rejection (Flows 4, 5, 6)**
```
You are the Vehicle Allowance program coordinator at Clyde Companies.
Draft a professional Teams message to {EmployeeName} explaining their
vehicle allowance application {ApplicationNumber} has been declined.

Reason: {ReviewerNotes}

Mention they may contact the Equipment Department with questions.
Keep tone respectful and professional. 100-150 words.
```

**Template: Insurance Expiry Reminder (Flow 7)**
```
Draft a Teams reminder message to {EmployeeName} that their {PolicyType}
insurance policy expires on {ExpirationDate} ({DaysUntilExpiry} days from today).

They must upload updated declaration pages to the Vehicle Allowance Portal
to maintain their allowance. Failure to do so within {GracePeriodDays} days
after expiry will result in allowance termination.

Portal link: {PortalUrl}

Professional tone, brief, 75-100 words.
```

**Template: Payroll Notification (Flow 6)**
```
Draft a Teams message to the Payroll team notifying them of a new
Vehicle Allowance recipient.

Employee: {EmployeeName}
Personnel Number: {PersonnelNumber}
Company: {CompanyName}
Allowance Level: {AllowanceLevel}
Monthly Amount: ${MonthlyAmount}/month
{if EV: EV Charging Allowance: $330/month (no fuel card)}
Effective Date: {EffectiveDate}

Action required: Add allowance to first payroll of {EffectiveMonth}.
No fuel card to be issued {if EV: (EV recipient)}.

Professional tone, under 100 words.
```

---

## Retraining Schedule

- **Initial:** After go-live, review AI extraction accuracy weekly for the first month
- **Ongoing:** Retrain quarterly or when accuracy drops below 75% on any field
- **Trigger for immediate retraining:** Any carrier format not in training set appearing in production (add 5+ samples, retrain)
- **Where to track accuracy:** AI Builder model detail page in Power Platform admin center → "Last training" → field-level confidence report

## Training Data Storage

**SharePoint library:** `CCI Equipment > Vehicle Allowance Program > AI Training Data`  
Structure:
```
AI Training Data/
├── Insurance Dec Pages/
│   ├── Auto/
│   │   ├── StateFarm/
│   │   ├── GEICO/
│   │   └── ...
│   └── Umbrella/
├── Window Stickers/
│   ├── Ford/
│   ├── Toyota/
│   └── ...
├── Endorsements/
└── README.md   ← who to contact for access
```

Access restricted to: Equipment Department, Power Platform Administrators
