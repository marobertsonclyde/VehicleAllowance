/**
 * UAT Banner
 *
 * Persistent banner rendered above the app shell. Lets testers:
 *  - See they are in UAT mode
 *  - Switch the active role (Employee / Equipment Leader / Director / Admin / Payroll)
 *  - Reset all UAT data back to the default seed state
 */

import { useState, useEffect } from 'react'
import { Select, Button, Text, Badge, tokens } from '@fluentui/react-components'
import { ArrowCounterclockwise20Regular } from '@fluentui/react-icons'
import { mockStore, ROLE_USERS } from '../mock-power-apps/MockStore'
import { UserRole } from '@/types'

const ALL_ROLES: UserRole[] = [
  UserRole.Employee,
  UserRole.EquipmentLeader,
  UserRole.Director,
  UserRole.Admin,
  UserRole.Payroll,
]

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Employee]:        'Employee',
  [UserRole.EquipmentLeader]: 'Equipment Leader',
  [UserRole.Director]:        'Director',
  [UserRole.Admin]:           'Admin',
  [UserRole.Payroll]:         'Payroll',
}

export function UATBanner() {
  const [role, setRole] = useState<UserRole>(mockStore.getRole())

  useEffect(() => {
    return mockStore.subscribe(() => setRole(mockStore.getRole()))
  }, [])

  function handleRoleChange(newRole: UserRole) {
    mockStore.setRole(newRole)
    // Navigate to root after role switch so the correct home screen renders
    window.location.hash = '/'
  }

  function handleReset() {
    if (confirm('Reset all UAT data to defaults? This will clear any applications or changes you made during this session.')) {
      mockStore.reset()
      window.location.hash = '/'
      window.location.reload()
    }
  }

  const displayName = ROLE_USERS[role].displayName

  return (
    <div
      role="banner"
      aria-label="UAT Mode controls"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalM,
        padding: `6px ${tokens.spacingHorizontalXXL}`,
        backgroundColor: '#1a1a2e',
        color: '#e0e0e0',
        fontSize: '12px',
        borderBottom: '2px solid #e94560',
      }}
    >
      <Badge appearance="filled" color="danger" size="small">UAT MODE</Badge>

      <Text size={200} style={{ color: '#a0a0b0' }}>
        Signed in as <strong style={{ color: '#ffffff' }}>{displayName}</strong>
      </Text>

      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
        <Text size={200} style={{ color: '#a0a0b0' }}>Role:</Text>
        <Select
          size="small"
          value={role}
          onChange={(_e, d) => handleRoleChange(d.value as UserRole)}
          style={{ minWidth: 160 }}
        >
          {ALL_ROLES.map(r => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
        </Select>
      </div>

      <Button
        size="small"
        appearance="subtle"
        icon={<ArrowCounterclockwise20Regular />}
        onClick={handleReset}
        style={{ color: '#e0e0e0', marginLeft: 'auto' }}
      >
        Reset UAT Data
      </Button>
    </div>
  )
}
