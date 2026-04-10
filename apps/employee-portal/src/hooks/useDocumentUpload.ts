import { useState, useCallback } from 'react'
import { useConnectorContext } from '@microsoft/power-apps'
import { usePollForCompletion } from './usePollForCompletion'
import { isAcceptedFileType, isWithinSizeLimit } from '@/utils/validation'
import { getErrorMessage } from '@/utils/formatters'
import type { DocumentType } from '@/types'

export function useDocumentUpload() {
  const { connectors } = useConnectorContext()
  const { startPolling, status: pollStatus, isPolling, timedOut } = usePollForCompletion()
  const [uploading, setUploading] = useState<DocumentType | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const upload = useCallback(async (
    applicationId: string,
    docType: DocumentType,
    file: File,
    extraFields?: Record<string, unknown>,
  ): Promise<boolean> => {
    if (!isAcceptedFileType(file)) { setUploadError('File must be PDF, PNG, JPEG, or TIFF'); return false }
    if (!isWithinSizeLimit(file)) { setUploadError('File must be under 10MB'); return false }

    setUploading(docType)
    setUploadError(null)
    try {
      const docResult = await connectors.dataverse.createRecord('va_documents', {
        '_va_applicationid_value': applicationId,
        va_documentType: docType,
        va_aiProcessingStatus: 'Pending',
        ...extraFields,
      })
      await connectors.dataverse.uploadFile('va_documents', docResult.id, 'va_filereference', file)
      startPolling(docResult.id)
      return true
    } catch (err) {
      setUploadError(getErrorMessage(err, 'Failed to upload document'))
      return false
    } finally {
      setUploading(null)
    }
  }, [connectors, startPolling])

  return { upload, uploading, uploadError, setUploadError, pollStatus, isPolling, timedOut }
}
