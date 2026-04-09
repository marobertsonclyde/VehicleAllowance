# Admin Setup Guide — Vehicle Allowance Program

This guide covers initial environment setup, solution deployment, and ongoing administration. Intended for the Power Platform administrator.

---

## Prerequisites

Install the following before starting:

- [Power Platform CLI (PAC CLI)](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) — `winget install Microsoft.PowerPlatformCLI`
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) — for looking up AAD Object IDs
- [Node.js 18+](https://nodejs.org) — for building the employee portal code app
- Git

Confirm the Power Platform environment has:
- Power Apps Premium licenses for all users
- AI Builder capacity (credits) — at minimum enough for the document classification and extraction models
- Dataverse enabled

---

## Step 1 — Clone the Repository

```powershell
git clone https://github.com/mcr63/vehicleallowance.git
cd VehicleAllowance
```

---

## Step 2 — Create an App Registration for CI/CD

The GitHub Actions pipelines authenticate to Power Platform using a service principal.

1. In Azure Portal → **Entra ID → App Registrations → New Registration**
   - Name: `VehicleAllowance-CICD`
   - Supported account types: Single tenant
2. After creation, go to **Certificates & Secrets → New Client Secret**. Copy the secret value — you will not see it again.
3. Note the **Application (client) ID** and **Directory (tenant) ID** from the Overview page.
4. In Power Platform Admin Center, go to your environment → **Settings → Users + Permissions → Application Users → New App User**
   - Add the app registration, assign the **System Administrator** role.

**Add these as GitHub Actions secrets** (repo Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `PP_ENVIRONMENT_URL` | Your environment URL, e.g. `https://yourorg.crm.dynamics.com` |
| `PP_CLIENT_ID` | App Registration client ID |
| `PP_CLIENT_SECRET` | App Registration client secret |
| `PP_TENANT_ID` | Azure AD tenant ID |

---

## Step 3 — Deploy the Solution

**Option A — GitHub Actions (recommended for ongoing deployments):**

Push to the `main` branch. The `deploy.yml` workflow packs and imports the solution automatically.

**Option B — Manual via PAC CLI:**

```powershell
# Authenticate
pac auth create --url https://yourorg.crm.dynamics.com

# Pack the solution
pac solution pack --folder src/VehicleAllowanceSolution --zipfile out/VehicleAllowanceSolution.zip

# Import
pac solution import --path out/VehicleAllowanceSolution.zip `
  --settings-file config/environment-variables.json `
  --force-overwrite --publish-changes
```

---

## Step 4 — Set Environment Variable Values

Edit `config/environment-variables.json` and replace all `REPLACE-WITH-*` placeholders before importing. After import, you can also update values directly in Power Platform:

**Power Platform Admin Center → Environments → your environment → Settings → Variables**

| Variable | Description | How to Find |
|----------|-------------|-------------|
| `va_EquipmentLeaderUserId` | AAD Object ID of the Equipment Leader | `az ad user show --id email --query id -o tsv` |
| `va_DirectorOfEquipmentUserId` | AAD Object ID of the Director of Equipment | Same as above |
| `va_CompanyPresidentUserId` | Fallback president GUID (used if no subsidiary-specific president is set) | Same as above |
| `va_PayrollTeamsChannelId` | Teams channel ID for payroll notifications | In Teams: right-click channel → Get link to channel, extract the `channel` parameter |
| `va_PortalUrl` | Base URL of the employee canvas app | Available after publishing the code app |
| `va_AIAutoApprovalThreshold` | AI score threshold for auto-approval (0–100, default: 85) | Set per your risk tolerance |
| `va_FabricSqlEndpoint` | SQL connection string for the Fabric Lakehouse (employee data) | From Microsoft Fabric workspace → SQL endpoint |

---

## Step 5 — Seed Reference Data

Edit `scripts/seed-reference-data.ps1` and fill in the AAD Object ID for each subsidiary president before running. Look up each president's Object ID:

```powershell
az ad user show --id firstname.lastname@clyde.com --query id -o tsv
```

Update the `presidentUserId` field for each of the 8 companies in the script, then run:

```powershell
./scripts/seed-reference-data.ps1 -EnvironmentUrl "https://yourorg.crm.dynamics.com"
```

The script creates 8 company entity records and warns you about any placeholder GUIDs that were not replaced.

---

## Step 6 — Create Reference Data in the Admin App

Open the Admin App and complete the following in the **Reference Data** section:

### Allowance Level Configuration

Create 4 records (A, B, C, D) with the current monthly allowance amounts:

| Level | Minimum MSRP | Monthly Amount | EV Charging |
|-------|-------------|----------------|-------------|
| A | $72,000 | $1,820 | $330 |
| B | $61,000 | $1,550 | $330 |
| C | $47,000 | $1,300 | $330 |
| D | $44,000 | $1,220 | $330 |

Set `Is Current Rate = Yes` on all four records.

### Eligible Job Titles

Create records for each eligible title. Map each title to the default allowance level. Titles must match exactly what appears in Dynamics HR — confirm the exact strings with the HR team.

Example titles: CCI SLT, CCI MLT, Equipment Manager, Location Manager, Project Manager, Sr. Project Manager, Construction Manager, Chief Estimator, Sr. Estimator, Estimator, Survey Manager, Project Controls Manager, Sales Manager, Facilities Manager, Materials Res. Manager, Property & Env. Manager.

### Reminder Configuration

Create 1 record:

| Field | Suggested Default |
|-------|------------------|
| Name | Insurance Reminder Schedule |
| Reminder Days 1 | 30 |
| Reminder Days 2 | 14 |
| Reminder Days 3 | 7 |
| Grace Period Days | 30 |
| Is Active | Yes |

Only one record should be active at a time. The daily flow reads this record at runtime — changing these values takes effect the next day.

---

## Step 7 — Configure Security Roles and AAD Groups

The solution includes 6 security roles. Assign each role to an AAD group so HR can manage membership without needing Power Platform access.

| Security Role | AAD Group (suggested name) | Who belongs |
|---------------|--------------------------|-------------|
| `va_Employee` | `VA-Employees` | All eligible employees currently enrolled or applying |
| `va_EquipmentLeader` | `VA-EquipmentLeaders` | Equipment Leader(s) |
| `va_Director` | `VA-Directors` | Director of Equipment |
| `va_President` | `VA-Presidents` | All 8 subsidiary presidents |
| `va_Payroll` | `VA-Payroll` | Payroll team members who need read access |
| `va_Administrator` | `VA-Admins` | Power Platform admins |

**In Power Platform Admin Center → Environments → your environment → Settings → Users → Teams:**

For each AAD group, create a team linked to the group and assign the corresponding security role to that team.

---

## Step 8 — Configure Column-Level Security

Certain fields are restricted from Employee-role users. Configure column-level security profiles in Power Platform:

1. Go to **Settings → Security → Column Security Profiles**
2. Create a profile named `VA-ReviewerFieldsOnly`
3. Add these columns with **Read = Allowed, Create/Update = Allowed** for the profile:
   - `va_allowanceapplication.va_equipmentLeaderNotes`
   - `va_allowanceapplication.va_equipmentLeaderDecision`
   - `va_allowanceapplication.va_directorNotes`
   - `va_allowanceapplication.va_directorDecision`
   - `va_allowanceapplication.va_presidentNotes`
   - `va_allowanceapplication.va_presidentDecision`
4. Assign this profile to the `VA-EquipmentLeaders`, `VA-Directors`, `VA-Presidents`, and `VA-Admins` teams.

Employees will not be able to read or write these fields.

---

## Step 9 — Train AI Builder Models

Three AI Builder models require training before the document processing flows will work:

### va_InsuranceDocumentExtractor (Form Processing)

Collects 25–50 sample insurance declaration pages from the Equipment Department (various carriers). Store samples in SharePoint — **do not commit them to git** (PII).

1. In AI Builder Studio, create a new **Document Processing** model named `va_InsuranceDocumentExtractor`.
2. Upload and label the training documents. Label these fields: CarrierName, PolicyNumber, EffectiveDate, ExpirationDate, CSLLimit, BIPerPerson, BIPerAccident, PropertyDamage, UmbrellaLimit, EndorsementType, EndorsedEntityName.
3. Train the model. Target field-level accuracy ≥ 80%.
4. Publish the model once accuracy is acceptable.

### va_WindowStickerExtractor (Form Processing)

Collect 30–50 sample window stickers (various manufacturers: Ford, GM, Toyota, RAM, Lexus, etc.).

1. Create a new **Document Processing** model named `va_WindowStickerExtractor`.
2. Label these fields: VIN, Make, Model, ModelYear, TotalMSRP, Powertrain.
3. Train and publish. Target ≥ 85% on VIN and TotalMSRP fields.

### va_DocumentClassifier (Custom Classification)

1. Create a new **Custom Classification** model named `va_DocumentClassifier`.
2. Add 5 classes: `Auto Dec Page`, `Umbrella Dec Page`, `Window Sticker`, `Endorsement`, `Unknown`.
3. Upload 10+ sample documents per class.
4. Train and publish. Documents with confidence < 0.6 are flagged for manual type assignment.

> Training data guidance is in `docs/ai-model-training-guide.md`.

---

## Step 10 — Build and Publish the Employee Portal Code App

The employee portal is a React/TypeScript code app. After the solution is imported and the Dataverse environment is ready:

```powershell
cd apps/employee-portal

# Generate typed Dataverse service bindings (run once per environment)
pac code add-data-source --environment https://yourorg.crm.dynamics.com

# Install dependencies
npm install

# Run locally for testing
pac code run

# Build for production
npm run build
```

After building, publish the code app through Power Apps Studio: **Apps → Import canvas app** or deploy via the solution import.

Once published, copy the app URL and update the `va_PortalUrl` environment variable.

---

## Ongoing Administration

### Updating Allowance Amounts

When CCI adjusts rates annually:

1. In the Admin App → **Reference Data → Allowance Levels**
2. Update the monthly amount on the relevant level records.
3. Existing active Allowance Records store the rate at approval time — they are not automatically updated. Decide whether to update them manually or leave grandfathered rates in place.

### Updating Reminder Intervals

In the Admin App → **Settings → Reminder Configuration**, edit the active record. Changes take effect on the next daily run (7:00 AM Mountain Time).

### Adding New Eligible Titles

In the Admin App → **Reference Data → Eligible Titles**, add a new record with the exact job title string from Dynamics and the default allowance level.

### Adding a New Subsidiary

1. In the Admin App → **Reference Data → Company Entities**, create a new record.
2. Set the legal entity code (short code), endorsement address, president user ID, and president name.
3. Add the president to the `VA-Presidents` AAD group.

### Exporting Solution Changes Back to Git

After making customizations in the Power Platform environment:

```powershell
pac solution export --name VehicleAllowanceSolution --path ./src --unpack
git add src/
git commit -m "Export solution changes from environment"
git push
```

---

## Troubleshooting

**Flow fails with "connection not authorized":** The flow connections (Dataverse, Teams, AI Builder) need to be re-authenticated. In Power Automate → Connections, reconnect each connection used by the flows.

**AI model returns low confidence scores:** Re-train with more representative samples. Ensure training documents cover the full range of carriers and formats employees are likely to submit.

**Employee can't see their application:** Confirm the employee is a member of the `VA-Employees` AAD group and the group is linked to the `va_Employee` security role team in the environment.

**Teams messages not sending:** Confirm the Teams connection in Power Automate is authenticated with a service account that has Teams access. Check the `va_EquipmentLeaderUserId` and `va_DirectorOfEquipmentUserId` environment variables contain valid AAD Object IDs (not email addresses).

**Seed script warns about placeholder president GUIDs:** Look up each president's AAD Object ID using `az ad user show --id email --query id -o tsv`, update `scripts/seed-reference-data.ps1`, and re-run the script.
