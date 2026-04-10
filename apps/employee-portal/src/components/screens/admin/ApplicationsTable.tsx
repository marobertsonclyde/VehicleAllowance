import { useNavigate } from 'react-router-dom'
import { Text, Spinner, MessageBar } from '@fluentui/react-components'
import { useAdminData } from '@/hooks/useAdminData'
import { DataTable, type Column, type FilterConfig } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { ApplicationStatus, ApplicationType, AllowanceLevel } from '@/types'
import type { AllowanceApplication } from '@/types'

const appFilters: FilterConfig<AllowanceApplication>[] = [
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
  {
    key: 'level',
    label: 'Level',
    options: Object.values(AllowanceLevel).map(l => ({ label: `Level ${l}`, value: l })),
    getValue: a => a.va_allowanceLevel ?? '',
  },
]

const columns: Column<AllowanceApplication>[] = [
  { key: 'name', label: 'Application', render: a => a.va_name ?? '--' },
  { key: 'type', label: 'Type', render: a => a.va_applicationType ?? '--', hideOnMobile: true },
  { key: 'status', label: 'Status', render: a => <StatusBadge status={a.va_status ?? 'Draft'} /> },
  { key: 'level', label: 'Level', render: a => a.va_allowanceLevel ?? '--', hideOnMobile: true },
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
        searchable
        searchPlaceholder="Search applications..."
        searchFields={[a => a.va_name ?? '']}
        filters={appFilters}
      />
    </div>
  )
}
