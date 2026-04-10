import { Badge } from '@fluentui/react-components'
import { ApplicationStatus, AIProcessingStatus } from '@/types'

type BadgeColor = 'brand' | 'danger' | 'important' | 'informative' | 'severe' | 'subtle' | 'success' | 'warning'

const STATUS_COLORS: Record<string, BadgeColor> = {
  [ApplicationStatus.Draft]: 'subtle',
  [ApplicationStatus.Submitted]: 'informative',
  [ApplicationStatus.AIReview]: 'brand',
  [ApplicationStatus.EquipmentLeaderReview]: 'warning',
  [ApplicationStatus.DirectorReview]: 'warning',
  [ApplicationStatus.PayrollNotification]: 'brand',
  [ApplicationStatus.Active]: 'success',
  [ApplicationStatus.Rejected]: 'danger',
  [ApplicationStatus.ReturnedToEmployee]: 'severe',
  [ApplicationStatus.Withdrawn]: 'subtle',
  [ApplicationStatus.Terminated]: 'danger',
  [AIProcessingStatus.Pending]: 'subtle',
  [AIProcessingStatus.Processing]: 'brand',
  [AIProcessingStatus.Completed]: 'success',
  [AIProcessingStatus.Failed]: 'danger',
  // AllowanceRecordStatus.Active/Suspended/Terminated share string values
  // with ApplicationStatus — already covered above
  Suspended: 'warning' as BadgeColor,
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? 'informative'
  return <Badge color={color} appearance="filled">{status}</Badge>
}
