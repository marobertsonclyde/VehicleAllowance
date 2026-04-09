# Vehicle Allowance Program — Power Platform Solution

A Microsoft Power Platform solution for managing the Clyde Companies Vehicle Allowance Program. Eligible employees may opt into a monthly cash allowance in lieu of a company vehicle, subject to vehicle compliance requirements and continuous insurance coverage.

## Solution Components

| Component | Description |
|---|---|
| **Dataverse** | 13 custom tables (`va_` prefix), security roles, reference data |
| **Canvas App** | Employee self-service portal (submit applications, upload documents, track status) |
| **Model-Driven App** | Admin/review interface for Equipment Leaders, Directors, President, Payroll |
| **Power Automate** | 8 flows covering intake, AI validation, routing, approval chain, insurance monitoring |
| **AI Builder** | Document extraction models for insurance dec pages and window stickers |
| **Copilot Studio** | `va_AllowanceAssistant` — embedded help agent with policy knowledge base |

## Repository Structure

```
VehicleAllowance/
├── .github/workflows/             # GitHub Actions CI/CD pipelines
├── src/VehicleAllowanceSolution/  # PAC CLI unpacked solution (source of truth)
│   ├── Entities/                  # Dataverse table definitions
│   ├── CanvasApps/                # Employee portal canvas app (unpacked .fx.yaml)
│   ├── Workflows/                 # Power Automate flow JSON definitions
│   ├── AIModels/                  # AI Builder model definitions
│   ├── Bots/                      # Copilot Studio agent topics
│   ├── Roles/                     # Security role XML definitions
│   └── EnvironmentVariableDefinitions/
├── config/                        # Per-environment non-secret configuration
├── scripts/                       # PAC CLI helper scripts (PowerShell)
├── docs/                          # Architecture docs, user guides, flow diagrams
├── training-data/                 # GITIGNORED — AI model training samples (SharePoint)
└── out/                           # GITIGNORED — packed solution ZIP output
```

## Prerequisites

- [Power Platform CLI (PAC)](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) installed
- Power Platform environment with:
  - Power Apps Premium license
  - AI Builder credits
  - Copilot Studio license
- Microsoft 365 + Azure AD (Entra ID) for user identity
- Access to Microsoft Fabric Lakehouse SQL endpoint (employee/Dynamics data)

## Development Workflow

### 1. Make changes in the Dev Power Platform environment

Build or modify components in the Power Platform Studio UI.

### 2. Export and unpack solution to this repo

```powershell
./scripts/export-solution.ps1 -EnvironmentUrl "https://your-dev-env.crm.dynamics.com"
```

This runs `pac solution export --unpack` and places files under `src/VehicleAllowanceSolution/`.

### 3. Commit and push

```bash
git add src/
git commit -m "describe your changes"
git push origin <branch>
```

### 4. Deploy to another environment

```powershell
./scripts/import-solution.ps1 -EnvironmentUrl "https://your-test-env.crm.dynamics.com" -SettingsFile "config/test-environment-variables.json"
```

## First-Time Setup (New Environment)

1. Deploy the solution:
   ```powershell
   ./scripts/import-solution.ps1 -EnvironmentUrl "https://your-env.crm.dynamics.com" -SettingsFile "config/dev-environment-variables.json"
   ```
2. Seed reference data (company entities, allowance levels, eligible titles):
   ```powershell
   ./scripts/seed-reference-data.ps1 -EnvironmentUrl "https://your-env.crm.dynamics.com"
   ```
3. Assign AAD security groups to Power Platform security roles in the environment.
4. Upload the policy PDF to SharePoint and configure the `va_PortalUrl` environment variable.
5. Upload the policy PDF as a knowledge source in Copilot Studio for `va_AllowanceAssistant`.

## Environments

| Environment | Purpose | Deployment |
|---|---|---|
| Dev | Active development | Auto on push to `develop` branch |
| Test | UAT and integration testing | Manual trigger in GitHub Actions |
| Prod | Live system | Manual trigger with approval gate |

## AI Model Training

Training data (insurance declaration pages, window sticker images) is **not stored in this repository** due to PII. See [docs/ai-model-training-guide.md](docs/ai-model-training-guide.md) for the training data location (SharePoint) and labeling process.

## Key Business Rules

- **Effective date:** Documents received on or before the 15th → current month; 16th or later → next month
- **President approval:** Required for New Opt-In applications only
- **Insurance continuity:** Lapsed coverage triggers allowance termination after configurable grace period
- **EV vehicles:** Receive $330/month EV Charging Allowance in lieu of fuel card
- **Vehicle age:** Must be 5 model years old or newer
- **Opt-out deadline:** August 1 each year for following calendar year

## Related Documents

- [Architecture Overview](docs/architecture-overview.md)
- [Data Model Reference](docs/data-model-reference.md)
- [AI Model Training Guide](docs/ai-model-training-guide.md)
- [Security Model](docs/security-model.md)
- [Employee User Guide](docs/user-guides/employee-guide.md)
- [Equipment Leader User Guide](docs/user-guides/equipment-leader-guide.md)
