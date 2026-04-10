import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Text, MessageBar, Spinner, tokens } from '@fluentui/react-components'
import { useConnectorContext } from '@microsoft/power-apps'
import { useAllowanceRecord } from '@/hooks/useAllowanceRecord'
import { usePollForCompletion } from '@/hooks/usePollForCompletion'
import { isAcceptedFileType, isWithinSizeLimit } from '@/utils/validation'
import { formatDate } from '@/utils/formatters'
import { DocumentType, AIProcessingStatus } from '@/types'

const RENEWAL_DOCS = [
  { type: DocumentType.AutoDecPage, label: 'Auto Declarations Page' },
  { type: DocumentType.UmbrellaDecPage, label: 'Umbrella Declarations Page' },
  { type: DocumentType.Endorsement, label: 'Endorsement' },
]

export function InsuranceRenewalScreen() {
  const navigate = useNavigate()
  const { connectors } = useConnectorContext()
  const { record, loading: recLoading } = useAllowanceRecord()
  const { isPolling, startPolling, status: pollStatus } = usePollForCompletion()

  const [uploaded, setUploaded] = useState<Set<DocumentType>>(new Set())
  const [uploading, setUploading] = useState<DocumentType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleUpload(docType: DocumentType, file: File) {
    if (!record?.va_originalApplicationId) return
    if (!isAcceptedFileType(file)) { setError('File must be PDF, PNG, JPEG, or TIFF'); return }
    if (!isWithinSizeLimit(file)) { setError('File must be under 10MB'); return }

    setUploading(docType)
    setError(null)
    try {
      const docResult = await connectors.dataverse.createRecord('va_documents', {
        '_va_applicationid_value': record.va_originalApplicationId,
        va_documentType: docType,
        va_aiProcessingStatus: 'Pending',
      })
      await connectors.dataverse.uploadFile('va_documents', docResult.id, 'va_filereference', file)
      startPolling(docResult.id)
      setUploaded(prev => new Set(prev).add(docType))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  if (recLoading) return <Spinner size="large" label="Loading..." />
  if (!record) return <MessageBar intent="warning">No active allowance record found.</MessageBar>

  const allUploaded = RENEWAL_DOCS.every(d => uploaded.has(d.type))

  if (success) {
    return (
      <div className="screen">
        <Text as="h1" size={700} weight="bold">Renewal Submitted</Text>
        <Card style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
          <MessageBar intent="success">Your renewal documents have been submitted for review.</MessageBar>
          <Button appearance="primary" onClick={() => navigate('/')} style={{ marginTop: tokens.spacingVerticalL }}>
            Return Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="screen">
      <Text as="h1" size={700} weight="bold">Insurance Renewal</Text>
      <Text size={300}>
        Your next renewal is due {formatDate(record.va_nextRenewalDue)}. Upload your updated insurance documents below.
      </Text>

      {error && <MessageBar intent="error">{error}</MessageBar>}

      {RENEWAL_DOCS.map(doc => (
        <Card key={doc.type}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text weight="semibold" size={300}>{doc.label}</Text>
            {uploaded.has(doc.type) && (
              <Text size={200} style={{ color: tokens.colorPaletteGreenForeground1 }}>Uploaded</Text>
            )}
          </div>
          {!uploaded.has(doc.type) && (
            uploading === doc.type ? (
              <Spinner size="tiny" label="Uploading..." />
            ) : (
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.tiff"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) void handleUpload(doc.type, f)
                }}
                style={{ marginTop: tokens.spacingVerticalS }}
              />
            )
          )}
        </Card>
      ))}

      {isPolling && <Spinner size="small" label="AI processing..." />}
      {pollStatus === AIProcessingStatus.Completed && <MessageBar intent="success">Document processed successfully.</MessageBar>}

      <div className="action-bar">
        <Button appearance="secondary" onClick={() => navigate('/')}>Cancel</Button>
        <Button appearance="primary" onClick={() => setSuccess(true)} disabled={!allUploaded}>
          Submit Renewal
        </Button>
      </div>
    </div>
  )
}
