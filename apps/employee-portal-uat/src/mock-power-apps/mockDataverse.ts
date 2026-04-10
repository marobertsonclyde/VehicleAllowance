/**
 * Mock Dataverse connector
 *
 * Implements the subset of the Dataverse connector API used by the portal:
 *   retrieveMultipleRecords, retrieveRecord, createRecord, updateRecord, uploadFile
 *
 * Queries are a subset of OData: $filter (eq/ne + and/or), $orderby, $top.
 * Lookup field names (_fieldname_value) are transparently mapped to their
 * base field names as stored in the MockStore.
 */

import { mockStore } from './MockStore'

// Simulated network latency (ms) – keeps the UI feel realistic during UAT
const LATENCY = 250

const delay = (ms = LATENCY) => new Promise<void>(r => setTimeout(r, ms))

// ─── OData filter parser ───────────────────────────────────────────────────────

function getField(entity: Record<string, unknown>, rawField: string): unknown {
  if (rawField in entity) return entity[rawField]
  // OData lookup field: _va_fieldname_value → va_fieldname (strip leading _ and trailing _value)
  if (rawField.startsWith('_') && rawField.endsWith('_value')) {
    const base = rawField.slice(1, -6)
    if (base in entity) return entity[base]
  }
  return undefined
}

function evaluateFilter(entity: Record<string, unknown>, filter: string): boolean {
  const f = filter.trim()

  // Handle parenthesised groups: (...)
  if (f.startsWith('(') && f.endsWith(')')) {
    return evaluateFilter(entity, f.slice(1, -1))
  }

  // Split on ' or ' (lowest precedence)
  const orParts = splitLogical(f, ' or ')
  if (orParts.length > 1) return orParts.some(p => evaluateFilter(entity, p))

  // Split on ' and '
  const andParts = splitLogical(f, ' and ')
  if (andParts.length > 1) return andParts.every(p => evaluateFilter(entity, p))

  // leaf: field eq 'value'  |  field ne 'value'
  const m = f.match(/^(\S+)\s+(eq|ne)\s+'([^']*)'$/i)
  if (m) {
    const [, field, op, value] = m
    const actual = String(getField(entity, field) ?? '')
    return op.toLowerCase() === 'eq' ? actual === value : actual !== value
  }

  return true // unknown clause — pass through
}

/**
 * Split a filter string on a logical keyword but NOT inside parentheses.
 */
function splitLogical(filter: string, keyword: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0

  for (let i = 0; i < filter.length; i++) {
    if (filter[i] === '(') depth++
    else if (filter[i] === ')') depth--
    else if (depth === 0 && filter.slice(i).toLowerCase().startsWith(keyword)) {
      parts.push(filter.slice(start, i))
      start = i + keyword.length
      i = start - 1
    }
  }
  parts.push(filter.slice(start))
  return parts.length > 1 ? parts : [filter]
}

function applyQuery(
  entities: Record<string, unknown>[],
  query: string,
): Record<string, unknown>[] {
  if (!query) return entities

  const qs = query.startsWith('?') ? query.slice(1) : query
  const params = new URLSearchParams(qs)

  let result = [...entities]

  const filterStr = params.get('$filter')
  if (filterStr) result = result.filter(e => evaluateFilter(e, filterStr))

  const orderby = params.get('$orderby')
  if (orderby) {
    const [field, dir = 'asc'] = orderby.trim().split(/\s+/)
    result.sort((a, b) => {
      const va = String(a[field] ?? '')
      const vb = String(b[field] ?? '')
      return dir === 'desc' ? vb.localeCompare(va) : va.localeCompare(vb)
    })
  }

  const top = params.get('$top')
  if (top) result = result.slice(0, parseInt(top, 10))

  return result
}

// ─── Public connector object ───────────────────────────────────────────────────

export function buildMockDataverse() {
  return {
    async retrieveMultipleRecords(entityName: string, query = '') {
      await delay()

      // Special case: role lookup used by useUserRole
      if (entityName === 'systemuserroles_association') {
        const role = mockStore.getRole()
        return {
          entities: [{
            'roleid.name': `va_${role.toLowerCase()}`,
          }],
        }
      }

      const table  = mockStore.getTable(entityName)
      const result = applyQuery(table, query)
      return { entities: result }
    },

    async retrieveRecord(entityName: string, id: string, _selectQuery = '') {
      await delay()
      const record = mockStore.findById(entityName, id)
      if (!record) throw new Error(`[UAT Mock] Record not found: ${entityName}/${id}`)
      return record
    },

    async createRecord(entityName: string, data: Record<string, unknown>) {
      await delay()
      const id = mockStore.createRecord(entityName, data)
      return { id }
    },

    async updateRecord(entityName: string, id: string, data: Record<string, unknown>) {
      await delay()
      mockStore.updateRecord(entityName, id, data)
    },

    async uploadFile(
      _entityName: string,
      _recordId: string,
      _columnName: string,
      _file: File,
    ) {
      // Simulate a brief upload pause; no actual file stored in UAT
      await delay(600)
    },
  }
}
