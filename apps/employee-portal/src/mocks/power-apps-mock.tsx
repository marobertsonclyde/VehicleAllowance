/**
 * POC mock for @microsoft/power-apps
 *
 * Vite aliases this module path on the poc/dummy-data branch so all imports
 * of `@microsoft/power-apps` resolve here instead of the real SDK.
 * The real hooks (useCurrentApplication etc.) call `useConnectorContext()`
 * which returns our mock connectors — no changes to hook code needed.
 */
import { type ReactNode } from 'react'
import { useMockConnectorContext } from './MockConnectorContext'

// These providers are no-ops in the POC — authentication is bypassed.
export function AuthenticationProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function ConnectorProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// This is the key export — hooks call useConnectorContext() and get our mocks.
export function useConnectorContext() {
  return useMockConnectorContext()
}
