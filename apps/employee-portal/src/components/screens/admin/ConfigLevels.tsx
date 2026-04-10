import { useState } from 'react'
import { Card, Button, Text, Input, Field, Checkbox, MessageBar, Spinner, tokens } from '@fluentui/react-components'
import { useAdminData } from '@/hooks/useAdminData'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { formatCurrency } from '@/utils/formatters'
import type { AllowanceLevelConfig } from '@/types'

const columns: Column<AllowanceLevelConfig>[] = [
  { key: 'level', label: 'Level', render: c => c.va_level ?? '--' },
  { key: 'msrp', label: 'Min MSRP', render: c => formatCurrency(c.va_minimumMsrp) },
  { key: 'monthly', label: 'Monthly Allowance', render: c => formatCurrency(c.va_monthlyAllowance) },
  { key: 'ev', label: 'EV Charging', render: c => formatCurrency(c.va_evChargingAmount) },
  { key: 'current', label: 'Current', render: c => c.va_isCurrentRate ? 'Yes' : 'No' },
]

export function ConfigLevels() {
  const { levels, loading, error, saveLevel } = useAdminData()
  const [editing, setEditing] = useState<AllowanceLevelConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    setSaveError(null)
    try {
      await saveLevel(editing)
      setEditing(null)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner size="large" label="Loading levels..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>

  return (
    <div className="screen">
      <div className="screen-header">
        <Text as="h1" size={700} weight="bold">Allowance Level Configuration</Text>
        <Button appearance="primary" onClick={() => setEditing({})}>Add Level</Button>
      </div>

      <DataTable
        columns={columns}
        items={levels}
        getRowKey={c => c.va_allowancelevelconfigid!}
        onRowClick={c => setEditing({ ...c })}
        emptyMessage="No levels configured."
      />

      {editing && (
        <Card style={{ marginTop: tokens.spacingVerticalM }}>
          <Text weight="semibold" size={400}>{editing.va_allowancelevelconfigid ? 'Edit' : 'New'} Level</Text>
          {saveError && <MessageBar intent="error">{saveError}</MessageBar>}
          <div className="form-grid" style={{ marginTop: tokens.spacingVerticalS }}>
            <Field label="Level">
              <Input value={editing.va_level ?? ''} onChange={(_e, d) => setEditing({ ...editing, va_level: d.value as AllowanceLevelConfig['va_level'] })} />
            </Field>
            <Field label="Minimum MSRP">
              <Input type="number" value={String(editing.va_minimumMsrp ?? '')} onChange={(_e, d) => setEditing({ ...editing, va_minimumMsrp: Number(d.value) })} contentBefore="$" />
            </Field>
            <Field label="Monthly Allowance">
              <Input type="number" value={String(editing.va_monthlyAllowance ?? '')} onChange={(_e, d) => setEditing({ ...editing, va_monthlyAllowance: Number(d.value) })} contentBefore="$" />
            </Field>
            <Field label="EV Charging Amount">
              <Input type="number" value={String(editing.va_evChargingAmount ?? '')} onChange={(_e, d) => setEditing({ ...editing, va_evChargingAmount: Number(d.value) })} contentBefore="$" />
            </Field>
            <Field label="">
              <Checkbox checked={editing.va_isCurrentRate ?? false} onChange={(_e, d) => setEditing({ ...editing, va_isCurrentRate: !!d.checked })} label="Current rate" />
            </Field>
          </div>
          <div className="action-bar">
            <Button appearance="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button appearance="primary" onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
