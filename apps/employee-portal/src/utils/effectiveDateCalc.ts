/**
 * Calculates the allowance effective date per policy section 3.1.3:
 * - If documents received on or before the 15th -> first day of current month
 * - If documents received on the 16th or later -> first day of next month
 */
export function calculateEffectiveDate(receivedOn: Date = new Date()): Date {
  const day = receivedOn.getDate()
  if (day <= 15) {
    return new Date(receivedOn.getFullYear(), receivedOn.getMonth(), 1)
  }
  return new Date(receivedOn.getFullYear(), receivedOn.getMonth() + 1, 1)
}

export function calculateEffectiveDateString(receivedOn: Date = new Date()): string {
  return calculateEffectiveDate(receivedOn).toISOString().split('T')[0]
}

export function effectiveDateDescription(receivedOn: Date = new Date()): string {
  const day = receivedOn.getDate()
  const effectiveDate = calculateEffectiveDate(receivedOn)
  const formatted = effectiveDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (day <= 15) {
    return `Since today is the ${day}${ordinal(day)}, your allowance will be backdated to ${formatted}.`
  }
  return `Since today is the ${day}${ordinal(day)}, your allowance will begin ${formatted}.`
}

/**
 * Returns the next August 1 renewal due date.
 * If today is before May 1 (>= 3 months before Aug 1), returns this year's Aug 1.
 * Otherwise returns next year's Aug 1.
 */
export function nextRenewalDueDate(from: Date = new Date()): Date {
  const thisYearAug1 = new Date(from.getFullYear(), 7, 1)
  const threeMonthsBefore = new Date(thisYearAug1)
  threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3)

  if (from <= threeMonthsBefore) {
    return thisYearAug1
  }
  return new Date(from.getFullYear() + 1, 7, 1)
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] ?? s[v] ?? s[0]
}

export function isInOptOutWindow(): boolean {
  const now = new Date()
  return now.getMonth() < 7
}

export function optOutEffectiveDate(requestedOn: Date = new Date()): Date {
  return new Date(requestedOn.getFullYear() + 1, 0, 1)
}
