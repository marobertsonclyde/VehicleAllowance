import { describe, it, expect } from 'vitest'
import { validateVin, validateMsrp, validateVehicleYear, isAcceptedFileType, isWithinSizeLimit } from '@/utils/validation'

describe('validateVin', () => {
  it('passes for valid 17-char VIN', () => {
    expect(validateVin('1FTEW1EP0KFA00001').passes).toBe(true)
  })

  it('fails for wrong length', () => {
    expect(validateVin('1234').passes).toBe(false)
  })

  it('fails for I, O, Q characters', () => {
    expect(validateVin('1FTEW1EP0KFA0000I').passes).toBe(false)
    expect(validateVin('1FTEW1EP0KFA0000O').passes).toBe(false)
    expect(validateVin('1FTEW1EP0KFA0000Q').passes).toBe(false)
  })
})

describe('validateMsrp', () => {
  it('passes for valid MSRP', () => {
    expect(validateMsrp(55000).passes).toBe(true)
  })

  it('fails for zero', () => {
    expect(validateMsrp(0).passes).toBe(false)
  })

  it('fails for over $200K', () => {
    expect(validateMsrp(250000).passes).toBe(false)
  })
})

describe('validateVehicleYear', () => {
  it('passes for current year', () => {
    const currentYear = new Date().getFullYear()
    expect(validateVehicleYear(currentYear).passes).toBe(true)
  })

  it('fails for very old year', () => {
    expect(validateVehicleYear(2010).passes).toBe(false)
  })
})

describe('isAcceptedFileType', () => {
  it('accepts PDF', () => {
    expect(isAcceptedFileType(new File([], 'test.pdf', { type: 'application/pdf' }))).toBe(true)
  })

  it('rejects text file', () => {
    expect(isAcceptedFileType(new File([], 'test.txt', { type: 'text/plain' }))).toBe(false)
  })
})

describe('isWithinSizeLimit', () => {
  it('accepts small file', () => {
    expect(isWithinSizeLimit(new File(['a'], 'test.pdf'))).toBe(true)
  })
})
