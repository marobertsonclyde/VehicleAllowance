import { useParams, useNavigate } from 'react-router-dom'
import { useCurrentApplication } from '@/hooks/useCurrentApplication'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ApplicationStatus } from '@/types'

// Ordered list of steps for the progress indicator
const STEPS: { label: string; status: ApplicationStatus }[] = [
  { label: 'Submitted',          status: ApplicationStatus.Submitted },
  { label: 'AI Review',          status: ApplicationStatus.AIReview },
  { label: 'Equipment Leader',   status: ApplicationStatus.EquipmentLeaderReview },
  { label: 'Director',           status: ApplicationStatus.DirectorReview },
  { label: 'President',          status: ApplicationStatus.PresidentReview },
  { label: 'Payroll',            status: ApplicationStatus.PayrollNotification },
  { label: 'Active',             status: ApplicationStatus.Active },
]

const STATUS_ORDER = STEPS.map(s => s.status)

function getStepState(step: ApplicationStatus, current: ApplicationStatus) {
  if (current === ApplicationStatus.Rejected || current === ApplicationStatus.Terminated) {
    const stepIdx = STATUS_ORDER.indexOf(step)
    const currentIdx = STATUS_ORDER.indexOf(current)
    if (stepIdx < currentIdx) return 'completed'
    if (stepIdx === currentIdx) return 'rejected'
    return 'pending'
  }
  const stepIdx = STATUS_ORDER.indexOf(step)
  const currentIdx = STATUS_ORDER.indexOf(current)
  if (stepIdx < currentIdx) return 'completed'
  if (stepIdx === currentIdx) return 'active'
  return 'pending'
}

export function StatusTrackerScreen() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { application, loading, error } = useCurrentApplication()

  if (loading) {
    return (
      <div className="screen">
        <div className="loading-spinner"><div className="spinner-icon" />Loading…</div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="screen">
        <div className="alert alert-error">{error ?? 'Application not found.'}</div>
      </div>
    )
  }

  const currentStatus = application.va_status ?? ApplicationStatus.Draft
  const isTerminal = [
    ApplicationStatus.Rejected,
    ApplicationStatus.Withdrawn,
    ApplicationStatus.Terminated,
    ApplicationStatus.Active,
  ].includes(currentStatus as ApplicationStatus)

  const isReturned = currentStatus === ApplicationStatus.ReturnedToEmployee

  return (
    <div className="screen">
      <div className="screen-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 className="screen-title" style={{ margin: 0 }}>
            Application {application.va_name}
          </h1>
          <StatusBadge status={currentStatus} />
        </div>
        <p className="screen-subtitle" style={{ marginTop: 4 }}>
          {application.va_applicationType} — submitted{' '}
          {application.va_submittedOn
            ? new Date(application.va_submittedOn).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })
            : '—'}
        </p>
      </div>

      {/* ── Progress indicator ─────────────────────────────────────────────── */}
      <div className="card">
        <div className="step-indicator">
          {STEPS.map((step, idx) => {
            const state = getStepState(step.status, currentStatus as ApplicationStatus)
            const isLast = idx === STEPS.length - 1
            return (
              <div key={step.status} className={`step ${state}`}>
                <div className="step-dot">
                  {state === 'completed' ? '✓' : state === 'rejected' ? '✗' : idx + 1}
                </div>
                {!isLast && <div className="step-line" />}
                <div className="step-label">{step.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Status-specific messaging ──────────────────────────────────────── */}
      {isReturned && (
        <div className="alert alert-warning">
          <strong>Action Required:</strong> Your application has been returned with corrections needed.
          {application.va_equipmentLeaderNotes && (
            <div style={{ marginTop: 8 }}>
              <strong>Equipment Leader notes:</strong> {application.va_equipmentLeaderNotes}
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={() => navigate('/apply/insurance')}>
              Upload Corrected Documents
            </button>
          </div>
        </div>
      )}

      {currentStatus === ApplicationStatus.Rejected && (
        <div className="alert alert-error">
          <strong>Application Rejected.</strong>
          {(application.va_equipmentLeaderNotes || application.va_directorNotes) && (
            <div style={{ marginTop: 8 }}>
              {application.va_equipmentLeaderNotes || application.va_directorNotes}
            </div>
          )}
          <div style={{ marginTop: 8 }}>
            Contact the Equipment Department if you have questions.
          </div>
        </div>
      )}

      {currentStatus === ApplicationStatus.Active && (
        <div className="alert alert-success">
          <strong>✅ Your allowance is active!</strong> Payment will begin on the first payroll of your effective month.
        </div>
      )}

      {/* ── Review timeline ────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-title">Review History</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {application.va_submittedOn && (
            <TimelineEntry
              date={application.va_submittedOn}
              label="Application Submitted"
              by="You"
            />
          )}
          {application.va_equipmentLeaderReviewDate && application.va_equipmentLeaderDecision && (
            <TimelineEntry
              date={application.va_equipmentLeaderReviewDate}
              label={`Equipment Leader: ${application.va_equipmentLeaderDecision}`}
              by="Equipment Leader"
            />
          )}
          {application.va_directorReviewDate && application.va_directorDecision && (
            <TimelineEntry
              date={application.va_directorReviewDate}
              label={`Director: ${application.va_directorDecision}`}
              by="Director of Equipment"
            />
          )}
          {application.va_presidentApprovalDate && application.va_presidentDecision && (
            <TimelineEntry
              date={application.va_presidentApprovalDate}
              label={`President: ${application.va_presidentDecision}`}
              by="Company President"
            />
          )}
          {application.va_payrollNotifiedDate && (
            <TimelineEntry
              date={application.va_payrollNotifiedDate}
              label="Payroll Notified"
              by="System"
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Return to Home</button>
      </div>
    </div>
  )
}

function TimelineEntry({ date, label, by }: { date: string; label: string; by: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: 'var(--color-primary)', flexShrink: 0, marginTop: 5,
      }} />
      <div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div className="form-hint">
          {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          {' '}· {by}
        </div>
      </div>
    </div>
  )
}
