import { useState, useEffect, useCallback } from 'react'
import { useConnectorContext } from '@microsoft/power-apps'
import { getErrorMessage } from '@/utils/formatters'
import type { AllowanceApplication, Vehicle, InsurancePolicy, VADocument } from '@/types'

interface ApplicationBundle {
  application: AllowanceApplication | null
  vehicle: Vehicle | null
  policies: InsurancePolicy[]
  documents: VADocument[]
}

interface UseApplicationDetailResult extends ApplicationBundle {
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApplicationDetail(applicationId: string | null | undefined): UseApplicationDetailResult {
  const { connectors } = useConnectorContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bundle, setBundle] = useState<ApplicationBundle>({
    application: null,
    vehicle: null,
    policies: [],
    documents: [],
  })

  const fetchData = useCallback(async () => {
    if (!applicationId) {
      setBundle({ application: null, vehicle: null, policies: [], documents: [] })
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [appResult, vehicleResult, policyResult, docResult] = await Promise.all([
        connectors.dataverse.retrieveRecord('va_allowanceapplications', applicationId),
        connectors.dataverse.retrieveMultipleRecords(
          'va_vehicles',
          `?$filter=_va_applicationid_value eq '${applicationId}'&$top=1`,
        ),
        connectors.dataverse.retrieveMultipleRecords(
          'va_insurancepolicies',
          `?$filter=_va_applicationid_value eq '${applicationId}'`,
        ),
        connectors.dataverse.retrieveMultipleRecords(
          'va_documents',
          `?$filter=_va_applicationid_value eq '${applicationId}'&$orderby=createdon desc`,
        ),
      ])
      setBundle({
        application: appResult as unknown as AllowanceApplication,
        vehicle: (vehicleResult.entities?.[0] as Vehicle | undefined) ?? null,
        policies: (policyResult.entities as InsurancePolicy[]) ?? [],
        documents: (docResult.entities as VADocument[]) ?? [],
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load application'))
    } finally {
      setLoading(false)
    }
  }, [connectors, applicationId])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { ...bundle, loading, error, refetch: fetchData }
}
