'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DocumentInfoModal } from '@/components/property/document-info-modal';
import {
  Upload,
  Check,
  X,
  Info,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { DocumentType, PropertyDocument } from '@/types';

interface DocumentUploadItemProps {
  documentType: DocumentType;
  uploadedDocument?: PropertyDocument | null;
  propertyId: number;
  onUploadComplete: () => void;
}

type ItemState = 'idle' | 'uploading' | 'uploaded' | 'missing';

export function DocumentUploadItem({
  documentType,
  uploadedDocument,
  propertyId,
  onUploadComplete,
}: DocumentUploadItemProps) {
  const rawAcceptedFormats = documentType.accepted_formats as unknown;
  const acceptedFormats: string[] = (() => {
    if (Array.isArray(rawAcceptedFormats)) {
      return rawAcceptedFormats
        .map((fmt) => String(fmt).trim().toLowerCase())
        .filter(Boolean);
    }

    if (typeof rawAcceptedFormats === 'string') {
      const trimmed = rawAcceptedFormats.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((fmt) => String(fmt).trim().toLowerCase())
            .filter(Boolean);
        }
      } catch {
        // Not JSON; fall back to comma-separated values.
      }

      return trimmed
        .split(',')
        .map((fmt) => fmt.trim().toLowerCase())
        .filter(Boolean);
    }

    return [];
  })();

  const { t } = useTranslation('properties');
  const [infoOpen, setInfoOpen] = useState(false);
  const [state, setState] = useState<ItemState>(
    uploadedDocument?.has_document === false
      ? 'missing'
      : uploadedDocument
        ? 'uploaded'
        : 'idle'
  );
  const [showDropzone, setShowDropzone] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document_type_id', documentType.id.toString());
      formData.append('file', file);

      const res = await api.post(
        `/properties/${propertyId}/documents`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(pct);
            }
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      setState('uploaded');
      setShowDropzone(false);
      setUploadProgress(0);
      setError(null);
      onUploadComplete();
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || t('documents.uploadFailed'));
      setUploadProgress(0);
    },
  });

  const markMissingMutation = useMutation({
    mutationFn: async () => {
      await api.post(
        `/properties/${propertyId}/documents/${documentType.id}/mark-missing`
      );
    },
    onSuccess: () => {
      setState('missing');
      setShowDropzone(false);
      setError(null);
      onUploadComplete();
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || t('documents.couldNotMarkMissing'));
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setError(null);
      setState('uploading');
      uploadMutation.mutate(acceptedFiles[0]);
    },
    [uploadMutation]
  );

  const acceptMap: Record<string, string[]> = {};
  acceptedFormats.forEach((fmt) => {
    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const mime = mimeMap[fmt.toLowerCase()];
    if (mime) {
      acceptMap[mime] = acceptMap[mime] || [];
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(acceptMap).length > 0 ? acceptMap : undefined,
    maxSize: documentType.max_file_size_mb * 1024 * 1024,
    maxFiles: 1,
    disabled: state === 'uploading',
    onDropRejected: (rejections) => {
      const rejection = rejections[0];
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setError(t('documents.fileExceedsLimit', { size: documentType.max_file_size_mb }));
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setError(t('documents.acceptedFormats', { formats: acceptedFormats.join(', ') || 'pdf, jpg, png, doc, docx' }));
      } else {
        setError(t('documents.fileRejected'));
      }
    },
  });

  const handleHaveThis = () => {
    setShowDropzone(true);
    setError(null);
  };

  const handleDontHaveThis = () => {
    markMissingMutation.mutate();
  };

  const handleFoundIt = () => {
    setState('idle');
    setShowDropzone(true);
    setError(null);
  };

  const handleReplace = () => {
    setState('idle');
    setShowDropzone(true);
    setError(null);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
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
              <Badge variant="outline" className="text-wisebox-status-danger border-wisebox-status-danger/30">
                {t('documents.required')}
              </Badge>
            )}
          </div>
          {documentType.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{documentType.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {t('documents.scoreWeight', {
              weight: documentType.score_weight,
              size: documentType.max_file_size_mb,
              formats: acceptedFormats.join(', ') || t('documents.notSpecified'),
            })}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 transition-all duration-200"
          onClick={() => setInfoOpen(true)}
        >
          <Info className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        </Button>
        <DocumentInfoModal
          slug={documentType.slug}
          documentTypeName={documentType.name}
          open={infoOpen}
          onOpenChange={setInfoOpen}
        />
      </div>

      {state === 'idle' && !showDropzone && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-primary/40 text-primary hover:bg-primary/10 transition-all duration-200"
            onClick={handleHaveThis}
          >
            <Check className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
            {t('documents.iHaveThis')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border text-muted-foreground hover:bg-muted transition-all duration-200"
            onClick={handleDontHaveThis}
            disabled={markMissingMutation.isPending}
          >
            <X className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
            {t('documents.iDontHaveThis')}
          </Button>
        </div>
      )}

      {(state === 'idle' || state === 'uploading') && showDropzone && (
        <div className="space-y-2">
          <div
            {...getRootProps()}
            className={`
              flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors duration-200
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary hover:bg-muted'}
              ${state === 'uploading' ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 text-muted-foreground mb-2" strokeWidth={1.5} />
            {isDragActive ? (
              <p className="text-sm text-primary font-medium">{t('documents.dropHere')}</p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('documents.dropFileOrBrowse', { defaultValue: 'Drop file here or click to browse' })}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {t('documents.fileFormats', {
                formats: acceptedFormats.join(', ').toUpperCase() || 'PDF, JPG, PNG, DOC, DOCX',
                size: documentType.max_file_size_mb,
              })}
            </p>
          </div>

          {state === 'uploading' && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
            </div>
          )}

          {state === 'idle' && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-wisebox-status-warning transition-all duration-200"
                onClick={handleDontHaveThis}
                disabled={markMissingMutation.isPending}
              >
                {t('documents.actuallyDontHave')}
              </Button>
            </div>
          )}
        </div>
      )}

      {state === 'uploaded' && (
        <div className="flex items-center justify-between rounded-md bg-wisebox-status-success/10 border border-wisebox-status-success/20 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-wisebox-status-success shrink-0" strokeWidth={1.5} />
            <span className="text-sm text-wisebox-status-success truncate">
              {uploadedDocument?.file_name || t('documents.documentUploaded')}
            </span>
            <Check className="h-4 w-4 text-wisebox-status-success shrink-0" strokeWidth={1.5} />
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-primary transition-all duration-200"
              onClick={handleReplace}
            >
              <RefreshCw className="h-3 w-3 mr-1" strokeWidth={1.5} />
              {t('documents.replace')}
            </Button>
          </div>
        </div>
      )}

      {state === 'missing' && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-md bg-wisebox-status-warning/10 border border-wisebox-status-warning/20 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-wisebox-status-warning mt-0.5 shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-wisebox-status-warning">{t('documents.markedAsMissing')}</p>
              {documentType.missing_guidance && (
                <p className="text-xs text-wisebox-status-warning mt-0.5 leading-relaxed">{documentType.missing_guidance}</p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-primary/40 text-primary hover:bg-primary/10 transition-all duration-200"
            onClick={handleFoundIt}
          >
            {t('documents.iFoundIt')}
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-wisebox-status-danger flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          {error}
        </p>
      )}
    </div>
  );
}
