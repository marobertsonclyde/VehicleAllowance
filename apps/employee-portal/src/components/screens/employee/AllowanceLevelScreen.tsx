import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Card, Button, Text, Spinner, MessageBar, RadioGroup, Radio, tokens } from '@fluentui/react-components'
import { useFlowActions } from '@/hooks/useFlowActions'
import { useWizardState, useWizardDispatch } from '@/context/WizardContext'
import { useConnectorContext } from '@microsoft/power-apps'
import { formatCurrency } from '@/utils/formatters'
import { effectiveDateDescription } from '@/utils/effectiveDateCalc'
import type { AllowanceLevelConfig } from '@/types'

export function AllowanceLevelScreen() {
  const navigate = useNavigate()
  const { connectors } = useConnectorContext()
  const wizardState = useWizardState()
  const dispatch = useWizardDispatch()
  const { getAllowanceLevelsForMsrp } = useFlowActions()

  const [levels, setLevels] = useState<AllowanceLevelConfig[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLevels() {
      try {
        // Fetch vehicle MSRP from the created vehicle record
        if (wizardState.vehicleId) {
          const vehicle = await connectors.dataverse.retrieveRecord(
            'va_vehicles',
            wizardState.vehicleId,
            '?$select=va_msrptotal',
          )
          const msrp = vehicle.va_msrptotal as number
          const result = await getAllowanceLevelsForMsrp(msrp)
          setLevels(result as AllowanceLevelConfig[])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load allowance levels')
      } finally {
        setLoading(false)
      }
    }
    void fetchLevels()
  }, [connectors, wizardState.vehicleId, getAllowanceLevelsForMsrp])

  async function handleSelect() {
    if (!selectedLevel || !wizardState.applicationId) return
    setSaving(true)
    try {
      const level = levels.find(l => l.va_allowancelevelconfigid === selectedLevel)
      if (level) {
        await connectors.dataverse.updateRecord('va_allowanceapplications', wizardState.applicationId, {
          va_allowanceLevel: level.va_level,
          va_monthlyAllowanceAmount: level.va_monthlyAllowance,
          va_evChargingAllowance: level.va_evChargingAmount,
          va_totalMonthlyAllowance: (level.va_monthlyAllowance ?? 0) + (level.va_evChargingAmount ?? 0),
        })
      }
      dispatch({ type: 'SET_STEP', payload: 'insurance' })
      navigate('/apply/insurance')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save level selection')
    } finally {
      setSaving(false)
    }
  }

  if (!wizardState.hydrated) return <Spinner size="large" label="Loading..." />
  if (!wizardState.applicationId || !wizardState.vehicleId) return <Navigate to="/apply/vehicle" replace />
  if (loading) return <Spinner size="large" label="Loading available levels..." />

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Select Allowance Level</Text>
      <Text size={300}>{effectiveDateDescription()}</Text>

      {error && <MessageBar intent="error">{error}</MessageBar>}

      {levels.length === 0 ? (
        <MessageBar intent="warning">No levels available for your vehicle MSRP.</MessageBar>
      ) : (
        <Card>
          <RadioGroup value={selectedLevel ?? ''} onChange={(_e, d) => setSelectedLevel(d.value)}>
            {levels.map(level => (
              <Radio
                key={level.va_allowancelevelconfigid}
                value={level.va_allowancelevelconfigid!}
                label={
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalL }}>
                    <Text weight="semibold">Level {level.va_level}</Text>
                    <Text>{formatCurrency(level.va_monthlyAllowance)}/mo</Text>
                    {level.va_evChargingAmount ? (
                      <Text size={200}>+ {formatCurrency(level.va_evChargingAmount)} EV charging</Text>
                    ) : null}
                  </div>
                }
              />
            ))}
          </RadioGroup>
        </Card>
      )}

      <div className="action-bar">
        <Button appearance="secondary" onClick={() => navigate('/apply/vehicle')}>Back</Button>
        <Button appearance="primary" onClick={() => void handleSelect()} disabled={!selectedLevel || saving}>
          {saving ? 'Saving...' : 'Next: Insurance Documents'}
        </Button>
      </div>
    </div>
  )
}
