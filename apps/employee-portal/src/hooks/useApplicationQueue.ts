import { useState, useEffect, useCallback } from 'react'
import { useConnectorContext } from '@microsoft/power-apps'
import { getErrorMessage } from '@/utils/formatters'
import type { AllowanceApplication } from '@/types'
import { ApplicationStatus } from '@/types'

interface UseApplicationQueueResult {
  pending: AllowanceApplication[]
  flagged: AllowanceApplication[]
  all: AllowanceApplication[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const REVIEW_STATUSES = [
  ApplicationStatus.EquipmentLeaderReview,
  ApplicationStatus.DirectorReview,
]

export function useApplicationQueue(): UseApplicationQueueResult {
  const { connectors } = useConnectorContext()
  const [applications, setApplications] = useState<AllowanceApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const reviewFilter = REVIEW_STATUSES.map(
        s => `va_status eq '${s}'`,
      ).join(' or ')

      const result = await connectors.dataverse.retrieveMultipleRecords(
        'va_allowanceapplications',
        `?$filter=(${reviewFilter})&$orderby=va_submittedon asc`,
      )

      setApplications((result.entities as AllowanceApplication[]) ?? [])
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load review queue'))
    } finally {
      setLoading(false)
    }
  }, [connectors])

  useEffect(() => {
    void fetchQueue()
  }, [fetchQueue])

  // API query already filters for review statuses, so `pending` is the full result set
  const flagged = applications.filter(a => a.va_aiAutoApprovalEligible === false)

  return { pending: applications, flagged, all: applications, loading, error, refetch: fetchQueue }
}
