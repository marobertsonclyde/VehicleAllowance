# Flow 6: Payroll Notification (Child Flow)

**Trigger:** Manual (child flow) — Input: `applicationId`

**Actions:**
1. Get application record (all fields)
2. Get vehicle record for this application
3. **Calculate effective date:**
   - If day of month <= 15 → 1st of current month
   - If day of month >= 16 → 1st of next month
4. **Calculate next renewal due:**
   - Next August 1 that is >= 3 months from now
   - If today is before May 1 → this year's Aug 1
   - Otherwise → next year's Aug 1
5. **Create va_AllowanceRecord:**
   - va_employeeId, va_personnelnumber, va_originalApplicationId
   - va_currentVehicleId, va_allowanceLevel, va_monthlyAmount
   - va_evChargingAmount, va_totalMonthlyAmount
   - va_effectiveDate (from step 3), va_nextRenewalDue (from step 4)
   - va_status = Active, va_companyEntityId
6. Update application: va_status → "Active", va_effectiveDate, va_payrollNotifiedDate
7. Create va_AuditLog: eventType="Approved", newStatus="Active"
8. **Post to payroll Teams channel** (env var `va_PayrollTeamsChannelId`):
   - Employee name, personnel number
   - Company entity, allowance level
   - Monthly amounts (base + EV + total)
   - Effective date
   - Vehicle details
9. Send Teams message to applicant: "Congratulations! Your vehicle allowance has been approved."
