# Flow 3: Application Routing (Child Flow)

**Trigger:** Manual (child flow) — Inputs: `applicationId`, `aiScore`, `aiAutoApprovalEligible`

**Routing Logic:**

| Condition | Path | Action |
|---|---|---|
| aiAutoApprovalEligible AND applicationType != New Opt-In | Fast-track to Director | Set status → Director Review, send Teams adaptive card to Director |
| aiAutoApprovalEligible AND applicationType == New Opt-In | Equipment Leader with AI badge | Set status → Equipment Leader Review, send Teams card with "AI Approved" badge |
| NOT aiAutoApprovalEligible | Equipment Leader with flags | Set status → Equipment Leader Review, send Teams card with flagged issues |

**Actions:**
1. Get application record (need applicationType)
2. Evaluate routing condition (see table above)
3. Update application status accordingly
4. Create va_AuditLog: eventType="Routing", previousStatus="AI Review", newStatus=(target status)
5. Send Teams adaptive card to target reviewer with:
   - Application number, applicant name, type
   - AI score badge (green if eligible, yellow if not)
   - Flagged issues (if any)
   - "Review Application" button → deep link to portal `/review/{applicationId}`

**Teams Adaptive Card Recipients:**
- Equipment Leader: env var `va_EquipmentLeaderUserId`
- Director: env var `va_DirectorOfEquipmentUserId`
