import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
} from '@fluentui/react-components'
import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  render: (item: T) => ReactNode
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  items: T[]
  getRowKey: (item: T) => string
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  items,
  getRowKey,
  onRowClick,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <Text size={300} style={{ color: 'var(--colorNeutralForeground3)' }}>
          {emptyMessage}
        </Text>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(col => (
            <TableHeaderCell key={col.key} style={col.width ? { width: col.width } : undefined}>
              {col.label}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => (
          <TableRow
            key={getRowKey(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            style={onRowClick ? { cursor: 'pointer' } : undefined}
          >
            {columns.map(col => (
              <TableCell key={col.key}>{col.render(item)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
