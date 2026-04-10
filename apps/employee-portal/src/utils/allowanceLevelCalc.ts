import type { AllowanceLevelConfig } from '@/types'
import { AllowanceLevel } from '@/types'

/**
 * Given a vehicle MSRP and the current level configurations,
 * returns the highest eligible level and its monthly amounts.
 */
export function determineAllowanceLevel(
  msrp: number,
  configs: AllowanceLevelConfig[],
): AllowanceLevelConfig | null {
  const currentConfigs = configs
    .filter(c => c.va_isCurrentRate)
    .sort((a, b) => (b.va_minimumMsrp ?? 0) - (a.va_minimumMsrp ?? 0))

  for (const config of currentConfigs) {
    if (msrp >= (config.va_minimumMsrp ?? 0)) {
      return config
    }
  }
  return null
}

/**
 * Calculates total monthly allowance including EV charging supplement.
 */
export function calculateTotalMonthly(
  baseAllowance: number,
  isElectric: boolean,
  evChargingAmount: number,
): number {
  return baseAllowance + (isElectric ? evChargingAmount : 0)
}

/**
 * Returns a human-readable label for the allowance level.
 */
export function levelLabel(level: AllowanceLevel): string {
  const labels: Record<AllowanceLevel, string> = {
    [AllowanceLevel.A]: 'Level A',
    [AllowanceLevel.B]: 'Level B',
    [AllowanceLevel.C]: 'Level C',
    [AllowanceLevel.D]: 'Level D',
  }
  return labels[level]
}
