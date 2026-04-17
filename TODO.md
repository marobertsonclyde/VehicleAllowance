# Build TODO — CCI Vehicle Allowance

Work from `design-brief.md` for specs; this file sequences the build. Each
phase unblocks the next. At the start of each relevant phase, load the skills
listed in `design-brief.md` → *Skills to Use*.

## Phase 0 — Environment

- [ ] Provision Dev / Test / Prod Power Platform environments with Dataverse.
- [ ] Confirm access to Fabric workspace + SQL endpoint; capture connection.
- [ ] Confirm access to Dynamics SQL DB for the asset register.
- [ ] Register Azure AD app for Graph (`Chat.Create`, `ChatMessage.Send`,
      `User.Read.All`); grant admin consent.
- [ ] Register Azure AD app for Power Automate REST (used by `power-automate`
      skill); grant admin consent.
- [ ] Install Power Apps Code Apps CLI + Code App MCP in VS Code.
- [ ] Scaffold repo layout: `/app`, `/solution`, `/fabric`, `/flows`.

## Phase 1 — Dataverse schema

- [ ] Create solution `VehicleAllowance` in Dev.
- [ ] Create tables per §Dataverse Entities: Employee, Allowance Level
      (effective-dated), Program Parameters (singleton), Legal Entity,
      Allowance Request, Vehicle, Insurance Policy, Document, Fuel Card,
      Allowance Enrollment, Asset, Audit Log.
- [ ] Add fields incl. `last_hr_sync_at`, `Legacy/Migrated`,
      `Mode` (Stipend/CompanyCar), `purchase-date level config` FK.
- [ ] Define lookups and relationships.
- [ ] Seed Allowance Level rows for 1/1/2026 (A/B/C/D, effective-from
      2026-01-01).
- [ ] Seed Program Parameters singleton (Aug 1 deadline, 60-day new-hire
      window, 15th-rule, $330 EV, 5 MY limit, T-60/30/7, 100-mile radius).
- [ ] Seed Legal Entity rows per policy §5.3.
- [ ] Create security roles: Employee, Supervisor, Equipment Leader (row-
      level filter by operating company), CCI Director, Program Admin,
      Payroll (read-only).
- [ ] Implement business rules on Allowance Request (§1 Dataverse): ≤ 5 MY,
      MSRP ≥ purchase-date level floor, required docs, body type
      pickup/SUV, endorsement entity matches company. `Legacy/Migrated`
      relaxes doc + age to warnings; `Mode=CompanyCar` skips them.

## Phase 2 — Integrations

- [ ] Fabric eligibility sync flow (scheduled, SQL connector) upserts
      Employee, stamps `last_hr_sync_at`.
- [ ] Nightly reconciliation flow flags Fabric rows without an Entra match.
- [ ] Define SQL views in `/fabric` for eligibility, max level, company-car
      flag.
- [ ] Dynamics asset sync flow (SQL → Asset table, scheduled). Match key
      TBD during build.

## Phase 3 — Code App shell (single app, role-gated)

- [ ] `/app` scaffold: TypeScript/React Code App, Code Apps SDK, Entra SSO,
      Fluent UI v9.
- [ ] Route structure with role guards (Employee / Reviewer / Admin /
      Payroll) backed by Dataverse role checks.
- [ ] Generated Dataverse service clients + `AnnotationsService` for file
      attachments (via `dataverse-codeapp-upload` skill).
- [ ] Apply `clyde-style-guide` theme (colors, typography, component rules).
- [ ] Responsive baseline per §3a (mobile <600px, tablet 600–1024px,
      desktop ≥1024px). Tap targets ≥44px; inputs ≥16px.

## Phase 4 — Employee screens

