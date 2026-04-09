import { useState, useEffect, useCallback } from 'react'
import { useConnectorContext } from '@microsoft/power-apps'
import type { AllowanceRecord, InsurancePolicy } from '@/types'
import { AllowanceRecordStatus } from '@/types'

interface UseAllowanceRecordResult {
  record: AllowanceRecord | null
  activePolicies: InsurancePolicy[]
  expiringPolicies: InsurancePolicy[]   // Policies expiring within 45 days
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const EXPIRY_WARNING_DAYS = 45

export function useAllowanceRecord(): UseAllowanceRecordResult {
  const { connectors } = useConnectorContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [record, setRecord] = useState<AllowanceRecord | null>(null)
  const [activePolicies, setActivePolicies] = useState<InsurancePolicy[]>([])

  const fetchRecord = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await connectors.dataverse.retrieveMultipleRecords(
        'va_allowancerecords',
        `?$filter=va_status eq '${AllowanceRecordStatus.Active}'&$top=1`,
      )

      const activeRecord: AllowanceRecord | null = result.entities?.[0] ?? null
      setRecord(activeRecord)

      if (!activeRecord?.va_allowancerecordid) {
        setActivePolicies([])
        return
      }

      // Fetch policies linked to the application on this record
      const policyResult = await connectors.dataverse.retrieveMultipleRecords(
        'va_insurancepolicies',
        `?$filter=_va_applicationid_value eq '${activeRecord.va_originalApplicationId}' and va_status eq 'Active'`,
      )
      setActivePolicies(policyResult.entities ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allowance record')
    } finally {
      setLoading(false)
    }
  }, [connectors])

  useEffect(() => {
    void fetchRecord()
  }, [fetchRecord])

  const warningThreshold = new Date()
  warningThreshold.setDate(warningThreshold.getDate() + EXPIRY_WARNING_DAYS)

  const expiringPolicies = activePolicies.filter(p => {
    if (!p.va_expirationDate) return false
    return new Date(p.va_expirationDate) <= warningThreshold
  })

  return { record, activePolicies, expiringPolicies, loading, error, refetch: fetchRecord }
}
