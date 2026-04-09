import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConnectorContext } from '@microsoft/power-apps'
import { useCurrentApplication } from '@/hooks/useCurrentApplication'
import { ChecklistItem } from '@/components/shared/ChecklistItem'
import { InsuranceExtractionDisplay } from '@/components/shared/AIExtractionDisplay'
import type { DocumentType, InsuranceExtractionResult, VADocument } from '@/types'
import { AIProcessingStatus } from '@/types'

/**
 * Insurance Documents Screen
 *
 * Renders the four-item document checklist and handles file uploads.
 * After each upload, polls the va_Document record until AI processing
 * completes, then displays the extracted values inline.
 */
export function InsuranceDocumentsScreen() {
  const navigate = useNavigate()
  const { connectors } = useConnectorContext()
  const { application, checklist, documents, loading, error, refetch } = useCurrentApplication()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const allSatisfied = checklist.length > 0 && checklist.every(item => item.va_isSatisfied)

  function handleUploadClick(itemType: string) {
    setUploadingType(itemType)
    setUploadError(null)
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !application?.va_allowanceapplicationid || !uploadingType) {
      setUploadingType(null)
      return
    }

    try {
      // 1. Create the Document record in Dataverse
      const docRecord = await connectors.dataverse.createRecord('va_documents', {
        va_name: file.name,
        '_va_applicationid_value@odata.bind': `/va_allowanceapplications(${application.va_allowanceapplicationid})`,
        va_documentType: uploadingType,
        va_aiProcessingStatus: AIProcessingStatus.Pending,
      })

      const docId: string = docRecord.va_documentid

      // 2. Upload file content to the file column
      const fileBytes = await file.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(fileBytes).reduce((data, byte) => data + String.fromCharCode(byte), ''),
      )

      await connectors.dataverse.uploadFile(
        'va_documents',
        docId,
        'va_filereference',
        base64,
        file.name,
        file.type,
      )

      // 3. Poll until AI processing completes (or times out after 60 seconds)
      await pollForAICompletion(docId)

      // 4. Refresh checklist and documents
      await refetch()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploadingType(null)
      // Reset file input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function pollForAICompletion(documentId: string, maxWaitMs = 60_000): Promise<void> {
    const interval = 3_000
    let waited = 0
    while (waited < maxWaitMs) {
      await new Promise(r => setTimeout(r, interval))
      waited += interval

      const result = await connectors.dataverse.retrieveRecord(
        'va_documents',
        documentId,
        '?$select=va_aiProcessingStatus',
      )

      const status = result.va_aiProcessingStatus as AIProcessingStatus
      if (status === AIProcessingStatus.Completed || status === AIProcessingStatus.Failed) {
        return
      }
    }
    // Timeout — still refresh, the result may appear shortly
  }

  if (loading) {
    return (
      <div className="screen">
        <div className="loading-spinner"><div className="spinner-icon" />Loading…</div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="screen">
        <div className="alert alert-error">
          {error ?? 'No active application found. Please start from the beginning.'}
        </div>
      </div>
    )
  }

  // Build a map of documentId → AI extracted data for rendering
  const extractionMap = new Map<string, { data: InsuranceExtractionResult; confidence: number }>()
  for (const doc of documents) {
    if (doc.va_aiExtractedData && doc.va_documentid) {
      try {
        extractionMap.set(doc.va_documentid, {
          data: JSON.parse(doc.va_aiExtractedData) as InsuranceExtractionResult,
          confidence: doc.va_aiConfidenceScore ?? 0,
        })
      } catch {
        // Malformed JSON — skip display
      }
    }
  }

  // Map checklist items to their satisfied documents
  const docsByType = new Map<string, VADocument>()
  for (const doc of documents) {
    if (doc.va_documentType) docsByType.set(doc.va_documentType, doc)
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
        <h1 className="screen-title">Insurance &amp; Vehicle Documents</h1>
        <p className="screen-subtitle">
          All four documents must be verified before you can submit your application.
          Upload PDFs or clear photos. AI will extract and validate the details.
        </p>
      </div>

      {uploadError && (
        <div className="alert alert-error">{uploadError}</div>
      )}

      <div className="card">
        <div className="card-title">Required Documents</div>

        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          Submit the actual policy <strong>Declaration Pages</strong> — not applications,
          binders, or insurance ID cards.
        </div>

        <div className="checklist">
          {checklist.map(item => {
            const linkedDoc = item.va_satisfiedByDocumentId
              ? documents.find(d => d.va_documentid === item.va_satisfiedByDocumentId)
              : docsByType.get(item.va_checklistItemType ?? '')

            const extraction = linkedDoc?.va_documentid
              ? extractionMap.get(linkedDoc.va_documentid)
              : undefined

            const isProcessing =
              linkedDoc?.va_aiProcessingStatus === AIProcessingStatus.Processing ||
              (uploadingType === item.va_checklistItemType)

            return (
              <ChecklistItem
                key={item.va_documentchecklistid}
                item={item}
                onUpload={handleUploadClick}
                uploading={isProcessing}
              >
                {/* Show processing spinner while AI runs */}
                {isProcessing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-neutral-60)' }}>
                    <div className="spinner-icon" style={{ width: 14, height: 14 }} />
                    AI is extracting and validating data from your document…
                  </div>
                )}

                {/* Show AI extraction results */}
                {extraction && !isProcessing && (
                  <InsuranceExtractionDisplay
                    data={extraction.data}
                    confidence={extraction.confidence}
                  />
                )}

                {/* Show rejection reason if document was rejected by reviewer */}
                {linkedDoc?.va_reviewStatus === 'Rejected' && linkedDoc.va_rejectionReason && (
                  <div className="alert alert-error">
                    <strong>Rejected:</strong> {linkedDoc.va_rejectionReason}
                    <br />Upload a corrected document above.
                  </div>
                )}
              </ChecklistItem>
            )
          })}
        </div>
      </div>

      <div className="action-bar">
        <button className="btn btn-ghost" onClick={() => navigate('/apply/level')}>
          ← Back
        </button>
        <div className="action-bar-right">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/apply/review')}
            disabled={!allSatisfied}
            title={!allSatisfied ? 'All four documents must be uploaded and verified first' : undefined}
          >
            Continue to Review →
          </button>
        </div>
      </div>

      {!allSatisfied && (
        <p className="form-hint" style={{ textAlign: 'right', marginTop: 8 }}>
          {checklist.filter(i => !i.va_isSatisfied).length} document(s) remaining
        </p>
      )}
    </div>
  )
}
