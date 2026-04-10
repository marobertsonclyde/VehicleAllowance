import { useNavigate } from 'react-router-dom'
import { Card, Text, CompoundButton, tokens } from '@fluentui/react-components'
import { Money24Regular, DocumentBulletList24Regular } from '@fluentui/react-icons'

export function PayrollDashboard() {
  const navigate = useNavigate()

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Payroll</Text>
      <div className="card-grid">
        <Card>
          <CompoundButton
            icon={<Money24Regular />}
            secondaryContent="View active allowance records and payment details"
            onClick={() => navigate('/payroll/allowances')}
            appearance="transparent"
            style={{ width: '100%', justifyContent: 'flex-start', padding: tokens.spacingVerticalS }}
          >
            Active Allowances
          </CompoundButton>
        </Card>
        <Card>
          <CompoundButton
            icon={<DocumentBulletList24Regular />}
            secondaryContent="View recently approved applications pending payroll setup"
            onClick={() => navigate('/payroll/allowances')}
            appearance="transparent"
            style={{ width: '100%', justifyContent: 'flex-start', padding: tokens.spacingVerticalS }}
          >
            New Approvals
          </CompoundButton>
        </Card>
      </div>
    </div>
  )
}
