import { useState, useEffect, useCallback } from 'react'
import { useConnectorContext } from '@microsoft/power-apps'
import type {
  AllowanceApplication,
  Vehicle,
  InsurancePolicy,
  DocumentChecklist,
  VADocument,
} from '@/types'
import { ApplicationStatus } from '@/types'

/**
 * Fetches and manages the current user's open AllowanceApplication.
 *
 * "Open" means any application that is not in a terminal state
 * (Active, Rejected, Withdrawn, Terminated).
 *
 * After `pac code add-data-source` generates the service files, replace the
 * connector-based calls below with direct service class calls, e.g.:
 *   import { Va_AllowanceApplicationService } from '@/generated/services/...'
 */

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
  checklist: DocumentChecklist[]
  documents: VADocument[]
}

interface UseCurrentApplicationResult extends ApplicationBundle {
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCurrentApplication(): UseCurrentApplicationResult {
  const { connectors } = useConnectorContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bundle, setBundle] = useState<ApplicationBundle>({
    application: null,
    vehicle: null,
    policies: [],
    checklist: [],
    documents: [],
  })

  const fetchApplication = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Query for open applications owned by the current user
      // Filter excludes terminal statuses
      const terminalFilter = TERMINAL_STATUSES.map(
        s => `va_status ne '${s}'`,
      ).join(' and ')

      const appsResult = await connectors.dataverse.retrieveMultipleRecords(
        'va_allowanceapplications',
        `?$filter=${terminalFilter}&$orderby=createdon desc&$top=1`,
      )

      const application: AllowanceApplication | null =
        appsResult.entities?.[0] ?? null

      if (!application?.va_allowanceapplicationid) {
        setBundle({ application: null, vehicle: null, policies: [], checklist: [], documents: [] })
        return
      }

      const appId = application.va_allowanceapplicationid

      // Fetch related records in parallel
      const [vehicleResult, policyResult, checklistResult, documentResult] =
        await Promise.all([
          connectors.dataverse.retrieveMultipleRecords(
            'va_vehicles',
            `?$filter=_va_applicationid_value eq '${appId}'&$top=1`,
          ),
          connectors.dataverse.retrieveMultipleRecords(
            'va_insurancepolicies',
            `?$filter=_va_applicationid_value eq '${appId}'`,
          ),
          connectors.dataverse.retrieveMultipleRecords(
            'va_documentchecklists',
            `?$filter=_va_applicationid_value eq '${appId}'&$orderby=va_name`,
          ),
          connectors.dataverse.retrieveMultipleRecords(
            'va_documents',
            `?$filter=_va_applicationid_value eq '${appId}'&$orderby=createdon desc`,
          ),
        ])

      setBundle({
        application,
        vehicle: vehicleResult.entities?.[0] ?? null,
        policies: policyResult.entities ?? [],
        checklist: checklistResult.entities ?? [],
        documents: documentResult.entities ?? [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application data')
    } finally {
      setLoading(false)
    }
  }, [connectors])

  useEffect(() => {
    void fetchApplication()
  }, [fetchApplication])

  return { ...bundle, loading, error, refetch: fetchApplication }
}
