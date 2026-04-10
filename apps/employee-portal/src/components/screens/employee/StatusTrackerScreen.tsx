import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Text, Spinner, MessageBar, tokens } from '@fluentui/react-components'
import { useConnectorContext } from '@microsoft/power-apps'
import { StepIndicator } from '@/components/shared/StepIndicator'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TimelineEntry } from '@/components/shared/TimelineEntry'
import { getErrorMessage } from '@/utils/formatters'
import { ApplicationStatus, type AllowanceApplication, type AuditLog } from '@/types'

const STATUS_STEPS = [
  ApplicationStatus.Submitted,
  ApplicationStatus.AIReview,
  ApplicationStatus.EquipmentLeaderReview,
  ApplicationStatus.DirectorReview,
  ApplicationStatus.PayrollNotification,
  ApplicationStatus.Active,
]

export function StatusTrackerScreen() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const { connectors } = useConnectorContext()
  const [application, setApplication] = useState<AllowanceApplication | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!applicationId) return
      try {
        const [appResult, logsResult] = await Promise.all([
          connectors.dataverse.retrieveRecord('va_allowanceapplications', applicationId),
          connectors.dataverse.retrieveMultipleRecords(
            'va_auditlogs',
            `?$filter=_va_applicationid_value eq '${applicationId}'&$orderby=va_eventdate desc`,
          ),
        ])
        setApplication(appResult as unknown as AllowanceApplication)
        setAuditLogs((logsResult.entities as AuditLog[]) ?? [])
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load application status'))
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [applicationId, connectors])

  if (loading) return <Spinner size="large" label="Loading status..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>
  if (!application) return <MessageBar intent="warning">Application not found.</MessageBar>

  const currentStatusIndex = STATUS_STEPS.indexOf(application.va_status as ApplicationStatus)
  const steps = STATUS_STEPS.map((status, i) => ({
    label: status,
    completed: i < currentStatusIndex,
    active: i === currentStatusIndex,
  }))

  return (
    <div className="screen">
      <div className="screen-header">
        <Text as="h1" size={700} weight="bold">Application {application.va_name}</Text>
        <StatusBadge status={application.va_status ?? 'Draft'} />
      </div>

      <Card>
        <StepIndicator steps={steps} />
      </Card>

      <Card>
        <Text weight="semibold" size={400}>Activity Timeline</Text>
        <div style={{ marginTop: tokens.spacingVerticalM }}>
          {auditLogs.map((log, i) => (
            <TimelineEntry
              key={log.va_auditlogid}
              event={`${log.va_eventType}: ${log.va_previousStatus ?? ''} -> ${log.va_newStatus ?? ''}`}
              date={log.va_eventDate}
              notes={log.va_notes}
              isLatest={i === 0}
            />
          ))}
          {auditLogs.length === 0 && (
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>No activity yet.</Text>
          )}
        </div>
      </Card>

      <div className="action-bar">
        <Button appearance="secondary" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    </div>
  )
}
