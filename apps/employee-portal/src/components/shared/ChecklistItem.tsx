import type { DocumentChecklist } from '@/types'

interface ChecklistItemProps {
  item: DocumentChecklist
  onUpload: (itemType: string) => void
  uploading?: boolean
  children?: React.ReactNode  // Optional: AI extraction display rendered below header
}

export function ChecklistItem({ item, onUpload, uploading, children }: ChecklistItemProps) {
  const satisfied = item.va_isSatisfied === true
  const failed = item.va_validationNote && !satisfied

  const itemClass = [
    'checklist-item',
    satisfied ? 'satisfied' : '',
    failed ? 'failed' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={itemClass}>
      <div className="checklist-item-header">
        <span className="validation-icon">
          {satisfied ? '✅' : failed ? '❌' : '⬜'}
        </span>
        <span>{item.va_name}</span>
        {item.va_isRequired && !satisfied && (
          <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>Required</span>
        )}
        {satisfied && (
          <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Verified</span>
        )}
      </div>

      {item.va_validationNote && (
        <div className={`alert ${satisfied ? 'alert-success' : 'alert-warning'}`}>
          {item.va_validationNote}
        </div>
      )}

      {children}

      {!satisfied && (
        <button
          className="btn btn-secondary"
          onClick={() => onUpload(item.va_checklistItemType ?? '')}
          disabled={uploading}
          style={{ alignSelf: 'flex-start' }}
        >
          {uploading ? (
            <><span className="spinner-icon" /> Uploading…</>
          ) : (
            '↑ Upload Document'
          )}
        </button>
      )}
    </div>
  )
}
