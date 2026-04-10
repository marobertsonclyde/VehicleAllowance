import { Card, Text, Badge, tokens } from '@fluentui/react-components'
import type { InsuranceExtractionResult, WindowStickerExtractionResult } from '@/types'
import { formatCurrency } from '@/utils/formatters'

interface AIExtractionDisplayProps {
  type: 'insurance' | 'windowSticker'
  data: string | undefined
  confidence: number | undefined
}

export function AIExtractionDisplay({ type, data, confidence }: AIExtractionDisplayProps) {
  if (!data) {
    return <Text size={200} italic>No AI extraction data available</Text>
  }

  let parsed: InsuranceExtractionResult | WindowStickerExtractionResult
  try {
    parsed = JSON.parse(data)
  } catch {
    return <Text size={200} italic>Unable to parse extraction data</Text>
  }

  const confidenceColor = (confidence ?? 0) >= 80 ? 'success' : (confidence ?? 0) >= 60 ? 'warning' : 'danger'

  return (
    <Card size="small">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacingVerticalS }}>
        <Text weight="semibold" size={300}>AI Extracted Data</Text>
        <Badge color={confidenceColor} appearance="filled">
          {confidence != null ? `${confidence.toFixed(0)}% confidence` : 'N/A'}
        </Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: tokens.spacingVerticalXS }}>
        {type === 'insurance' ? renderInsurance(parsed as InsuranceExtractionResult) : renderWindowSticker(parsed as WindowStickerExtractionResult)}
      </div>
    </Card>
  )
}

function renderInsurance(data: InsuranceExtractionResult) {
  const fields = [
    ['Carrier', data.carrier_name],
    ['Policy #', data.policy_number],
    ['CSL Limit', formatCurrency(data.csl_limit)],
    ['BI/Person', formatCurrency(data.bi_per_person)],
    ['BI/Accident', formatCurrency(data.bi_per_accident)],
    ['PD Limit', formatCurrency(data.pd_limit)],
    ['Umbrella', formatCurrency(data.umbrella_limit)],
    ['Endorsement', data.endorsement_type],
    ['Vehicles on Policy', data.listed_vehicles?.length?.toString() ?? '0'],
  ]

  return fields.map(([label, value]) => (
    <div key={label}>
      <Text size={200} style={{ color: 'var(--colorNeutralForeground3)' }}>{label}</Text>
      <br />
      <Text size={200}>{value ?? '--'}</Text>
    </div>
  ))
}

function renderWindowSticker(data: WindowStickerExtractionResult) {
  const fields = [
    ['VIN', data.vin],
    ['Total MSRP', formatCurrency(data.total_msrp)],
    ['Year', data.model_year?.toString()],
    ['Make', data.make],
    ['Model', data.model],
    ['Powertrain', data.powertrain_description],
    ['Electric', data.is_electric ? 'Yes' : 'No'],
  ]

  return fields.map(([label, value]) => (
    <div key={label}>
      <Text size={200} style={{ color: 'var(--colorNeutralForeground3)' }}>{label}</Text>
      <br />
      <Text size={200}>{value ?? '--'}</Text>
    </div>
  ))
}
