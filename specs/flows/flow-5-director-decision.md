# Flow 5: Director Decision

**Trigger:** Dataverse — When va_AllowanceApplication.va_directorDecision is set AND va_status = "Director Review"

**Actions:**
1. Get application record
2. Set `va_directorReviewDate = utcNow()`
3. **Branch on decision:**
   - **Approved:** Call Flow 6 (Payroll Notification) with `applicationId`
   - **Returned:** Update status → "Returned to Employee". Send Teams message to applicant.
   - **Rejected:** Update status → "Rejected". Send Teams message to applicant.
4. Create va_AuditLog: eventType="DirectorDecision", previousStatus="Director Review", newStatus=(target), notes=va_directorNotes
