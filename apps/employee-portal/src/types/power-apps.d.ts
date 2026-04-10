// Type augmentations for @microsoft/power-apps SDK
// These provide IntelliSense for the connector APIs.

declare module '@microsoft/power-apps' {
  export function AuthenticationProvider(props: {
    children: React.ReactNode
  }): React.ReactElement

  export function ConnectorProvider(props: {
    children: React.ReactNode
  }): React.ReactElement

  export interface DataverseConnector {
    retrieveRecord(
      entityLogicalName: string,
      id: string,
      options?: string,
    ): Promise<Record<string, unknown>>

    retrieveMultipleRecords(
      entityLogicalName: string,
      options?: string,
    ): Promise<{ entities: Record<string, unknown>[]; nextLink?: string }>

    createRecord(
      entityLogicalName: string,
      data: Record<string, unknown>,
    ): Promise<{ id: string }>

    updateRecord(
      entityLogicalName: string,
      id: string,
      data: Record<string, unknown>,
    ): Promise<void>

    deleteRecord(
      entityLogicalName: string,
      id: string,
    ): Promise<void>

    uploadFile(
      entityLogicalName: string,
      id: string,
      columnLogicalName: string,
      file: File,
    ): Promise<void>
  }

  export interface PowerAutomateConnector {
    runFlow(
      flowName: string,
      inputs: Record<string, unknown>,
    ): Promise<unknown>
  }

  export interface ConnectorContext {
    connectors: {
      dataverse: DataverseConnector
      powerAutomate: PowerAutomateConnector
    }
  }

  export function useConnectorContext(): ConnectorContext

  export interface AuthContext {
    userId: string
    userName: string
    userEmail: string
  }

  export function useAuthContext(): AuthContext
}
