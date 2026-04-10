import { Text, Spinner, MessageBar } from '@fluentui/react-components'
import { useAdminData } from '@/hooks/useAdminData'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { formatDateTime } from '@/utils/formatters'
import type { AuditLog } from '@/types'

const columns: Column<AuditLog>[] = [
  { key: 'date', label: 'Date', render: l => formatDateTime(l.va_eventDate) },
  { key: 'event', label: 'Event', render: l => l.va_eventType ?? '--' },
  { key: 'from', label: 'From', render: l => l.va_previousStatus ?? '--' },
  { key: 'to', label: 'To', render: l => l.va_newStatus ?? '--' },
  { key: 'by', label: 'By', render: l => l.va_performedByName ?? '--' },
  { key: 'notes', label: 'Notes', render: l => l.va_notes ?? '--' },
]

export function AuditLogScreen() {
  const { auditLogs, loading, error } = useAdminData()

  if (loading) return <Spinner size="large" label="Loading audit log..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Audit Log</Text>
      <DataTable
        columns={columns}
        items={auditLogs}
        getRowKey={l => l.va_auditlogid!}
        emptyMessage="No audit log entries."
      />
    </div>
  )
}
