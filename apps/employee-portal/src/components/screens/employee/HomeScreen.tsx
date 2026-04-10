import { useNavigate } from 'react-router-dom'
import { Card, Button, Text, Spinner, MessageBar, tokens } from '@fluentui/react-components'
import { useCurrentApplication } from '@/hooks/useCurrentApplication'
import { useAllowanceRecord } from '@/hooks/useAllowanceRecord'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { ApplicationStatus } from '@/types'

export function HomeScreen() {
  const navigate = useNavigate()
  const { application, loading: appLoading, error: appError } = useCurrentApplication()
  const { record, loading: recLoading } = useAllowanceRecord()

  if (appLoading || recLoading) {
    return <Spinner size="large" label="Loading your data..." />
  }

  if (appError) {
    return <MessageBar intent="error">{appError}</MessageBar>
  }

  // Active allowance record — show management options
  if (record) {
    return (
      <div className="screen">
        <Text as="h1" size={700} weight="bold">Your Vehicle Allowance</Text>
        <Card>
          <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>Monthly Allowance</Text>
              <Text as="p" size={800} weight="bold">{formatCurrency(record.va_totalMonthlyAmount)}</Text>
              <Text size={200}>Level {record.va_allowanceLevel} | Effective {formatDate(record.va_effectiveDate)}</Text>
            </div>
            <StatusBadge status={record.va_status ?? 'Active'} />
          </div>
        </Card>
        <div className="card-grid">
          <Card>
            <Text weight="semibold" size={400}>Insurance Renewal</Text>
            <Text size={200}>Next renewal due: {formatDate(record.va_nextRenewalDue)}</Text>
            <Button appearance="primary" onClick={() => navigate('/renewal')} style={{ marginTop: tokens.spacingVerticalM }}>
              Upload Renewal Documents
            </Button>
          </Card>
          <Card>
            <Text weight="semibold" size={400}>Opt Out</Text>
            <Text size={200}>Request to opt out of the vehicle allowance program.</Text>
            <Button appearance="secondary" onClick={() => navigate('/opt-out')} style={{ marginTop: tokens.spacingVerticalM }}>
              Request Opt-Out
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // Open application — show status
  if (application) {
    const isReturned = application.va_status === ApplicationStatus.ReturnedToEmployee
    return (
      <div className="screen">
        <Text as="h1" size={700} weight="bold">Application {application.va_name}</Text>
        <Card>
          <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text size={300}>Status</Text>
              <div style={{ marginTop: tokens.spacingVerticalXS }}>
                <StatusBadge status={application.va_status ?? 'Draft'} />
              </div>
            </div>
            <div>
              <Text size={300}>Submitted</Text>
              <Text as="p" size={200}>{formatDate(application.va_submittedOn)}</Text>
            </div>
          </div>
        </Card>
        {isReturned && (
          <MessageBar intent="warning">
            Your application has been returned. Please review the feedback and resubmit.
          </MessageBar>
        )}
        <div className="action-bar">
          {application.va_status === ApplicationStatus.Draft && (
            <Button appearance="primary" onClick={() => navigate('/apply/vehicle')}>
              Continue Application
            </Button>
          )}
          <Button
            appearance="secondary"
            onClick={() => navigate(`/status/${application.va_allowanceapplicationid}`)}
          >
            View Status
          </Button>
        </div>
      </div>
    )
  }

  // No application — show CTA
  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Vehicle Allowance Program</Text>
      <Card style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
        <Text as="p" size={400}>
          Check your eligibility and apply for the company vehicle allowance program.
        </Text>
        <Button
          appearance="primary"
          size="large"
          onClick={() => navigate('/eligibility')}
          style={{ marginTop: tokens.spacingVerticalL }}
        >
          Check Eligibility
        </Button>
      </Card>
    </div>
  )
}
