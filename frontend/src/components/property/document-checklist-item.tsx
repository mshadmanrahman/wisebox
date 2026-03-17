"use client"

import { useTranslation } from 'react-i18next'
import { Check, X, Clock, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DocumentType, PropertyDocument } from '@/types'

interface DocumentChecklistItemProps {
  documentType: DocumentType
  uploadedDocument?: PropertyDocument | null
  compact?: boolean
}

type DocStatus = 'uploaded' | 'missing' | 'pending'

export function DocumentChecklistItem({
  documentType,
  uploadedDocument,
  compact = true
}: DocumentChecklistItemProps) {
  const { t } = useTranslation('properties')
  const status: DocStatus = uploadedDocument?.has_document === false
    ? 'missing'
    : uploadedDocument
      ? 'uploaded'
      : 'pending'

  const statusConfig = {
    uploaded: {
      icon: Check,
      bgColor: 'bg-wisebox-status-success/10',
      textColor: 'text-wisebox-status-success',
      borderColor: 'border-wisebox-status-success/20',
      labelKey: 'documents.uploaded',
    },
    missing: {
      icon: X,
      bgColor: 'bg-wisebox-status-danger/10',
      textColor: 'text-wisebox-status-danger',
      borderColor: 'border-wisebox-status-danger/20',
      labelKey: 'documents.missing',
    },
    pending: {
      icon: Clock,
      bgColor: 'bg-card',
      textColor: 'text-muted-foreground',
      borderColor: 'border-border',
      labelKey: 'documents.pending',
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-md border p-2.5 transition-colors duration-200',
          config.bgColor,
          config.borderColor
        )}
      >
        <div className={cn('flex h-5 w-5 items-center justify-center rounded-full', config.bgColor)}>
          <StatusIcon className={cn('h-3 w-3', config.textColor)} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground truncate">
              {documentType.name}
            </span>
            {documentType.category === 'primary' && (
              <Badge
                variant="outline"
                className="h-4 px-1 text-[10px] leading-none bg-primary/10 text-primary border-primary/20"
              >
                {t('documents.primary')}
              </Badge>
            )}
          </div>
          {uploadedDocument?.file_name && status === 'uploaded' && (
            <div className="flex items-center gap-1 mt-0.5">
              <FileText className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-xs text-muted-foreground truncate">
                {uploadedDocument.file_name}
              </span>
            </div>
          )}
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] leading-none h-4 px-1.5',
            status === 'uploaded' && 'bg-wisebox-status-success/10 text-wisebox-status-success border-wisebox-status-success/20',
            status === 'missing' && 'bg-wisebox-status-danger/10 text-wisebox-status-danger border-wisebox-status-danger/20',
            status === 'pending' && 'bg-muted text-muted-foreground border-border'
          )}
        >
          {t(config.labelKey)}
        </Badge>
      </div>
    )
  }

  // Non-compact view (for potential future use)
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 transition-colors duration-200',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', config.bgColor)}>
        <StatusIcon className={cn('h-4 w-4', config.textColor)} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4 className="text-sm font-medium text-foreground">{documentType.name}</h4>
          <Badge
            variant={documentType.category === 'primary' ? 'default' : 'secondary'}
            className={
              documentType.category === 'primary'
                ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10'
                : 'bg-muted text-muted-foreground border-border hover:bg-muted'
            }
          >
            {documentType.category === 'primary' ? t('documents.primary') : t('documents.secondary')}
          </Badge>
          {documentType.is_required && (
            <Badge variant="outline" className="text-wisebox-status-danger border-wisebox-status-danger/20">
              {t('documents.required')}
            </Badge>
          )}
        </div>
        {documentType.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{documentType.description}</p>
        )}
        {uploadedDocument?.file_name && status === 'uploaded' && (
          <div className="flex items-center gap-1.5 mt-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">{uploadedDocument.file_name}</span>
            <Check className="h-3.5 w-3.5 text-wisebox-status-success ml-auto" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <Badge
        variant="outline"
        className={cn(
          'text-xs',
          status === 'uploaded' && 'bg-wisebox-status-success/10 text-wisebox-status-success border-wisebox-status-success/20',
          status === 'missing' && 'bg-wisebox-status-danger/10 text-wisebox-status-danger border-wisebox-status-danger/20',
          status === 'pending' && 'bg-muted text-muted-foreground border-border'
        )}
      >
        {t(config.labelKey)}
      </Badge>
    </div>
  )
}

interface DocumentChecklistProps {
  documentTypes: DocumentType[]
  uploadedDocuments: PropertyDocument[]
  columns?: 1 | 2
}

export function DocumentChecklist({
  documentTypes,
  uploadedDocuments,
  columns = 2
}: DocumentChecklistProps) {
  const { t } = useTranslation('properties')
  const getDocForType = (docTypeId: number): PropertyDocument | null => {
    return uploadedDocuments.find((pd) => pd.document_type_id === docTypeId) ?? null
  }

  const primaryDocs = documentTypes.filter((dt) => dt.category === 'primary')
  const secondaryDocs = documentTypes.filter((dt) => dt.category === 'secondary')

  const uploadedCount = uploadedDocuments.filter((doc) => doc.has_document !== false).length
  const totalCount = documentTypes.length
  const completionPct = totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 0

  const progressColor =
    completionPct >= 80
      ? 'text-wisebox-status-success'
      : completionPct >= 50
        ? 'text-wisebox-status-warning'
        : 'text-wisebox-status-danger'

  const progressBgColor =
    completionPct >= 80
      ? 'bg-wisebox-status-success'
      : completionPct >= 50
        ? 'bg-wisebox-status-warning'
        : 'bg-wisebox-status-danger'

  const gridCols = columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-foreground">{t('documents.documentChecklist')}</h3>
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium', progressColor)}>
            {uploadedCount}/{totalCount}
          </span>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', progressBgColor)}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {primaryDocs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">{t('documents.primaryDocuments')}</h4>
          <div className={cn('grid gap-2', gridCols)}>
            {primaryDocs.map((dt) => (
              <DocumentChecklistItem
                key={dt.id}
                documentType={dt}
                uploadedDocument={getDocForType(dt.id)}
              />
            ))}
          </div>
        </div>
      )}

      {secondaryDocs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">{t('documents.secondaryDocuments')}</h4>
          <div className={cn('grid gap-2', gridCols)}>
            {secondaryDocs.map((dt) => (
              <DocumentChecklistItem
                key={dt.id}
                documentType={dt}
                uploadedDocument={getDocForType(dt.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
