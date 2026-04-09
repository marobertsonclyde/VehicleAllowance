import { ApplicationStatus, AllowanceRecordStatus } from '@/types'

interface StatusBadgeProps {
  status: ApplicationStatus | AllowanceRecordStatus | string
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  [ApplicationStatus.Draft]:                  { label: 'Draft',                  className: 'badge-neutral' },
  [ApplicationStatus.Submitted]:              { label: 'Submitted',              className: 'badge-info' },
  [ApplicationStatus.AIReview]:               { label: 'AI Review',              className: 'badge-info' },
  [ApplicationStatus.EquipmentLeaderReview]:  { label: 'Under Review',           className: 'badge-warning' },
  [ApplicationStatus.DirectorReview]:         { label: 'Director Review',        className: 'badge-warning' },
  [ApplicationStatus.PayrollNotification]:    { label: 'Processing',             className: 'badge-info' },
  [ApplicationStatus.Active]:                 { label: 'Active',                 className: 'badge-success' },
  [ApplicationStatus.Rejected]:               { label: 'Rejected',               className: 'badge-error' },
  [ApplicationStatus.ReturnedToEmployee]:     { label: 'Returned — Action Needed', className: 'badge-warning' },
  [ApplicationStatus.Withdrawn]:              { label: 'Withdrawn',              className: 'badge-neutral' },
  [ApplicationStatus.Terminated]:             { label: 'Terminated',             className: 'badge-error' },
  [AllowanceRecordStatus.Suspended]:          { label: 'Suspended',              className: 'badge-warning' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'badge-neutral' }
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  )
}
