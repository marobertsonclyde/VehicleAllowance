# Flow 7: Insurance Expiry Reminder (Scheduled)

**Trigger:** Recurrence — Daily at 7:00 AM Mountain Time

**Actions:**
1. Get active va_ReminderConfig (va_isActive = true)
2. Query all va_InsurancePolicy where:
   - va_status = "Active"
   - Linked AllowanceRecord.va_status = "Active"
3. **For each policy:** Calculate days until expiration = `va_expirationDate - today`
4. **Determine reminder tier:**

| Condition | Tier | Recipients | Action |
|---|---|---|---|
| days == reminderDays1 | Reminder 1 | Employee | Teams: "Your insurance expires in {days} days" |
| days == reminderDays2 | Reminder 2 | Employee + Equipment Leader | Teams: "Urgent: Insurance expires in {days} days" |
| days == reminderDays3 | Reminder 3 | Employee + Equipment Leader + Director | Teams: "Final notice: Insurance expires in {days} days" |
| days == 0 | Expired | Equipment Leader + Director | Teams: "Insurance has expired — grace period started" |
| days == -gracePeriodDays | Grace Expired | All + Payroll | Terminate AllowanceRecord. Update status → Terminated. Notify payroll channel. |

5. **De-duplication:** Before sending, check `va_lastReminderSentDate` and `va_lastReminderType`. Skip if already sent for this tier today.
6. After sending, update InsurancePolicy: `va_lastReminderSentDate = utcNow()`, `va_lastReminderType = tier`
7. Create va_AuditLog for each reminder sent and for terminations
