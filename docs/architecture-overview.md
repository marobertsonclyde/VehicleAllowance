# Architecture Overview — Vehicle Allowance Program

## System Context

The Vehicle Allowance Program system digitalizes the intake, approval, and ongoing monitoring of employee vehicle allowances at Clyde Companies. It replaces a paper/email-based process with structured workflows, AI-assisted document review, and automated insurance compliance monitoring.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSOFT POWER PLATFORM                     │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │  Employee Portal │    │     Admin / Review App           │  │
│  │  (Canvas App)    │    │     (Model-Driven App)           │  │
│  └────────┬─────────┘    └──────────────┬───────────────────┘  │
│           │                             │                       │
│           ▼                             ▼                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    DATAVERSE                            │   │
│  │  13 custom tables  |  Security roles  |  Audit log      │   │
│  └──────────────────────────────┬──────────────────────────┘   │
│                                 │                               │
│  ┌──────────────────────────────▼──────────────────────────┐   │
│  │              POWER AUTOMATE FLOWS (8)                   │   │
│  │  Intake → AI Validation → Routing → Approvals →         │   │
│  │  AllowanceRecord → Insurance Monitoring                  │   │
│  └───────┬───────────────────────────────┬─────────────────┘   │
│          │                               │                      │
│  ┌───────▼────────┐             ┌────────▼──────────┐          │
│  │  AI BUILDER    │             │  COPILOT STUDIO   │          │
│  │  • InsuranceDoc│             │  va_AllowanceAsst │          │
│  │  • WindowStick │             │  (help widget +   │          │
│  │  • DocClassify │             │   Teams bot)      │          │
│  │  • EmailDraft  │             └───────────────────┘          │
│  └────────────────┘                                            │
└──────────────────────────────────────────────┬─────────────────┘
                                               │
            ┌──────────────────────────────────┤
            │                                  │
   ┌────────▼──────────┐             ┌─────────▼──────────┐
   │  MICROSOFT FABRIC │             │   MICROSOFT TEAMS  │
   │  Lakehouse SQL    │             │   Adaptive cards   │
   │  (employee data   │             │   Channel messages │
   │   from Dynamics)  │             └────────────────────┘
   └───────────────────┘
```

## Application Lifecycle State Machine

```
[Draft] ──submit──► [Submitted] ──auto──► [AI Review]
                                              │
                         ┌────────────────────┴────────────────────┐
                         │                                         │
                   AI eligible +                           AI flagged or
                   New Opt-In                              low confidence
                         │                                         │
                         ▼                                         ▼
               [Equipment Leader Review] ◄──────────────── (both paths)
                         │
              ┌──────────┼──────────┐
              │          │          │
           Approved   Returned   Rejected
              │          │          │
              │      (back to    [Rejected]
              │       employee)
              ▼
        [Director Review]
              │
    ┌─────────┼──────────────┐
    │         │              │
 New        Update/      Returned/
 Opt-In     Renewal      Rejected
    │         │
    ▼         ▼
[President  [Payroll Notification]
  Review]        │
    │            ▼
    │       [Active]
    │
 Approved
    │
    ▼
[Payroll Notification]
    │
    ▼
[Active] ──insurance lapse──► [Terminated]
         ──opt-out request──► [Terminated (Jan 1)]
