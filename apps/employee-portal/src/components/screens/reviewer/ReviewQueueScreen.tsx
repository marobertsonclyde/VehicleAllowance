import { useNavigate } from 'react-router-dom'
import { Text, Spinner, MessageBar, Badge } from '@fluentui/react-components'
import { useApplicationQueue } from '@/hooks/useApplicationQueue'
import { DataTable, type Column, type FilterConfig } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/utils/formatters'
import { ApplicationStatus, ApplicationType } from '@/types'
import type { AllowanceApplication } from '@/types'

const queueFilters: FilterConfig<AllowanceApplication>[] = [
  {
    key: 'status',
    label: 'Status',
    options: Object.values(ApplicationStatus).map(s => ({ label: s, value: s })),
    getValue: a => a.va_status ?? '',
  },
  {
    key: 'type',
    label: 'Type',
    options: Object.values(ApplicationType).map(t => ({ label: t, value: t })),
    getValue: a => a.va_applicationType ?? '',
  },
]

const columns: Column<AllowanceApplication>[] = [
  { key: 'name', label: 'Application', render: a => a.va_name ?? '--' },
  { key: 'type', label: 'Type', render: a => a.va_applicationType ?? '--', hideOnMobile: true },
  { key: 'status', label: 'Status', render: a => <StatusBadge status={a.va_status ?? 'Draft'} /> },
  { key: 'submitted', label: 'Submitted', render: a => formatDate(a.va_submittedOn) },
  {
    key: 'ai',
    label: 'AI Score',
    render: a => (
      <Badge
        color={a.va_aiAutoApprovalEligible ? 'success' : 'warning'}
        appearance="outline"
      >
        {a.va_aiValidationScore != null ? `${a.va_aiValidationScore.toFixed(0)}%` : 'N/A'}
      </Badge>
    ),
  },
]

export function ReviewQueueScreen() {
  const navigate = useNavigate()
  const { pending, flagged, all, loading, error } = useApplicationQueue()

  if (loading) return <Spinner size="large" label="Loading review queue..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Review Queue</Text>

      <div className="mobile-stack" style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        <Badge color="brand" appearance="filled">{pending.length} pending</Badge>
        <Badge color="warning" appearance="filled">{flagged.length} AI flagged</Badge>
        <Badge color="informative" appearance="filled">{all.length} total</Badge>
      </div>

      <DataTable
        columns={columns}
        items={all}
        getRowKey={a => a.va_allowanceapplicationid!}
        onRowClick={a => navigate(`/review/${a.va_allowanceapplicationid}`)}
        emptyMessage="No applications pending review."
        searchable
        searchPlaceholder="Search applications..."
        searchFields={[a => a.va_name ?? '']}
        filters={queueFilters}
      />
    </div>
  )
}
