/**
 * Provides a mock connector context that replaces the real
 * @microsoft/power-apps connector context for the POC branch.
 *
 * The mock `useConnectorContext` in power-apps-mock.tsx reads from this context.
 */
import { createContext, useContext, type ReactNode } from 'react'
import type { ScenarioData } from './mock-data'

// ─── Mock connector shape ─────────────────────────────────────────────────────

interface MockDataverseConnector {
  retrieveMultipleRecords: (entityName: string, options?: string) => Promise<{ entities: unknown[] }>
  retrieveRecord: (entityName: string, id: string) => Promise<unknown>
  createRecord: (entityName: string, data: object) => Promise<{ id: string }>
  updateRecord: (entityName: string, id: string, data: object) => Promise<void>
  deleteRecord: (entityName: string, id: string) => Promise<void>
}

interface MockPowerAutomateConnector {
  runFlow: (flowName: string, data: object) => Promise<unknown>
}

export interface MockConnectors {
  dataverse: MockDataverseConnector
  powerAutomate: MockPowerAutomateConnector
}

interface MockConnectorContextValue {
  connectors: MockConnectors
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MockConnectorCtx = createContext<MockConnectorContextValue | null>(null)

export function useMockConnectorContext(): MockConnectorContextValue {
  const ctx = useContext(MockConnectorCtx)
  if (!ctx) throw new Error('useMockConnectorContext: no provider found')
  return ctx
}

// ─── Connector factory ────────────────────────────────────────────────────────

function buildConnectors(scenario: ScenarioData): MockConnectors {
  const dataverse: MockDataverseConnector = {
    async retrieveMultipleRecords(entityName) {
      switch (entityName) {
        case 'va_allowanceapplications':
          return { entities: scenario.application ? [scenario.application] : [] }
        case 'va_vehicles':
          return { entities: scenario.vehicle ? [scenario.vehicle] : [] }
        case 'va_insurancepolicies':
          return { entities: scenario.policies }
        case 'va_documentchecklists':
          return { entities: scenario.checklist }
        case 'va_documents':
          return { entities: scenario.documents }
        case 'va_allowancerecords':
          return { entities: scenario.record ? [scenario.record] : [] }
        default:
          console.warn(`[MOCK] retrieveMultipleRecords: no mock for "${entityName}"`)
          return { entities: [] }
      }
    },

    async retrieveRecord(entityName, id) {
      console.log(`[MOCK] retrieveRecord ${entityName}/${id}`)
      return {}
    },

    async createRecord(entityName, data) {
      console.log('[MOCK] createRecord', entityName, data)
      return { id: `mock-${Date.now()}` }
    },

    async updateRecord(entityName, id, data) {
      console.log('[MOCK] updateRecord', entityName, id, data)
    },

    async deleteRecord(entityName, id) {
      console.log('[MOCK] deleteRecord', entityName, id)
    },
  }

  const powerAutomate: MockPowerAutomateConnector = {
    async runFlow(flowName, data) {
      console.log('[MOCK] runFlow', flowName, data)
      switch (flowName) {
        case 'va_CheckEmployeeEligibility':
          return scenario.eligibility
        case 'va_SubmitApplication':
        case 'va_ReprocessDocument':
        case 'va_SubmitOptOut':
          return null
        case 'va_GetAllowanceLevelForMsrp':
          return {
            levels: [
              { level: 'B', minimumMsrp: 59000, monthlyAllowance: 1500 },
              { level: 'C', minimumMsrp: 46000, monthlyAllowance: 1260 },
            ],
          }
        default:
          console.warn(`[MOCK] runFlow: no mock for "${flowName}"`)
          return null
      }
    },
  }

  return { dataverse, powerAutomate }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface MockConnectorProviderProps {
  scenario: ScenarioData
  children: ReactNode
}

export function MockConnectorProvider({ scenario, children }: MockConnectorProviderProps) {
  const connectors = buildConnectors(scenario)
  return (
    <MockConnectorCtx.Provider value={{ connectors }}>
      {children}
    </MockConnectorCtx.Provider>
  )
}
