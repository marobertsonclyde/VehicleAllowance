import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, Button, Text, Textarea, Field, RadioGroup, Radio,
  MessageBar, Spinner, tokens,
} from '@fluentui/react-components'
import { useConnectorContext } from '@microsoft/power-apps'
import { useUserRole } from '@/hooks/useUserRole'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { getErrorMessage } from '@/utils/formatters'
import { DecisionType, ApplicationStatus, UserRole, type AllowanceApplication } from '@/types'

export function DecisionScreen() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const { connectors } = useConnectorContext()
  const { role } = useUserRole()

  const [application, setApplication] = useState<AllowanceApplication | null>(null)
  const [decision, setDecision] = useState<DecisionType | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function fetchApp() {
      if (!applicationId) return
      try {
        const result = await connectors.dataverse.retrieveRecord('va_allowanceapplications', applicationId)
        setApplication(result as unknown as AllowanceApplication)
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load application'))
      } finally {
        setLoading(false)
      }
    }
    void fetchApp()
  }, [applicationId, connectors])

  const isEquipmentLeader = role === UserRole.EquipmentLeader || role === UserRole.Admin
  const isDirector = role === UserRole.Director || role === UserRole.Admin

  async function handleSubmit() {
    if (!applicationId || !decision) return
    setSubmitting(true)
    setError(null)
    try {
      const updateData: Record<string, unknown> = {}

      if (application?.va_status === ApplicationStatus.EquipmentLeaderReview && isEquipmentLeader) {
        updateData.va_equipmentLeaderDecision = decision
        updateData.va_equipmentLeaderNotes = notes
        updateData.va_equipmentLeaderReviewDate = new Date().toISOString()
      } else if (application?.va_status === ApplicationStatus.DirectorReview && isDirector) {
        updateData.va_directorDecision = decision
        updateData.va_directorNotes = notes
        updateData.va_directorReviewDate = new Date().toISOString()
      } else {
        setError('You are not authorized to make this decision at this stage.')
        setSubmitting(false)
        return
      }

      await connectors.dataverse.updateRecord('va_allowanceapplications', applicationId, updateData)
      setSubmitted(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit decision'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner size="large" label="Loading..." />
  if (!application) return <MessageBar intent="warning">Application not found.</MessageBar>

  if (submitted) {
    return (
      <div className="screen">
        <Text as="h1" size={700} weight="bold">Decision Submitted</Text>
        <Card style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
          <MessageBar intent="success">Your decision has been recorded.</MessageBar>
          <Button appearance="primary" onClick={() => navigate('/review')} style={{ marginTop: tokens.spacingVerticalL }}>
            Return to Queue
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <Text as="h1" size={700} weight="bold">Decision: {application.va_name}</Text>
        <StatusBadge status={application.va_status ?? 'Draft'} />
      </div>

      {error && <MessageBar intent="error">{error}</MessageBar>}

      <Card>
        <Field label="Decision" required>
          <RadioGroup value={decision ?? ''} onChange={(_e, d) => setDecision(d.value as DecisionType)}>
            <Radio value={DecisionType.Approved} label="Approve" />
            <Radio value={DecisionType.Returned} label="Return to Employee" />
            <Radio value={DecisionType.Rejected} label="Reject" />
          </RadioGroup>
        </Field>
      </Card>

      <Card>
        <Field label="Notes" hint="Provide context for your decision (visible to other reviewers, not the employee)">
          <Textarea value={notes} onChange={(_e, d) => setNotes(d.value)} rows={4} resize="vertical" />
        </Field>
      </Card>

      <div className="action-bar">
        <Button appearance="secondary" onClick={() => navigate(`/review/${applicationId}`)}>Back</Button>
        <Button appearance="primary" onClick={() => void handleSubmit()} disabled={!decision || submitting}>
          {submitting ? 'Submitting...' : 'Submit Decision'}
        </Button>
      </div>
    </div>
  )
}
