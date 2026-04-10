# Vehicle Allowance Program

Power Apps code app for managing the company vehicle allowance program. A single React/TypeScript application serving all roles: Employee, Equipment Leader, Director, Admin, and Payroll.

## Architecture

- **Code App** (`apps/employee-portal/`): React 18, TypeScript, Fluent UI v9, deployed to Power Platform
- **Backend**: Dataverse (9 tables), Power Automate (8 flows), AI Builder (3 models), Copilot Studio agent
- **Auth**: Entra ID via `@microsoft/power-apps` SDK
- **HR Data**: Fabric SQL endpoint for eligibility checks

## Quick Start

```bash
cd apps/employee-portal
npm install
npm run dev          # Starts Vite dev server + pac code run
```

## Project Structure

```
apps/employee-portal/    # Code app source (React/TypeScript)
specs/                   # Manual build reference cards for Power Platform
  dataverse-tables.md    # 9 table schemas
  flows/                 # 8 flow specs
  security-roles.md      # 5 role permission matrix
  copilot-agent.md       # 4 agent topics
  ai-builder-models.md   # 3 AI model specs
  environment-variables.md
  connection-references.md
config/                  # Deployment settings templates
docs/                    # Architecture documentation
```

## Roles

| Role | Access |
|---|---|
| Employee | Apply for allowance, track status, renew insurance, opt out |
| Equipment Leader | Review queue, approve/return/reject applications |
| Director | Review queue, approve/return/reject, configure program settings |
| Admin | All of above + reference data CRUD + audit log |
| Payroll | Read-only view of active allowances and payment details |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run test         # Vitest test runner
```

## Manual Build Items

The `specs/` directory contains reference cards for everything that must be built manually in Power Platform:
- Dataverse tables and relationships
- Power Automate cloud flows
- Security roles and field-level security
- Copilot Studio agent topics
- AI Builder model configurations
- Environment variables and connection references

## Required GitHub Secrets

| Secret | Purpose |
|---|---|
| PP_CLIENT_ID | Entra app registration client ID |
| PP_CLIENT_SECRET | Entra app registration secret |
| PP_TENANT_ID | Entra tenant ID |
| PP_DEV_ENVIRONMENT_URL | Dev environment URL |
