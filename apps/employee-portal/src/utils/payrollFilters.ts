import { PayrollVerificationStatus, type AllowanceRecord } from '@/types'

export function getUnverifiedRecords(records: AllowanceRecord[]): AllowanceRecord[] {
  return records.filter(r => !r.va_payrollVerificationStatus || r.va_payrollVerificationStatus === PayrollVerificationStatus.Pending)
}

export function getMismatchedRecords(records: AllowanceRecord[]): AllowanceRecord[] {
  return records.filter(r => r.va_payrollAmountMismatch)
}
