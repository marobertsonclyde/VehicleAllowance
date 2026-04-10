# Vehicle Allowance Code App Rewrite Plan (Fork)

## Why this rewrite

This repository is currently structured as a Power Platform solution export (Dataverse entities, flows, roles, bot topics, and app module metadata). For the fork, the target is a **Power Apps code app** architecture where application UX and business logic are implemented in source code (for example, React/TypeScript) and deployed into a Power Platform environment.

## What a Power Apps code app is (research summary)

Based on Microsoft Learn documentation:

- Code apps are **code-first web apps** developed in an IDE (such as VS Code), then published to Power Platform.
- They run on Power Platform managed controls (authN/authZ, sharing, DLP/Conditional Access alignment) while giving full control over UI and app logic.
- They are different from canvas and model-driven apps, and currently have notable limitations (for example, no native support in Power Apps mobile app).
- Microsoft is transitioning from older `pac code` commands toward a newer npm-based CLI in the code apps client library.

## Proposed target architecture for the fork

1. **Single code app frontend**
   - React + TypeScript app (or chosen framework) in a clean monorepo folder.
   - Explicit screen routing for employee, reviewer, and admin experiences.

2. **Dataverse-centric data layer**
   - Keep Dataverse as system-of-record.
   - Access via supported code app data/connectivity patterns.

3. **Workflow/orchestration redesign**
   - Rebuild all current workflow behavior as either:
     - Power Automate cloud flows (manually configured where automation tooling is blocked), and/or
     - Server-side custom APIs/Azure Functions where deterministic code-based orchestration is needed.

4. **Copilot/agent integration**
   - Recreate assistant capabilities as a separately managed component with clear contract boundaries (prompting, tool access, escalation paths).

5. **ALM/deployment**
   - CI pipeline for lint/test/build/package.
   - Environment-based configuration and release promotion.

## Functional parity map (rewrite scope)

The rewrite should preserve functional outcomes from the current solution:

- Employee eligibility and submission.
- Vehicle and insurance document handling.
- Review/approval routing (equipment leader/director/payroll).
- Notification/reminder processes.
- Status tracking and auditability.

## Key constraints and risks to resolve early

1. **Environment readiness**
   - Code apps must be enabled in target environments.
   - End users need compatible licensing.

2. **Automation coverage gaps**
   - Confirm which assets can be created/managed via CLI/API versus requiring maker portal/manual setup.

3. **Identity and security model**
   - Validate role mapping from current security model to code app auth/authorization checks.

4. **Operational visibility**
   - Add telemetry and request tracing from day 1.

## Discovery questions before implementation

These must be answered before building the new fork:

1. Which framework should we standardize on for the code app UI (React/Vue/other)?
2. Is Dataverse still mandatory as the source of truth for all entities?
3. Which existing flows are acceptable to rebuild manually in Power Automate vs. move into code-first services?
4. Do we require mobile support on day 1 (noting code app mobile limitations)?
5. Should Copilot/agent capabilities be in scope for v1, or staged for v1.1+?
6. What are the exact nonfunctional targets (SLA, concurrency, auditing depth, DR/RPO/RTO)?
7. What is the cutover strategy: big bang vs. phased rollout by user group?

## Execution plan (phased)

### Phase 0 — Alignment and design (1–2 weeks)
- Confirm product scope and decisions for the open questions.
- Produce canonical architecture diagrams and security model.
- Define parity acceptance criteria from the current solution behavior.

### Phase 1 — Platform foundation (1 week)
- Provision target environments and enable code apps feature.
- Set up repo scaffolding, coding standards, CI checks, and environment config strategy.
- Define logging/telemetry baseline.

### Phase 2 — Core domain implementation (2–4 weeks)
- Implement application and allowance domain modules.
- Implement employee journey end-to-end (eligibility to submission).
- Integrate Dataverse reads/writes and validation logic.

### Phase 3 — Decisioning and operations (2–3 weeks)
- Implement reviewer workflows (equipment leader/director/payroll).
- Implement reminders/notifications and insurance renewal handling.
- Rebuild assistant/agent integration as approved.

### Phase 4 — Hardening and cutover (1–2 weeks)
- UAT, security validation, and performance testing.
- Data migration/reconciliation (if needed).
- Production rollout + hypercare.

## Definition of done for the rewrite

- Functional parity (or approved deltas) signed off by business owner.
- Security and compliance controls validated in target environment.
- Runbooks and support ownership documented.
- Legacy solution path archived with rollback and audit trail.
