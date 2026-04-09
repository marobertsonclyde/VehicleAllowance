/**
 * Replaces PowerProvider on the poc/dummy-data branch.
 * Wraps the app with mock connector context and renders the scenario switcher.
 */
import { useState, type ReactNode } from 'react'
import { MockConnectorProvider } from './MockConnectorContext'
import { ScenarioSelector } from './ScenarioSelector'
import { SCENARIOS, DEFAULT_SCENARIO, type ScenarioKey } from './mock-data'

interface MockPowerProviderProps {
  children: ReactNode
}

export function MockPowerProvider({ children }: MockPowerProviderProps) {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>(DEFAULT_SCENARIO)
  const scenario = SCENARIOS[scenarioKey]

  return (
    <MockConnectorProvider scenario={scenario}>
      {children}
      <ScenarioSelector current={scenarioKey} onChange={setScenarioKey} />
    </MockConnectorProvider>
  )
}
