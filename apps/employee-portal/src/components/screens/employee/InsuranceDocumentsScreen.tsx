import { useState, useCallback, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Card, Button, Text, MessageBar, Spinner, tokens } from '@fluentui/react-components'
import { useConnectorContext } from '@microsoft/power-apps'
import { useWizardState, useWizardDispatch } from '@/context/WizardContext'
import { usePollForCompletion } from '@/hooks/usePollForCompletion'
import { ChecklistItem } from '@/components/shared/ChecklistItem'
import { isAcceptedFileType, isWithinSizeLimit } from '@/utils/validation'
import { DocumentType, AIProcessingStatus, type ChecklistItemState, type VADocument } from '@/types'

const REQUIRED_DOCS: { type: DocumentType; label: string; required: boolean }[] = [
  { type: DocumentType.AutoDecPage, label: 'Auto Declarations Page', required: true },
  { type: DocumentType.UmbrellaDecPage, label: 'Umbrella/Personal Excess Declarations Page', required: true },
  { type: DocumentType.Endorsement, label: 'Additional Insured/Interest Endorsement', required: true },
  { type: DocumentType.WindowSticker, label: 'Window Sticker', required: true },
]

export function InsuranceDocumentsScreen() {
  const navigate = useNavigate()
  const { connectors } = useConnectorContext()
  const wizardState = useWizardState()
  const dispatch = useWizardDispatch()
  const { startPolling, status: pollStatus, isPolling } = usePollForCompletion()

  const [documents, setDocuments] = useState<VADocument[]>([])
  const [uploading, setUploading] = useState<DocumentType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDocuments = useCallback(async () => {
    if (!wizardState.applicationId) {
      setLoading(false)
      return
    }
    try {
      const result = await connectors.dataverse.retrieveMultipleRecords(
        'va_documents',
        `?$filter=_va_applicationid_value eq '${wizardState.applicationId}'&$orderby=createdon desc`,
      )
      setDocuments((result.entities as VADocument[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [connectors, wizardState.applicationId])

  useEffect(() => { void fetchDocuments() }, [fetchDocuments])

  // Re-fetch when polling completes
  useEffect(() => {
    if (pollStatus === AIProcessingStatus.Completed || pollStatus === AIProcessingStatus.Failed) {
      void fetchDocuments()
    }
  }, [pollStatus, fetchDocuments])

  async function handleUpload(docType: DocumentType, file: File) {
    if (!wizardState.applicationId) return
    if (!isAcceptedFileType(file)) { setError('File must be PDF, PNG, JPEG, or TIFF'); return }
    if (!isWithinSizeLimit(file)) { setError('File must be under 10MB'); return }

    setUploading(docType)
    setError(null)
    try {
      const docResult = await connectors.dataverse.createRecord('va_documents', {
        '_va_applicationid_value': wizardState.applicationId,
        va_documentType: docType,
        va_aiProcessingStatus: 'Pending',
      })
      await connectors.dataverse.uploadFile('va_documents', docResult.id, 'va_filereference', file)
      startPolling(docResult.id)
      await fetchDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document')
    } finally {
      setUploading(null)
    }
  }

  function buildChecklist(): ChecklistItemState[] {
    return REQUIRED_DOCS.map(req => {
      const doc = documents.find(d => d.va_documentType === req.type)
      return {
        documentType: req.type,
        label: req.label,
        required: req.required,
        satisfied: doc?.va_aiProcessingStatus === AIProcessingStatus.Completed,
        documentId: doc?.va_documentid,
        aiStatus: doc?.va_aiProcessingStatus as AIProcessingStatus | undefined,
      }
    })
  }

  const checklist = buildChecklist()
  const allSatisfied = checklist.filter(c => c.required).every(c => c.satisfied)

  if (!wizardState.hydrated) return <Spinner size="large" label="Loading..." />
  if (!wizardState.applicationId) return <Navigate to="/apply/vehicle" replace />
  if (loading) return <Spinner size="large" label="Loading documents..." />

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Insurance Documents</Text>
      <Text size={300}>Upload all required insurance documents. Each will be automatically validated by AI.</Text>

      {error && <MessageBar intent="error">{error}</MessageBar>}

      <Card>
        {checklist.map(item => (
          <div key={item.documentType}>
            <ChecklistItem item={item} />
            {!item.satisfied && (
              <div style={{ paddingLeft: 36, paddingBottom: tokens.spacingVerticalS }}>
                {uploading === item.documentType || (item.aiStatus === AIProcessingStatus.Processing) ? (
                  <Spinner size="tiny" label="Processing..." />
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.tiff"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) void handleUpload(item.documentType, f)
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </Card>

      {isPolling && <Spinner size="small" label="AI processing latest upload..." />}

      <div className="action-bar">
        <Button appearance="secondary" onClick={() => navigate('/apply/level')}>Back</Button>
        <Button
          appearance="primary"
          onClick={() => { dispatch({ type: 'SET_STEP', payload: 'review' }); navigate('/apply/review') }}
          disabled={!allSatisfied}
        >
          Next: Review & Submit
        </Button>
      </div>
    </div>
  )
}
