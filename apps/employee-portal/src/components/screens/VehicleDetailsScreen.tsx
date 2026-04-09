import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConnectorContext } from '@microsoft/power-apps'
import { useCurrentApplication } from '@/hooks/useCurrentApplication'
import { WindowStickerExtractionDisplay } from '@/components/shared/AIExtractionDisplay'
import { meetsYearRequirement, oldestEligibleYear } from '@/utils/allowanceLevelCalc'
import type { WindowStickerExtractionResult } from '@/types'
import { BodyType, AIProcessingStatus } from '@/types'

export function VehicleDetailsScreen() {
  const navigate = useNavigate()
  const { connectors } = useConnectorContext()
  const { application, vehicle, refetch } = useCurrentApplication()

  // Form state
  const [vin, setVin] = useState(vehicle?.va_vin ?? '')
  const [make, setMake] = useState(vehicle?.va_make ?? '')
  const [model, setModel] = useState(vehicle?.va_model ?? '')
  const [year, setYear] = useState<number | ''>(vehicle?.va_year ?? '')
  const [bodyType, setBodyType] = useState<BodyType | ''>(vehicle?.va_bodyType ?? '')
  const [msrp, setMsrp] = useState<number | ''>(vehicle?.va_msrpTotal ?? '')
  const [isElectric, setIsElectric] = useState(vehicle?.va_isElectric ?? false)
  const [preApproved, setPreApproved] = useState(vehicle?.va_preApprovedByEquipmentLeader ?? false)

  // Prevent stale state updates if user navigates away during AI polling
  const isMountedRef = useRef(true)
  useEffect(() => () => { isMountedRef.current = false }, [])

  // Window sticker AI state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stickerUploading, setStickerUploading] = useState(false)
  const [stickerExtraction, setStickerExtraction] = useState<{
    data: WindowStickerExtractionResult
    confidence: number
  } | null>(null)

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!vin.match(/^[A-HJ-NPR-Z0-9]{17}$/i)) e.vin = 'VIN must be 17 characters (no I, O, or Q).'
    if (!make.trim()) e.make = 'Make is required.'
    if (!model.trim()) e.model = 'Model is required.'
    if (!year || year < oldestEligibleYear()) e.year = `Vehicle must be ${oldestEligibleYear()} or newer.`
    if (!bodyType) e.bodyType = 'Body type is required.'
    if (!msrp || msrp <= 0) e.msrp = 'Total MSRP is required.'
    if (!preApproved) e.preApproved = 'Vehicle must be pre-approved by the Equipment Leader before purchase.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate() || !application?.va_allowanceapplicationid) return
    setSaving(true)
    try {
      const vehicleData = {
        va_vin: vin.toUpperCase(),
        va_make: make,
        va_model: model,
        va_year: Number(year),
        va_bodyType: bodyType,
        va_msrpTotal: Number(msrp),
        va_isElectric: isElectric,
        va_preApprovedByEquipmentLeader: preApproved,
        va_meetsYearRequirement: meetsYearRequirement(Number(year)),
        va_meetsBodyTypeRequirement: bodyType === BodyType.Pickup || bodyType === BodyType.SUV,
        '_va_applicationid_value@odata.bind': `/va_allowanceapplications(${application.va_allowanceapplicationid})`,
      }

      if (vehicle?.va_vehicleid) {
        await connectors.dataverse.updateRecord('va_vehicles', vehicle.va_vehicleid, vehicleData)
      } else {
        await connectors.dataverse.createRecord('va_vehicles', {
          ...vehicleData,
          va_name: `${year} ${make} ${model}`,
        })
      }

      await refetch()
      navigate('/apply/level')
    } catch (err) {
      setErrors({ _global: err instanceof Error ? err.message : 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleStickerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !application?.va_allowanceapplicationid) return
    setStickerUploading(true)

    try {
      const docRecord = await connectors.dataverse.createRecord('va_documents', {
        va_name: file.name,
        '_va_applicationid_value@odata.bind': `/va_allowanceapplications(${application.va_allowanceapplicationid})`,
        va_documentType: 'Window Sticker',
        va_aiProcessingStatus: AIProcessingStatus.Pending,
      })

      const fileBytes = await file.arrayBuffer()
      const base64 = btoa(new Uint8Array(fileBytes).reduce((d, b) => d + String.fromCharCode(b), ''))

      await connectors.dataverse.uploadFile(
        'va_documents', docRecord.va_documentid, 'va_filereference', base64, file.name, file.type,
      )

      // Poll for AI completion
      let waited = 0
      let extractedDoc = null
      while (waited < 60_000) {
        await new Promise(r => setTimeout(r, 3_000))
        if (!isMountedRef.current) break
        waited += 3_000
        const doc = await connectors.dataverse.retrieveRecord(
          'va_documents', docRecord.va_documentid,
          '?$select=va_aiProcessingStatus,va_aiExtractedData,va_aiConfidenceScore',
        )
        if (!isMountedRef.current) break
        if (
          doc.va_aiProcessingStatus === AIProcessingStatus.Completed ||
          doc.va_aiProcessingStatus === AIProcessingStatus.Failed
        ) {
          extractedDoc = doc
          break
        }
      }

      if (extractedDoc?.va_aiExtractedData) {
        const extracted = JSON.parse(extractedDoc.va_aiExtractedData) as WindowStickerExtractionResult
        setStickerExtraction({ data: extracted, confidence: extractedDoc.va_aiConfidenceScore ?? 0 })

        // Auto-populate form fields from AI extraction
        if (extracted.vin) setVin(extracted.vin)
        if (extracted.make) setMake(extracted.make)
        if (extracted.model) setModel(extracted.model)
        if (extracted.model_year) setYear(extracted.model_year)
        if (extracted.total_msrp) setMsrp(extracted.total_msrp)
        if (extracted.is_electric !== undefined) setIsElectric(extracted.is_electric)
      }
    } finally {
      setStickerUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="screen">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={e => void handleStickerUpload(e)}
      />

      <div className="screen-header">
        <h1 className="screen-title">Vehicle Details</h1>
        <p className="screen-subtitle">Enter your allowance vehicle information. You can upload the window sticker to auto-fill most fields.</p>
      </div>

      {errors._global && <div className="alert alert-error">{errors._global}</div>}

      {/* ── Window Sticker Upload ──────────────────────────────────────────── */}
      <div className="card">
        <div className="card-title">Manufacturer's Window Sticker</div>
        <p className="form-hint" style={{ marginBottom: 12 }}>
          Upload a clear photo or scan of the window sticker (Monroney label).
          AI will extract the VIN, Total MSRP, and vehicle details automatically.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={stickerUploading}
        >
          {stickerUploading ? (
            <><span className="spinner-icon" /> Extracting from sticker…</>
          ) : (
            '↑ Upload Window Sticker'
          )}
        </button>

        {stickerExtraction && (
          <div style={{ marginTop: 12 }}>
            <WindowStickerExtractionDisplay
              data={stickerExtraction.data}
              confidence={stickerExtraction.confidence}
              minimumMsrp={undefined}
            />
          </div>
        )}
      </div>

      {/* ── Vehicle Details Form ───────────────────────────────────────────── */}
      <div className="card">
        <div className="card-title">Vehicle Information</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label required">VIN</label>
            <input
              className={`form-input ${errors.vin ? 'error' : ''}`}
              value={vin}
              onChange={e => setVin(e.target.value.toUpperCase())}
              maxLength={17}
              placeholder="17-character VIN"
              style={{ fontFamily: 'monospace' }}
            />
            {errors.vin && <span className="form-error">{errors.vin}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Make</label>
            <input className={`form-input ${errors.make ? 'error' : ''}`} value={make} onChange={e => setMake(e.target.value)} placeholder="e.g. Ford" />
            {errors.make && <span className="form-error">{errors.make}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Model</label>
            <input className={`form-input ${errors.model ? 'error' : ''}`} value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. F-250 Super Duty" />
            {errors.model && <span className="form-error">{errors.model}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Model Year</label>
            <input
              className={`form-input ${errors.year ? 'error' : ''}`}
              type="number"
              value={year}
              onChange={e => setYear(e.target.value ? Number(e.target.value) : '')}
              min={oldestEligibleYear()}
              max={new Date().getFullYear() + 1}
              placeholder={String(new Date().getFullYear())}
            />
            {errors.year
              ? <span className="form-error">{errors.year}</span>
              : <span className="form-hint">Must be {oldestEligibleYear()} or newer</span>
            }
          </div>

          <div className="form-group">
            <label className="form-label required">Body Type</label>
            <select className={`form-select ${errors.bodyType ? 'error' : ''}`} value={bodyType} onChange={e => setBodyType(e.target.value as BodyType)}>
              <option value="">Select…</option>
              <option value={BodyType.Pickup}>Pickup Truck</option>
              <option value={BodyType.SUV}>SUV</option>
              <option value={BodyType.Other}>Other (requires Equipment Leader approval)</option>
            </select>
            {errors.bodyType && <span className="form-error">{errors.bodyType}</span>}
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label required">Total MSRP (from Window Sticker)</label>
            <input
              className={`form-input ${errors.msrp ? 'error' : ''}`}
              type="number"
              value={msrp}
              onChange={e => setMsrp(e.target.value ? Number(e.target.value) : '')}
              min={0}
              placeholder="e.g. 65000"
            />
            {errors.msrp
              ? <span className="form-error">{errors.msrp}</span>
              : <span className="form-hint">Use the "Total Suggested Retail Price" from the bottom of the manufacturer's window sticker — not the purchase price.</span>
            }
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={isElectric} onChange={e => setIsElectric(e.target.checked)} />
              <span className="form-label" style={{ margin: 0 }}>⚡ This is an electric vehicle (BEV/PHEV)</span>
            </label>
            <span className="form-hint">EV recipients receive a separate monthly charging allowance in lieu of a fuel card.</span>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={preApproved} onChange={e => setPreApproved(e.target.checked)} style={{ marginTop: 2 }} />
              <span>
                <span className={`form-label ${errors.preApproved ? '' : 'required'}`} style={{ margin: 0, display: 'block' }}>
                  This vehicle has been pre-approved by the Company Equipment Leader
                </span>
                <span className="form-hint">Per policy, the Equipment Leader must approve the vehicle before purchase.</span>
              </span>
            </label>
            {errors.preApproved && <span className="form-error">{errors.preApproved}</span>}
          </div>
        </div>
      </div>

      <div className="action-bar">
        <button className="btn btn-ghost" onClick={() => navigate('/eligibility')}>← Back</button>
        <button className="btn btn-primary" onClick={() => void handleSave()} disabled={saving}>
          {saving ? <><span className="spinner-icon" /> Saving…</> : 'Continue to Allowance Level →'}
        </button>
      </div>
    </div>
  )
}
