/**
 * Mock replacement for @microsoft/power-apps
 *
 * Provides the same API surface used by the portal (AuthenticationProvider,
 * ConnectorProvider, useAuthContext, useConnectorContext) but backed entirely
 * by the in-memory MockStore instead of real Dataverse / Power Automate.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { mockStore } from './MockStore'
import { buildMockDataverse } from './mockDataverse'
import { buildMockFlowRunner } from './mockFlows'

// ─── Auth context ──────────────────────────────────────────────────────────────

interface AuthCtx { userId: string }
const AuthContext = createContext<AuthCtx>({ userId: mockStore.getUserId() })

export function AuthenticationProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState(mockStore.getUserId())

  useEffect(() => {
    return mockStore.subscribe(() => setUserId(mockStore.getUserId()))
  }, [])

  return (
    <AuthContext.Provider value={{ userId }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}

// ─── Connector context ─────────────────────────────────────────────────────────

interface ConnectorCtx {
  connectors: {
    dataverse:     ReturnType<typeof buildMockDataverse>
    powerAutomate: ReturnType<typeof buildMockFlowRunner>
  }
}

const ConnectorContext = createContext<ConnectorCtx>({
  connectors: {
    dataverse:     buildMockDataverse(),
    powerAutomate: buildMockFlowRunner(),
  },
})

export function ConnectorProvider({ children }: { children: ReactNode }) {
  return (
    <ConnectorContext.Provider value={{
      connectors: {
        dataverse:     buildMockDataverse(),
        powerAutomate: buildMockFlowRunner(),
      },
    }}>
      {children}
    </ConnectorContext.Provider>
  )
}

export function useConnectorContext() {
  return useContext(ConnectorContext)
}
