import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Tab,
  TabList,
  Text,
  tokens,
} from '@fluentui/react-components'
import {
  VehicleCar24Regular,
  PersonCircle24Regular,
} from '@fluentui/react-icons'
import { UserRole } from '@/types'
import { canAccessAdmin, canAccessReview } from '@/hooks/useUserRole'

interface AppShellProps {
  role: UserRole
  children: ReactNode
}

interface NavItem {
  path: string
  label: string
}

function getNavItems(role: UserRole): NavItem[] {
  const items: NavItem[] = [{ path: '/', label: 'Home' }]

  if (canAccessReview(role)) {
    items.push({ path: '/review', label: 'Review Queue' })
  }

  if (canAccessAdmin(role)) {
    items.push({ path: '/admin', label: 'Admin' })
  }

  if (role === UserRole.Payroll) {
    items.push({ path: '/payroll', label: 'Payroll' })
  }

  return items
}

export function AppShell({ role, children }: AppShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = getNavItems(role)

  const currentTab = navItems.find(item =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path),
  )?.path ?? '/'

  return (
    <div className="app-container">
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalL,
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorNeutralBackground1,
      }}>
        <VehicleCar24Regular />
        <Text weight="semibold" size={500}>Vehicle Allowance</Text>
        <nav style={{ marginLeft: tokens.spacingHorizontalXL, flex: 1 }}>
          <TabList
            selectedValue={currentTab}
            onTabSelect={(_e, data) => navigate(data.value as string)}
            size="small"
          >
            {navItems.map(item => (
              <Tab key={item.path} value={item.path}>{item.label}</Tab>
            ))}
          </TabList>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
          <PersonCircle24Regular />
          <Text size={200}>{role}</Text>
        </div>
      </header>
      <main className="app-content">
        {children}
      </main>
    </div>
  )
}
