declare module '@microsoft/power-apps' {
  import type { ReactNode } from 'react'

  export interface DataverseConnector {
    retrieveMultipleRecords: (entitySetName: string, query?: string) => Promise<{ entities?: any[] }>
    retrieveRecord: (entitySetName: string, id: string, query?: string) => Promise<Record<string, any>>
    createRecord: (entitySetName: string, data: Record<string, any>) => Promise<Record<string, any>>
    updateRecord: (entitySetName: string, id: string, data: Record<string, any>) => Promise<void>
    uploadFile: (
      entitySetName: string,
      id: string,
      attributeName: string,
      fileContentBase64: string,
      fileName: string,
      mimeType: string,
    ) => Promise<void>
  }

  export interface PowerAutomateConnector {
    runFlow: (flowName: string, payload: Record<string, any>) => Promise<unknown>
  }

  export interface ConnectorContextValue {
    connectors: {
      dataverse: DataverseConnector
      powerAutomate: PowerAutomateConnector
    }
  }

  export function useConnectorContext(): ConnectorContextValue

  export function AuthenticationProvider(props: { children: ReactNode }): JSX.Element
  export function ConnectorProvider(props: { children: ReactNode }): JSX.Element
}
