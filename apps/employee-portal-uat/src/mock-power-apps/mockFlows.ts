/**
 * Mock Power Automate flow runner
 *
 * Returns realistic responses for every flow the portal calls.
 * Status-changing flows (submit, opt-out, decisions) also mutate
 * the MockStore so the UI reflects the change immediately.
 */

import { mockStore } from './MockStore'
import {
  AllowanceLevel,
  ApplicationStatus,
  AIProcessingStatus,
  PayrollVerificationStatus,
} from '@/types'
import type { EligibilityCheckResult } from '@/types'

const delay = (ms = 800) => new Promise<void>(r => setTimeout(r, ms))

export function buildMockFlowRunner() {
  return {
    async runFlow(flowName: string, params: Record<string, unknown> = {}) {
      switch (flowName) {

        // ── Eligibility check ────────────────────────────────────────────────
        case 'va_CheckEmployeeEligibility': {
          await delay()
          const result: EligibilityCheckResult = {
            isEligible: true,
            personnelNumber: 'EMP-10042',
            jobTitle: 'Field Operations Manager',
            company: 'Clyde Companies Inc.',
            defaultAllowanceLevel: AllowanceLevel.B,
            eligibilityDeadline: new Date(Date.now() + 45 * 86400_000).toISOString().slice(0, 10),
          }
          return result
        }

        // ── Submit application ───────────────────────────────────────────────
        case 'va_SubmitApplication': {
          await delay(1200)
          const appId = params['applicationId'] as string
          if (appId) {
            mockStore.updateRecord('va_allowanceapplications', appId, {
              va_status: ApplicationStatus.Submitted,
              va_submittedOn: new Date().toISOString(),
            })
            // Simulate AI review starting after a beat
            setTimeout(() => {
              mockStore.updateRecord('va_allowanceapplications', appId, {
                va_status: ApplicationStatus.AIReview,
              })
              // Then move to EL review
              setTimeout(() => {
                mockStore.updateRecord('va_allowanceapplications', appId, {
                  va_status: ApplicationStatus.EquipmentLeaderReview,
                  va_aiValidationScore: 84,
                  va_aiAutoApprovalEligible: false,
                  va_aiValidationSummary: 'Documents extracted with good confidence. Vehicle details verified.',
                  va_aiFlaggedIssues: '',
                })
              }, 3000)
            }, 1500)
          }
          return {}
        }

        // ── Allowance levels for MSRP ────────────────────────────────────────
        case 'va_GetAllowanceLevelForMsrp': {
          await delay()
          const msrp = (params['vehicleMsrp'] as number) ?? 0
          const levels = mockStore.getTable('va_allowancelevelconfigs') as Array<{
            va_minimumMsrp?: number
            va_isCurrentRate?: boolean
            [key: string]: unknown
          }>
          const eligible = levels
            .filter(l => l.va_isCurrentRate && (l.va_minimumMsrp ?? 0) <= msrp)
            .sort((a, b) => (a.va_minimumMsrp ?? 0) - (b.va_minimumMsrp ?? 0))
          return eligible
        }

        // ── Reprocess document (AI) ──────────────────────────────────────────
        case 'va_ReprocessDocument': {
          const docId = params['documentId'] as string
          if (docId) {
            mockStore.updateRecord('va_documents', docId, {
              va_aiProcessingStatus: AIProcessingStatus.Processing,
            })
            await delay(2000)
            mockStore.updateRecord('va_documents', docId, {
              va_aiProcessingStatus: AIProcessingStatus.Completed,
              va_aiConfidenceScore: 0.88,
            })
          }
          return {}
        }

        // ── Opt-out ──────────────────────────────────────────────────────────
        case 'va_SubmitOptOut': {
          await delay()
          const recordId = params['allowanceRecordId'] as string
          if (recordId) {
            mockStore.updateRecord('va_allowancerecords', recordId, {
              va_optOutRequestedDate: new Date().toISOString(),
              va_optOutEffectiveDate: params['requestedDate'] as string,
            })
          }
          return {}
        }

        // ── Payroll verification ─────────────────────────────────────────────
        case 'va_VerifyPayrollEarnCode': {
          await delay(1500)
          const recordId = params['allowanceRecordId'] as string
          const record = mockStore.findById('va_allowancerecords', recordId) as {
            va_totalMonthlyAmount?: number
          } | undefined
          const expected = record?.va_totalMonthlyAmount ?? 0
          // Simulate a match for most records
          return {
            status: PayrollVerificationStatus.Verified,
            earnCode: 'VEHALLOW',
            payrollAmount: expected,
            expectedAmount: expected,
            amountMismatch: false,
            notes: 'Earn code verified against payroll system.',
          }
        }

        default:
          await delay(400)
          return {}
      }
    },
  }
}
