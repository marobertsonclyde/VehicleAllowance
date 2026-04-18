# CCI Vehicle Allowance Policy — Power Platform Solution

## Deliverable

This document is a **design brief**, not an implementation. The app itself
will be built as a **Power Apps Code App** using the `code-apps` plugin
from [`microsoft/power-platform-skills`](https://github.com/microsoft/power-platform-skills)
(manifest `code-apps-preview`, v1.0.0), invoked from **Claude Code or
GitHub Copilot CLI**. Code Apps (the product) are generally available as
of February 2026; the `code-apps` plugin is in preview. This brief is the
spec the developer (and agent) work from. No code, solution zips, or
Dataverse artifacts are produced here.

## Skills to Use

When implementing against this brief, load and apply the following skills
from this repo (`skills/`):

- **`clyde-style-guide`** — Clyde Companies brand standards (colors, typography,
  voice, Power BI / Word / Excel / PowerPoint / HTML rules). Apply to every
  Code App screen, adaptive card, Teams message, and admin view so the app
  ships on-brand.
- **`power-automate`** — programmatic creation of Power Automate flows via the
  REST API (Node.js + MSAL). Use for every flow in §4 (Fabric sync, approval
  routing, payroll notification, insurance watcher, Jan 1 rate refresh) so
  they are scripted, versioned, and reproducible. The program currently
  has a single Power Platform environment (`clyde-bi`); flows are still
  scripted so promotion to additional environments is a config change
  later.
- **`dataverse-codeapp-upload`** — file upload + Dataverse CRUD patterns for
  Power Apps Code Apps (generated service classes, `AnnotationsService` for
  file attachments). Use for the window-sticker / auto-dec / umbrella-dec
  uploads in the employee self-service wizard and for reading/writing all
  Dataverse records in the Code App.

## Context

Clyde Companies' CCI already runs a Vehicle Allowance Policy for eligible
leadership/management titles; the 1/1/2026 policy refresh is being used as the
trigger to move the program off spreadsheets + PDFs and onto Power Platform.
Today the program is defined by two PDFs:

- `docs/policy/CCI - Vehicle Allowance Policy - Effective 1.1.2026.pdf`
- `docs/policy/CCI - Vehicle Allowance Checklist - Effective 1.1.2026.pdf`

We are building a Microsoft Power Platform solution to administer the program end
to end — self-service intake for employees, a multi-tier approval workflow,
automated reminders, and an admin surface the CCI Director of Equipment (and
delegates) can use to configure parameters and track allowances.

Because the program is already live, the MVP has to absorb the existing
enrollee population at cutover. Some historical records will arrive without a
window sticker, complete dec pages, or other documents; that must not block
their continued participation — it becomes a remediation backlog, not a
gating failure.

## Decisions (from user)

- **Eligibility source:** SQL endpoint in Microsoft Fabric is the single
  authority for each employee's eligibility flag, **maximum qualifying
  level**, and **company-car deferral flag**. Entra ID is used only to
  match the signed-in employee's UPN/email to the Fabric record. There
  is no admin-editable Title → Level mapping in Dataverse; title is
  display-only metadata. Eligibility refreshes on the scheduled Fabric
  sync; there is no on-demand recheck action in MVP.
- **Employee-facing copy rule:** no employee-visible text references
  backend system names (Fabric, Dataverse, Entra). Use plain language
  ("your HR record", "from HR", "refresh from HR"). Internal names
  stay in this brief and on admin screens only.
- **Eligibility disputes:** the eligibility landing has a "Doesn't look
  right?" action. Submitting captures a reason category + optional
  attachment and spawns a Teams group chat (via Graph) between the
  employee and configured HR recipients. Resolution happens in that
  chat, outside the app; the app writes a single audit-log entry on
  the Employee record.
- **Payroll hand-off:** Teams notification (formatted message to payroll
  channel/recipient) for MVP; a direct payroll-system integration is a later
  phase.
- **MVP scope:** (1) Self-service + multi-tier approvals, (2) Insurance renewal
  tracking + reminders, (3) AI Builder document extraction. Power BI dashboard,
  automated fuel-card flow, and e-signature are phase 2.
- **Admin scope:** CCI Director of Equipment + a small set of named delegates
  can edit program parameters. Equipment Leaders are reviewers, not admins.
- **Legacy data import:** A one-time SQL/Dataverse import script lands
  existing enrollees at cutover. Imported records are tagged
  `Legacy/Migrated = true` and bypass the normal "required docs present"
  business rule on save. Exceptions raised against legacy records are
  tagged informational (see §6) and sort lower in Needs Attention — they
  cannot stop payroll for an already-active employee. No separate
  "Backfill Needed" admin view; missing documents are worked from the
  same queue.
- **Level hierarchy (step-down):** Fabric tells us each employee's
  **maximum qualifying level** directly. Actual level is the highest
  level whose min-MSRP their chosen vehicle meets, capped at that
  maximum. A Level A-eligible employee who buys a car that only meets
  Level C's MSRP gets Level C; a Level B employee can never receive
  Level A regardless of vehicle price. The employee's eligibility
  landing shows every level at or below their max with its min MSRP
  and monthly stipend, so the step-down outcome is visible before they
  pick a vehicle.
- **Grandfathered MSRP thresholds:** On each Jan 1 the monthly payroll
  amounts refresh to the new year's Allowance Level values, but MSRP
  thresholds are evaluated against the level config that was in effect on
  the vehicle's purchase date. Raising the Level A MSRP floor next year does
  not demote an employee whose current vehicle was conforming when purchased.
- **MLT+ company-car deferral:** Employees at MLT or above may decline the
  allowance stipend and elect a company-provided vehicle instead. This is
  a branch on the Allowance Request, not a separate request type. Company-
  car branch skips the MSRP / self-insurance path and routes directly to
  the Equipment team for vehicle assignment.

## Actors / Roles

- **Eligible Employee** — opts in, submits docs, maintains vehicle + insurance.
- **Supervisor** — approves vehicle fit to job duties.
- **Company Equipment Leader** (per operating company) — first-line reviewer.
- **CCI Director of Equipment** — final approver; triggers payroll Teams notice.
- **Program Admin** — CCI Director + named delegates; edits parameters.
- **Payroll recipient(s)** — receive Teams notifications; ack back in-app.
- **CCI Exec Assistant** — fuel card / EV allowance coordination (phase 2
  automation; MVP can surface a task to them).

## Dataverse Entities

- **Employee** — mirror of Fabric roster; keyed by Entra UPN. Fields: name,
  email/UPN, title (display-only metadata), leadership team (SLT/MLT),
  operating company (legal entity), supervisor UPN, hire date,
  **eligibility flag** (from Fabric), eligibility effective date, **max
  qualifying level** (from Fabric), **company-car deferral eligible**
  (from Fabric), `last_hr_sync_at` (timestamp of the most recent
  successful read of this row, shown to the employee as "last updated
  from HR"). No field on this entity is admin-editable — Fabric is
  authoritative; admins who need to correct data must fix it in the
  upstream HR system.
- **Allowance Level (A/B/C/D)** — min total MSRP, monthly amount, **effective-
  from / effective-to** dates so historical configs can be looked up by
  purchase date. Admin edits create a new effective-dated row rather than
  overwriting.
- **Program Parameters** — singleton record holding: opt-in deadline
  (Aug 1), 60-day new-hire window, 15th-of-month effective-date cutoff,
  EV charging allowance ($330), vehicle age limit (5 MY), insurance reminder
  lead times, 100-mile personal-fuel radius. All editable by Program Admin;
  changes captured in audit log.
- **Legal Entity** — for "Additional Insured"/"Additional Interest"
  endorsement; one row per subsidiary in policy §5.3.
- **Allowance Request** — the case record moving through workflow.
  - Types: New Opt-In, Vehicle Update, Insurance Renewal, Opt-Out,
    Company-Car Deferral (MLT+ only).
  - Mode: `Stipend` (default) or `CompanyCar` (MLT+ branch).
  - Status: Draft → Supervisor Review → Equipment Leader Review → CCI
    Director Review → Approved (Payroll Notified) → Active (terminal
    branches: Rejected, Withdrawn, Terminated). Company-Car requests skip
    the Payroll-Notified step and route an assignment task to the Equipment
    team instead.
- **Vehicle** — make, model, year, VIN, body type (pickup/SUV), fuel type
  (ICE / Hybrid / EV), total MSRP (from window sticker), purchase date.
- **Insurance Policy** — type (Auto / Umbrella), carrier, policy #,
  effective/expiration dates, coverage limits, endorsement type (Additional
  Insured / Additional Interest), endorsed Legal Entity, dec-page attachment.
- **Document** — file column(s) attached to requests/policies (window sticker,
  dec pages, indemnification). Use Dataverse file columns for MVP; revisit
  SharePoint if retention policy requires.
- **Fuel Card** — card #, issue date, status, linked enrollment (lightweight
  in MVP; full workflow phase 2).
- **Allowance Enrollment** — active/terminated periods per employee
  (effective start, effective end, level, amount, payroll ack status,
  **mode** (Stipend / CompanyCar), **purchase-date level config** (FK to
  the effective-dated Allowance Level row used for grandfathering MSRP),
  **Legacy/Migrated** flag + original source reference).
- **Asset** — mirror of the Dynamics asset register, synced from the SQL
  database. Fields: asset #, description, linked Vehicle, linked Employee,
  status. MVP: Equipment Leader manually enters/selects the asset # on
  the Allowance Request after the vehicle is reviewed; the sync populates
  a lookup list from SQL so they can match against existing Dynamics
  records. Future state (phase 2): auto-create the asset in Dynamics on
  CCI Director approval.
- **Audit Log** — every state transition, approval decision, parameter
  change. Also carries `EligibilityDispute` events as **metadata only**
  (reason category, submitted-by, timestamp, Teams chat URL/thread ID);
  the employee-submitted note text and any attachment remain only in the
  access-controlled Teams chat created on submit and are **not** copied
  into the audit log. No separate entity for disputes — the audit log
  records that a dispute was submitted, while the dispute contents live
  in the Teams chat.

## Workflows

| # | Trigger | Flow |
|---|---------|------|
| 1 | Fabric SQL shows newly eligible employee | Upsert Employee, start 60-day opt-in clock, notify employee via Teams/email |
| 2 | Annual opt-in window | Remind eligible employees in July; lock Aug 1 |
| 3 | Employee submits request | Route: Supervisor → Equipment Leader → CCI Director (Teams Approvals, sequential) |
| 4 | CCI Director approves | Compute effective date (15th rule); post Teams notice to payroll; open enrollment |
| 5 | Insurance expiration approaching | Auto-reminders at T-60/T-30/T-7 (thresholds in Program Parameters) |
| 6 | Insurance lapses | Auto-flag enrollment; notify recipient + Equipment Leader; candidate for termination |
| 7 | Vehicle update | Same review chain, no payroll notice |
| 8 | Opt-out (by Aug 1) | Notify CCI Director; schedule Company Vehicle reissue next Jan 1 |
| 9 | Annual parameter review | Admin updates allowance amounts; history preserved via audit log and effective-dated Allowance Level records |
| 10 | Jan 1 payroll rate refresh | For every Active enrollment, set the monthly amount to the level's new effective-dated value; MSRP thresholds are NOT re-evaluated (grandfathered to purchase-date config); post a single roll-up Teams notice to payroll |
| 11 | Initial bulk migration (one-time SQL import, not a Power Automate flow) | Insert existing enrollees as Legacy-tagged Active enrollments; missing docs surface as informational exceptions in §6; do NOT block payroll |
| 12 | MLT+ company-car deferral | Request with `Mode=CompanyCar` skips MSRP/insurance checks; on final approval routes a vehicle-assignment task to the Equipment team instead of a payroll Teams notice |
| 13 | Employee opens an eligibility dispute | Form submit triggers a flow that creates a Teams group chat via Graph (`Chat.Create` + `ChatMessage.Send`) with the employee + configured HR recipients, seeds it with the reason/description/attachment, writes an `EligibilityDispute` audit entry on the Employee, returns the chat deep link to the client. Resolution happens in-chat; the app does not track it |

## Power Platform Architecture

### 1. Dataverse — system of record

All entities above with enforced relationships. Business rules on Allowance
Request enforce: vehicle ≤ 5 model years, MSRP ≥ level minimum (evaluated
against the Allowance Level row effective on the vehicle's purchase date),
required docs present, body type is pickup/SUV, endorsement entity matches
employee's operating company.

**Level selection (step-down):** on submit, compute the actual level as
`min(employee.max_qualifying_level, highest_level_whose_MSRP_floor_is_met)`
using the effective-dated Allowance Level config from the vehicle's purchase
date. `employee.max_qualifying_level` is mirrored from Fabric — there is no
Dataverse lookup table in between. A Level A employee with a Level C vehicle
books a Level C enrollment; a Level B employee can never book Level A
regardless of vehicle price.

**Legacy bypass:** when `Legacy/Migrated = true`, the "required docs" and
vehicle-age rules are relaxed to warnings so payroll continuity is preserved
while the backfill queue is worked.

**Company-car mode:** requests with `Mode = CompanyCar` skip MSRP,
vehicle-age, insurance-endorsement, and document-presence rules entirely;
only the approval chain and Equipment-team assignment apply.

### 2. Fabric ↔ Dataverse sync (eligibility)

Two viable paths; pick during build:

- **Scheduled Power Automate flow** (SQL Server connector against the Fabric
  warehouse endpoint) → upsert into Employee table. Simple, no extra
  infrastructure.
- **Fabric → Dataverse via Dataflow Gen2 / virtual table** — preferred if a
  near-real-time view is needed.

Entra UPN is the join key. A nightly reconciliation flow flags any Fabric row
without a matching Entra user for admin attention.

**Dynamics asset sync (SQL → Dataverse):** A separate scheduled Power Automate
flow pulls the Dynamics asset register from SQL into the Asset table in
Dataverse. Equipment Leaders select the matching asset # on the request during
their review step (no auto-create in MVP). Match key TBD during build (likely
asset # + assignee). Phase 2 replaces manual selection with auto-create of the
Dynamics asset on final approval.

### 3. Power Apps Code App

Built as a Power Apps Code App — **React + Vite + TypeScript** scaffold
from `microsoft/PowerAppsCodeApps/templates/vite`, authored via the
`code-apps` plugin (`microsoft/power-platform-skills`, manifest
`code-apps-preview`) in Claude Code or GitHub Copilot CLI, deployed with
`pac code push`, and surfaced in a Teams tab. Dataverse is accessed
through the generated `src/generated/` service classes; Entra SSO is
handled by the Code App host. A single codebase serves both audiences —
employees on self-service intake/status and reviewers/admins on
approvals, queues, and configuration — with route-level role gating.

**Runtime sandbox constraint:** Code Apps run in a sandbox; direct
`fetch` / Graph SDK calls from the client fail at runtime. All external
data access is connector-only. Dataverse reads/writes go through the
generated services; Microsoft Graph work (e.g. the dispute flow's
`Chat.Create`) runs inside HTTP-triggered Power Automate flows (see
§4), never in the client.

**Audiences:** Eligible Employee (self-service), Supervisor / Equipment
Leader / CCI Director (reviewers), CCI Director + named delegates
(Program Admin), Payroll (read-only, filtered to "Payroll Ready").

**Employee screens:**

- "Am I eligible?" landing page pulling from the Employee mirror of
  Fabric, showing a personalized deadline countdown, the
  `last_hr_sync_at` timestamp as "last updated from HR · <time>",
  a "Doesn't look right?" entry point into the dispute flow, and
  an **available-levels card** listing
  every level at or below the employee's max with that level's min
  total MSRP and monthly stipend so the step-down is visible before
  vehicle selection. Employee-facing copy refers to "your HR record"
  / "from HR"; the words Fabric/Dataverse/Entra never appear in
  employee UI.
- Guided wizard: Opt-in intent → Upload window sticker (AI Builder extracts
  VIN, MSRP, year, make, model) → Upload auto dec page (AI Builder extracts
  carrier, policy #, dates, coverage limits) → Upload umbrella dec page (AI
  extracts effective dates and limit) → **Verify vehicle details** (confirm
  or correct the AI extraction; add purchase date since it isn't on the
  sticker) → Review & Submit. Extract-first ordering means employees don't
  type what the documents already contain.
- In-app status tracker for in-flight requests.
- **Eligibility dispute flow** — reached from the eligibility landing
  and the enrollment profile. Short form: reason category (Title,
  Tier, Operating company, Max level, Company-car eligibility,
  Supervisor, Other), free-text description, optional attachment.
  Submit spawns the Teams group chat with HR and lands the employee
  on a confirmation screen with a deep link to the chat. The app
  does not track resolution; HR closes the chat manually.
- Insurance renewal resubmission flow (one-click if vehicle unchanged).
- Opt-out action with reason + effective-date preview.
- Indemnification: MVP captures an in-app attestation checkbox recorded
  in the audit log; DocuSign/Adobe Sign is a phase-2 swap-in.

**Admin / reviewer screens:**

- Views: active enrollments, pending approvals aging, expiring insurance
  (30/60/90), terminations, requests by status/company/level, Needs
  Attention (exceptions from §6).
- Request form with inline document viewer + AI-extracted field comparison;
  Equipment Leader step includes Asset # picker sourced from the synced
  Dynamics asset list.
- Config pages (admin-only): Allowance Levels, Program Parameters,
  Legal Entities. (No Title→Level mapping — eligibility and max level
  are Fabric-owned and not admin-editable.)
- **Eligibility Roster** view (replaces the old Title→Level page) —
  read-only list of every employee Fabric marks eligible, with columns
  Name, Title, Tier, Company, Max level, Company-car flag, In-app status
  (Enrolled / Not enrolled / Opted out / Company car / Legacy), Last HR
  sync. Search + filter by company / tier / status. Row click opens the
  employee detail page.

Internal users only → Teams tab avoids Power Pages licensing and uses Entra
SSO natively. Role gating is enforced server-side via Dataverse security
roles + route-level guards; the Code App only hides UI affordances as a UX
nicety, not a security boundary.

### 3a. Responsive / platform targets

The Code App is responsive across employee self-service and admin/reviewer
surfaces from a single codebase. Form-factor expectations:

- **Mobile (< 600px)** — single-column layout, hamburger drawer for primary
  navigation, a fixed bottom tab bar for top-level destinations, vertical
  wizard stepper, data grids collapse to card-per-row with label:value
  pairs. Tap targets ≥ 44×44px; form inputs ≥ 16px font-size to prevent
  iOS zoom on focus. Employee surfaces are expected to be used primarily
  on mobile; admin surfaces are expected to be used on mobile for triage
  (queues, approvals, payroll ack) while configuration pages are
  desktop-primary.
- **Tablet (600–1024px)** — two-column forms where it helps; drawer becomes
  a persistent narrow rail; tables resume tabular layout with horizontal
  scroll if needed.
- **Desktop (≥ 1024px)** — full persistent left rail, tables inline, the
  6-step wizard uses a 2-column layout (stepper on the left, form on the
  right), admin queues get a filter panel on the right.

Phone-primary admin surfaces: Needs Attention queue, Pending Approvals,
individual Request Review (approve/reject with comment), Payroll Ack.
Desktop-primary admin surfaces: Config pages and bulk Active Enrollments
views. Config pages may degrade to a "open on a larger screen" message on
narrow viewports rather than attempting dense mobile layouts.

Component style should map cleanly to **Fluent UI v9** (primary buttons with
4px radius, underline-style inputs that thicken to brand color on focus,
1px Pearl Gray card borders with no shadows, zebra-striped data grids,
tab lists with an underline indicator, message bars for inline banners).
This keeps the design portable between the Teams tab host and the Power
Apps mobile app, and means the eventual React implementation can adopt
`@fluentui/react-components` without a re-skin.

### 4. Power Automate — automation backbone

Flows delivered in MVP:

- **Fabric eligibility sync** (scheduled, hourly or nightly).
- **New-eligibility onboarding** — on Employee eligibility true, set 60-day
  deadline, send welcome + checklist.
- **Approval routing** — Dataverse trigger on Submit → sequential Teams
  Approvals (Supervisor → Equipment Leader → CCI Director) with rejection
  short-circuit and reassignment on timeout.
- **Effective-date calculator** — on final approval, apply 15th-of-month rule,
  create Allowance Enrollment, set start date.
- **Payroll Teams notification** — posts an adaptive card to a payroll Team/
  chat with employee, level, monthly amount, EV allowance (if applicable),
  effective date; payroll acks via button → sets enrollment Payroll Ack = true.
- **Insurance expiration watcher** — daily scan against Program Parameter
  thresholds; sends reminders; opens a Renewal Required sub-request.
- **Annual cadence** — Aug 1 lockouts; Jan 1 rollovers; admin annual-review
  ticket.
- **Eligibility dispute** — HTTP-triggered flow; creates a Teams group
  chat via Microsoft Graph (`Chat.Create` + `ChatMessage.Send`) with
  the employee and configured HR recipients, posts a seed message
  carrying the reason, description, snapshot of the disputed HR
  fields, and attachment (when supplied), writes an
  `EligibilityDispute` audit entry, returns the chat deep link.
  Required Graph app permissions: `Chat.Create`, `ChatMessage.Send`,
  `User.Read.All` for HR-recipient lookup.
- **Jan 1 payroll rate refresh** — sweep all Active enrollments, set
  monthly amount to the new effective year's Allowance Level amount for the
  enrollment's level; write audit-log entries; post single roll-up payroll
  Teams notice. MSRP thresholds are NOT re-applied — existing vehicles stay
  grandfathered to their purchase-date config.

The one-time legacy import (workflow #11) is a SQL/Dataverse script, not a
Power Automate flow, and is run once at cutover.

### 5. AI Builder (MVP)

- **Document Processing** model for auto dec pages → extract policy
  dates, coverage limits, endorsement text → pre-fill request, flag
  shortfalls against policy thresholds.
- **Document Processing** for umbrella dec pages → extract effective
  dates and coverage limit.
- **Document Processing** for window sticker → extract VIN, total MSRP,
  model year.
- Human review retained; AI removes the keying burden and gives reviewers
  a side-by-side confidence view.

### 6. Exception / Issue Flagging

A daily "Exceptions" scan (Power Automate against Dataverse) surfaces data-
integrity problems on a dedicated model-driven app view and pings the CCI
Director + Equipment Leaders via Teams. Each exception is an `Issue` row
(type, severity, linked Request/Enrollment/Employee, detected-on date, status:
Open/Acknowledged/Resolved). Checks in MVP:

- **No payroll setup** — Enrollment is Active but has no Payroll Ack (or
  missing effective-date/amount) after N days post-approval.
- **Out-of-scope allowance** — Enrollment is Active but the employee's current
  Fabric eligibility row is false, or their title no longer maps to a level.
- **No asset assigned** — Enrollment is Active with no linked Asset #.
- **Multiple assets assigned** — More than one active Asset linked to the
  same Enrollment/Employee.
- **Asset mismatch** — Linked Asset's assignee/VIN/company in Dynamics does
  not match the Employee/Vehicle on the Dataverse record.
- **Payroll still enrolled after termination** — Enrollment status is
  Suspended / Expired / Opted-Out but Payroll Ack = true with no subsequent
  payroll-stop ack, or effective end-date has passed without payroll
  confirmation.

These same checks power a "Needs Attention" tile on the admin landing page
and are written to the Audit Log when raised and when resolved.

**Legacy handling:** issues on `Legacy/Migrated = true` records are tagged
`Severity = Informational` and sort lower in the Needs Attention queue.
They never gate payroll for a record that was Active at migration time.

### 7. Security / Governance

- Dataverse security roles: Employee, Supervisor, Equipment Leader (scoped
  by operating company via business unit or row-level filter), CCI Director,
  Program Admin, Payroll (read-only).
- Only Program Admins can edit Allowance Level and Program Parameters
  tables. Eligibility, max qualifying level, and company-car deferral
  are **Fabric-owned and not editable from the app by any role**;
  corrections go through the upstream HR system (typically via a
  dispute initiated by the employee).
- Audit columns + dedicated Audit Log table for state transitions and
  parameter changes.
- Solution-based packaging in the single `clyde-bi` environment for
  MVP. Changes land via solution import; no Dev → Test → Prod pipeline
  until additional environments are provisioned.
- Mobile and desktop share a single Dataverse-role-based authorization model.
  The Power Apps mobile shell inherits Entra SSO from the Code App host;
  no separate auth model, no device-specific permission table.

### 8. Explicit Phase-2 items (deferred)

- Power BI dashboard (program analytics, spend run-rate, compliance).
- Automated fuel-card / EV-allowance workflow (task to Exec Assistant,
  provider API if available).
- E-signature (DocuSign/Adobe Sign) for indemnification.
- Direct payroll-system integration (replace Teams notification).

## Critical Files

This brief is the artifact. Implementation happens in a Code Apps project
driven from Claude Code or GitHub Copilot CLI by the `code-apps` plugin,
with a companion Power Platform solution for Dataverse + flows. Expected
repo layout when build starts:

- `/app` — Power Apps Code App source — React + Vite + TypeScript,
  scaffolded from the `microsoft/PowerAppsCodeApps/templates/vite`
  template, deployed via `pac code push`.
- `/solution` — exported Dataverse solution zip (tables, business rules,
  security roles, flows).
- `/fabric` — SQL view definitions feeding eligibility + asset sync.
- `/flows` — Power Automate flow definitions (under solution, tracked here
  for review).

## Verification Plan

- **End-to-end dry run (`clyde-bi` env):**
  1. Seed a test eligible employee in a mock Fabric view.
  2. Run eligibility sync; confirm Employee + 60-day deadline set.
  3. Walk through opt-in wizard with sample dec pages + window sticker;
     verify AI Builder extraction + mismatch flagging.
  4. Approve at each tier via Teams Approvals.
  5. Confirm effective-date math (submit on the 15th vs. 16th test cases).
  6. Verify payroll Teams adaptive card posts and ack flips enrollment status.
  7. Fast-forward test clocks to verify T-60/30/7 insurance reminders and
     lapse termination path.
- **Admin dry run:** change Level D monthly amount; confirm audit log entry
  and that only enrollments effective after the change pick up the new value
  (historical enrollments unchanged). Open the Eligibility Roster;
  confirm it is read-only and lists every Fabric-eligible employee
  with correct in-app status.
- **Dispute flow test:** open the dispute form, pick a reason, attach
  a PDF, submit. Confirm a Teams group chat is created with the
  employee + HR recipients, the seed message includes the disputed
  snapshot and attachment, the deep link returned to the client opens
  that chat, and an `EligibilityDispute` entry appears on the
  employee detail page audit log.
- **Step-down test:** submit a request for a Level A-eligible employee with
  a vehicle whose MSRP only meets Level C; confirm the enrollment is booked
  at Level C. Submit for a Level B employee with an A-priced vehicle;
  confirm the enrollment caps at Level B.
- **Grandfathering test:** book a vehicle under the current Level A MSRP
  floor, then raise the Level A floor; confirm the existing enrollment is
  unaffected and the Jan 1 refresh only changes the dollar amount.
- **Migration dry run:** run the one-time SQL import against a batch of
  legacy enrollees with missing docs; confirm they land as Active, surface
  on Needs Attention with `Severity = Informational` (sorted below blocking
  items), and continue receiving payroll amounts.
- **Company-car deferral test:** MLT+ employee submits a `Mode=CompanyCar`
  request; confirm MSRP/insurance/doc rules are skipped, approval chain
  still runs, and approval fires an Equipment-team assignment task with no
  payroll Teams notice.
- **Security test:** Equipment Leader from Company X cannot see Company Y
  requests; Payroll role cannot edit; non-admin cannot open config pages.
- **Fabric sync test:** break the Fabric→Dataverse join on a user (missing
  UPN) and confirm the reconciliation flow surfaces it to admin.
- **Mobile layout check:** walk the employee happy path on a phone (375px
  viewport / Power Apps mobile app) — eligibility landing, full 6-step
  wizard including camera-based window-sticker upload, status tracker,
  renewal, opt-out — and confirm no horizontal scroll, all tap targets
  ≥ 44px, stepper renders vertically, data grids collapse to cards.
  Repeat on the admin side for Needs Attention, Pending Approvals, and
  individual Request Review (approve/reject). Confirm Config pages either
  render usably or show the "open on a larger screen" degradation.
