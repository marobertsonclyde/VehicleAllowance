# Flow 9: Payroll Earn Code Verification

**Trigger:** Two triggers:
- **Scheduled:** Recurrence — Daily at 6:00 AM Mountain Time (automated batch)
- **Manual (on-demand):** Called by code app via `va_VerifyPayrollEarnCode` with `{ allowanceRecordId }` input

---

## Inputs

| Parameter | Type | Required | Notes |
|---|---|---|---|
| allowanceRecordId | GUID | No | When provided, verifies only this record (on-demand). When omitted, verifies all active records (scheduled batch). |

---

## Actions

1. **Determine scope:**
   - If `allowanceRecordId` is provided → fetch single va_AllowanceRecord
   - If omitted (scheduled run) → query all va_AllowanceRecord where `va_status = "Active"`

2. **For each AllowanceRecord:**

   a. **Query Fabric SQL endpoint** (via SQL Server connector using `va_FabricSqlEndpoint` env var):
   ```sql
   SELECT EarnCode, Amount, EffectiveDate, Status
   FROM PayrollEarnCodes
   WHERE PersonnelNumber = @personnelNumber
     AND EarnCodeType = 'VehicleAllowance'
     AND Status = 'Active'
   ```

   b. **Evaluate result:**

   | Condition | Verification Status | Notes |
   |---|---|---|
   | No rows returned | `Not Found` | Earn code not set up in payroll |
   | Row found, amount matches `va_totalMonthlyAmount` | `Verified` | Payroll is correctly configured |
   | Row found, amount ≠ `va_totalMonthlyAmount` | `Amount Mismatch` | Payroll amount doesn't match allowance |
   | SQL query fails | `Failed` | Connection or query error |

   c. **Update AllowanceRecord:**
   - `va_payrollVerificationStatus` = determined status
   - `va_payrollVerifiedDate` = `utcNow()`
   - `va_payrollEarnCode` = earn code from SQL (if found)
   - `va_payrollAmount` = amount from SQL (if found)
   - `va_payrollAmountMismatch` = `true` if Amount Mismatch, else `false`
   - `va_payrollVerificationNotes` = description of finding (e.g., "Expected $650.00, found $550.00")

3. **Notifications (scheduled batch only):**
   - If any records have status `Not Found` or `Amount Mismatch`:
     - Post summary to `va_PayrollTeamsChannelId`:
       > **Payroll Verification Alert**
       > {count} allowance record(s) require attention:
       > - {notFoundCount} not found in payroll
       > - {mismatchCount} with amount mismatch
     - Include deep link to `/payroll/allowances` in the code app

4. **Create va_AuditLog** for each verification:
   - `va_eventType` = "PayrollVerification"
   - `va_notes` = verification result summary
   - `va_applicationId` = linked original application

---

## Output (on-demand only)

Returns `PayrollVerificationResult` to the calling code app:

```json
{
  "status": "Verified | Not Found | Amount Mismatch | Failed",
  "earnCode": "VA-A",
  "payrollAmount": 650.00,
  "expectedAmount": 650.00,
  "amountMismatch": false,
  "notes": "Earn code VA-A verified with matching amount"
}
```

---

## Connection References

- **Fabric SQL** (`va_FabricSqlEndpoint`) — reads earn code data
- **Dataverse** — reads/updates AllowanceRecord, creates AuditLog
- **Microsoft Teams** — posts batch alerts to payroll channel

---

## Error Handling

- If Fabric SQL endpoint is unreachable, set status to `Failed` with connection error in notes
- Scheduled batch: continue processing remaining records if one fails; include failures in summary notification
- On-demand: return `Failed` status so the UI can display the error
