import { useState, useEffect, useCallback } from 'react'
import { Text, Spinner, MessageBar, Badge, Button, tokens } from '@fluentui/react-components'
import { useConnectorContext } from '@microsoft/power-apps'
import { useFlowActions } from '@/hooks/useFlowActions'
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

export function PayrollAllowances() {
  const { connectors } = useConnectorContext()
  const { verifyPayroll } = useFlowActions()
  const [records, setRecords] = useState<AllowanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      const result = await connectors.dataverse.retrieveMultipleRecords(
        'va_allowancerecords',
        '?$orderby=createdon desc',
      )
      setRecords((result.entities as AllowanceRecord[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [connectors])

  useEffect(() => {
    void fetchRecords()
  }, [fetchRecords])

  async function handleVerify(record: AllowanceRecord) {
    if (!record.va_allowancerecordid) return
    setVerifying(record.va_allowancerecordid)
    try {
      await verifyPayroll(record.va_allowancerecordid)
      await fetchRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setVerifying(null)
    }
  }

  const columns: Column<AllowanceRecord>[] = [
    { key: 'name', label: 'Record', render: r => r.va_name ?? '--' },
    { key: 'personnel', label: 'Personnel #', render: r => r.va_personnelnumber ?? '--' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.va_status ?? 'Active'} /> },
    { key: 'level', label: 'Level', render: r => r.va_allowanceLevel ?? '--' },
    { key: 'total', label: 'Total Monthly', render: r => formatCurrency(r.va_totalMonthlyAmount) },
    {
      key: 'payroll',
      label: 'Payroll',
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
          <VerificationBadge status={r.va_payrollVerificationStatus} />
          {r.va_payrollAmountMismatch && (
            <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>
              Expected {formatCurrency(r.va_totalMonthlyAmount)}, got {formatCurrency(r.va_payrollAmount)}
            </Text>
          )}
        </div>
      ),
    },
    { key: 'earnCode', label: 'Earn Code', render: r => r.va_payrollEarnCode ?? '--', hideOnMobile: true },
    { key: 'verified', label: 'Verified', render: r => formatDate(r.va_payrollVerifiedDate), hideOnMobile: true },
    {
      key: 'action',
      label: '',
      render: r => (
        <Button
          size="small"
          appearance="subtle"
          onClick={(e) => { e.stopPropagation(); void handleVerify(r) }}
          disabled={verifying === r.va_allowancerecordid}
        >
          {verifying === r.va_allowancerecordid ? 'Checking...' : 'Verify'}
        </Button>
      ),
    },
  ]

  const unverified = records.filter(r => !r.va_payrollVerificationStatus || r.va_payrollVerificationStatus === PayrollVerificationStatus.Pending)
  const mismatched = records.filter(r => r.va_payrollAmountMismatch)

  if (loading) return <Spinner size="large" label="Loading payroll data..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Allowance Records</Text>

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
        items={records}
        getRowKey={r => r.va_allowancerecordid!}
        emptyMessage="No allowance records."
      />
    </div>
  )
}
