# Security Model

This document summarizes authentication, authorization, and data-protection controls for the Vehicle Allowance Power Platform solution.

## Authentication

- Users authenticate with Microsoft Entra ID (Azure AD) using managed corporate identities.
- Automation flows should use service-principal connections where possible for non-interactive operations.
- Conditional Access and MFA policies are inherited from tenant-level enterprise controls.

## Authorization

Dataverse role-based access control (RBAC) is mapped to Entra groups:

| Entra Group | Dataverse Role | Purpose |
|---|---|---|
| `PP-VA-Employee` | `va_Employee` | Employee portal access and own-record interaction |
| `PP-VA-EquipmentLeader` | `va_EquipmentLeader` | First-level review and decisioning |
| `PP-VA-Director` | `va_Director` | Director review and approvals |
| `PP-VA-President` | `va_President` | President review for required opt-in paths |
| `PP-VA-Payroll` | `va_Payroll` | Read approved outcomes and payroll handoff data |
| `PP-VA-Administrator` | `va_Administrator` | Solution administration and configuration |

## Data Protection

- Uploaded insurance and vehicle documents may contain PII and are stored in Dataverse.
- Sensitive reviewer-only fields should use field-level security profiles.
- Audit trail entries are retained for review actions and key state transitions.
- Training artifacts containing PII are not stored in this Git repository.

## Operational Controls

- Quarterly access recertification for each role-mapped Entra group.
- Break-glass admin access logging and time-bound elevation.
- Environment variables used for endpoint/user IDs must be reviewed before promotion.

## Recommended Control Enhancements

1. Add automated role-membership drift detection with weekly reports.
2. Enable data loss prevention (DLP) policy validation in CI release checks.
3. Add a documented incident response runbook for compromised account scenarios.
