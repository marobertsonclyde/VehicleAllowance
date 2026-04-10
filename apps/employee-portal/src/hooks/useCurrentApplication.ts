import { useState, useEffect, useCallback } from 'react'
import { useConnectorContext, useAuthContext } from '@microsoft/power-apps'
import { useApplicationDetail } from './useApplicationDetail'
import { getErrorMessage } from '@/utils/formatters'
import type { AllowanceApplication } from '@/types'
import { ApplicationStatus } from '@/types'

const TERMINAL_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.Active,
  ApplicationStatus.Rejected,
  ApplicationStatus.Withdrawn,
  ApplicationStatus.Terminated,
]

export function useCurrentApplication() {
  const { connectors } = useConnectorContext()
  const { userId } = useAuthContext()
  const [resolvedAppId, setResolvedAppId] = useState<string | null>(null)
  const [resolving, setResolving] = useState(true)
  const [resolveError, setResolveError] = useState<string | null>(null)

  const resolveApplicationId = useCallback(async () => {
    setResolving(true)
    setResolveError(null)
    try {
      const terminalFilter = TERMINAL_STATUSES.map(
        s => `va_status ne '${s}'`,
      ).join(' and ')

      const appsResult = await connectors.dataverse.retrieveMultipleRecords(
        'va_allowanceapplications',
        `?$filter=_va_applicantid_value eq '${userId}' and ${terminalFilter}&$orderby=createdon desc&$top=1`,
      )

      const application = (appsResult.entities?.[0] as AllowanceApplication | undefined) ?? null
      setResolvedAppId(application?.va_allowanceapplicationid ?? null)
    } catch (err) {
      setResolveError(getErrorMessage(err, 'Failed to load application data'))
    } finally {
      setResolving(false)
    }
  }, [connectors, userId])

  useEffect(() => {
    void resolveApplicationId()
  }, [resolveApplicationId])

  const detail = useApplicationDetail(resolvedAppId)

  return {
    ...detail,
    loading: resolving || detail.loading,
    error: resolveError ?? detail.error,
    refetch: async () => {
      await resolveApplicationId()
      await detail.refetch()
    },
  }
}
