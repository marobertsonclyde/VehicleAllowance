/**
 * UAT Banner
 *
 * Persistent banner above the app shell. Lets testers:
 *  - See they are in UAT mode
 *  - Switch the active role (Employee / Equipment Leader / Director / Admin / Payroll)
 *  - When role = Employee, switch between pre-seeded employee personas
 *  - Reset all UAT data back to the default seed state
 */

import { useState, useEffect } from 'react'
import { Select, Button, Text, Badge, tokens } from '@fluentui/react-components'
import { ArrowCounterclockwise20Regular } from '@fluentui/react-icons'
import { mockStore, ROLE_USERS, EMPLOYEE_PERSONAS } from '../mock-power-apps/MockStore'
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

function navigateHome() {
  window.location.hash = '/'
}

export function UATBanner() {
  const [role, setRole]           = useState<UserRole>(mockStore.getRole())
  const [personaKey, setPersonaKey] = useState<string>(mockStore.getPersonaKey())

  useEffect(() => {
    return mockStore.subscribe(() => {
      setRole(mockStore.getRole())
      setPersonaKey(mockStore.getPersonaKey())
    })
  }, [])

  function handleRoleChange(newRole: UserRole) {
    mockStore.setRole(newRole)
    navigateHome()
  }

  function handlePersonaChange(key: string) {
    mockStore.setPersona(key)
    navigateHome()
  }

  function handleReset() {
    if (confirm('Reset all UAT data to defaults? Any applications or changes made this session will be lost.')) {
      mockStore.reset()
      navigateHome()
      window.location.reload()
    }
  }

  const displayName = ROLE_USERS[role]
    ? (role === UserRole.Employee
        ? (EMPLOYEE_PERSONAS.find(p => p.key === personaKey)?.displayName ?? ROLE_USERS[role].displayName)
        : ROLE_USERS[role].displayName)
    : ''

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

      {/* Role selector */}
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

      {/* Employee persona selector — only shown when role = Employee */}
      {role === UserRole.Employee && (
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
          <Text size={200} style={{ color: '#a0a0b0' }}>Persona:</Text>
          <Select
            size="small"
            value={personaKey}
            onChange={(_e, d) => handlePersonaChange(d.value)}
            style={{ minWidth: 280 }}
          >
            {EMPLOYEE_PERSONAS.map(p => (
              <option key={p.key} value={p.key}>
                {p.displayName} — {p.description}
              </option>
            ))}
          </Select>
        </div>
      )}

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
