# Flow 1: Application Submission Orchestrator

**Trigger:** Dataverse — When va_AllowanceApplication.va_status changes to `Submitted`

**Actions:**
1. Get the application record (all fields)
2. Generate application number: query count of va_AllowanceApplication, format as `VA-{YYYY}-{count+1 padded to 5 digits}`
3. Update application: set `va_name`, `va_submittedOn = utcNow()`
4. Create va_AuditLog: eventType="Submission", newStatus="Submitted"
5. Send Teams adaptive card to applicant: "Your application {va_name} has been submitted"
6. Update application: set `va_status = AI Review`
7. Call Flow 2 (child flow) with `applicationId`

**Outputs:** None (writes to Dataverse)
