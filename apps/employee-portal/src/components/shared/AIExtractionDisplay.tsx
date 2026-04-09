import type { InsuranceExtractionResult, WindowStickerExtractionResult } from '@/types'
import { formatCurrency } from '@/utils/allowanceLevelCalc'

// ─── Insurance dec page extraction display ─────────────────────────────────────

interface InsuranceExtractionProps {
  data: InsuranceExtractionResult
  confidence: number
}

export function InsuranceExtractionDisplay({ data, confidence }: InsuranceExtractionProps) {
  return (
    <div className="ai-extraction">
      <div className="ai-extraction-header">
        <span className="ai-label">AI Extracted</span>
        <ConfidenceIndicator score={confidence} />
      </div>
      <table className="extraction-table">
        <tbody>
          {data.carrier_name && (
            <ExtractionRow label="Carrier" value={data.carrier_name} confidence={data.confidence_scores?.carrier_name} />
          )}
          {data.policy_number && (
            <ExtractionRow label="Policy #" value={data.policy_number} confidence={data.confidence_scores?.policy_number} />
          )}
          {data.policy_period_end && (
            <ExtractionRow
              label="Expiry Date"
              value={new Date(data.policy_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              confidence={data.confidence_scores?.policy_period_end}
              highlight
            />
          )}
          {data.csl_limit !== undefined && (
            <ExtractionRow
              label="CSL Limit"
              value={formatCurrency(data.csl_limit)}
              confidence={data.confidence_scores?.csl_limit}
              passes={data.csl_limit >= 500_000}
              requirementLabel="≥ $500,000 required"
            />
          )}
          {data.bi_per_person !== undefined && (
            <ExtractionRow
              label="BI / Person"
              value={formatCurrency(data.bi_per_person)}
              confidence={data.confidence_scores?.bi_per_person}
              passes={data.bi_per_person >= 250_000}
              requirementLabel="≥ $250,000 required"
            />
          )}
          {data.bi_per_accident !== undefined && (
            <ExtractionRow
              label="BI / Accident"
              value={formatCurrency(data.bi_per_accident)}
              confidence={data.confidence_scores?.bi_per_accident}
              passes={data.bi_per_accident >= 500_000}
              requirementLabel="≥ $500,000 required"
            />
          )}
          {data.pd_limit !== undefined && (
            <ExtractionRow
              label="Property Damage"
              value={formatCurrency(data.pd_limit)}
              confidence={data.confidence_scores?.pd_limit}
              passes={data.pd_limit >= 100_000}
              requirementLabel="≥ $100,000 required"
            />
          )}
          {data.umbrella_limit !== undefined && (
            <ExtractionRow
              label="Umbrella Limit"
              value={formatCurrency(data.umbrella_limit)}
              confidence={data.confidence_scores?.umbrella_limit}
            />
          )}
          {data.endorsement_type && (
            <ExtractionRow label="Endorsement Type" value={data.endorsement_type} confidence={data.confidence_scores?.endorsement_type} />
          )}
          {data.additional_insured_entity && (
            <ExtractionRow label="Named Entity" value={data.additional_insured_entity} confidence={data.confidence_scores?.additional_insured_entity} />
          )}
        </tbody>
      </table>
      {confidence < 70 && (
        <div className="alert alert-warning" style={{ marginTop: 8 }}>
          Low confidence extraction — an Equipment Leader will review this document manually.
        </div>
      )}
    </div>
  )
}

// ─── Window sticker extraction display ────────────────────────────────────────

interface WindowStickerExtractionProps {
  data: WindowStickerExtractionResult
  confidence: number
  minimumMsrp?: number
}

export function WindowStickerExtractionDisplay({ data, confidence, minimumMsrp }: WindowStickerExtractionProps) {
  const currentYear = new Date().getFullYear()
  const meetsYear = data.model_year !== undefined && currentYear - data.model_year <= 5
  const meetsMsrp = minimumMsrp !== undefined && data.total_msrp !== undefined && data.total_msrp >= minimumMsrp

  return (
    <div className="ai-extraction">
      <div className="ai-extraction-header">
        <span className="ai-label">AI Extracted from Window Sticker</span>
        <ConfidenceIndicator score={confidence} />
      </div>
      <table className="extraction-table">
        <tbody>
          {data.vin && (
            <ExtractionRow label="VIN" value={data.vin} confidence={data.confidence_scores?.vin} highlight />
          )}
          {data.vehicle_description && (
            <ExtractionRow label="Vehicle" value={data.vehicle_description} confidence={data.confidence_scores?.vehicle_description} />
          )}
          {data.model_year !== undefined && (
            <ExtractionRow
              label="Model Year"
              value={String(data.model_year)}
              confidence={data.confidence_scores?.model_year}
              passes={meetsYear}
              requirementLabel={`Must be ${currentYear - 5} or newer`}
            />
          )}
          {data.total_msrp !== undefined && (
            <ExtractionRow
              label="Total MSRP"
              value={formatCurrency(data.total_msrp)}
              confidence={data.confidence_scores?.total_msrp}
              passes={minimumMsrp !== undefined ? meetsMsrp : undefined}
              requirementLabel={minimumMsrp ? `≥ ${formatCurrency(minimumMsrp)} for selected level` : undefined}
              highlight
            />
          )}
          {data.is_electric && (
            <ExtractionRow label="Powertrain" value="⚡ Electric Vehicle" confidence={data.confidence_scores?.powertrain_description} />
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── Shared subcomponents ──────────────────────────────────────────────────────

function ConfidenceIndicator({ score }: { score: number }) {
  const label = score >= 85 ? 'High confidence' : score >= 70 ? 'Medium confidence' : 'Low confidence'
  const color = score >= 85 ? 'var(--color-success)' : score >= 70 ? '#7a4f00' : 'var(--color-error)'
  return (
    <span style={{ fontSize: 12, color, fontWeight: 600 }}>
      {label} ({Math.round(score)}%)
    </span>
  )
}

interface ExtractionRowProps {
  label: string
  value: string
  confidence?: number
  passes?: boolean
  requirementLabel?: string
  highlight?: boolean
}

function ExtractionRow({ label, value, confidence, passes, requirementLabel, highlight }: ExtractionRowProps) {
  return (
    <tr style={{ background: highlight ? '#f0f7ff' : undefined }}>
      <td style={{ padding: '4px 8px', fontSize: 12, color: 'var(--color-neutral-60)', width: 140, whiteSpace: 'nowrap' }}>
        {label}
      </td>
      <td style={{ padding: '4px 8px', fontSize: 13, fontWeight: highlight ? 600 : 400 }}>
        {value}
        {passes === true && <span style={{ marginLeft: 6, color: 'var(--color-success)' }}>✓</span>}
        {passes === false && <span style={{ marginLeft: 6, color: 'var(--color-error)' }}>✗</span>}
        {requirementLabel && passes === false && (
          <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--color-error)' }}>({requirementLabel})</span>
        )}
      </td>
      {confidence !== undefined && (
        <td style={{ padding: '4px 8px', fontSize: 11, color: confidence >= 70 ? 'var(--color-neutral-60)' : 'var(--color-warning)' }}>
          {Math.round(confidence)}%
        </td>
      )}
    </tr>
  )
}

// ─── Inline styles for extraction tables ──────────────────────────────────────
// (Appended to index.css at build time via the module approach below)

const style = document.createElement('style')
style.textContent = `
  .ai-extraction {
    background: #f8faff;
    border: 1px solid #c7e0f4;
    border-radius: 4px;
    padding: 12px;
    font-size: 13px;
  }
  .ai-extraction-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .ai-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-primary-dark);
  }
  .extraction-table {
    width: 100%;
    border-collapse: collapse;
  }
  .extraction-table tr:hover td {
    background: rgba(0, 120, 212, 0.04);
  }
`
if (typeof document !== 'undefined') {
  document.head.appendChild(style)
}
