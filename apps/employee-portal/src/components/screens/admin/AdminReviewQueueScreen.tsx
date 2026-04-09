import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { ADMIN_APPLICATIONS } from '@/mocks/admin-mock-data'
import { ApplicationStatus } from '@/types'

type FilterTab = 'pending' | 'flagged' | 'all'

const STATUS_COLOR: Record<string, string> = {
  [ApplicationStatus.EquipmentLeaderReview]: '#0078d4',
  [ApplicationStatus.DirectorReview]:        '#8764b8',
  [ApplicationStatus.PresidentReview]:       '#038387',
  [ApplicationStatus.AIReview]:              '#8a8886',
}

function ScoreBadge({ score, eligible }: { score?: number; eligible?: boolean }) {
  const color = eligible ? '#107c10' : score && score >= 70 ? '#d83b01' : '#a4262c'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: color + '18', color, border: `1px solid ${color}40`,
      borderRadius: '10px', padding: '2px 8px', fontSize: '12px', fontWeight: 600,
    }}>
      {score ?? '—'} {eligible ? '✓' : score && score < 70 ? '⚠' : ''}
    </span>
  )
}

function StatusPill({ status }: { status?: string }) {
  const color = (status && STATUS_COLOR[status]) ?? '#8a8886'
  return (
    <span style={{
      background: color + '18', color, border: `1px solid ${color}40`,
      borderRadius: '10px', padding: '2px 10px', fontSize: '12px', fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}

export function AdminReviewQueueScreen() {
  const [tab, setTab] = useState<FilterTab>('pending')
  const navigate = useNavigate()

  const pendingStatuses = [
    ApplicationStatus.EquipmentLeaderReview,
    ApplicationStatus.DirectorReview,
    ApplicationStatus.PresidentReview,
    ApplicationStatus.AIReview,
  ]

  const filtered = ADMIN_APPLICATIONS.filter(app => {
    if (tab === 'pending') return pendingStatuses.includes(app.va_status as ApplicationStatus)
    if (tab === 'flagged') return !app.va_aiAutoApprovalEligible
    return true
  })

  const counts = {
    pending: ADMIN_APPLICATIONS.filter(a => pendingStatuses.includes(a.va_status as ApplicationStatus)).length,
    flagged: ADMIN_APPLICATIONS.filter(a => !a.va_aiAutoApprovalEligible).length,
    all: ADMIN_APPLICATIONS.length,
  }

  return (
    <AdminLayout title="Review Queue">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {(['pending', 'flagged', 'all'] as FilterTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 16px', borderRadius: '4px', cursor: 'pointer',
              border: tab === t ? '1px solid #0078d4' : '1px solid #e1dfdd',
              background: tab === t ? '#0078d4' : '#fff',
              color: tab === t ? '#fff' : '#323130',
              fontSize: '13px', fontWeight: 500,
            }}
          >
            {t === 'pending' ? 'My Pending' : t === 'flagged' ? '⚠ AI Flagged' : 'All Applications'}
            <span style={{
              marginLeft: '6px', background: tab === t ? 'rgba(255,255,255,0.25)' : '#edebe9',
              borderRadius: '10px', padding: '1px 7px', fontSize: '11px',
            }}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '4px', border: '1px solid #e1dfdd', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#faf9f8', borderBottom: '1px solid #e1dfdd' }}>
              {['Application #', 'Applicant', 'Company', 'Type', 'Status', 'AI Score', 'Submitted'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#323130', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#8a8886' }}>No applications found.</td></tr>
            )}
            {filtered.map((app, i) => (
              <tr
                key={app.va_allowanceapplicationid}
                onClick={() => navigate(`/admin/applications/${app.va_allowanceapplicationid}`)}
                style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid #f3f2f1' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f3f2f1')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '11px 14px', fontWeight: 600, color: '#0078d4' }}>{app.va_name}</td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ fontWeight: 500 }}>{app.va_applicantName}</div>
                  <div style={{ fontSize: '12px', color: '#8a8886' }}>{app.va_personnelnumber}</div>
                </td>
                <td style={{ padding: '11px 14px', color: '#605e5c' }}>{app.va_applicantCompany}</td>
                <td style={{ padding: '11px 14px', color: '#605e5c' }}>{app.va_applicationType}</td>
                <td style={{ padding: '11px 14px' }}><StatusPill status={app.va_status} /></td>
                <td style={{ padding: '11px 14px' }}>
                  <ScoreBadge score={app.va_aiValidationScore} eligible={app.va_aiAutoApprovalEligible} />
                </td>
                <td style={{ padding: '11px 14px', color: '#8a8886', fontSize: '12px' }}>
                  {app.va_submittedOn ? new Date(app.va_submittedOn).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
