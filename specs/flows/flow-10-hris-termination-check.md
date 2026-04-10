# Flow 10: HRIS Termination Check (Scheduled)

**Trigger:** Recurrence — Daily at 5:00 AM Mountain Time (runs before Flow 9 payroll verification)

---

## Purpose

Detects employees who have been separated in the HRIS and automatically terminates their active allowance records. Prevents continued payroll disbursement after an employee leaves the company.

---

## Actions

1. **Query all active allowance records:**
   ```
   va_AllowanceRecord where va_status = "Active"
   ```

2. **For each record**, query Fabric SQL for current employment status:
   ```sql
   SELECT EmploymentStatus, TerminationDate, PersonnelNumber
   FROM Employees
   WHERE PersonnelNumber = @personnelNumber
   ```

3. **Evaluate result:**

   | Condition | Action |
   |---|---|
   | `EmploymentStatus` = "Active" | No action — skip |
   | `EmploymentStatus` = "Terminated" or "Separated" | Terminate allowance record (step 4) |
   | Employee not found in HRIS | Flag for admin review — do not auto-terminate |
   | SQL query fails | Log error, continue to next record |

4. **Terminate the allowance record:**
   - Update va_AllowanceRecord:
     - `va_status` = "Terminated"
     - `va_terminationReason` = "Employee separated per HRIS (TerminationDate: {date})"
   - Create va_AuditLog:
     - `va_eventType` = "AutoTermination"
     - `va_previousStatus` = "Active"
     - `va_newStatus` = "Terminated"
     - `va_performedByName` = "System — HRIS Termination Check"
     - `va_notes` = "Employee no longer active in HRIS. Personnel #: {personnelNumber}"
     - `va_applicationId` = linked original application

5. **Handle "not found" cases:**
   - If the employee's personnel number returns no rows from Fabric SQL, this may indicate a data sync issue rather than a true termination
   - Update va_AllowanceRecord:
     - `va_payrollVerificationNotes` = "Employee not found in HRIS — flagged for admin review"
   - Create va_AuditLog:
     - `va_eventType` = "HRISLookupFailed"
     - `va_notes` = "Personnel # {personnelNumber} not found in Fabric SQL. Manual review required."
   - Do **not** change `va_status` — leave as Active until an admin investigates

---

## Connection References

- **Fabric SQL** (`va_FabricSqlEndpoint`) — reads employment status
- **Dataverse** — reads/updates AllowanceRecord, creates AuditLog

---

## Error Handling

- If Fabric SQL endpoint is unreachable, log the error and skip the entire batch (do not terminate any records on connection failure)
- If an individual query fails, log the error for that record and continue processing remaining records
- All termination actions are audited — no silent state changes
