import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConnectorContext } from '@microsoft/power-apps'
import { useAllowanceRecord } from '@/hooks/useAllowanceRecord'
import { InsuranceExtractionDisplay } from '@/components/shared/AIExtractionDisplay'
import type { InsuranceExtractionResult } from '@/types'
import { AIProcessingStatus } from '@/types'

/**
 * Insurance Renewal Screen
 *
 * Allows active allowance recipients to upload updated insurance dec pages
 * when their policies renew. Linked directly to the AllowanceRecord (not a
 * new application), so the process doesn't require full re-approval.
 */
export function InsuranceRenewalScreen() {
  const navigate = useNavigate()
  const { connectors } = useConnectorContext()
  const { record, activePolicies, loading } = useAllowanceRecord()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPolicyId, setUploadingPolicyId] = useState<string | null>(null)
  const [extractions, setExtractions] = useState<Record<string, { data: InsuranceExtractionResult; confidence: number }>>({})
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function handleUploadClick(policyId: string) {
    setUploadingPolicyId(policyId)
    setUploadError(null)
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !uploadingPolicyId || !record?.va_originalApplicationId) {
      setUploadingPolicyId(null)
      return
    }

    try {
      // Create doc record linked to the application (not the renewal itself)
      const docRecord = await connectors.dataverse.createRecord('va_documents', {
        va_name: file.name,
        '_va_applicationid_value@odata.bind': `/va_allowanceapplications(${record.va_originalApplicationId})`,
        '_va_linkedpolicyid_value@odata.bind': `/va_insurancepolicies(${uploadingPolicyId})`,
        va_documentType: 'Auto Dec Page',   // Will be corrected by AI classifier
        va_aiProcessingStatus: AIProcessingStatus.Pending,
      })

      const fileBytes = await file.arrayBuffer()
      const base64 = btoa(new Uint8Array(fileBytes).reduce((d, b) => d + String.fromCharCode(b), ''))

      await connectors.dataverse.uploadFile(
        'va_documents', docRecord.va_documentid, 'va_filereference', base64, file.name, file.type,
      )

      // Poll for completion
      let waited = 0
      while (waited < 60_000) {
        await new Promise(r => setTimeout(r, 3_000))
        waited += 3_000
        const doc = await connectors.dataverse.retrieveRecord(
          'va_documents', docRecord.va_documentid,
          '?$select=va_aiProcessingStatus,va_aiExtractedData,va_aiConfidenceScore',
        )
        if (doc.va_aiProcessingStatus !== AIProcessingStatus.Processing &&
            doc.va_aiProcessingStatus !== AIProcessingStatus.Pending) {
          if (doc.va_aiExtractedData) {
            setExtractions(prev => ({
              ...prev,
              [uploadingPolicyId]: {
                data: JSON.parse(doc.va_aiExtractedData) as InsuranceExtractionResult,
                confidence: doc.va_aiConfidenceScore ?? 0,
              },
            }))
          }
          break
        }
      }

      setSuccessMessage('Document uploaded. The Equipment Department will review the updated policy details.')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploadingPolicyId(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return <div className="screen"><div className="loading-spinner"><div className="spinner-icon" />Loading…</div></div>
  }

  if (!record) {
    return (
      <div className="screen">
        <div className="alert alert-info">No active allowance record found. <button className="btn btn-ghost" onClick={() => navigate('/')}>Return Home</button></div>
      </div>
    )
  }

  return (
    <div className="screen">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={e => void handleFileSelected(e)}
      />

      <div className="screen-header">
        <h1 className="screen-title">Upload Insurance Renewal</h1>
        <p className="screen-subtitle">
          Upload updated declaration pages when your insurance policies renew.
          Per policy, you must maintain continuous coverage — upload renewals before your policies expire.
        </p>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {uploadError && <div className="alert alert-error">{uploadError}</div>}

      {activePolicies.length === 0 && (
        <div className="alert alert-info">No active insurance policies on file. Contact the Equipment Department.</div>
      )}

      {activePolicies.map(policy => {
        const expiry = policy.va_expirationDate ? new Date(policy.va_expirationDate) : null
        const daysLeft = expiry ? Math.ceil((expiry.getTime() - Date.now()) / 86_400_000) : null
        const isExpiring = daysLeft !== null && daysLeft <= 45
        const isUploading = uploadingPolicyId === policy.va_insurancepolicyid
        const extraction = policy.va_insurancepolicyid ? extractions[policy.va_insurancepolicyid] : undefined

        return (
          <div key={policy.va_insurancepolicyid} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{policy.va_policyType}</div>
                <div className="form-hint">{policy.va_carrierName} · Policy #{policy.va_policyNumber}</div>
              </div>
              {expiry && (
                <div style={{ textAlign: 'right' }}>
                  <div className={`badge ${isExpiring ? 'badge-warning' : 'badge-neutral'}`}>
                    {isExpiring ? '⚠ ' : ''}
                    Expires {expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {daysLeft !== null && (
                    <div className="form-hint" style={{ marginTop: 2 }}>{daysLeft} days remaining</div>
                  )}
                </div>
              )}
            </div>

            {extraction && (
              <div style={{ marginBottom: 12 }}>
                <InsuranceExtractionDisplay data={extraction.data} confidence={extraction.confidence} />
              </div>
            )}

            <button
              className="btn btn-secondary"
              onClick={() => handleUploadClick(policy.va_insurancepolicyid!)}
              disabled={isUploading}
            >
              {isUploading ? <><span className="spinner-icon" /> Uploading…</> : '↑ Upload Renewal Dec Pages'}
            </button>
          </div>
        )
      })}

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Return to Home</button>
      </div>
    </div>
  )
}
