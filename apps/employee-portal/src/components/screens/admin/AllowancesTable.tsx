import { Text, Spinner, MessageBar, Badge } from '@fluentui/react-components'
import { useAdminData } from '@/hooks/useAdminData'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatCurrency } from '@/utils/formatters'
import type { AllowanceRecord } from '@/types'

const columns: Column<AllowanceRecord>[] = [
  { key: 'name', label: 'Record', render: r => r.va_name ?? '--' },
  { key: 'personnel', label: 'Personnel #', render: r => r.va_personnelnumber ?? '--' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.va_status ?? 'Active'} /> },
  { key: 'level', label: 'Level', render: r => r.va_allowanceLevel ?? '--' },
  { key: 'amount', label: 'Monthly', render: r => formatCurrency(r.va_totalMonthlyAmount) },
  { key: 'effective', label: 'Effective', render: r => formatDate(r.va_effectiveDate) },
  {
    key: 'renewal',
    label: 'Next Renewal',
    render: r => {
      const date = r.va_nextRenewalDue
      if (!date) return '--'
      const isExpiring = new Date(date) <= new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      return isExpiring ? <Badge color="warning">{formatDate(date)}</Badge> : formatDate(date)
    },
  },
]

export function AllowancesTable() {
  const { allowanceRecords, loading, error } = useAdminData()

  if (loading) return <Spinner size="large" label="Loading allowances..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Active Allowances</Text>
      <DataTable
        columns={columns}
        items={allowanceRecords}
        getRowKey={r => r.va_allowancerecordid!}
        emptyMessage="No allowance records found."
      />
    </div>
  )
}
