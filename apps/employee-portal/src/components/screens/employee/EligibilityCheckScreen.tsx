import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Text, Spinner, MessageBar, tokens } from '@fluentui/react-components'
import { useFlowActions } from '@/hooks/useFlowActions'
import { useWizardDispatch } from '@/context/WizardContext'
import type { EligibilityCheckResult } from '@/types'

export function EligibilityCheckScreen() {
  const navigate = useNavigate()
  const { checkEligibility } = useFlowActions()
  const dispatch = useWizardDispatch()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EligibilityCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheck() {
    setLoading(true)
    setError(null)
    try {
      const eligibility = await checkEligibility()
      setResult(eligibility)
      if (eligibility.isEligible) {
        dispatch({ type: 'SET_ELIGIBILITY', payload: eligibility })
        dispatch({ type: 'SET_STEP', payload: 'vehicle' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eligibility check failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Eligibility Check</Text>
      <Text size={300}>
        We will verify your job title and company against the vehicle allowance program requirements.
      </Text>

      {!result && !loading && (
        <Card style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
          <Text as="p" size={400}>Ready to check your eligibility?</Text>
          <Button
            appearance="primary"
            size="large"
            onClick={() => void handleCheck()}
            style={{ marginTop: tokens.spacingVerticalL }}
          >
            Check My Eligibility
          </Button>
        </Card>
      )}

      {loading && <Spinner size="large" label="Checking eligibility..." />}

      {error && <MessageBar intent="error">{error}</MessageBar>}

      {result && result.isEligible && (
        <Card>
          <MessageBar intent="success">You are eligible for the Vehicle Allowance Program!</MessageBar>
          <div className="form-grid" style={{ marginTop: tokens.spacingVerticalM }}>
            <div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Job Title</Text>
              <Text as="p" size={300}>{result.jobTitle}</Text>
            </div>
            <div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Company</Text>
              <Text as="p" size={300}>{result.company}</Text>
            </div>
            <div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Default Level</Text>
              <Text as="p" size={300}>Level {result.defaultAllowanceLevel}</Text>
            </div>
            <div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Deadline to Apply</Text>
              <Text as="p" size={300}>{result.eligibilityDeadline ?? 'N/A'}</Text>
            </div>
          </div>
          <div className="action-bar">
            <Button appearance="primary" onClick={() => navigate('/apply/vehicle')}>
              Start Application
            </Button>
          </div>
        </Card>
      )}

      {result && !result.isEligible && (
        <Card>
          <MessageBar intent="warning">You are not currently eligible for the Vehicle Allowance Program.</MessageBar>
          <Text as="p" size={300} style={{ marginTop: tokens.spacingVerticalM }}>
            {result.ineligibilityReason ?? 'Your current role does not qualify for the program.'}
          </Text>
          <div className="action-bar">
            <Button appearance="secondary" onClick={() => navigate('/')}>Return Home</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
