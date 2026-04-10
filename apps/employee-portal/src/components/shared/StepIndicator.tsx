import { Text, tokens } from '@fluentui/react-components'
import {
  CheckmarkCircle24Filled,
  Circle24Regular,
  ArrowCircleRight24Filled,
} from '@fluentui/react-icons'

interface Step {
  label: string
  completed: boolean
  active: boolean
}

interface StepIndicatorProps {
  steps: Step[]
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
      {steps.map((step, i) => (
        <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS }}>
          {i > 0 && (
            <div style={{
              width: 32,
              height: 2,
              backgroundColor: step.completed ? tokens.colorBrandBackground : tokens.colorNeutralStroke1,
            }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS }}>
            {step.completed ? (
              <CheckmarkCircle24Filled primaryFill={tokens.colorBrandBackground} />
            ) : step.active ? (
              <ArrowCircleRight24Filled primaryFill={tokens.colorBrandBackground} />
            ) : (
              <Circle24Regular primaryFill={tokens.colorNeutralStroke1} />
            )}
            <Text
              size={200}
              weight={step.active ? 'semibold' : 'regular'}
              style={{ color: step.active ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground3 }}
            >
              {step.label}
            </Text>
          </div>
        </div>
      ))}
    </div>
  )
}