```

## Key Integrations

### Microsoft Fabric Lakehouse (SQL Endpoint)
- **Purpose:** Validate employee eligibility from Dynamics HR/Finance data
- **Data accessed:** PersonnelNumber, JobTitle, Company/LegalEntity
- **Connector:** SQL Server connector in Power Automate (pointing to Fabric SQL endpoint)
- **When:** On application submission (Flow 1), validates title against `va_EligibleTitle`
- **Fallback:** Manual entry by employee, verified by Equipment Leader during review

### Microsoft Teams
- **Purpose:** All internal notifications (replaces email for internal stakeholders)
- **Patterns used:**
  - Adaptive cards with action buttons (approve/reject inline) for Equipment Leader, Director, President
  - Channel message for Payroll notification
  - Direct message for employees (application status, insurance reminders)
- **Connection:** Microsoft Teams connector (service principal or delegated)

### SharePoint
- **Purpose:**
  1. Host official policy PDF and checklist (linked from canvas app Home screen)
  2. Store AI model training data (insurance dec pages, window stickers) — NOT in git
- **Connection:** SharePoint connector

### Dynamics / Microsoft Fabric
- **PersonnelNumber** is the primary employee business key — stored on all employee-related Dataverse records
- **AssetID** from Dynamics Fixed Assets is assigned to vehicles after approval (manual entry initially, automated via Dynamics connector in future phase)
- **Company** affiliation from Dynamics determines which of the 8 `va_CompanyEntity` records applies for endorsement addressing

## Security Architecture

### Authentication
- All users authenticate via Azure AD (Entra ID) using their M365 work accounts
- Power Platform uses AAD app registration for flow service principal (non-interactive)

### Authorization
- 6 Dataverse security roles mapped to AAD groups
- Group membership managed by HR/IT (update when titles change)

| AAD Group | Security Role | Who |
|---|---|---|
| `PP-VA-Employee` | `va_Employee` | All eligible employees |
| `PP-VA-EquipmentLeader` | `va_EquipmentLeader` | Company Equipment Leaders |
| `PP-VA-Director` | `va_Director` | CCI Director of Equipment |
| `PP-VA-President` | `va_President` | Company President |
| `PP-VA-Payroll` | `va_Payroll` | Payroll team members |
| `PP-VA-Administrator` | `va_Administrator` | IT/Power Platform admins |

### Data Sensitivity
- Insurance declaration pages contain PII (policyholder name, address, policy details) — stored in Dataverse file columns with organization-level access control
- Column-level security hides reviewer decision fields from Employee role
- Training data stored in SharePoint with restricted access — never committed to git

## Flow Architecture

Each flow is independent and communicates only via Dataverse status changes. This enables:
- Independent monitoring and debugging in flow run history
- Retry of specific steps without re-running entire lifecycle
- Future replacement of individual flows without touching others

```
Flow 1: Submission Orchestrator
  └─► (child) Flow 2: AI Document Validation
                └─► (child) Flow 3: Application Routing
                              └─► Triggers Flow 4 (via Dataverse status change)

Flow 4: Equipment Leader Decision ──► Triggers Flow 5 (via Dataverse)
Flow 5: Director Decision ──────────► Triggers Flow 6 (via Dataverse)
Flow 6: President Approval & Payroll ──► Creates AllowanceRecord + ReminderSchedule

Flow 7: Insurance Reminder (Scheduled daily, reads va_ReminderConfig for intervals)
Flow 8: Document Upload AI Processing (triggered on every new va_Document row)
```

## AI Builder Model Architecture

| Model | Type | Input | Key Outputs | Used In |
|---|---|---|---|---|
| `va_InsuranceDocumentExtractor` | Custom Form Processing | PDF/image (dec pages) | Coverage limits, expiry date, endorsement type | Flow 2, Flow 8 |
| `va_WindowStickerExtractor` | Custom Form Processing | PDF/image (Monroney label) | VIN, Total MSRP, year, EV flag | Flow 2, Flow 8 |
| `va_DocumentClassifier` | Custom Classification | Any uploaded file | Document type classification | Flow 8 (pre-validation) |
| `va_EmailDraftingPrompt` | AI Builder Prompt (GPT) | Structured template data | Drafted Teams message body | Flows 4, 5, 6, 7 |

**AI Confidence thresholds:**
- Field-level extraction: ≥ 0.70 to auto-populate (below = flag for human review)
- Document classification: ≥ 0.60 to accept type (below = manual type assignment)
- Application auto-approval composite score: ≥ 75 (configurable via Environment Variable)

## GitHub Secrets Required

Configure these secrets in the GitHub repository Settings > Secrets and variables > Actions:

| Secret | Description |
|---|---|
| `PP_CLIENT_ID` | Azure AD app registration client ID for Power Platform service principal |
| `PP_CLIENT_SECRET` | Client secret for the app registration |
| `PP_TENANT_ID` | Azure AD tenant ID |
| `PP_DEV_ENVIRONMENT_URL` | Dev Power Platform environment URL |
| `PP_TEST_ENVIRONMENT_URL` | Test Power Platform environment URL |
| `PP_PROD_ENVIRONMENT_URL` | Production Power Platform environment URL |
