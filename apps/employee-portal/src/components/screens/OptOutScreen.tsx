import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllowanceRecord } from '@/hooks/useAllowanceRecord'
import { useFlowActions } from '@/hooks/useFlowActions'
import { formatCurrency } from '@/utils/allowanceLevelCalc'

export function OptOutScreen() {
  const navigate = useNavigate()
  const { record, loading } = useAllowanceRecord()
  const { submitOptOut } = useFlowActions()
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleOptOut() {
    if (!confirmed || !record?.va_allowancerecordid) return
    setSubmitting(true)
    try {
      await submitOptOut(
        record.va_allowancerecordid,
        new Date().toISOString().split('T')[0],
      )
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opt-out submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="screen"><div className="loading-spinner"><div className="spinner-icon" />Loading…</div></div>
  }

  if (!record) {
    return (
      <div className="screen">
        <div className="alert alert-info">No active allowance to opt out of.</div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="screen" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
        <h1 className="screen-title">Opt-Out Request Submitted</h1>
        <p style={{ color: 'var(--color-neutral-60)', maxWidth: 480, margin: '0 auto 8px' }}>
          Your opt-out request has been submitted to the Equipment Department.
        </p>
        <p style={{ color: 'var(--color-neutral-60)', maxWidth: 480, margin: '8px auto 32px' }}>
          They will confirm your allowance termination date and coordinate company vehicle assignment.
          You will receive a Teams notification once your request has been processed.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Home</button>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1 className="screen-title">Opt Out of Vehicle Allowance</h1>
        <p className="screen-subtitle">
          Requesting opt-out will return you to a company-provided vehicle.
          The Equipment Department will confirm your termination date and coordinate vehicle assignment.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Current allowance summary */}
      <div className="card">
        <div className="card-title">Current Allowance</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div className="form-hint">Monthly Amount</div>
            <div style={{ fontWeight: 600 }}>{formatCurrency(record.va_totalMonthlyAmount)}/month</div>
          </div>
          <div>
            <div className="form-hint">Level</div>
            <div style={{ fontWeight: 600 }}>Level {record.va_allowanceLevel}</div>
          </div>
          <div>
            <div className="form-hint">Effective Since</div>
            <div style={{ fontWeight: 600 }}>
              {record.va_effectiveDate ? new Date(record.va_effectiveDate).toLocaleDateString() : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Opt-out consequences */}
      <div className="card">
        <div className="card-title">What Happens When You Opt Out</div>
        <ul style={{ paddingLeft: 20, lineHeight: 2, color: 'var(--color-neutral-90)' }}>
          <li>The Equipment Department will review your request and confirm your termination date</li>
          <li>Your vehicle allowance payments will stop on the confirmed termination date</li>
          <li>Your company fuel card will be deactivated at that time</li>
          <li>A company vehicle will be assigned by the Equipment Department</li>
          <li>You will receive a Teams notification once your request is processed</li>
        </ul>
      </div>

      {/* Confirmation */}
      <div className="card">
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }}
          />
          <span>
            I confirm that I want to opt out of the Vehicle Allowance Program and return to a
            company-provided vehicle. I understand that my allowance will end on the date confirmed
            by the Equipment Department.
          </span>
        </label>
      </div>

      <div className="action-bar">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
        <button
          className="btn btn-danger"
          onClick={() => void handleOptOut()}
          disabled={!confirmed || submitting}
        >
          {submitting ? <><span className="spinner-icon" /> Submitting…</> : 'Submit Opt-Out Request'}
        </button>
      </div>
    </div>
  )
}
