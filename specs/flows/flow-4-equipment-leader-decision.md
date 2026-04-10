# Flow 4: Equipment Leader Decision

**Trigger:** Dataverse — When va_AllowanceApplication.va_equipmentLeaderDecision is set AND va_status = "Equipment Leader Review"

**Actions:**
1. Get application record
2. Set `va_equipmentLeaderReviewDate = utcNow()`
3. **Branch on decision:**
   - **Approved:** Update status → "Director Review". Send Teams adaptive card to Director (env var `va_DirectorOfEquipmentUserId`) with review link.
   - **Returned:** Update status → "Returned to Employee". Send Teams message to applicant: "Your application has been returned. Please review feedback and resubmit."
   - **Rejected:** Update status → "Rejected". Send Teams message to applicant: "Your application has been rejected."
4. Create va_AuditLog: eventType="EquipmentLeaderDecision", previousStatus="Equipment Leader Review", newStatus=(target), notes=va_equipmentLeaderNotes
