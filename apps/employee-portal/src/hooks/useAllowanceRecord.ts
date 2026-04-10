import { useState, useEffect, useCallback } from 'react'
import { useConnectorContext, useAuthContext } from '@microsoft/power-apps'
import { getErrorMessage } from '@/utils/formatters'
import type { AllowanceRecord, InsurancePolicy } from '@/types'
import { AllowanceRecordStatus } from '@/types'

interface UseAllowanceRecordResult {
  record: AllowanceRecord | null
  policies: InsurancePolicy[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAllowanceRecord(): UseAllowanceRecordResult {
  const { connectors } = useConnectorContext()
  const { userId } = useAuthContext()
  const [record, setRecord] = useState<AllowanceRecord | null>(null)
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecord = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await connectors.dataverse.retrieveMultipleRecords(
        'va_allowancerecords',
        `?$filter=_va_employeeid_value eq '${userId}' and va_status eq '${AllowanceRecordStatus.Active}'&$orderby=createdon desc&$top=1`,
      )

      const activeRecord = (result.entities?.[0] as AllowanceRecord | undefined) ?? null
      setRecord(activeRecord)

      if (activeRecord?.va_allowancerecordid) {
        const policyResult = await connectors.dataverse.retrieveMultipleRecords(
          'va_insurancepolicies',
          `?$filter=_va_employeeid_value eq '${activeRecord.va_employeeId}'&$orderby=va_expirationdate desc`,
        )
        setPolicies((policyResult.entities as InsurancePolicy[]) ?? [])
      } else {
        setPolicies([])
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load allowance record'))
    } finally {
      setLoading(false)
    }
  }, [connectors, userId])

  useEffect(() => {
    void fetchRecord()
  }, [fetchRecord])

  return { record, policies, loading, error, refetch: fetchRecord }
}
