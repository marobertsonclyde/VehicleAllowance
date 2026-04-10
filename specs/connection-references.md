# Connection References — Build Reference

Create these connection references in the solution. Each environment needs its own connections configured.

| Logical Name | Connector | Used By | Notes |
|---|---|---|---|
| va_DataverseConnection | Microsoft Dataverse | All flows, code app | Standard connector. Auto-authenticated via current user context. |
| va_TeamsConnection | Microsoft Teams | Flows 1, 3, 4, 5, 6, 7 | Post adaptive cards and channel messages. Requires Teams license. |
| va_AIBuilderConnection | AI Builder | Flows 2, 8 | Calls custom AI models. Requires AI Builder capacity. |
| va_FabricSqlConnection | SQL Server | Eligibility check flow | Connects to Fabric SQL endpoint for HR data. Use SQL Server connector with Fabric SQL connection string. |
| va_SharePointConnection | SharePoint | AI model training, policy document links | Access to training data library and document storage. |

## Setup Per Environment

1. Create each connection in the target environment
2. In the solution, map each connection reference to the environment's connection
3. For `va_FabricSqlConnection`: use the `va_FabricSqlEndpoint` env var for the server URL
4. For `va_TeamsConnection`: use a service account or the flow owner's connection
5. For `va_AIBuilderConnection`: ensure AI Builder capacity is allocated to the environment
