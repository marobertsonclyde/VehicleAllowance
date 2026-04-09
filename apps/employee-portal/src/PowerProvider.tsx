/**
 * PowerProvider
 *
 * Wraps the app with the Power Apps SDK authentication and connector context.
 * All Dataverse calls and flow invocations made within the app pass through
 * the middleware provided by `pac code run`, which handles Entra ID token
 * acquisition transparently.
 *
 * See: https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture
 */
import { type ReactNode } from 'react'
import { AuthenticationProvider, ConnectorProvider } from '@microsoft/power-apps'

interface PowerProviderProps {
  children: ReactNode
}

export function PowerProvider({ children }: PowerProviderProps) {
  return (
    <AuthenticationProvider>
      <ConnectorProvider>
        {children}
      </ConnectorProvider>
    </AuthenticationProvider>
  )
}
