import { useState, useEffect, useCallback } from 'react'
import { useConnectorContext, useAuthContext } from '@microsoft/power-apps'
import type { AllowanceApplication, Vehicle, InsurancePolicy, VADocument } from '@/types'
import { ApplicationStatus } from '@/types'

const TERMINAL_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.Active,
  ApplicationStatus.Rejected,
  ApplicationStatus.Withdrawn,
  ApplicationStatus.Terminated,
]

interface ApplicationBundle {
  application: AllowanceApplication | null
  vehicle: Vehicle | null
  policies: InsurancePolicy[]
  documents: VADocument[]
}

interface UseCurrentApplicationResult extends ApplicationBundle {
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCurrentApplication(): UseCurrentApplicationResult {
  const { connectors } = useConnectorContext()
  const { userId } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bundle, setBundle] = useState<ApplicationBundle>({
    application: null,
    vehicle: null,
    policies: [],
    documents: [],
  })

  const fetchApplication = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const terminalFilter = TERMINAL_STATUSES.map(
        s => `va_status ne '${s}'`,
      ).join(' and ')

      const appsResult = await connectors.dataverse.retrieveMultipleRecords(
        'va_allowanceapplications',
        `?$filter=_va_applicantid_value eq '${userId}' and ${terminalFilter}&$orderby=createdon desc&$top=1`,
      )

      const application = (appsResult.entities?.[0] as AllowanceApplication | undefined) ?? null

      if (!application?.va_allowanceapplicationid) {
        setBundle({ application: null, vehicle: null, policies: [], documents: [] })
        return
      }

      const appId = application.va_allowanceapplicationid

      const [vehicleResult, policyResult, documentResult] = await Promise.all([
        connectors.dataverse.retrieveMultipleRecords(
          'va_vehicles',
          `?$filter=_va_applicationid_value eq '${appId}'&$top=1`,
        ),
        connectors.dataverse.retrieveMultipleRecords(
          'va_insurancepolicies',
          `?$filter=_va_applicationid_value eq '${appId}'`,
        ),
        connectors.dataverse.retrieveMultipleRecords(
          'va_documents',
          `?$filter=_va_applicationid_value eq '${appId}'&$orderby=createdon desc`,
        ),
      ])

      setBundle({
        application,
        vehicle: (vehicleResult.entities?.[0] as Vehicle | undefined) ?? null,
        policies: (policyResult.entities as InsurancePolicy[]) ?? [],
        documents: (documentResult.entities as VADocument[]) ?? [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application data')
    } finally {
      setLoading(false)
    }
  }, [connectors, userId])

  useEffect(() => {
    void fetchApplication()
  }, [fetchApplication])

  return { ...bundle, loading, error, refetch: fetchApplication }
}
