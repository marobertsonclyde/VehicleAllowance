import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentApplication } from '@/hooks/useCurrentApplication'
import { useFlowActions } from '@/hooks/useFlowActions'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency } from '@/utils/allowanceLevelCalc'
import { effectiveDateDescription } from '@/utils/effectiveDateCalc'
import { ApplicationStatus } from '@/types'

export function ReviewSubmitScreen() {
  const navigate = useNavigate()
  const { application, vehicle, policies, checklist } = useCurrentApplication()
  const { submitApplication } = useFlowActions()
  const [attested, setAttested] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allSatisfied = checklist.every(i => i.va_isSatisfied)

  async function handleSubmit() {
    if (!attested || !application?.va_allowanceapplicationid || !allSatisfied) return
    setSubmitting(true)
    setError(null)
    try {
      await submitApplication(application.va_allowanceapplicationid)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="screen" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h1 className="screen-title">Application Submitted!</h1>
        <p style={{ color: 'var(--color-neutral-60)', marginBottom: 8, maxWidth: 480, margin: '0 auto 8px' }}>
          Application <strong>{application?.va_name}</strong> has been submitted for review.
        </p>
        <p style={{ color: 'var(--color-neutral-60)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
          {effectiveDateDescription(new Date())}
          {' '}You will receive a Teams notification when your application is reviewed.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Return to Home
        </button>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1 className="screen-title">Review &amp; Submit</h1>
        <p className="screen-subtitle">Review all information before submitting. You cannot make changes after submission without returning the application.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Application summary ───────────────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ margin: 0 }}>Application Summary</div>
          <StatusBadge status={application?.va_status ?? ApplicationStatus.Draft} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div className="form-hint">Application Type</div>
            <div style={{ fontWeight: 600 }}>{application?.va_applicationType ?? '—'}</div>
          </div>
          <div>
            <div className="form-hint">Allowance Level</div>
            <div style={{ fontWeight: 600 }}>Level {application?.va_allowanceLevel ?? '—'}</div>
          </div>
          <div>
            <div className="form-hint">Monthly Allowance</div>
            <div style={{ fontWeight: 600 }}>{formatCurrency(application?.va_monthlyAllowanceAmount)}/month</div>
          </div>
          {application?.va_isElectricVehicle && (
            <div>
              <div className="form-hint">EV Charging Allowance</div>
              <div style={{ fontWeight: 600 }}>⚡ {formatCurrency(application.va_evChargingAllowance)}/month</div>
            </div>
          )}
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="form-hint">Estimated Effective Date</div>
            <div style={{ fontWeight: 600 }}>{effectiveDateDescription(new Date())}</div>
          </div>
        </div>
      </div>

      {/* ── Vehicle summary ───────────────────────────────────────────────── */}
      {vehicle && (
        <div className="card">
          <div className="card-title">Vehicle</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="form-hint">VIN</div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{vehicle.va_vin ?? '—'}</div>
            </div>
            <div>
              <div className="form-hint">Vehicle</div>
              <div style={{ fontWeight: 600 }}>{vehicle.va_year} {vehicle.va_make} {vehicle.va_model}</div>
            </div>
            <div>
              <div className="form-hint">Body Type</div>
              <div style={{ fontWeight: 600 }}>{vehicle.va_bodyType ?? '—'}</div>
            </div>
            <div>
              <div className="form-hint">Total MSRP</div>
              <div style={{ fontWeight: 600 }}>{formatCurrency(vehicle.va_msrpTotal)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Insurance summary ─────────────────────────────────────────────── */}
      {policies.length > 0 && (
        <div className="card">
          <div className="card-title">Insurance Policies</div>
          {policies.map(p => (
            <div key={p.va_insurancepolicyid} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-neutral-20)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{p.va_policyType}</span>
                <span className={`badge ${p.va_meetsLiabilityRequirement || p.va_meetsUmbrellaRequirement ? 'badge-success' : 'badge-error'}`}>
                  {p.va_meetsLiabilityRequirement || p.va_meetsUmbrellaRequirement ? '✓ Verified' : '✗ Issue'}
                </span>
              </div>
              <div className="form-hint">{p.va_carrierName} — expires {p.va_expirationDate ? new Date(p.va_expirationDate).toLocaleDateString() : '—'}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Document checklist summary ────────────────────────────────────── */}
      <div className="card">
        <div className="card-title">Document Checklist</div>
        {checklist.map(item => (
          <div key={item.va_documentchecklistid} className="validation-row">
            <span className={`validation-icon ${item.va_isSatisfied ? 'validation-pass' : 'validation-fail'}`}>
              {item.va_isSatisfied ? '✅' : '❌'}
            </span>
            <span>{item.va_name}</span>
          </div>
        ))}
        {!allSatisfied && (
          <div className="alert alert-error" style={{ marginTop: 12 }}>
            Not all required documents have been verified. Return to the Insurance Documents step.
          </div>
        )}
      </div>

      {/* ── Attestation ───────────────────────────────────────────────────── */}
      <div className="card">
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={attested}
            onChange={e => setAttested(e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }}
          />
          <span style={{ fontSize: 14, lineHeight: 1.5 }}>
            I confirm that all information submitted is accurate and complete. I understand that I am responsible for
            maintaining the required insurance coverages continuously, operating my personal vehicle for all
            Clyde Companies business purposes, and complying with the Vehicle Allowance Policy.
          </span>
        </label>
      </div>

      <div className="action-bar">
        <button className="btn btn-ghost" onClick={() => navigate('/apply/insurance')}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={() => void handleSubmit()}
          disabled={!attested || !allSatisfied || submitting}
        >
          {submitting ? <><span className="spinner-icon" /> Submitting…</> : 'Submit Application'}
        </button>
      </div>
    </div>
  )
}
