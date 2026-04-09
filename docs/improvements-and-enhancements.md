# Improvements & Feature Enhancements Backlog

This backlog proposes practical improvements for the Vehicle Allowance solution, prioritized for delivery value, operational risk reduction, and implementation effort.

## Priority 1 — Quick Wins (0–2 sprints)

### 1) Strengthen data quality guardrails
- Add Dataverse business rules and server-side validations for:
  - Missing VIN/MSRP on New Opt-In applications
  - Insurance expiry date in the past at submission time
  - Duplicate active applications for the same PersonnelNumber
- Add explicit required-field UX hints in the employee portal before file upload.

**Value:** Reduces reviewer rework and prevents avoidable routing loops.

### 2) Reviewer SLA visibility
- Add `DaysInStage`, `SLAStatus`, and `NextEscalationDate` calculated/derived fields.
- Create model-driven dashboards by role (Equipment Leader, Director, President).
- Add flow-based escalation nudges in Teams when stages exceed configured thresholds.

**Value:** Faster approvals and fewer stalled records.

### 3) AI exception queue improvements
- Introduce a dedicated “AI Exceptions” view that groups low-confidence extraction results.
- Surface side-by-side original document preview + extracted fields for quick correction.
- Track correction reason codes (`Unreadable Scan`, `Wrong Document Type`, etc.).

**Value:** Improves throughput while producing better training feedback for AI models.

### 4) Config-driven policy logic
- Move hard-coded policy assumptions into Dataverse/config tables (where not already present):
  - EV stipend amount
  - Vehicle age eligibility
  - Opt-in cutoff dates
  - Minimum liability thresholds

**Value:** Policy updates become admin actions instead of release events.

## Priority 2 — Medium-Term Enhancements (1–2 quarters)

### 5) Employee “what-if” calculator
- Add a portal calculator for monthly allowance projections by allowance tier, EV status, and effective date.
- Provide transparent rule breakdown (why a user is in a given tier).

**Value:** Better employee trust and fewer eligibility questions to reviewers.

### 6) Document lifecycle automation
- Add automated reminders tied to policy expiry windows with configurable cadence.
- Introduce a “grace period countdown” timeline in the employee status tracker.
- Add one-click re-upload flow for rejected/expired insurance docs.

**Value:** Lowers involuntary terminations and manual follow-up burden.

### 7) Operational analytics
- Build Power BI dashboards for:
  - Approval cycle times by stage/company
  - AI extraction accuracy trend
  - Rejection/return reasons
  - Insurance lapse risk trend by month
- Publish a monthly KPI scorecard to leadership.

**Value:** Enables policy and staffing decisions based on actual process data.

### 8) Auditable decision rationale
- Require structured reason capture for all non-approval outcomes.
- Auto-write decision summaries into `va_auditlog` with actor, timestamp, and prior/new state.
- Add export-ready review packets for compliance or HR investigations.

**Value:** Better legal defensibility and faster incident response.

## Priority 3 — Strategic Features (2+ quarters)

### 9) Dynamics/Fabric master data sync hardening
- Implement resilient sync with retry/dead-letter handling for title/company eligibility attributes.
- Add data freshness indicators in the application UI.
- Add admin reconciliation screen for unresolved employee identity/title mismatches.

**Value:** Improves trust in auto-routing and eligibility outcomes.

### 10) Payroll integration maturity
- Replace notification-only handoff with optional API/file integration to payroll processing.
- Support adjustment events (mid-cycle terminations, stipend changes, corrections).
- Add end-to-end acknowledgment and reconciliation status.

**Value:** Reduces manual payroll touchpoints and payout errors.

### 11) Risk scoring and proactive interventions
- Introduce risk score combining document quality, historical corrections, and lapse history.
- Route high-risk records to enhanced review path.
- Trigger pre-expiry outreach journeys for likely-to-lapse users.

**Value:** Prevents downstream compliance and payroll incidents.

### 12) Knowledge assistant expansion
- Extend Copilot assistant with contextual answers based on user stage/status.
- Add “next best action” responses and deep links to exact portal screens.
- Track unresolved intents to continuously improve topic coverage.

**Value:** Improves self-service completion rates and reduces support requests.

## Non-Functional Improvement Themes

- **Security:** Add periodic role-access recertification and runbook for least-privilege audits.
- **Reliability:** Standardize retry policies, idempotency keys, and poison-message handling in flows.
- **Testability:** Add a repeatable UAT regression checklist mapped to each flow and status transition.
- **ALM:** Add automated solution validation gates in CI (schema checks, flow reference validation, env var completeness).

## Suggested Delivery Sequence

1. Data quality guardrails + SLA visibility + AI exception queue
2. Config-driven policy logic + operational analytics
3. Document lifecycle automation + auditable rationale
4. Payroll integration maturity + risk scoring + assistant expansion

## Suggested Success Metrics

- 25% reduction in average days-to-approval
- 40% reduction in returned applications due to missing/invalid documents
- 20% reduction in insurance lapse terminations after reminder redesign
- 30% reduction in manual payroll correction events
