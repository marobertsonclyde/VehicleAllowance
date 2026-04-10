import { useState, useEffect } from 'react'
import { Text, Spinner, MessageBar } from '@fluentui/react-components'
import { useConnectorContext } from '@microsoft/power-apps'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatCurrency } from '@/utils/formatters'
import type { AllowanceRecord } from '@/types'

const columns: Column<AllowanceRecord>[] = [
  { key: 'name', label: 'Record', render: r => r.va_name ?? '--' },
  { key: 'personnel', label: 'Personnel #', render: r => r.va_personnelnumber ?? '--' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.va_status ?? 'Active'} /> },
  { key: 'level', label: 'Level', render: r => r.va_allowanceLevel ?? '--' },
  { key: 'base', label: 'Base', render: r => formatCurrency(r.va_monthlyAmount) },
  { key: 'ev', label: 'EV Charging', render: r => formatCurrency(r.va_evChargingAmount) },
  { key: 'total', label: 'Total Monthly', render: r => formatCurrency(r.va_totalMonthlyAmount) },
  { key: 'effective', label: 'Effective', render: r => formatDate(r.va_effectiveDate) },
]

export function PayrollAllowances() {
  const { connectors } = useConnectorContext()
  const [records, setRecords] = useState<AllowanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecords() {
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
    }
    void fetchRecords()
  }, [connectors])

  if (loading) return <Spinner size="large" label="Loading payroll data..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Allowance Records</Text>
      <DataTable
        columns={columns}
        items={records}
        getRowKey={r => r.va_allowancerecordid!}
        emptyMessage="No allowance records."
      />
    </div>
  )
}
