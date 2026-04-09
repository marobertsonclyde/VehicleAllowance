import { useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { ADMIN_ALLOWANCE_RECORDS } from '@/mocks/admin-mock-data'
import { AllowanceRecordStatus } from '@/types'

const EXPIRY_WARNING_DAYS = 45

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ dateStr }: { dateStr?: string }) {
  const days = daysUntil(dateStr)
  if (days === null) return <span style={{ color: '#8a8886' }}>—</span>

  const urgent = days <= 14
  const warning = days <= EXPIRY_WARNING_DAYS
  const color = urgent ? '#a4262c' : warning ? '#d83b01' : '#107c10'
  const bg = urgent ? '#fde7e9' : warning ? '#fff4ce' : '#dff6dd'

  return (
    <span style={{
      background: bg, color, border: `1px solid ${color}30`,
      borderRadius: '10px', padding: '2px 8px', fontSize: '12px', fontWeight: 600,
    }}>
      {urgent && '🚨 '}
      {warning && !urgent && '⚠ '}
      {dateStr} {days <= EXPIRY_WARNING_DAYS && `(${days}d)`}
    </span>
  )
}

type TerminateModal = { recordId: string; name: string } | null

export function AdminActiveAllowancesScreen() {
  const [terminateModal, setTerminateModal] = useState<TerminateModal>(null)
  const [terminationType, setTerminationType] = useState('')
  const [terminationReason, setTerminationReason] = useState('')
  const [terminated, setTerminated] = useState<Set<string>>(new Set())

  const active = ADMIN_ALLOWANCE_RECORDS.filter(
    r => r.va_status === AllowanceRecordStatus.Active && !terminated.has(r.va_allowancerecordid!)
  )

  const handleTerminate = () => {
    if (!terminateModal) return
    setTerminated(prev => new Set([...prev, terminateModal.recordId]))
    console.log('[POC] Terminate', terminateModal, terminationType, terminationReason)
    setTerminateModal(null)
    setTerminationType('')
    setTerminationReason('')
  }

  // Find the earliest expiry across all policies for a record
  const earliestExpiry = (record: typeof ADMIN_ALLOWANCE_RECORDS[0]) => {
    const dates = (record._policies ?? []).map(p => p.va_expirationDate).filter(Boolean)
    return dates.sort()[0]
  }

  return (
    <AdminLayout title="Active Allowances">
      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
        {[
          { label: 'Active Recipients', value: active.length, color: '#0078d4' },
          { label: 'Expiring ≤ 45 days', value: active.filter(r => { const d = daysUntil(earliestExpiry(r)); return d !== null && d <= 45 }).length, color: '#d83b01' },
          { label: 'Urgent (≤ 14 days)', value: active.filter(r => { const d = daysUntil(earliestExpiry(r)); return d !== null && d <= 14 }).length, color: '#a4262c' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', border: '1px solid #e1dfdd', borderRadius: '6px',
            padding: '14px 20px', minWidth: '160px',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#8a8886', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e1dfdd', borderRadius: '6px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#faf9f8', borderBottom: '1px solid #e1dfdd' }}>
              {['Employee', 'Company', 'Level', 'Monthly', 'Effective', 'Earliest Insurance Expiry', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#323130' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#8a8886' }}>No active allowances.</td></tr>
            )}
            {active.map((record, i) => {
              const expiry = earliestExpiry(record)
              return (
                <tr key={record.va_allowancerecordid} style={{ borderBottom: i < active.length - 1 ? '1px solid #f3f2f1' : 'none' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 500 }}>{record.va_applicantName}</div>
                    <div style={{ fontSize: '12px', color: '#8a8886' }}>{record.va_personnelnumber}</div>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#605e5c' }}>{record.va_applicantCompany}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      background: '#e1efff', color: '#0078d4',
                      borderRadius: '10px', padding: '2px 10px', fontSize: '12px', fontWeight: 600,
                    }}>
                      Level {record.va_allowanceLevel}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600 }}>${record.va_totalMonthlyAmount?.toLocaleString()}/mo</div>
                    {(record as { va_isElectricVehicle?: boolean }).va_isElectricVehicle && (
                      <div style={{ fontSize: '11px', color: '#038387' }}>⚡ Incl. EV charging</div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#605e5c' }}>{record.va_effectiveDate}</td>
                  <td style={{ padding: '12px 14px' }}><ExpiryBadge dateStr={expiry} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => setTerminateModal({ recordId: record.va_allowancerecordid!, name: record.va_applicantName! })}
                      style={{
                        background: '#fde7e9', color: '#a4262c', border: '1px solid #a4262c40',
                        borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px',
                      }}
                    >
                      Terminate
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Terminate Modal */}
      {terminateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', width: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Terminate Allowance</h2>
            <p style={{ fontSize: '13px', color: '#605e5c', marginBottom: '20px' }}>{terminateModal.name}</p>

            <label style={{ fontSize: '12px', fontWeight: 600, color: '#323130', display: 'block', marginBottom: '6px' }}>Termination Type</label>
            <select
              value={terminationType}
              onChange={e => setTerminationType(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #e1dfdd', borderRadius: '4px', fontSize: '13px', marginBottom: '14px' }}
            >
              <option value="">Select type...</option>
              <option value="opt-out">Employee Opt-Out — Company Car Requested</option>
              <option value="admin">Administrative — Equipment Leader</option>
              <option value="insurance">Insurance Non-Compliance</option>
              <option value="other">Other</option>
            </select>

            <label style={{ fontSize: '12px', fontWeight: 600, color: '#323130', display: 'block', marginBottom: '6px' }}>Reason</label>
            <textarea
              value={terminationReason}
              onChange={e => setTerminationReason(e.target.value)}
              placeholder="Enter reason for termination..."
              style={{ width: '100%', minHeight: '80px', padding: '8px', border: '1px solid #e1dfdd', borderRadius: '4px', fontSize: '13px', resize: 'vertical', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setTerminateModal(null)} style={{ padding: '8px 18px', background: '#fff', border: '1px solid #e1dfdd', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                disabled={!terminationType}
                style={{ padding: '8px 18px', background: terminationType ? '#a4262c' : '#edebe9', color: terminationType ? '#fff' : '#8a8886', border: 'none', borderRadius: '4px', cursor: terminationType ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 600 }}
              >
                Confirm Termination
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
