import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Text, Spinner, MessageBar, Badge, tokens } from '@fluentui/react-components'
import { useApplicationDetail } from '@/hooks/useApplicationDetail'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AIExtractionDisplay } from '@/components/shared/AIExtractionDisplay'
import { formatCurrency, formatDate, formatPercent } from '@/utils/formatters'

export function ApplicationDetailScreen() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const { application, vehicle, policies, documents, loading, error } = useApplicationDetail(applicationId)

  if (loading) return <Spinner size="large" label="Loading application..." />
  if (error) return <MessageBar intent="error">{error}</MessageBar>
  if (!application) return <MessageBar intent="warning">Application not found.</MessageBar>

  return (
    <div className="screen">
      <div className="screen-header">
        <Text as="h1" size={700} weight="bold">{application.va_name}</Text>
        <div className="mobile-stack" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge status={application.va_status ?? 'Draft'} />
          <Badge color={application.va_aiAutoApprovalEligible ? 'success' : 'warning'} appearance="filled">
            AI: {formatPercent(application.va_aiValidationScore)}
          </Badge>
        </div>
      </div>

      {/* AI Summary */}
      {application.va_aiValidationSummary && (
        <Card>
          <Text weight="semibold" size={400}>AI Validation Summary</Text>
          <Text as="p" size={300} style={{ marginTop: tokens.spacingVerticalS }}>{application.va_aiValidationSummary}</Text>
          {application.va_aiFlaggedIssues && (
            <MessageBar intent="warning" style={{ marginTop: tokens.spacingVerticalS }}>
              {application.va_aiFlaggedIssues}
            </MessageBar>
          )}
        </Card>
      )}

      {/* Applicant + Vehicle */}
      <div className="card-grid">
        <Card>
          <Text weight="semibold" size={400}>Applicant</Text>
          <div style={{ marginTop: tokens.spacingVerticalS }}>
            <Text size={200}>Personnel #: {application.va_personnelnumber}</Text><br />
            <Text size={200}>Company: {application.va_companyEntityName}</Text><br />
            <Text size={200}>Type: {application.va_applicationType}</Text><br />
            <Text size={200}>Submitted: {formatDate(application.va_submittedOn)}</Text>
          </div>
        </Card>
        <Card>
          <Text weight="semibold" size={400}>Vehicle</Text>
          <div style={{ marginTop: tokens.spacingVerticalS }}>
            <Text size={200}>{vehicle?.va_year} {vehicle?.va_make} {vehicle?.va_model}</Text><br />
            <Text size={200}>VIN: {vehicle?.va_vin}</Text><br />
            <Text size={200}>MSRP: {formatCurrency(vehicle?.va_msrpTotal)}</Text><br />
            <Text size={200}>Electric: {vehicle?.va_isElectric ? 'Yes' : 'No'}</Text>
          </div>
        </Card>
      </div>

      {/* Allowance */}
      <Card>
        <Text weight="semibold" size={400}>Allowance Details</Text>
        <div className="form-grid" style={{ marginTop: tokens.spacingVerticalS }}>
          <div><Text size={200}>Level</Text><Text as="p" size={300}>{application.va_allowanceLevel}</Text></div>
          <div><Text size={200}>Monthly</Text><Text as="p" size={300}>{formatCurrency(application.va_monthlyAllowanceAmount)}</Text></div>
          <div><Text size={200}>EV Charging</Text><Text as="p" size={300}>{formatCurrency(application.va_evChargingAllowance)}</Text></div>
          <div><Text size={200}>Total</Text><Text as="p" size={300} weight="semibold">{formatCurrency(application.va_totalMonthlyAllowance)}</Text></div>
        </div>
      </Card>

      {/* Insurance */}
      <Card>
        <Text weight="semibold" size={400}>Insurance Policies</Text>
        {policies.map(p => (
          <div key={p.va_insurancepolicyid} style={{ marginTop: tokens.spacingVerticalS, paddingTop: tokens.spacingVerticalS, borderTop: `1px solid ${tokens.colorNeutralStroke2}` }}>
            <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text weight="semibold" size={300}>{p.va_policyType}: {p.va_carrierName}</Text>
              <Badge color={p.va_meetsLiabilityRequirement ? 'success' : 'danger'} appearance="outline" size="small">
                {p.va_meetsLiabilityRequirement ? 'Meets requirements' : 'Does not meet requirements'}
              </Badge>
            </div>
            <Text size={200}>Policy #{p.va_policyNumber} | Expires {formatDate(p.va_expirationDate)}</Text><br />
            <Text size={200}>CSL: {formatCurrency(p.va_coverageLimitCSL)} | Umbrella: {formatCurrency(p.va_umbrellaLimit)}</Text>
          </div>
        ))}
      </Card>

      {/* Documents with AI extraction */}
      <Card>
        <Text weight="semibold" size={400}>Documents</Text>
        {documents.map(d => (
          <div key={d.va_documentid} style={{ marginTop: tokens.spacingVerticalM }}>
            <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacingVerticalXS }}>
              <Text size={300}>{d.va_documentType}</Text>
              <StatusBadge status={d.va_aiProcessingStatus ?? 'Pending'} />
            </div>
            {d.va_aiExtractedData && (
              <AIExtractionDisplay
                type={d.va_documentType === 'Window Sticker' ? 'windowSticker' : 'insurance'}
                data={d.va_aiExtractedData}
                confidence={d.va_aiConfidenceScore}
              />
            )}
          </div>
        ))}
      </Card>

      <div className="action-bar">
        <Button appearance="secondary" onClick={() => navigate('/review')}>Back to Queue</Button>
        <Button appearance="primary" onClick={() => navigate(`/review/${applicationId}/decide`)}>
          Make Decision
        </Button>
      </div>
    </div>
  )
}
