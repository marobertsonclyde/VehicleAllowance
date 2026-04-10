/**
 * Format a number as USD currency.
 */
export function formatCurrency(amount: number | undefined): string {
  if (amount == null) return '--'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format an ISO date string as a readable date.
 */
export function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return '--'
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format an ISO datetime string as a readable datetime.
 */
export function formatDateTime(isoDate: string | undefined): string {
  if (!isoDate) return '--'
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Format a percentage (0-100) with one decimal.
 */
export function formatPercent(value: number | undefined): string {
  if (value == null) return '--'
  return `${value.toFixed(1)}%`
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '\u2026'
}
