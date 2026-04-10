import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, Button, Text, Input, Field, Select, MessageBar,
  Spinner, tokens,
} from '@fluentui/react-components'
import { useConnectorContext } from '@microsoft/power-apps'
import { useWizardState, useWizardDispatch } from '@/context/WizardContext'
import { usePollForCompletion } from '@/hooks/usePollForCompletion'
import { AIExtractionDisplay } from '@/components/shared/AIExtractionDisplay'
import { validateVin, validateMsrp, isAcceptedFileType, isWithinSizeLimit } from '@/utils/validation'
import { BodyType, AIProcessingStatus } from '@/types'
import type { Vehicle } from '@/types'

export function VehicleDetailsScreen() {
  const navigate = useNavigate()
  const { connectors } = useConnectorContext()
  const wizardState = useWizardState()
  const dispatch = useWizardDispatch()
  const { status: aiStatus, isPolling, timedOut, startPolling } = usePollForCompletion()

  const [vin, setVin] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [bodyType, setBodyType] = useState<BodyType>(BodyType.Pickup)
  const [msrp, setMsrp] = useState<number>(0)
  const [isElectric, setIsElectric] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentData] = useState<{ extractedData?: string; confidence?: number } | null>(null)
  const [prefilled, setPrefilled] = useState(false)

  // Pre-fill form from existing vehicle when resuming a draft
  useEffect(() => {
    if (prefilled || !wizardState.hydrated || !wizardState.vehicleId) return
    async function loadVehicle() {
      try {
        const v = await connectors.dataverse.retrieveRecord(
          'va_vehicles',
          wizardState.vehicleId!,
        ) as Vehicle
        setVin(v.va_vin ?? '')
        setMake(v.va_make ?? '')
        setModel(v.va_model ?? '')
        setYear(v.va_year ?? new Date().getFullYear())
        setBodyType((v.va_bodyType as BodyType) ?? BodyType.Pickup)
        setMsrp(v.va_msrpTotal ?? 0)
        setIsElectric(v.va_isElectric ?? false)
      } catch {
        // Vehicle record missing or inaccessible — start fresh
      }
      setPrefilled(true)
    }
    void loadVehicle()
  }, [connectors, wizardState.hydrated, wizardState.vehicleId, prefilled])

  async function handleSaveAndUpload() {
    const vinResult = validateVin(vin)
    if (!vinResult.passes) { setError(vinResult.message); return }
    const msrpResult = validateMsrp(msrp)
    if (!msrpResult.passes) { setError(msrpResult.message); return }
    if (!file) { setError('Please upload a window sticker'); return }
    if (!isAcceptedFileType(file)) { setError('File must be PDF, PNG, JPEG, or TIFF'); return }
    if (!isWithinSizeLimit(file)) { setError('File must be under 10MB'); return }

    setSaving(true)
    setError(null)
    try {
      // Reuse existing draft or create a new application
      let appId = wizardState.applicationId
      if (!appId) {
        const appResult = await connectors.dataverse.createRecord('va_allowanceapplications', {
          va_applicationType: 'New Opt-In',
          va_status: 'Draft',
          va_personnelnumber: wizardState.eligibility?.personnelNumber,
        })
        appId = appResult.id
        dispatch({ type: 'SET_APPLICATION_ID', payload: appId })
      }

      // Update existing vehicle or create a new one
      const vehiclePayload = {
        '_va_applicationid_value': appId,
        va_vin: vin.trim().toUpperCase(),
        va_make: make,
        va_model: model,
        va_year: year,
        va_bodyType: bodyType,
        va_msrpTotal: msrp,
        va_isElectric: isElectric,
      }

      let vehicleId = wizardState.vehicleId
      if (vehicleId) {
        await connectors.dataverse.updateRecord('va_vehicles', vehicleId, vehiclePayload)
      } else {
        const vehicleResult = await connectors.dataverse.createRecord('va_vehicles', vehiclePayload)
        vehicleId = vehicleResult.id
        dispatch({ type: 'SET_VEHICLE_ID', payload: vehicleId })
      }

      // Create document and upload file
      const docResult = await connectors.dataverse.createRecord('va_documents', {
        '_va_applicationid_value': appId,
        va_documentType: 'Window Sticker',
        va_aiProcessingStatus: 'Pending',
        '_va_linkedvehicleid_value': vehicleId,
      })
      await connectors.dataverse.uploadFile('va_documents', docResult.id, 'va_filereference', file)

      // Poll for AI processing
      startPolling(docResult.id)

      dispatch({ type: 'SET_STEP', payload: 'level' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle details')
    } finally {
      setSaving(false)
    }
  }

  const canProceed = aiStatus === AIProcessingStatus.Completed || aiStatus === AIProcessingStatus.Failed || timedOut

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Vehicle Details</Text>
      {error && <MessageBar intent="error">{error}</MessageBar>}

      <Card>
        <div className="form-grid">
          <Field label="VIN" required>
            <Input value={vin} onChange={(_e, d) => setVin(d.value)} placeholder="17-character VIN" maxLength={17} />
          </Field>
          <Field label="Make" required>
            <Input value={make} onChange={(_e, d) => setMake(d.value)} placeholder="e.g. Ford" />
          </Field>
          <Field label="Model" required>
            <Input value={model} onChange={(_e, d) => setModel(d.value)} placeholder="e.g. F-150" />
          </Field>
          <Field label="Year" required>
            <Input type="number" value={String(year)} onChange={(_e, d) => setYear(Number(d.value))} />
          </Field>
          <Field label="Body Type" required>
            <Select value={bodyType} onChange={(_e, d) => setBodyType(d.value as BodyType)}>
              <option value={BodyType.Pickup}>Pickup</option>
              <option value={BodyType.SUV}>SUV</option>
              <option value={BodyType.Other}>Other</option>
            </Select>
          </Field>
          <Field label="Total MSRP" required>
            <Input type="number" value={String(msrp)} onChange={(_e, d) => setMsrp(Number(d.value))} contentBefore="$" />
          </Field>
          <Field label="Electric Vehicle">
            <input type="checkbox" checked={isElectric} onChange={e => setIsElectric(e.target.checked)} />
          </Field>
        </div>
      </Card>

      <Card>
        <Text weight="semibold" size={400}>Window Sticker Upload</Text>
        <Text as="p" size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          Upload the factory window sticker (Monroney label) to verify MSRP and vehicle details.
        </Text>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.tiff"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          style={{ marginTop: tokens.spacingVerticalS }}
        />
        {isPolling && <Spinner size="small" label="AI processing document..." style={{ marginTop: tokens.spacingVerticalS }} />}
        {timedOut && <MessageBar intent="warning">AI processing timed out. You can continue; a reviewer will verify manually.</MessageBar>}
        {documentData && <AIExtractionDisplay type="windowSticker" data={documentData.extractedData} confidence={documentData.confidence} />}
      </Card>

      <div className="action-bar">
        <Button appearance="secondary" onClick={() => navigate('/eligibility')}>Back</Button>
        {!canProceed ? (
          <Button appearance="primary" onClick={() => void handleSaveAndUpload()} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Upload'}
          </Button>
        ) : (
          <Button appearance="primary" onClick={() => navigate('/apply/level')}>
            Next: Allowance Level
          </Button>
        )}
      </div>
    </div>
  )
}
