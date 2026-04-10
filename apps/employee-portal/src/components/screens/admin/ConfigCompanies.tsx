import { useState } from 'react'
import { Card, Button, Text, Input, Field, Checkbox, MessageBar, Spinner, tokens } from '@fluentui/react-components'
import { useAdminData } from '@/hooks/useAdminData'
import { DataTable, type Column } from '@/components/shared/DataTable'
import type { CompanyEntity } from '@/types'

const columns: Column<CompanyEntity>[] = [
  { key: 'name', label: 'Company', render: c => c.va_name ?? '--' },
  { key: 'shortcode', label: 'Code', render: c => c.va_shortcode ?? '--' },
  { key: 'addr', label: 'Endorsement Address', render: c => c.va_endorsementaddressline1 ?? '--', hideOnMobile: true },
  { key: 'active', label: 'Active', render: c => c.va_isactive ? 'Yes' : 'No' },
]

export function ConfigCompanies() {
  const { companies, loading, error, saveCompany } = useAdminData()
  const [editing, setEditing] = useState<CompanyEntity | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    setSaveError(null)
    try {
      await saveCompany(editing)
      setEditing(null)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner size="large" label="Loading..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>

  return (
    <div className="screen">
      <div className="screen-header">
        <Text as="h1" size={700} weight="bold">Company Entities</Text>
        <Button appearance="primary" onClick={() => setEditing({ va_isactive: true })}>Add Company</Button>
      </div>

      <DataTable
        columns={columns}
        items={companies}
        getRowKey={c => c.va_companyentityid!}
        onRowClick={c => setEditing({ ...c })}
        emptyMessage="No company entities configured."
      />

      {editing && (
        <Card style={{ marginTop: tokens.spacingVerticalM }}>
          <Text weight="semibold" size={400}>{editing.va_companyentityid ? 'Edit' : 'New'} Company</Text>
          {saveError && <MessageBar intent="error">{saveError}</MessageBar>}
          <div className="form-grid" style={{ marginTop: tokens.spacingVerticalS }}>
            <Field label="Company Name"><Input value={editing.va_name ?? ''} onChange={(_e, d) => setEditing({ ...editing, va_name: d.value })} /></Field>
            <Field label="Short Code"><Input value={editing.va_shortcode ?? ''} onChange={(_e, d) => setEditing({ ...editing, va_shortcode: d.value })} /></Field>
            <Field label="Endorsement Address Line 1"><Input value={editing.va_endorsementaddressline1 ?? ''} onChange={(_e, d) => setEditing({ ...editing, va_endorsementaddressline1: d.value })} /></Field>
            <Field label="Endorsement Address Line 2"><Input value={editing.va_endorsementaddressline2 ?? ''} onChange={(_e, d) => setEditing({ ...editing, va_endorsementaddressline2: d.value })} /></Field>
            <Field label="Attention"><Input value={editing.va_endorsementattn ?? ''} onChange={(_e, d) => setEditing({ ...editing, va_endorsementattn: d.value })} /></Field>
            <Field label=""><Checkbox checked={editing.va_isactive ?? true} onChange={(_e, d) => setEditing({ ...editing, va_isactive: !!d.checked })} label="Active" /></Field>
          </div>
          <div className="action-bar">
            <Button appearance="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button appearance="primary" onClick={() => void handleSave()} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
