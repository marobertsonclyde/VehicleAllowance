import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Text, Checkbox, MessageBar, Spinner, tokens } from '@fluentui/react-components'
import { useCurrentApplication } from '@/hooks/useCurrentApplication'
import { useFlowActions } from '@/hooks/useFlowActions'
import { useWizardState } from '@/context/WizardContext'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { effectiveDateDescription } from '@/utils/effectiveDateCalc'

export function ReviewSubmitScreen() {
  const navigate = useNavigate()
  const wizardState = useWizardState()
  const { application, vehicle, policies, documents, loading, error: loadError } = useCurrentApplication()
  const { submitApplication } = useFlowActions()

  const [attested, setAttested] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    const appId = wizardState.applicationId ?? application?.va_allowanceapplicationid
    if (!appId) { setError('No application found'); return }

    setSubmitting(true)
    setError(null)
    try {
      await submitApplication(appId)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner size="large" label="Loading application summary..." />

  if (submitted) {
    return (
      <div className="screen">
        <Text as="h1" size={700} weight="bold">Application Submitted</Text>
        <Card style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
          <MessageBar intent="success">Your application has been submitted for review!</MessageBar>
          <Text as="p" size={300} style={{ marginTop: tokens.spacingVerticalM }}>
            You will receive a Teams notification when there is an update. {effectiveDateDescription()}
          </Text>
          <Button
            appearance="primary"
            onClick={() => navigate(`/status/${wizardState.applicationId ?? application?.va_allowanceapplicationid}`)}
            style={{ marginTop: tokens.spacingVerticalL }}
          >
            Track Status
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Review & Submit</Text>

      {(loadError || error) && <MessageBar intent="error">{loadError ?? error}</MessageBar>}

      {/* Vehicle Summary */}
      <Card>
        <Text weight="semibold" size={400}>Vehicle</Text>
        <div className="form-grid" style={{ marginTop: tokens.spacingVerticalS }}>
          <div><Text size={200}>VIN</Text><Text as="p" size={300}>{vehicle?.va_vin ?? '--'}</Text></div>
          <div><Text size={200}>Year/Make/Model</Text><Text as="p" size={300}>{vehicle?.va_year} {vehicle?.va_make} {vehicle?.va_model}</Text></div>
          <div><Text size={200}>MSRP</Text><Text as="p" size={300}>{formatCurrency(vehicle?.va_msrpTotal)}</Text></div>
          <div><Text size={200}>Electric</Text><Text as="p" size={300}>{vehicle?.va_isElectric ? 'Yes' : 'No'}</Text></div>
        </div>
      </Card>

      {/* Allowance Summary */}
      <Card>
        <Text weight="semibold" size={400}>Allowance</Text>
        <div className="form-grid" style={{ marginTop: tokens.spacingVerticalS }}>
          <div><Text size={200}>Level</Text><Text as="p" size={300}>{application?.va_allowanceLevel}</Text></div>
          <div><Text size={200}>Monthly Amount</Text><Text as="p" size={300}>{formatCurrency(application?.va_monthlyAllowanceAmount)}</Text></div>
          <div><Text size={200}>EV Charging</Text><Text as="p" size={300}>{formatCurrency(application?.va_evChargingAllowance)}</Text></div>
          <div><Text size={200}>Total Monthly</Text><Text as="p" size={300} weight="semibold">{formatCurrency(application?.va_totalMonthlyAllowance)}</Text></div>
        </div>
      </Card>

      {/* Insurance Summary */}
      <Card>
        <Text weight="semibold" size={400}>Insurance Policies ({policies.length})</Text>
        {policies.map(p => (
          <div key={p.va_insurancepolicyid} style={{ marginTop: tokens.spacingVerticalS, paddingTop: tokens.spacingVerticalS, borderTop: `1px solid ${tokens.colorNeutralStroke2}` }}>
            <Text size={300}>{p.va_policyType}: {p.va_carrierName} #{p.va_policyNumber}</Text>
            <Text as="p" size={200}>Expires: {formatDate(p.va_expirationDate)}</Text>
          </div>
        ))}
      </Card>

      {/* Documents */}
      <Card>
        <Text weight="semibold" size={400}>Documents ({documents.length})</Text>
        {documents.map(d => (
          <div key={d.va_documentid} style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacingVerticalXS }}>
            <Text size={200}>{d.va_documentType}</Text>
            <StatusBadge status={d.va_aiProcessingStatus ?? 'Pending'} />
          </div>
        ))}
      </Card>

      {/* Attestation */}
      <Card>
        <Checkbox
          checked={attested}
          onChange={(_e, data) => setAttested(!!data.checked)}
          label="I certify that the information provided is accurate and complete, and I agree to the terms of the Vehicle Allowance Program."
        />
      </Card>

      <div className="action-bar">
        <Button appearance="secondary" onClick={() => navigate('/apply/insurance')}>Back</Button>
        <Button appearance="primary" onClick={() => void handleSubmit()} disabled={!attested || submitting}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  )
}
