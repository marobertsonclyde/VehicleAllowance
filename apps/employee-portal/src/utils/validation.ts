import type { ValidationResult } from '@/types'

/**
 * Validates a 17-character VIN (Vehicle Identification Number).
 */
export function validateVin(vin: string): ValidationResult {
  const cleaned = vin.trim().toUpperCase()
  if (cleaned.length !== 17) {
    return { field: 'vin', passes: false, message: 'VIN must be exactly 17 characters' }
  }
  if (/[IOQ]/.test(cleaned)) {
    return { field: 'vin', passes: false, message: 'VIN cannot contain I, O, or Q' }
  }
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned)) {
    return { field: 'vin', passes: false, message: 'VIN contains invalid characters' }
  }
  return { field: 'vin', passes: true, message: 'Valid VIN' }
}

/**
 * Validates that MSRP is a positive number within the expected range.
 */
export function validateMsrp(msrp: number): ValidationResult {
  if (msrp <= 0) {
    return { field: 'msrp', passes: false, message: 'MSRP must be greater than zero' }
  }
  if (msrp > 200000) {
    return { field: 'msrp', passes: false, message: 'MSRP exceeds maximum ($200,000)' }
  }
  return { field: 'msrp', passes: true, message: 'Valid MSRP' }
}

/**
 * Validates that a vehicle year meets the program requirement
 * (must be current year or newer; program may allow current-1).
 */
export function validateVehicleYear(year: number): ValidationResult {
  const currentYear = new Date().getFullYear()
  if (year < currentYear - 1) {
    return { field: 'year', passes: false, message: `Vehicle must be ${currentYear - 1} or newer` }
  }
  if (year > currentYear + 2) {
    return { field: 'year', passes: false, message: 'Vehicle year seems too far in the future' }
  }
  return { field: 'year', passes: true, message: 'Valid vehicle year' }
}

/**
 * Returns true if the file is an accepted document type.
 */
export function isAcceptedFileType(file: File): boolean {
  const accepted = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff']
  return accepted.includes(file.type)
}

/**
 * Returns true if the file size is within the limit (default 10MB).
 */
export function isWithinSizeLimit(file: File, maxBytes = 10 * 1024 * 1024): boolean {
  return file.size <= maxBytes
}
