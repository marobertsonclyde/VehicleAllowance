# Environment Variables — Build Reference

Create these in Power Platform > Solutions > Environment Variables.

| Name | Type | Default | Purpose |
|---|---|---|---|
| va_EquipmentLeaderUserId | Text | (AAD Object ID) | Routes Teams notifications to Equipment Leader |
| va_DirectorOfEquipmentUserId | Text | (AAD Object ID) | Routes Teams notifications to Director |
| va_PayrollTeamsChannelId | Text | (Teams channel ID) | Target channel for payroll notifications |
| va_PortalUrl | Text | (Code app URL) | Deep links in Teams messages, e.g. `https://apps.powerapps.com/play/e/{appId}` |
| va_AIAutoApprovalThreshold | Text | 75 | Minimum AI score (0-100) for fast-track routing |
| va_OptInWindowDays | Text | 60 | Days after eligibility determination to submit application |
| va_FabricSqlEndpoint | Text | (Fabric SQL URL) | Endpoint for employee HR data validation (eligibility check) |

## Per-Environment Overrides

Set different values in each environment (Dev, Test, Prod):
- `va_EquipmentLeaderUserId` — different user per environment
- `va_DirectorOfEquipmentUserId` — different user per environment
- `va_PayrollTeamsChannelId` — test channel in Dev/Test, production channel in Prod
- `va_PortalUrl` — environment-specific app URL
- `va_FabricSqlEndpoint` — environment-specific SQL endpoint
