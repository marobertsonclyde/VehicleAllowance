import { useCallback } from 'react'
import { useConnectorContext } from '@microsoft/power-apps'
import type { EligibilityCheckResult } from '@/types'

export function useFlowActions() {
  const { connectors } = useConnectorContext()

  const checkEligibility = useCallback(async (): Promise<EligibilityCheckResult> => {
    const result = await connectors.powerAutomate.runFlow(
      'va_CheckEmployeeEligibility',
      {},
    )
    return result as EligibilityCheckResult
  }, [connectors])

  const submitApplication = useCallback(async (applicationId: string): Promise<void> => {
    await connectors.powerAutomate.runFlow(
      'va_SubmitApplication',
      { applicationId },
    )
  }, [connectors])

  const reprocessDocument = useCallback(async (documentId: string): Promise<void> => {
    await connectors.powerAutomate.runFlow(
      'va_ReprocessDocument',
      { documentId },
    )
  }, [connectors])

  const submitOptOut = useCallback(async (
    allowanceRecordId: string,
    requestedDate: string,
  ): Promise<void> => {
    await connectors.powerAutomate.runFlow(
      'va_SubmitOptOut',
      { allowanceRecordId, requestedDate },
    )
  }, [connectors])

  const getAllowanceLevelsForMsrp = useCallback(async (vehicleMsrp: number) => {
    const result = await connectors.powerAutomate.runFlow(
      'va_GetAllowanceLevelForMsrp',
      { vehicleMsrp },
    )
    return result
  }, [connectors])

  return {
    checkEligibility,
    submitApplication,
    reprocessDocument,
    submitOptOut,
    getAllowanceLevelsForMsrp,
  }
}
