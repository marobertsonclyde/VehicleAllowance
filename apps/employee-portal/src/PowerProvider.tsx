import { AuthenticationProvider, ConnectorProvider } from '@microsoft/power-apps'
import type { ReactNode } from 'react'

interface PowerProviderProps {
  children: ReactNode
}

/**
 * Wraps the app with Power Platform authentication and connector context.
 * During dev, `pac code run` provides the auth middleware.
 * In production, Power Platform manages the auth lifecycle.
 */
export function PowerProvider({ children }: PowerProviderProps) {
  return (
    <AuthenticationProvider>
      <ConnectorProvider>
        {children}
      </ConnectorProvider>
    </AuthenticationProvider>
  )
}
