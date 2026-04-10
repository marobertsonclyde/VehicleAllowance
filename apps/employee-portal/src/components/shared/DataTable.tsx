import { useState, useMemo } from 'react'
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Input,
  Select,
  Label,
} from '@fluentui/react-components'
import { Search20Regular } from '@fluentui/react-icons'
import type { ReactNode } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

export interface Column<T> {
  key: string
  label: string
  render: (item: T) => ReactNode
  width?: string
  hideOnMobile?: boolean
}

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig<T> {
  key: string
  label: string
  options: FilterOption[]
  getValue: (item: T) => string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  items: T[]
  getRowKey: (item: T) => string
  onRowClick?: (item: T) => void
  emptyMessage?: string
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: ((item: T) => string)[]
  filters?: FilterConfig<T>[]
}

export function DataTable<T>({
  columns,
  items,
  getRowKey,
  onRowClick,
  emptyMessage = 'No data available',
  searchable,
  searchPlaceholder = 'Search...',
  searchFields,
  filters,
}: DataTableProps<T>) {
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const visibleColumns = isMobile ? columns.filter(c => !c.hideOnMobile) : columns

  const filteredItems = useMemo(() => {
    let result = items

    if (searchQuery && searchFields && searchFields.length > 0) {
      const q = searchQuery.toLowerCase()
      result = result.filter(item =>
        searchFields.some(getVal => getVal(item).toLowerCase().includes(q)),
      )
    }

    if (filters) {
      for (const filter of filters) {
        const val = activeFilters[filter.key]
        if (val) {
          result = result.filter(item => filter.getValue(item) === val)
        }
      }
    }

    return result
  }, [items, searchQuery, searchFields, filters, activeFilters])

  const hasToolbar = searchable || (filters && filters.length > 0)
  const isFiltered = searchQuery || Object.values(activeFilters).some(v => v)

  return (
    <div>
      {hasToolbar && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 12,
            alignItems: 'flex-end',
          }}
        >
          {searchable && (
            <Input
              contentBefore={<Search20Regular />}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(_e, d) => setSearchQuery(d.value)}
              style={{ minWidth: 240 }}
            />
          )}
          {filters?.map(filter => (
            <div key={filter.key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Label size="small" style={{ color: 'var(--colorNeutralForeground3)' }}>
                {filter.label}
              </Label>
              <Select
                size="small"
                value={activeFilters[filter.key] ?? ''}
                onChange={(_e, d) =>
                  setActiveFilters(prev => ({ ...prev, [filter.key]: d.value }))
                }
              >
                <option value="">All</option>
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Text size={300} style={{ color: 'var(--colorNeutralForeground3)' }}>
            {isFiltered ? 'No results match your search.' : emptyMessage}
          </Text>
        </div>
      ) : (
        <div className="table-scroll-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map(col => (
                  <TableHeaderCell
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.label}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow
                  key={getRowKey(item)}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  style={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {visibleColumns.map(col => (
                    <TableCell key={col.key}>{col.render(item)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
