import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlowActions } from '@/hooks/useFlowActions'
import type { EligibilityCheckResult } from '@/types'

export function EligibilityCheckScreen() {
  const navigate = useNavigate()
  const { checkEligibility } = useFlowActions()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<EligibilityCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkEligibility()
      .then(setResult)
      .catch(err => setError(err instanceof Error ? err.message : 'Eligibility check failed'))
      .finally(() => setLoading(false))
  }, [checkEligibility])

  if (loading) {
    return (
      <div className="screen">
        <div className="loading-spinner">
          <div className="spinner-icon" />
          Checking your eligibility…
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1 className="screen-title">Eligibility Check</h1>
        <p className="screen-subtitle">We checked your job title and current allowance status.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          Could not complete eligibility check: {error}. Please contact the Equipment Department.
        </div>
      )}

      {result && (
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <div className="form-hint">Personnel Number</div>
              <div style={{ fontWeight: 600 }}>{result.personnelNumber ?? '—'}</div>
            </div>
            <div>
              <div className="form-hint">Job Title</div>
              <div style={{ fontWeight: 600 }}>{result.jobTitle ?? '—'}</div>
            </div>
            <div>
              <div className="form-hint">Company</div>
              <div style={{ fontWeight: 600 }}>{result.company ?? '—'}</div>
            </div>
            <div>
              <div className="form-hint">Default Allowance Level</div>
              <div style={{ fontWeight: 600 }}>
                {result.defaultAllowanceLevel ? `Level ${result.defaultAllowanceLevel}` : '—'}
              </div>
            </div>
          </div>

          {result.isEligible ? (
            <>
              <div className="alert alert-success">
                <strong>✅ You are eligible</strong> for the Vehicle Allowance Program.
                {result.eligibilityDeadline && (
                  <> You must submit your application by{' '}
                    <strong>
                      {new Date(result.eligibilityDeadline).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </strong>.
                  </>
                )}
              </div>
              <div className="alert alert-info" style={{ marginTop: 8 }}>
                <strong>Before applying:</strong> Your vehicle must be approved by the Company Equipment Leader
                before purchase. If you haven't done this yet, contact the Equipment Department first.
              </div>
              <div className="action-bar">
                <button className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
                <button className="btn btn-primary" onClick={() => navigate('/apply/vehicle')}>
                  Continue to Application →
                </button>
              </div>
            </>
          ) : (
            <div className="alert alert-error">
              <strong>Not eligible:</strong> {result.ineligibilityReason ?? 'Your job title is not currently on the eligible list.'}
              <br />
              <span style={{ marginTop: 4, display: 'block' }}>
                If you believe this is an error, contact the Equipment Department.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
