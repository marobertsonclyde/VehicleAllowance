import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Text, MessageBar, tokens } from '@fluentui/react-components'
import { useAllowanceRecord } from '@/hooks/useAllowanceRecord'
import { useFlowActions } from '@/hooks/useFlowActions'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatCurrency, formatDate, getErrorMessage } from '@/utils/formatters'
import { isInOptOutWindow, optOutEffectiveDate } from '@/utils/effectiveDateCalc'

export function OptOutScreen() {
  const navigate = useNavigate()
  const { record } = useAllowanceRecord()
  const { submitOptOut } = useFlowActions()

  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleOptOut() {
    if (!record?.va_allowancerecordid) return
    setSubmitting(true)
    setError(null)
    try {
      await submitOptOut(record.va_allowancerecordid, new Date().toISOString())
      setSubmitted(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Opt-out request failed'))
    } finally {
      setSubmitting(false)
      setShowConfirm(false)
    }
  }

  if (!record) {
    return <MessageBar intent="warning">No active allowance record found.</MessageBar>
  }

  if (submitted) {
    return (
      <div className="screen">
        <Text as="h1" size={700} weight="bold">Opt-Out Requested</Text>
        <Card style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
          <MessageBar intent="success">
            Your opt-out request has been submitted. Your allowance will end effective {formatDate(optOutEffectiveDate().toISOString())}.
          </MessageBar>
          <Button appearance="primary" onClick={() => navigate('/')} style={{ marginTop: tokens.spacingVerticalL }}>
            Return Home
          </Button>
        </Card>
      </div>
    )
  }

  const inWindow = isInOptOutWindow()

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Opt Out of Vehicle Allowance</Text>

      {error && <MessageBar intent="error">{error}</MessageBar>}

      {!inWindow && (
        <MessageBar intent="warning">
          The opt-out window has passed. Opt-out requests must be submitted before August 1.
        </MessageBar>
      )}

      <Card>
        <Text weight="semibold" size={400}>Current Allowance</Text>
        <div className="form-grid" style={{ marginTop: tokens.spacingVerticalS }}>
          <div><Text size={200}>Level</Text><Text as="p" size={300}>{record.va_allowanceLevel}</Text></div>
          <div><Text size={200}>Monthly Amount</Text><Text as="p" size={300}>{formatCurrency(record.va_totalMonthlyAmount)}</Text></div>
          <div><Text size={200}>Effective Since</Text><Text as="p" size={300}>{formatDate(record.va_effectiveDate)}</Text></div>
        </div>
      </Card>

      <Card>
        <Text weight="semibold" size={400}>What Happens When You Opt Out</Text>
        <ul style={{ margin: `${tokens.spacingVerticalS} 0`, paddingLeft: 20 }}>
          <li><Text size={300}>Your allowance payments will stop effective January 1, {optOutEffectiveDate().getFullYear()}.</Text></li>
          <li><Text size={300}>This action cannot be undone until the next enrollment period.</Text></li>
          <li><Text size={300}>You must return any company-issued equipment per the Equipment Department.</Text></li>
        </ul>
      </Card>

      <div className="action-bar">
        <Button appearance="secondary" onClick={() => navigate('/')}>Cancel</Button>
        <Button appearance="primary" onClick={() => setShowConfirm(true)} disabled={!inWindow || submitting}>
          Request Opt-Out
        </Button>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Confirm Opt-Out"
        message={`Are you sure you want to opt out? Your allowance of ${formatCurrency(record.va_totalMonthlyAmount)}/month will end effective January 1, ${optOutEffectiveDate().getFullYear()}.`}
        confirmLabel="Yes, Opt Out"
        onConfirm={() => void handleOptOut()}
        onCancel={() => setShowConfirm(false)}
        danger
      />
    </div>
  )
}
