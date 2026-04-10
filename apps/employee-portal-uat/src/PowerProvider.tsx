/**
 * UAT PowerProvider — passthrough wrapper.
 *
 * In the real app this sets up @microsoft/power-apps Auth + Connector providers.
 * In UAT those providers are supplied by the mock SDK (mock-power-apps/index.ts),
 * so this component is a plain passthrough to keep main.tsx unchanged.
 */
import type { ReactNode } from 'react'
import { AuthenticationProvider, ConnectorProvider } from '@microsoft/power-apps'

export function PowerProvider({ children }: { children: ReactNode }) {
  return (
    <AuthenticationProvider>
      <ConnectorProvider>
        {children}
      </ConnectorProvider>
    </AuthenticationProvider>
  )
}
