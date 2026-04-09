import { useCallback } from 'react'
import { useConnectorContext } from '@microsoft/power-apps'
import type { EligibilityCheckResult } from '@/types'

/**
 * Provides typed wrappers for calling Power Automate flows.
 *
 * Each flow is triggered via HTTP POST to its unique trigger URL.
 * Flow URLs are stored in environment variables on the Power Platform side
 * and surfaced here via the connector context.
 *
 * Note: After adding the Power Automate connector via
 *   `pac code add-data-source -a "PowerAutomate" -c <connectionId>`
 * the generated connector service provides typed methods.
 * Until then, calls are made via the raw connectors.powerAutomate API.
 */

export function useFlowActions() {
  const { connectors } = useConnectorContext()

  /**
   * Checks whether the current user is eligible for the vehicle allowance,
   * and retrieves their PersonnelNumber, job title, and company from Dynamics
   * via the Fabric SQL endpoint (done server-side in the flow).
   */
  const checkEligibility = useCallback(async (): Promise<EligibilityCheckResult> => {
    const result = await connectors.powerAutomate.runFlow(
      'va_CheckEmployeeEligibility',
      {},
    )
    return result as EligibilityCheckResult
  }, [connectors])

  /**
   * Submits a draft application for processing.
   * Triggers Flow 1 (Application Submission Orchestrator) in Power Automate.
   */
  const submitApplication = useCallback(async (applicationId: string): Promise<void> => {
    await connectors.powerAutomate.runFlow(
      'va_SubmitApplication',
      { applicationId },
    )
  }, [connectors])

  /**
   * Triggers AI reprocessing of a specific document.
   * Useful when the employee re-uploads a rejected document.
   */
  const reprocessDocument = useCallback(async (documentId: string): Promise<void> => {
    await connectors.powerAutomate.runFlow(
      'va_ReprocessDocument',
      { documentId },
    )
  }, [connectors])

  /**
   * Submits an opt-out request.
   * Creates the opt-out record and notifies the Equipment Leader.
   */
  const submitOptOut = useCallback(async (
    allowanceRecordId: string,
    requestedDate: string,
  ): Promise<void> => {
    await connectors.powerAutomate.runFlow(
      'va_SubmitOptOut',
      { allowanceRecordId, requestedDate },
    )
  }, [connectors])

  /**
   * Queries the AllowanceLevelConfig table and returns levels that match
   * the given vehicle MSRP. Used by the Copilot agent calculator topic
   * and the AllowanceLevel screen.
   */
  const getAllowanceLevelsForMsrp = useCallback(async (
    vehicleMsrp: number,
  ) => {
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
