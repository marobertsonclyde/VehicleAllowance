import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { ADMIN_APPLICATIONS, type AuditEntry } from '@/mocks/admin-mock-data'
import { ApplicationStatus, type AdminApplication } from '@/mocks/admin-mock-data'
import { DocumentType } from '@/types'

type Tab = 'summary' | 'vehicle' | 'documents' | 'decisions' | 'audit'

// Re-export ApplicationStatus for use in this file
export { ApplicationStatus }

function Field({ label, value, wide }: { label: string; value?: string | number | boolean | null; wide?: boolean }) {
  const display = value === true ? 'Yes' : value === false ? 'No' : value ?? '—'
  return (
    <div style={{ marginBottom: '14px', gridColumn: wide ? '1 / -1' : undefined }}>
      <div style={{ fontSize: '11px', color: '#8a8886', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: '#323130' }}>{String(display)}</div>
    </div>
  )
}

function ScoreBar({ score, eligible }: { score?: number; eligible?: boolean }) {
  const pct = score ?? 0
  const color = eligible ? '#107c10' : pct >= 70 ? '#d83b01' : '#a4262c'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, height: '8px', background: '#edebe9', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontWeight: 700, color, minWidth: '36px' }}>{pct}/100</span>
      {eligible && <span style={{ fontSize: '12px', color: '#107c10', fontWeight: 600 }}>✓ AI Pre-Validated</span>}
      {!eligible && <span style={{ fontSize: '12px', color: '#d83b01', fontWeight: 600 }}>⚠ Manual Review Required</span>}
    </div>
  )
}

interface DecisionPanelProps {
  role: 'Equipment Leader' | 'Director' | 'President'
  currentDecision?: string
  currentNotes?: string
  onSave: (decision: string, notes: string) => void
  locked: boolean
}

function DecisionPanel({ role, currentDecision, currentNotes, onSave, locked }: DecisionPanelProps) {
  const [decision, setDecision] = useState(currentDecision ?? '')
  const [notes, setNotes] = useState(currentNotes ?? '')
  const [saved, setSaved] = useState(!!currentDecision)

  const handleSave = () => {
    if (!decision) return
    onSave(decision, notes)
    setSaved(true)
  }

  return (
    <div style={{
      border: '1px solid #e1dfdd', borderRadius: '6px', padding: '16px',
      background: locked && !saved ? '#faf9f8' : '#fff',
      opacity: locked && !saved ? 0.6 : 1,
    }}>
      <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '13px', color: '#323130' }}>{role}</div>

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{
            background: decision === 'Approved' ? '#dff6dd' : decision === 'Returned' ? '#fff4ce' : '#fde7e9',
            color: decision === 'Approved' ? '#107c10' : decision === 'Returned' ? '#7a4f00' : '#a4262c',
            padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
          }}>
            {decision}
          </span>
          {!locked && <button onClick={() => setSaved(false)} style={{ background: 'none', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '12px' }}>Edit</button>}
        </div>
      )}

      {!saved && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {['Approved', 'Returned', 'Rejected'].map(d => (
              <button
                key={d}
                disabled={locked}
                onClick={() => setDecision(d)}
                style={{
                  padding: '6px 14px', borderRadius: '4px', cursor: locked ? 'not-allowed' : 'pointer',
                  border: decision === d
                    ? (d === 'Approved' ? '2px solid #107c10' : d === 'Returned' ? '2px solid #d83b01' : '2px solid #a4262c')
                    : '1px solid #e1dfdd',
                  background: decision === d
                    ? (d === 'Approved' ? '#dff6dd' : d === 'Returned' ? '#fff4ce' : '#fde7e9')
                    : '#fff',
                  color: decision === d
                    ? (d === 'Approved' ? '#107c10' : d === 'Returned' ? '#7a4f00' : '#a4262c')
                    : '#323130',
                  fontSize: '13px', fontWeight: 500,
                }}
              >
                {d}
              </button>
            ))}
          </div>
          <textarea
            disabled={locked}
            placeholder={`Notes for ${role.toLowerCase()}...`}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{
              width: '100%', minHeight: '64px', padding: '8px', fontSize: '13px',
              border: '1px solid #e1dfdd', borderRadius: '4px', resize: 'vertical',
              background: locked ? '#f3f2f1' : '#fff',
            }}
          />
          <button
            disabled={!decision || locked}
            onClick={handleSave}
            style={{
              marginTop: '8px', padding: '6px 16px', background: decision ? '#0078d4' : '#edebe9',
              color: decision ? '#fff' : '#8a8886', border: 'none', borderRadius: '4px',
              cursor: decision && !locked ? 'pointer' : 'not-allowed', fontSize: '13px',
            }}
          >
            Save Decision
          </button>
        </>
      )}

      {saved && notes && (
        <div style={{ fontSize: '13px', color: '#605e5c', marginTop: '6px', fontStyle: 'italic' }}>"{notes}"</div>
      )}
    </div>
  )
}

