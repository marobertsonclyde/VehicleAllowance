import { Text, Spinner, MessageBar, Badge, tokens } from '@fluentui/react-components'
import { useAdminData } from '@/hooks/useAdminData'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { VerificationBadge } from '@/components/shared/VerificationBadge'
import { PayrollWarnings } from '@/components/shared/PayrollWarnings'
import { formatDate, formatCurrency } from '@/utils/formatters'
import type { AllowanceRecord } from '@/types'

const RENEWAL_WARNING_MS = 45 * 24 * 60 * 60 * 1000

const columns: Column<AllowanceRecord>[] = [
  { key: 'name', label: 'Record', render: r => r.va_name ?? '--' },
  { key: 'personnel', label: 'Personnel #', render: r => r.va_personnelnumber ?? '--', hideOnMobile: true },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.va_status ?? 'Active'} /> },
  { key: 'level', label: 'Level', render: r => r.va_allowanceLevel ?? '--', hideOnMobile: true },
  { key: 'amount', label: 'Monthly', render: r => formatCurrency(r.va_totalMonthlyAmount) },
  {
    key: 'payroll',
    label: 'Payroll Status',
    render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
        <VerificationBadge status={r.va_payrollVerificationStatus} />
        {r.va_payrollAmountMismatch && (
          <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>
            Mismatch
          </Text>
        )}
      </div>
    ),
  },
  { key: 'earnCode', label: 'Earn Code', render: r => r.va_payrollEarnCode ?? '--', hideOnMobile: true },
  { key: 'effective', label: 'Effective', render: r => formatDate(r.va_effectiveDate), hideOnMobile: true },
  {
    key: 'renewal',
    label: 'Next Renewal',
    hideOnMobile: true,
    render: r => {
      const date = r.va_nextRenewalDue
      if (!date) return '--'
      const isExpiring = new Date(date) <= new Date(Date.now() + RENEWAL_WARNING_MS)
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

      <PayrollWarnings records={allowanceRecords} />

      <DataTable
        columns={columns}
        items={allowanceRecords}
        getRowKey={r => r.va_allowancerecordid!}
        emptyMessage="No allowance records found."
      />
    </div>
  )
}
