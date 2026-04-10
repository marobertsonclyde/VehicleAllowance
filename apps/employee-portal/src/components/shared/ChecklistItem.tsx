import { Text, Badge, tokens } from '@fluentui/react-components'
import {
  CheckmarkCircle24Filled,
  Circle24Regular,
  ArrowSync24Regular,
  ErrorCircle24Regular,
} from '@fluentui/react-icons'
import { AIProcessingStatus } from '@/types'
import type { ChecklistItemState } from '@/types'

interface ChecklistItemProps {
  item: ChecklistItemState
}

export function ChecklistItem({ item }: ChecklistItemProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacingHorizontalS,
      padding: tokens.spacingVerticalS,
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    }}>
      {getIcon(item)}
      <div style={{ flex: 1 }}>
        <Text weight="semibold" size={300}>{item.label}</Text>
        {item.required && !item.satisfied && (
          <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}> (required)</Text>
        )}
      </div>
      {item.aiStatus && (
        <Badge
          color={item.aiStatus === AIProcessingStatus.Completed ? 'success' : item.aiStatus === AIProcessingStatus.Failed ? 'danger' : 'brand'}
          appearance="outline"
          size="small"
        >
          {item.aiStatus}
        </Badge>
      )}
    </div>
  )
}

function getIcon(item: ChecklistItemState) {
  if (item.satisfied) return <CheckmarkCircle24Filled primaryFill={tokens.colorPaletteGreenForeground1} />
  if (item.aiStatus === AIProcessingStatus.Processing) return <ArrowSync24Regular primaryFill={tokens.colorBrandForeground1} />
  if (item.aiStatus === AIProcessingStatus.Failed) return <ErrorCircle24Regular primaryFill={tokens.colorPaletteRedForeground1} />
  return <Circle24Regular primaryFill={tokens.colorNeutralStroke1} />
}
