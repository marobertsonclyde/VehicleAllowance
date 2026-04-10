# AI Builder Models — Build Reference

---

## Model 1: va_DocumentClassifier

**Type:** Custom Classification

**Categories:**
- Auto Dec Page
- Umbrella Dec Page
- Window Sticker
- Endorsement
- Unknown

**Training Requirements:**
- Minimum 10 samples per category (25+ recommended)
- 5+ "Unknown" samples (random non-insurance documents)
- Diverse carriers: State Farm, GEICO, Progressive, Allstate, USAA, Farmers, etc.
- Both PDF and image formats

**Confidence Threshold:** >= 0.60 to accept classification. Below → classify as Unknown and flag for manual review.

---

## Model 2: va_InsuranceDocumentExtractor

**Type:** Custom Document Processing (Form Processing)

**Collections:** Auto Dec Page, Umbrella Dec Page

**Fields to Extract:**

| Field | Type | Required | Notes |
|---|---|---|---|
| carrier_name | Text | Yes | Insurance company name |
| policy_number | Text | Yes | |
| insured_name | Text | Yes | Policyholder name |
| policy_period_start | Date | Yes | |
| policy_period_end | Date | Yes | Used for expiry tracking |
| csl_limit | Currency | No | Combined Single Limit (auto only) |
| bi_per_person | Currency | No | Bodily Injury per person |
| bi_per_accident | Currency | No | Bodily Injury per accident |
| pd_limit | Currency | No | Property Damage |
| umbrella_limit | Currency | No | Umbrella/excess limit |
| endorsement_type | Text | No | "Additional Insured" or "Additional Interest" |
| additional_insured_entity | Text | No | Company name on endorsement |
| listed_vehicles | Table | No | Rows: vin, year, make, model |

**Training Requirements:**
- 25+ samples minimum, 50+ recommended
- Diverse carriers and policy formats
- Both split-limit and CSL formats for auto policies
- Include multi-vehicle policies (2-4 vehicles common)

**Confidence Threshold:** >= 0.70 per field

---

## Model 3: va_WindowStickerExtractor

**Type:** Custom Document Processing (Form Processing)

**Fields to Extract:**

| Field | Type | Required | Notes |
|---|---|---|---|
| vin | Text | Yes | 17-character VIN |
| total_msrp | Currency | Yes | Total MSRP from sticker |
| vehicle_description | Text | No | Full vehicle description line |
| model_year | Number | Yes | |
| make | Text | Yes | e.g. Ford, RAM, Toyota |
| model | Text | Yes | e.g. F-150, 1500, Tacoma |
| powertrain_description | Text | No | Engine/motor description |

**Training Requirements:**
- 30+ samples minimum
- Diverse makes: Ford, GM (Chevrolet/GMC), RAM, Toyota, Honda, etc.
- Include both ICE and EV stickers (EV stickers have different layout)
- Both PDF scans and photos

**Confidence Threshold:** >= 0.70 per field

---

## Training Data Location

Store training samples in SharePoint: `Vehicle Allowance / AI Training Data /`
- `/Auto Dec Pages/`
- `/Umbrella Dec Pages/`
- `/Window Stickers/`
- `/Endorsements/`
- `/Unknown/`
