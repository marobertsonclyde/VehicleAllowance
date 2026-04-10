import { useNavigate } from 'react-router-dom'
import { Card, Text, CompoundButton, tokens } from '@fluentui/react-components'
import {
  DocumentBulletList24Regular,
  Money24Regular,
  Settings24Regular,
  ClipboardTextLtr24Regular,
  PersonCircle24Regular,
  CalendarClock24Regular,
} from '@fluentui/react-icons'

export function AdminDashboard() {
  const navigate = useNavigate()

  const cards = [
    { icon: <DocumentBulletList24Regular />, label: 'All Applications', desc: 'View and filter all applications', path: '/admin/applications' },
    { icon: <Money24Regular />, label: 'Active Allowances', desc: 'Manage allowance records and expiring insurance', path: '/admin/allowances' },
    { icon: <Settings24Regular />, label: 'Allowance Levels', desc: 'Configure MSRP thresholds and monthly rates', path: '/admin/config/levels' },
    { icon: <CalendarClock24Regular />, label: 'Reminder Config', desc: 'Set insurance expiry reminder intervals', path: '/admin/config/reminders' },
    { icon: <PersonCircle24Regular />, label: 'Company Entities', desc: 'Manage endorsement companies and addresses', path: '/admin/config/companies' },
    { icon: <ClipboardTextLtr24Regular />, label: 'Audit Log', desc: 'View system activity history', path: '/admin/audit' },
  ]

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Administration</Text>
      <div className="card-grid">
        {cards.map(card => (
          <Card key={card.path}>
            <CompoundButton
              icon={card.icon}
              secondaryContent={card.desc}
              onClick={() => navigate(card.path)}
              appearance="transparent"
              style={{ width: '100%', justifyContent: 'flex-start', padding: tokens.spacingVerticalS }}
            >
              {card.label}
            </CompoundButton>
          </Card>
        ))}
      </div>
    </div>
  )
}
