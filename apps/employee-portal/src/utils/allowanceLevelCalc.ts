import { AllowanceLevel, type AllowanceLevelConfig } from '@/types'

/**
 * Returns the allowance levels that a vehicle's MSRP qualifies for,
 * filtered against what the employee's job title allows.
 */
export function getEligibleLevels(
  vehicleMsrp: number,
  availableLevels: AllowanceLevelConfig[],
  titleDefaultLevel?: AllowanceLevel,
): AllowanceLevelConfig[] {
  // Only current rates
  const currentRates = availableLevels.filter(l => l.va_isCurrentRate)

  // Filter to levels where vehicle MSRP meets the minimum
  const qualifying = currentRates.filter(
    l => vehicleMsrp >= (l.va_minimumMsrp ?? 0),
  )

  if (!titleDefaultLevel) return qualifying

  // If title has a default level, employee can only select up to that level
  const levelOrder: AllowanceLevel[] = [
    AllowanceLevel.A,
    AllowanceLevel.B,
    AllowanceLevel.C,
    AllowanceLevel.D,
  ]
  const maxLevelIndex = levelOrder.indexOf(titleDefaultLevel)

  return qualifying.filter(l => {
    const idx = levelOrder.indexOf(l.va_level!)
    return idx >= 0 && idx >= maxLevelIndex // D is most restricted (highest index)
  })
}

/**
 * Returns the best (highest allowance) level a vehicle qualifies for.
 */
export function getBestLevel(
  vehicleMsrp: number,
  availableLevels: AllowanceLevelConfig[],
  titleDefaultLevel?: AllowanceLevel,
): AllowanceLevelConfig | undefined {
  const eligible = getEligibleLevels(vehicleMsrp, availableLevels, titleDefaultLevel)
  if (eligible.length === 0) return undefined

  // Sort by monthly allowance descending, return highest
  return eligible.sort(
    (a, b) => (b.va_monthlyAllowance ?? 0) - (a.va_monthlyAllowance ?? 0),
  )[0]
}

/**
 * Formats a dollar amount as USD currency string.
 */
export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Returns the minimum MSRP required for a given level from the config.
 */
export function minimumMsrpForLevel(
  level: AllowanceLevel,
  configs: AllowanceLevelConfig[],
): number | undefined {
  return configs.find(c => c.va_level === level && c.va_isCurrentRate)
    ?.va_minimumMsrp
}

/**
 * Validates that a vehicle's model year meets the 5-year requirement.
 * A vehicle is eligible if: currentYear - modelYear <= 5
 */
export function meetsYearRequirement(modelYear: number): boolean {
  const currentYear = new Date().getFullYear()
  return currentYear - modelYear <= 5
}

/** Returns the oldest eligible model year (current year minus 5). */
export function oldestEligibleYear(): number {
  return new Date().getFullYear() - 5
}
