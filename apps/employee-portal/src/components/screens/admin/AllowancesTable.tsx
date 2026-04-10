import { Text, Spinner, MessageBar, Badge, tokens } from '@fluentui/react-components'
import { useAdminData } from '@/hooks/useAdminData'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { PayrollVerificationStatus, type AllowanceRecord } from '@/types'

function VerificationBadge({ status }: { status?: PayrollVerificationStatus }) {
  if (!status) return <Badge color="subtle" appearance="outline" size="small">Not Checked</Badge>
  const colorMap: Record<PayrollVerificationStatus, 'success' | 'danger' | 'warning' | 'subtle' | 'brand'> = {
    [PayrollVerificationStatus.Verified]: 'success',
    [PayrollVerificationStatus.NotFound]: 'danger',
    [PayrollVerificationStatus.AmountMismatch]: 'warning',
    [PayrollVerificationStatus.Pending]: 'brand',
    [PayrollVerificationStatus.Failed]: 'danger',
  }
  return <Badge color={colorMap[status] ?? 'subtle'} appearance="filled" size="small">{status}</Badge>
}

const columns: Column<AllowanceRecord>[] = [
  { key: 'name', label: 'Record', render: r => r.va_name ?? '--' },
  { key: 'personnel', label: 'Personnel #', render: r => r.va_personnelnumber ?? '--' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.va_status ?? 'Active'} /> },
  { key: 'level', label: 'Level', render: r => r.va_allowanceLevel ?? '--' },
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
  { key: 'earnCode', label: 'Earn Code', render: r => r.va_payrollEarnCode ?? '--' },
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

  const unverified = allowanceRecords.filter(r => !r.va_payrollVerificationStatus || r.va_payrollVerificationStatus === PayrollVerificationStatus.Pending)
  const mismatched = allowanceRecords.filter(r => r.va_payrollAmountMismatch)

  if (loading) return <Spinner size="large" label="Loading allowances..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Active Allowances</Text>

      {unverified.length > 0 && (
        <MessageBar intent="warning">
          {unverified.length} record{unverified.length > 1 ? 's' : ''} not yet verified in payroll.
        </MessageBar>
      )}
      {mismatched.length > 0 && (
        <MessageBar intent="error">
          {mismatched.length} record{mismatched.length > 1 ? 's' : ''} with payroll amount mismatch.
        </MessageBar>
      )}

      <DataTable
        columns={columns}
        items={allowanceRecords}
        getRowKey={r => r.va_allowancerecordid!}
        emptyMessage="No allowance records found."
      />
    </div>
  )
}
