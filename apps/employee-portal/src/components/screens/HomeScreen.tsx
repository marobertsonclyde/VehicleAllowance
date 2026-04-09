import { useNavigate } from 'react-router-dom'
import { useAllowanceRecord } from '@/hooks/useAllowanceRecord'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency } from '@/utils/allowanceLevelCalc'
import { isInOptOutWindow } from '@/utils/effectiveDateCalc'

export function HomeScreen() {
  const navigate = useNavigate()
  const { record, expiringPolicies, loading, error } = useAllowanceRecord()

  if (loading) {
    return (
      <div className="screen">
        <div className="loading-spinner">
          <div className="spinner-icon" />
          Loading your allowance information…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="screen">
        <div className="alert alert-error">
          Failed to load your allowance information. Please refresh the page.
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1 className="screen-title">Vehicle Allowance Portal</h1>
        <p className="screen-subtitle">Clyde Companies — Equipment Department</p>
      </div>

      {/* ── Expiry warnings ──────────────────────────────────────────────── */}
      {expiringPolicies.map(policy => {
        const expiry = policy.va_expirationDate
          ? new Date(policy.va_expirationDate)
          : null
        const daysLeft = expiry
          ? Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null

        return (
          <div key={policy.va_insurancepolicyid} className="alert alert-warning">
            <strong>⚠ Insurance Expiring:</strong> Your{' '}
            {policy.va_policyType} policy expires{' '}
            {expiry?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}{' '}
            {daysLeft !== null && `(${daysLeft} days)`}.{' '}
            <button className="btn btn-ghost" style={{ padding: '2px 10px', fontSize: 12 }} onClick={() => navigate('/renewal')}>
              Upload Renewal Documents
            </button>
          </div>
        )
      })}

      {/* ── Active allowance summary ─────────────────────────────────────── */}
      {record ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div className="card-title">Your Current Allowance</div>
              <StatusBadge status={record.va_status ?? 'Active'} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="amount-display">{formatCurrency(record.va_totalMonthlyAmount)}</div>
              <div className="amount-label">per month</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <div className="form-hint">Allowance Level</div>
              <div style={{ fontWeight: 600 }}>Level {record.va_allowanceLevel}</div>
            </div>
            <div>
              <div className="form-hint">Effective Date</div>
              <div style={{ fontWeight: 600 }}>
                {record.va_effectiveDate
                  ? new Date(record.va_effectiveDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : '—'}
              </div>
            </div>
            {record.va_evChargingAmount && (
              <div>
                <div className="form-hint">EV Charging Allowance</div>
                <div style={{ fontWeight: 600 }}>
                  ⚡ {formatCurrency(record.va_evChargingAmount)}/month
                </div>
              </div>
            )}
            <div>
              <div className="form-hint">Next Renewal Due</div>
              <div style={{ fontWeight: 600 }}>
                {record.va_nextRenewalDue
                  ? new Date(record.va_nextRenewalDue).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : '—'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/apply/vehicle')}>
              Update My Vehicle
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/renewal')}>
              Upload Insurance Renewal
            </button>
            {isInOptOutWindow() && (
              <button className="btn btn-ghost" onClick={() => navigate('/opt-out')}>
                Opt Out of Allowance
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── No active record — CTA to start application ───────────────── */
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
          <h2 style={{ marginBottom: 8 }}>No Active Vehicle Allowance</h2>
          <p style={{ color: 'var(--color-neutral-60)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
            Eligible employees may opt into a monthly vehicle allowance instead of a company vehicle.
            Start by checking your eligibility below.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/eligibility')}>
            Check Eligibility &amp; Apply
          </button>
        </div>
      )}

      {/* ── Policy documents ─────────────────────────────────────────────── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Program Resources</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a
            className="btn btn-ghost"
            href="https://clydeco.sharepoint.com/sites/equipment/VehicleAllowance/Policy.pdf"
            target="_blank"
            rel="noreferrer"
          >
            📄 Vehicle Allowance Policy
          </a>
          <a
            className="btn btn-ghost"
            href="https://clydeco.sharepoint.com/sites/equipment/VehicleAllowance/Checklist.pdf"
            target="_blank"
            rel="noreferrer"
          >
            ✅ Required Documents Checklist
          </a>
        </div>
        <p className="form-hint" style={{ marginTop: 8 }}>
          Questions? Use the help assistant (bottom-right) or contact the Equipment Department.
        </p>
      </div>
    </div>
  )
}
