import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConnectorContext } from '@microsoft/power-apps'
import { useCurrentApplication } from '@/hooks/useCurrentApplication'
import { getEligibleLevels, formatCurrency } from '@/utils/allowanceLevelCalc'
import type { AllowanceLevelConfig } from '@/types'
import { AllowanceLevel } from '@/types'

export function AllowanceLevelScreen() {
  const navigate = useNavigate()
  const { connectors } = useConnectorContext()
  const { application, vehicle, refetch } = useCurrentApplication()

  const [levelConfigs, setLevelConfigs] = useState<AllowanceLevelConfig[]>([])
  const [selectedLevel, setSelectedLevel] = useState<AllowanceLevel | null>(
    application?.va_allowanceLevel ?? null,
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    connectors.dataverse
      .retrieveMultipleRecords(
        'va_allowancelevelconfigs',
        '?$filter=va_isCurrentRate eq true&$orderby=va_monthlyAllowance desc',
      )
      .then(r => setLevelConfigs(r.entities ?? []))
      .catch(console.error)
  }, [connectors])

  const vehicleMsrp = vehicle?.va_msrpTotal ?? 0
  const eligible = getEligibleLevels(vehicleMsrp, levelConfigs)
  const isElectric = vehicle?.va_isElectric ?? application?.va_isElectricVehicle

  async function handleContinue() {
    if (!selectedLevel || !application?.va_allowanceapplicationid) return
    setSaving(true)
    try {
      const config = levelConfigs.find(c => c.va_level === selectedLevel)
      await connectors.dataverse.updateRecord(
        'va_allowanceapplications',
        application.va_allowanceapplicationid,
        {
          va_allowanceLevel: selectedLevel,
          va_monthlyAllowanceAmount: config?.va_monthlyAllowance,
          va_isElectricVehicle: isElectric,
          va_evChargingAllowance: isElectric ? (config?.va_evChargingAllowance ?? 310) : 0,
          va_totalMonthlyAllowance:
            (config?.va_monthlyAllowance ?? 0) + (isElectric ? (config?.va_evChargingAllowance ?? 310) : 0),
        },
      )
      await refetch()
      navigate('/apply/insurance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1 className="screen-title">Allowance Level</h1>
        <p className="screen-subtitle">
          Select the allowance level for your vehicle. Levels are filtered to those your vehicle's MSRP qualifies for.
        </p>
      </div>

      {vehicleMsrp > 0 && (
        <div className="alert alert-info">
          Your vehicle's Total MSRP: <strong>{formatCurrency(vehicleMsrp)}</strong>
        </div>
      )}

      {eligible.length === 0 && levelConfigs.length > 0 && (
        <div className="alert alert-error">
          Your vehicle's MSRP of {formatCurrency(vehicleMsrp)} does not meet the minimum for any allowance level.
          The minimum is {formatCurrency(Math.min(...levelConfigs.map(c => c.va_minimumMsrp ?? 0)))}.
          Please update your vehicle information or contact the Equipment Department.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {levelConfigs.map(config => {
          const isEligible = eligible.some(e => e.va_level === config.va_level)
          const isSelected = selectedLevel === config.va_level
          const totalAmount = (config.va_monthlyAllowance ?? 0) + (isElectric ? (config.va_evChargingAllowance ?? 310) : 0)

          return (
            <button
              key={config.va_allowancelevelconfigid}
              className="card"
              style={{
                textAlign: 'left',
                cursor: isEligible ? 'pointer' : 'not-allowed',
                opacity: isEligible ? 1 : 0.4,
                border: isSelected ? '2px solid var(--color-primary)' : undefined,
                background: isSelected ? '#deecf9' : undefined,
                padding: 20,
              }}
              onClick={() => isEligible && setSelectedLevel(config.va_level!)}
              disabled={!isEligible}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="radio"
                      readOnly
                      checked={isSelected}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: 18, fontWeight: 700 }}>Level {config.va_level}</span>
                    {isSelected && <span className="badge badge-info">Selected</span>}
                    {!isEligible && <span className="badge badge-neutral">MSRP too low</span>}
                  </div>
                  <div className="form-hint" style={{ marginTop: 4, marginLeft: 28 }}>
                    Minimum Total MSRP: {formatCurrency(config.va_minimumMsrp)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="amount-display">{formatCurrency(config.va_monthlyAllowance)}</div>
                  <div className="amount-label">/month</div>
                  {isElectric && (
                    <div style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 4 }}>
                      + ⚡ {formatCurrency(config.va_evChargingAllowance)} EV charging
                      <br />
                      = {formatCurrency(totalAmount)} total
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {isElectric && selectedLevel && (
        <div className="alert alert-info" style={{ marginTop: 16 }}>
          ⚡ As an EV recipient, you'll receive an additional ${310}/month charging allowance
          and will <strong>not</strong> receive a company fuel card. All charging costs are your responsibility.
        </div>
      )}

      <div className="action-bar">
        <button className="btn btn-ghost" onClick={() => navigate('/apply/vehicle')}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={() => void handleContinue()}
          disabled={!selectedLevel || saving}
        >
          {saving ? <><span className="spinner-icon" /> Saving…</> : 'Continue to Insurance Documents →'}
        </button>
      </div>
    </div>
  )
}
