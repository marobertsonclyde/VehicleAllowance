# Security Roles — Build Reference

5 roles. All prefixed `va_`. Scope: B = Business Unit, G = Global, O = Own records only.

## Permission Matrix

| Table | Employee | Equipment Leader | Director | Payroll | Administrator |
|---|---|---|---|---|---|
| **va_AllowanceApplication** | CRUD/O | CRU/G | RU/G | R/G | CRUD/G |
| **va_Vehicle** | CRUD/O | CRU/G | R/G | — | CRUD/G |
| **va_InsurancePolicy** | CRU/O | CRU/G | R/G | R/G | CRUD/G |
| **va_Document** | CRU/O | CRU/G | R/G | — | CRUD/G |
| **va_AllowanceRecord** | R/O | RU/G | RU/G | R/G | CRUD/G |
| **va_AuditLog** | R/O | CR/G | R/G | — | CR/G |
| **va_CompanyEntity** | R/G | R/G | RU/G | R/G | CRUD/G |
| **va_AllowanceLevelConfig** | R/G | R/G | RU/G | R/G | CRUD/G |
| **va_ReminderConfig** | — | R/G | RU/G | — | CRUD/G |

Legend: C=Create, R=Read, U=Update, D=Delete. /O=Own, /G=Global.

## Column-Level Security Profiles

Create a **Field Security Profile** named `va_ReviewerNotesProfile`:
- Columns: `va_equipmentLeaderNotes`, `va_directorNotes`
- Grant read access to: va_EquipmentLeader, va_Director, va_Administrator
- Deny read access to: va_Employee, va_Payroll

## Role Assignments

| Role | Assigned To |
|---|---|
| va_Employee | All users (baseline) |
| va_EquipmentLeader | Equipment department team lead |
| va_Director | Director of Equipment |
| va_Payroll | Payroll department members |
| va_Administrator | System administrators, power platform admins |

Users may have multiple roles. The code app resolves to the highest-privilege role for navigation.
