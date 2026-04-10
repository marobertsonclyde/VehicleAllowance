import { MessageBar } from '@fluentui/react-components'
import type { AllowanceRecord } from '@/types'
import { getUnverifiedRecords, getMismatchedRecords } from '@/utils/payrollFilters'

export function PayrollWarnings({ records }: { records: AllowanceRecord[] }) {
  const unverified = getUnverifiedRecords(records)
  const mismatched = getMismatchedRecords(records)

  return (
    <>
      {unverified.length > 0 && (
        <MessageBar intent="warning">
          {unverified.length} record{unverified.length > 1 ? 's' : ''} not yet verified in payroll.
        </MessageBar>
      )}
      {mismatched.length > 0 && (
        <MessageBar intent="error">
          {mismatched.length} record{mismatched.length > 1 ? 's' : ''} with payroll amount mismatch.
        </MessageBar>
      )}
    </>
  )
}
