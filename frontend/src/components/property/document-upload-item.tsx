'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
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
      setError(axiosErr.response?.data?.message || 'Upload failed. Please try again.');
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
      setError(axiosErr.response?.data?.message || 'Could not mark as missing.');
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
  documentType.accepted_formats.forEach((fmt) => {
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
        setError(`File exceeds ${documentType.max_file_size_mb}MB limit.`);
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setError(`Accepted formats: ${documentType.accepted_formats.join(', ')}`);
      } else {
        setError('File rejected. Check format and size.');
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
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-medium text-gray-900">{documentType.name}</h4>
            <Badge
              variant={documentType.category === 'primary' ? 'default' : 'secondary'}
              className={
                documentType.category === 'primary'
                  ? 'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100'
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100'
              }
            >
              {documentType.category === 'primary' ? 'Primary' : 'Secondary'}
            </Badge>
            {documentType.is_required && (
              <Badge variant="outline" className="text-red-600 border-red-200">
                Required
              </Badge>
            )}
          </div>
          {documentType.description && (
            <p className="text-xs text-gray-500 mt-1">{documentType.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            Score weight: {documentType.score_weight} | Max: {documentType.max_file_size_mb}MB |
            Formats: {documentType.accepted_formats.join(', ')}
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <Info className="h-4 w-4 text-gray-400" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{documentType.name}</DialogTitle>
              <DialogDescription>
                {documentType.guidance_text || 'No additional guidance available for this document type.'}
              </DialogDescription>
            </DialogHeader>
            {documentType.missing_guidance && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  <strong>If you don&apos;t have this:</strong> {documentType.missing_guidance}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {state === 'idle' && !showDropzone && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-teal-300 text-teal-700 hover:bg-teal-50"
            onClick={handleHaveThis}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            I have this
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
            onClick={handleDontHaveThis}
            disabled={markMissingMutation.isPending}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            I don&apos;t have this
          </Button>
        </div>
      )}

      {(state === 'idle' || state === 'uploading') && showDropzone && (
        <div className="space-y-2">
          <div
            {...getRootProps()}
            className={`
              flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors
              ${isDragActive ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-300 hover:bg-gray-50'}
              ${state === 'uploading' ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            {isDragActive ? (
              <p className="text-sm text-teal-600 font-medium">Drop file here</p>
            ) : (
              <p className="text-sm text-gray-500">
                Drop file here or <span className="text-teal-600 font-medium">click to browse</span>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {documentType.accepted_formats.join(', ').toUpperCase()} up to {documentType.max_file_size_mb}MB
            </p>
          </div>

          {state === 'uploading' && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-right">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}

      {state === 'uploaded' && (
        <div className="flex items-center justify-between rounded-md bg-green-50 border border-green-200 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-green-600 shrink-0" />
            <span className="text-sm text-green-800 truncate">
              {uploadedDocument?.file_name || 'Document uploaded'}
            </span>
            <Check className="h-4 w-4 text-green-600 shrink-0" />
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-gray-500 hover:text-teal-600"
              onClick={handleReplace}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Replace
            </Button>
          </div>
        </div>
      )}

      {state === 'missing' && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-amber-800">Marked as missing</p>
              {documentType.missing_guidance && (
                <p className="text-xs text-amber-700 mt-0.5">{documentType.missing_guidance}</p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-teal-300 text-teal-700 hover:bg-teal-50"
            onClick={handleFoundIt}
          >
            I found it
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