export function AdminApplicationDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('summary')

  const app: AdminApplication | undefined = ADMIN_APPLICATIONS.find(a => a.va_allowanceapplicationid === id)
  if (!app) return <AdminLayout title="Application Not Found"><p>Application not found.</p></AdminLayout>

  const tabs: { key: Tab; label: string }[] = [
    { key: 'summary',   label: 'Summary' },
    { key: 'vehicle',   label: 'Vehicle & Insurance' },
    { key: 'documents', label: 'Documents' },
    { key: 'decisions', label: 'Decisions' },
    { key: 'audit',     label: 'Audit Log' },
  ]

  const statusColor: Record<string, string> = {
    [ApplicationStatus.EquipmentLeaderReview]: '#0078d4',
    [ApplicationStatus.DirectorReview]:        '#8764b8',
    [ApplicationStatus.PresidentReview]:       '#038387',
    [ApplicationStatus.Active]:                '#107c10',
  }
  const color = (app.va_status && statusColor[app.va_status]) ?? '#8a8886'

  return (
    <AdminLayout title={`Application ${app.va_name}`}>
      {/* Back */}
      <button
        onClick={() => navigate('/admin/queue')}
        style={{ background: 'none', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', padding: 0 }}
      >
        ← Review Queue
      </button>

      {/* Header card */}
      <div style={{ background: '#fff', border: '1px solid #e1dfdd', borderRadius: '6px', padding: '20px', marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{app.va_applicantName}</div>
            <div style={{ color: '#605e5c', marginTop: '2px' }}>{app.va_personnelnumber} · {app.va_applicantCompany} · {app.va_applicantJobTitle}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              background: color + '18', color, border: `1px solid ${color}40`,
              borderRadius: '10px', padding: '4px 12px', fontSize: '13px', fontWeight: 600,
            }}>{app.va_status}</span>
            <div style={{ fontSize: '12px', color: '#8a8886', marginTop: '6px' }}>{app.va_name} · {app.va_applicationType}</div>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '12px', color: '#8a8886', marginBottom: '6px' }}>AI Validation Score</div>
          <ScoreBar score={app.va_aiValidationScore} eligible={app.va_aiAutoApprovalEligible} />
        </div>

        {app.va_aiValidationSummary && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f3f2f1', borderRadius: '4px', fontSize: '13px', color: '#323130' }}>
            {app.va_aiValidationSummary}
          </div>
        )}

        {app.va_aiFlaggedIssues && (
          <div style={{ marginTop: '8px', padding: '10px 14px', background: '#fff4ce', borderRadius: '4px', fontSize: '13px', color: '#7a4f00', border: '1px solid #ffde70' }}>
            ⚠ {app.va_aiFlaggedIssues}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e1dfdd', background: '#fff', borderLeft: '1px solid #e1dfdd', borderRight: '1px solid #e1dfdd' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 18px', background: 'none', cursor: 'pointer', fontSize: '13px',
              border: 'none', borderBottom: tab === t.key ? '2px solid #0078d4' : '2px solid transparent',
              color: tab === t.key ? '#0078d4' : '#605e5c', fontWeight: tab === t.key ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: '#fff', border: '1px solid #e1dfdd', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '20px' }}>

        {tab === 'summary' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
            <Field label="Application #"   value={app.va_name} />
            <Field label="Submitted"       value={app.va_submittedOn ? new Date(app.va_submittedOn).toLocaleString() : undefined} />
            <Field label="Personnel #"     value={app.va_personnelnumber} />
            <Field label="Company"         value={app.va_applicantCompany} />
            <Field label="Application Type" value={app.va_applicationType} />
            <Field label="Allowance Level" value={app.va_allowanceLevel} />
            <Field label="Monthly Amount"  value={app.va_monthlyAllowanceAmount ? `$${app.va_monthlyAllowanceAmount.toLocaleString()}/mo` : undefined} />
            <Field label="Electric Vehicle" value={app.va_isElectricVehicle} />
            {app.va_isElectricVehicle && <Field label="EV Charging" value={`$${app.va_evChargingAllowance}/mo`} />}
            <Field label="Total Monthly"   value={app.va_totalMonthlyAllowance ? `$${app.va_totalMonthlyAllowance?.toLocaleString()}/mo` : undefined} />
            <Field label="President Approval Required" value={app.va_presidentApprovalRequired} />
          </div>
        )}

        {tab === 'vehicle' && (
          <div>
            {app._vehicle ? (
              <div>
                <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>Vehicle</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 24px' }}>
                  <Field label="VIN"      value={app._vehicle.va_vin} />
                  <Field label="Year"     value={app._vehicle.va_year} />
                  <Field label="Make"     value={app._vehicle.va_make} />
                  <Field label="Model"    value={app._vehicle.va_model} />
                  <Field label="MSRP"     value={app._vehicle.va_msrpTotal ? `$${app._vehicle.va_msrpTotal.toLocaleString()}` : undefined} />
                  <Field label="Electric" value={app._vehicle.va_isElectric} />
                </div>
              </div>
            ) : <p style={{ color: '#8a8886' }}>No vehicle record.</p>}

            {app._policies && app._policies.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '14px', fontSize: '14px', fontWeight: 600 }}>Insurance Policies</h3>
                {app._policies.map(p => (
                  <div key={p.va_insurancepolicyid} style={{ border: '1px solid #e1dfdd', borderRadius: '6px', padding: '14px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.va_policyType}</span>
                      <span style={{
                        padding: '2px 10px', borderRadius: '10px', fontSize: '12px',
                        background: (p.va_meetsLiabilityRequirement || p.va_meetsUmbrellaRequirement) ? '#dff6dd' : '#fde7e9',
                        color: (p.va_meetsLiabilityRequirement || p.va_meetsUmbrellaRequirement) ? '#107c10' : '#a4262c',
                      }}>
                        {(p.va_meetsLiabilityRequirement || p.va_meetsUmbrellaRequirement) ? '✓ Meets requirements' : '✗ Below minimum'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 16px', fontSize: '13px' }}>
                      <Field label="Carrier"    value={p.va_carrierName} />
                      <Field label="Policy #"   value={p.va_policyNumber} />
                      <Field label="Expiry"     value={p.va_expirationDate} />
                      <Field label="AI Confidence" value={p.va_aiExtractionConfidence ? `${(p.va_aiExtractionConfidence * 100).toFixed(0)}%` : undefined} />
                      {p.va_coverageLimitCSL && <Field label="CSL Limit" value={`$${p.va_coverageLimitCSL.toLocaleString()}`} />}
                      {p.va_umbrellaLimit && <Field label="Umbrella Limit" value={`$${p.va_umbrellaLimit.toLocaleString()}`} />}
                      {p.va_endorsementType && <Field label="Endorsement Type" value={p.va_endorsementType} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'documents' && (
          <div>
            <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>Document Checklist</h3>
            <div style={{ marginBottom: '20px' }}>
              {(app._checklist ?? []).map(item => (
                <div key={item.va_documentchecklistid} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderBottom: '1px solid #f3f2f1',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{item.va_isSatisfied ? '✅' : '⬜'}</span>
                    <span style={{ fontSize: '13px' }}>{item.va_name}</span>
                  </div>
                  {item.va_validationNote && (
                    <span style={{ fontSize: '12px', color: '#d83b01', background: '#fff4ce', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.va_validationNote}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom: '14px', fontSize: '14px', fontWeight: 600 }}>Uploaded Documents</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#faf9f8', borderBottom: '1px solid #e1dfdd' }}>
                  {['File', 'Type', 'AI Confidence', 'Status', 'Uploaded'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#323130' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(app._documents ?? []).map(doc => (
                  <tr key={doc.va_documentid} style={{ borderBottom: '1px solid #f3f2f1' }}>
                    <td style={{ padding: '9px 12px', color: '#0078d4' }}>{doc.va_name}</td>
                    <td style={{ padding: '9px 12px', color: '#605e5c' }}>{doc.va_documentType}</td>
                    <td style={{ padding: '9px 12px' }}>
                      {doc.va_aiConfidenceScore
                        ? <span style={{ color: doc.va_aiConfidenceScore >= 0.8 ? '#107c10' : '#d83b01' }}>{(doc.va_aiConfidenceScore * 100).toFixed(0)}%</span>
                        : '—'}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '10px', fontSize: '12px',
                        background: doc.va_reviewStatus === 'Accepted' ? '#dff6dd' : doc.va_reviewStatus === 'Rejected' ? '#fde7e9' : '#fff4ce',
                        color: doc.va_reviewStatus === 'Accepted' ? '#107c10' : doc.va_reviewStatus === 'Rejected' ? '#a4262c' : '#7a4f00',
                      }}>
                        {doc.va_reviewStatus ?? 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '9px 12px', color: '#8a8886' }}>
                      {doc.va_uploadedOn ? new Date(doc.va_uploadedOn).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'decisions' && (
          <div>
            <p style={{ fontSize: '13px', color: '#605e5c', marginBottom: '20px' }}>
              Each reviewer sets their decision independently. Decisions trigger the next stage automatically.
              In this demo, decisions update local state only.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <DecisionPanel
                role="Equipment Leader"
                currentDecision={app.va_equipmentLeaderDecision as string}
                currentNotes={app.va_equipmentLeaderNotes}
                locked={false}
                onSave={(d, n) => console.log('[POC] EL decision:', d, n)}
              />
              <DecisionPanel
                role="Director"
                currentDecision={app.va_directorDecision as string}
                currentNotes={app.va_directorNotes}
                locked={!app.va_equipmentLeaderDecision}
                onSave={(d, n) => console.log('[POC] Director decision:', d, n)}
              />
              <DecisionPanel
                role="President"
                currentDecision={app.va_presidentDecision as string}
                locked={!app.va_directorDecision}
                onSave={(d, n) => console.log('[POC] President decision:', d, n)}
              />
            </div>
          </div>
        )}

        {tab === 'audit' && (
          <div>
            {(app._auditLog ?? []).length === 0
              ? <p style={{ color: '#8a8886' }}>No audit entries.</p>
              : (app._auditLog ?? []).map((entry: AuditEntry) => (
                <div key={entry.id} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #f3f2f1' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e1efff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>
                    {entry.eventType === 'StatusChange' ? '↗' : '✓'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                      {entry.previousStatus} → {entry.newStatus}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8a8886', marginTop: '2px' }}>
                      {entry.performedBy} · {new Date(entry.eventDate).toLocaleString()}
                    </div>
                    {entry.notes && (
                      <div style={{ fontSize: '12px', color: '#605e5c', marginTop: '4px', fontStyle: 'italic' }}>"{entry.notes}"</div>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
