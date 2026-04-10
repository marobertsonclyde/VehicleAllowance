import { describe, it, expect } from 'vitest'
import {
  calculateEffectiveDate,
  calculateEffectiveDateString,
  nextRenewalDueDate,
  isInOptOutWindow,
  optOutEffectiveDate,
} from '@/utils/effectiveDateCalc'

describe('calculateEffectiveDate', () => {
  it('returns 1st of current month when day <= 15', () => {
    const result = calculateEffectiveDate(new Date(2026, 3, 10)) // April 10
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(3) // April
    expect(result.getDate()).toBe(1)
  })

  it('returns 1st of next month when day >= 16', () => {
    const result = calculateEffectiveDate(new Date(2026, 3, 20)) // April 20
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(4) // May
    expect(result.getDate()).toBe(1)
  })

  it('returns 1st of current month on the 15th', () => {
    const result = calculateEffectiveDate(new Date(2026, 0, 15)) // Jan 15
    expect(result.getMonth()).toBe(0) // January
    expect(result.getDate()).toBe(1)
  })

  it('returns 1st of next month on the 16th', () => {
    const result = calculateEffectiveDate(new Date(2026, 0, 16)) // Jan 16
    expect(result.getMonth()).toBe(1) // February
    expect(result.getDate()).toBe(1)
  })

  it('handles December 16th correctly (rolls to January next year)', () => {
    const result = calculateEffectiveDate(new Date(2026, 11, 16)) // Dec 16
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(0) // January
  })
})

describe('calculateEffectiveDateString', () => {
  it('returns ISO date string', () => {
    const result = calculateEffectiveDateString(new Date(2026, 3, 10))
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('nextRenewalDueDate', () => {
  it('returns this year Aug 1 when before May 1', () => {
    const result = nextRenewalDueDate(new Date(2026, 2, 15)) // March 15
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(7) // August
    expect(result.getDate()).toBe(1)
  })

  it('returns next year Aug 1 when after May 1', () => {
    const result = nextRenewalDueDate(new Date(2026, 5, 1)) // June 1
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(7)
  })
})

describe('optOutEffectiveDate', () => {
  it('returns Jan 1 of following year', () => {
    const result = optOutEffectiveDate(new Date(2026, 5, 15))
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(0)
    expect(result.getDate()).toBe(1)
  })
})

describe('isInOptOutWindow', () => {
  it('returns a boolean', () => {
    expect(typeof isInOptOutWindow()).toBe('boolean')
  })
})
