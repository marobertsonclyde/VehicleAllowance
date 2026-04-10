import { useState, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Tab,
  TabList,
  Text,
  Button,
  OverlayDrawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  tokens,
} from '@fluentui/react-components'
import {
  VehicleCar24Regular,
  PersonCircle24Regular,
  Navigation24Regular,
  Dismiss24Regular,
} from '@fluentui/react-icons'
import { UserRole } from '@/types'
import { canAccessAdmin, canAccessReview, canAccessPayroll } from '@/hooks/useUserRole'
import { useIsMobile } from '@/hooks/useIsMobile'

interface AppShellProps {
  allRoles: UserRole[]
  children: ReactNode
}

interface NavItem {
  path: string
  label: string
}

function getNavItems(allRoles: UserRole[]): NavItem[] {
  const items: NavItem[] = [{ path: '/', label: 'Home' }]

  if (canAccessReview(allRoles)) {
    items.push({ path: '/review', label: 'Review Queue' })
  }

  if (canAccessAdmin(allRoles)) {
    items.push({ path: '/admin', label: 'Admin' })
  }

  if (canAccessPayroll(allRoles)) {
    items.push({ path: '/payroll', label: 'Payroll' })
  }

  return items
}

export function AppShell({ allRoles, children }: AppShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navItems = getNavItems(allRoles)

  const currentTab = navItems.find(item =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path),
  )?.path ?? '/'

  return (
    <div className="app-container">
      {isMobile ? (
        <>
          <header style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalS,
            padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
            borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
            backgroundColor: tokens.colorNeutralBackground1,
          }}>
            <Button
              icon={<Navigation24Regular />}
              appearance="subtle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            />
            <VehicleCar24Regular />
            <Text weight="semibold" size={400} style={{ flex: 1 }}>Vehicle Allowance</Text>
            <PersonCircle24Regular />
          </header>
          <OverlayDrawer
            position="start"
            open={drawerOpen}
            onOpenChange={(_e, data) => setDrawerOpen(data.open)}
          >
            <DrawerHeader>
              <DrawerHeaderTitle
                action={
                  <Button
                    appearance="subtle"
                    icon={<Dismiss24Regular />}
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close navigation"
                  />
                }
              >
                Navigation
              </DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
                {navItems.map(item => (
                  <Button
                    key={item.path}
                    appearance={currentTab === item.path ? 'subtle' : 'transparent'}
                    style={{
                      justifyContent: 'flex-start',
                      fontWeight: currentTab === item.path ? 600 : 400,
                    }}
                    onClick={() => { navigate(item.path); setDrawerOpen(false) }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
              <div style={{
                marginTop: 'auto',
                paddingTop: tokens.spacingVerticalL,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacingHorizontalS,
              }}>
                <PersonCircle24Regular />
                <Text size={200}>{allRoles.join(', ')}</Text>
              </div>
            </DrawerBody>
          </OverlayDrawer>
        </>
      ) : (
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
            <Text size={200}>{allRoles.join(', ')}</Text>
          </div>
        </header>
      )}
      <main className="app-content">
        {children}
      </main>
    </div>
  )
}
