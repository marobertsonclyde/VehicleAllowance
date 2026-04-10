import { useState, useEffect } from 'react'
import { useConnectorContext, useAuthContext } from '@microsoft/power-apps'
import { UserRole } from '@/types'

const ROLE_MAP: Record<string, UserRole> = {
  va_administrator: UserRole.Admin,
  va_director: UserRole.Director,
  va_equipmentleader: UserRole.EquipmentLeader,
  va_payroll: UserRole.Payroll,
  va_employee: UserRole.Employee,
}

// Priority order: highest-privilege role wins if user has multiple
const ROLE_PRIORITY: UserRole[] = [
  UserRole.Admin,
  UserRole.Director,
  UserRole.EquipmentLeader,
  UserRole.Payroll,
  UserRole.Employee,
]

interface UseUserRoleResult {
  role: UserRole
  allRoles: UserRole[]
  loading: boolean
  error: string | null
}

export function useUserRole(): UseUserRoleResult {
  const { connectors } = useConnectorContext()
  const { userId } = useAuthContext()
  const [allRoles, setAllRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoles() {
      try {
        const result = await connectors.dataverse.retrieveMultipleRecords(
          'systemuserroles_association',
          `?$filter=systemuserid eq '${userId}'&$select=roleid&$expand=roleid($select=name)`,
        )

        const matched: UserRole[] = []
        for (const entity of result.entities) {
          const roleName = (entity['roleid.name'] as string ?? '').toLowerCase().replace(/\s+/g, '')
          for (const [key, value] of Object.entries(ROLE_MAP)) {
            if (roleName.includes(key.replace('va_', ''))) {
              matched.push(value)
            }
          }
        }

        setAllRoles(matched.length > 0 ? matched : [UserRole.Employee])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user roles')
        setAllRoles([UserRole.Employee])
      } finally {
        setLoading(false)
      }
    }

    void fetchRoles()
  }, [connectors, userId])

  const role = ROLE_PRIORITY.find(r => allRoles.includes(r)) ?? UserRole.Employee

  return { role, allRoles, loading, error }
}

/** Returns true if the role can access admin config screens */
export function canAccessAdmin(role: UserRole): boolean {
  return role === UserRole.Admin || role === UserRole.Director
}

/** Returns true if the role can access reviewer screens */
export function canAccessReview(role: UserRole): boolean {
  return role === UserRole.EquipmentLeader || role === UserRole.Director || role === UserRole.Admin
}