- [ ] Eligibility landing: deadline countdown, `last_hr_sync_at` ("last
      updated from HR · <time>"), available-levels card, "Doesn't look
      right?" entry. Copy uses "your HR record" / "from HR" only.
- [ ] Guided wizard (6 steps): intent → window sticker → auto dec →
      umbrella dec → verify vehicle details (add purchase date) → review
      & submit. Wired to AI Builder extractions.
- [ ] In-app status tracker.
- [ ] Eligibility dispute form (reason, description, optional attachment)
      → confirmation with Teams chat deep link.
- [ ] Insurance renewal resubmission (one-click when vehicle unchanged).
- [ ] Opt-out action with reason + effective-date preview.
- [ ] Indemnification attestation checkbox → audit log.
- [ ] MLT+ Company-Car branch: elect `Mode=CompanyCar`; skips
      MSRP/insurance/docs.
- [ ] Mobile QA pass at 375px incl. camera-based uploads.

## Phase 5 — Admin / reviewer screens

- [ ] Queues: Active Enrollments, Pending Approvals Aging, Expiring
      Insurance (30/60/90), Terminations, Requests by status/company/
      level, Needs Attention.
- [ ] Request review form with inline document viewer + AI-extracted
      field comparison.
- [ ] Equipment Leader review step with Asset # picker from synced
      Dynamics assets.
- [ ] Config pages (Program Admin only): Allowance Levels (new
      effective-dated row on edit), Program Parameters, Legal Entities.
- [ ] Eligibility Roster read-only view (Name, Title, Tier, Company, Max
      level, Company-car flag, In-app status, Last HR sync; search +
      filter by company/tier/status).
- [ ] Mobile QA: Needs Attention, Pending Approvals, Request Review,
      Payroll Ack. Config pages may degrade to "open on a larger screen".

## Phase 6 — AI Builder

- [ ] Document Processing model: window sticker (VIN, MSRP, MY, make,
      model).
- [ ] Document Processing model: auto dec (carrier, policy #, effective
      / expiration, limits, endorsement).
- [ ] Document Processing model: umbrella dec (effective dates, limit).
- [ ] Wire extractions into wizard verify step.

## Phase 7 — Workflow automation

- [ ] New-eligibility onboarding flow (60-day deadline, welcome +
      checklist Teams/email).
- [ ] Approval routing flow — sequential Teams Approvals: Supervisor →
      Equipment Leader → CCI Director; rejection short-circuit; timeout
      reassignment.
- [ ] Effective-date calculator (15th-rule) creates Allowance Enrollment
      on final approval.
- [ ] Payroll Teams adaptive card with ack button → flips Payroll Ack.
- [ ] Insurance expiration watcher (daily; T-60/30/7 reminders; Renewal
      Required sub-request). Lapse flags enrollment.
- [ ] Annual cadence: Aug 1 lockout flow; Jan 1 payroll rate refresh
      (roll-up payroll notice, MSRP thresholds NOT re-applied).
- [ ] Eligibility dispute flow: Graph `Chat.Create` + `ChatMessage.Send`,
      seed with disputed snapshot + attachment, write `EligibilityDispute`
      audit entry, return chat deep link.
- [ ] MLT+ Company-Car deferral path: approval chain runs, skips payroll
      notice, routes Equipment-team assignment task.
- [ ] Exception scanner (daily, six checks per §6). Needs Attention +
      Teams ping. `Legacy/Migrated` items tagged `Informational`.

## Phase 8 — Legacy migration (one-time)

- [ ] Write SQL/Dataverse import script for existing enrollees: tag
      `Legacy/Migrated = true`, land as Active. Not a Power Automate flow.
- [ ] Validate in Dev against a real extract.

## Phase 9 — Verification

Run every bullet in `design-brief.md` → *Verification Plan*:

- [ ] End-to-end dry run (seven sub-steps).
- [ ] Admin dry run (rate change + Eligibility Roster).
- [ ] Dispute flow test.
- [ ] Step-down test.
- [ ] Grandfathering test.
- [ ] Migration dry run.
- [ ] Company-car deferral test.
- [ ] Security test (row-level filter, payroll read-only, non-admin config
      lockout).
- [ ] Fabric sync test (missing UPN reconciliation).
- [ ] Mobile layout check at 375px (employee happy path + admin triage).

## Phase 10 — ALM promotion

- [ ] Export solution from Dev → import to Test → smoke test.
- [ ] Import to Prod; run the Phase 8 legacy import at cutover.
