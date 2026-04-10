import { useNavigate } from 'react-router-dom'
import { Text, Spinner, MessageBar } from '@fluentui/react-components'
import { useAdminData } from '@/hooks/useAdminData'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatCurrency } from '@/utils/formatters'
import type { AllowanceApplication } from '@/types'

const columns: Column<AllowanceApplication>[] = [
  { key: 'name', label: 'Application', render: a => a.va_name ?? '--' },
  { key: 'type', label: 'Type', render: a => a.va_applicationType ?? '--' },
  { key: 'status', label: 'Status', render: a => <StatusBadge status={a.va_status ?? 'Draft'} /> },
  { key: 'level', label: 'Level', render: a => a.va_allowanceLevel ?? '--' },
  { key: 'amount', label: 'Total Monthly', render: a => formatCurrency(a.va_totalMonthlyAllowance) },
  { key: 'submitted', label: 'Submitted', render: a => formatDate(a.va_submittedOn) },
]

export function ApplicationsTable() {
  const navigate = useNavigate()
  const { applications, loading, error } = useAdminData()

  if (loading) return <Spinner size="large" label="Loading applications..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">All Applications</Text>
      <DataTable
        columns={columns}
        items={applications}
        getRowKey={a => a.va_allowanceapplicationid!}
        onRowClick={a => navigate(`/review/${a.va_allowanceapplicationid}`)}
        emptyMessage="No applications found."
      />
    </div>
  )
}
