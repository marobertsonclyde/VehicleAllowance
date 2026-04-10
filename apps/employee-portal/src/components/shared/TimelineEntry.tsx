import { Text, tokens } from '@fluentui/react-components'
import { formatDateTime } from '@/utils/formatters'

interface TimelineEntryProps {
  event: string
  date: string | undefined
  notes?: string
  isLatest?: boolean
}

export function TimelineEntry({ event, date, notes, isLatest = false }: TimelineEntryProps) {
  return (
    <div style={{
      display: 'flex',
      gap: tokens.spacingHorizontalM,
      paddingBottom: tokens.spacingVerticalM,
      borderLeft: `2px solid ${isLatest ? tokens.colorBrandStroke1 : tokens.colorNeutralStroke2}`,
      paddingLeft: tokens.spacingHorizontalM,
      marginLeft: tokens.spacingHorizontalS,
    }}>
      <div style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: isLatest ? tokens.colorBrandBackground : tokens.colorNeutralStroke2,
        marginTop: 6,
        marginLeft: -22,
        flexShrink: 0,
      }} />
      <div>
        <Text weight={isLatest ? 'semibold' : 'regular'} size={300}>{event}</Text>
        <br />
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {formatDateTime(date)}
        </Text>
        {notes && (
          <>
            <br />
            <Text size={200} italic>{notes}</Text>
          </>
        )}
      </div>
    </div>
  )
}
