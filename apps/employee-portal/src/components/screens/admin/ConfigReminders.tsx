import { useState } from 'react'
import { Card, Button, Text, Input, Field, MessageBar, Spinner, tokens } from '@fluentui/react-components'
import { useAdminData } from '@/hooks/useAdminData'
import { getErrorMessage } from '@/utils/formatters'
import type { ReminderConfig } from '@/types'

export function ConfigReminders() {
  const { reminders, loading, error, saveReminder } = useAdminData()
  const [editing, setEditing] = useState<ReminderConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const active = reminders[0] ?? null

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    setSaveError(null)
    try {
      await saveReminder({ ...editing, va_isActive: true })
      setEditing(null)
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to save'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner size="large" label="Loading..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>

  const config = editing ?? active

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Insurance Reminder Configuration</Text>
      <Text size={300}>Configure when insurance expiry reminders are sent to employees and reviewers.</Text>

      <Card>
        {saveError && <MessageBar intent="error">{saveError}</MessageBar>}
        <div className="form-grid" style={{ marginTop: tokens.spacingVerticalS }}>
          <Field label="First Reminder (days before expiry)" hint="e.g. 45 = send reminder 45 days before policy expires">
            <Input
              type="number"
              value={String(config?.va_reminderDays1 ?? '')}
              onChange={(_e, d) => setEditing({ ...(config ?? {}), va_reminderDays1: Number(d.value) })}
              disabled={!editing}
            />
          </Field>
          <Field label="Second Reminder (days before expiry)">
            <Input
              type="number"
              value={String(config?.va_reminderDays2 ?? '')}
              onChange={(_e, d) => setEditing({ ...(config ?? {}), va_reminderDays2: Number(d.value) })}
              disabled={!editing}
            />
          </Field>
          <Field label="Third Reminder (days before expiry)">
            <Input
              type="number"
              value={String(config?.va_reminderDays3 ?? '')}
              onChange={(_e, d) => setEditing({ ...(config ?? {}), va_reminderDays3: Number(d.value) })}
              disabled={!editing}
            />
          </Field>
          <Field label="Grace Period (days after expiry)" hint="Allowance terminated if no renewal after grace period">
            <Input
              type="number"
              value={String(config?.va_gracePeriodDays ?? '')}
              onChange={(_e, d) => setEditing({ ...(config ?? {}), va_gracePeriodDays: Number(d.value) })}
              disabled={!editing}
            />
          </Field>
        </div>
        <div className="action-bar">
          {!editing ? (
            <Button appearance="primary" onClick={() => setEditing(active ? { ...active } : {})}>Edit</Button>
          ) : (
            <>
              <Button appearance="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button appearance="primary" onClick={() => void handleSave()} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
