/**
 * Type shim for @microsoft/power-apps.
 *
 * At runtime Vite replaces this import with mock-power-apps/index.tsx.
 * This declaration lets tsc type-check src/PowerProvider.tsx without
 * needing the real (or absent) @microsoft/power-apps package.
 */
declare module '@microsoft/power-apps' {
  import type { ReactNode } from 'react'

  export function AuthenticationProvider(props: { children: ReactNode }): JSX.Element
  export function ConnectorProvider(props: { children: ReactNode }): JSX.Element
  export function useAuthContext(): { userId: string }
  export function useConnectorContext(): {
    connectors: {
      dataverse: {
        retrieveMultipleRecords(entity: string, query?: string): Promise<{ entities: unknown[] }>
        retrieveRecord(entity: string, id: string, query?: string): Promise<unknown>
        createRecord(entity: string, data: Record<string, unknown>): Promise<{ id: string }>
        updateRecord(entity: string, id: string, data: Record<string, unknown>): Promise<void>
        uploadFile(entity: string, id: string, column: string, file: File): Promise<void>
      }
      powerAutomate: {
        runFlow(flowName: string, params?: Record<string, unknown>): Promise<unknown>
      }
    }
  }
}
