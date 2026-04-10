import { useState, useEffect, useCallback } from 'react'
import { useConnectorContext } from '@microsoft/power-apps'
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
      setError(err instanceof Error ? err.message : 'Failed to load review queue')
    } finally {
      setLoading(false)
    }
  }, [connectors])

  useEffect(() => {
    void fetchQueue()
  }, [fetchQueue])

  const pending = applications.filter(
    a => a.va_status === ApplicationStatus.EquipmentLeaderReview || a.va_status === ApplicationStatus.DirectorReview,
  )
  const flagged = applications.filter(a => a.va_aiAutoApprovalEligible === false)

  return { pending, flagged, all: applications, loading, error, refetch: fetchQueue }
}
