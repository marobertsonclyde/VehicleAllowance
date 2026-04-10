import { Badge } from '@fluentui/react-components'
import { PayrollVerificationStatus } from '@/types'

const colorMap: Record<PayrollVerificationStatus, 'success' | 'danger' | 'warning' | 'subtle' | 'brand'> = {
  [PayrollVerificationStatus.Verified]: 'success',
  [PayrollVerificationStatus.NotFound]: 'danger',
  [PayrollVerificationStatus.AmountMismatch]: 'warning',
  [PayrollVerificationStatus.Pending]: 'brand',
  [PayrollVerificationStatus.Failed]: 'danger',
}

export function VerificationBadge({ status }: { status?: PayrollVerificationStatus }) {
  if (!status) return <Badge color="subtle" appearance="outline" size="small">Not Checked</Badge>
  return <Badge color={colorMap[status] ?? 'subtle'} appearance="filled" size="small">{status}</Badge>
}
