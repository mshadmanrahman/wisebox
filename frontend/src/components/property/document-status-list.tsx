'use client';

import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  CheckCircle2,
  Minus,
  Upload,
  FileUp,
  Loader2,
  Trash2,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type {
  ApiResponse,
  DocumentType,
  PropertyDocument,
} from '@/types';

interface DocumentStatusListProps {
  propertyId: number;
  ownershipStatusSlug?: string;
  completionPercentage: number;
  completionStatus: 'red' | 'yellow' | 'green';
}

interface DocumentsResponse {
  document_types: DocumentType[];
  uploaded: PropertyDocument[];
}

const docStatusConfig: Record<
  PropertyDocument['status'],
  { label: string; className: string }
> = {
  uploaded: {
    label: 'Uploaded',
    className: 'bg-blue-100 text-blue-700',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-amber-100 text-amber-700',
  },
  verified: {
    label: 'Verified',
    className: 'bg-green-100 text-green-700',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700',
  },
};

function completionBarColor(status: 'red' | 'yellow' | 'green'): string {
  if (status === 'green') return 'bg-wisebox-status-success';
  if (status === 'yellow') return 'bg-wisebox-status-warning';
  return 'bg-wisebox-status-danger';
}

function completionTextColor(status: 'red' | 'yellow' | 'green'): string {
  if (status === 'green') return 'text-wisebox-status-success';
  if (status === 'yellow') return 'text-wisebox-status-warning';
  return 'text-wisebox-status-danger';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentStatusList({
  propertyId,
  ownershipStatusSlug,
  completionPercentage,
  completionStatus,
}: DocumentStatusListProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['property-documents', propertyId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DocumentsResponse>>(
        `/properties/${propertyId}/documents`
      );
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/3 rounded bg-gray-200" />
            <div className="h-2 w-full rounded bg-gray-200" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full rounded bg-gray-100" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-red-600">
            Failed to load documents. Please refresh the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { document_types, uploaded } = data;

  const uploadedByType = new Map<number, PropertyDocument>();
  for (const doc of uploaded) {
    uploadedByType.set(doc.document_type_id, doc);
  }

  const filteredTypes = document_types.filter((dt) => {
    if (!dt.conditional_on_ownership) return true;
    if (!ownershipStatusSlug) return false;
    return dt.conditional_on_ownership === ownershipStatusSlug;
  });

  const primaryTypes = filteredTypes.filter((dt) => dt.category === 'primary');
  const secondaryTypes = filteredTypes.filter(
    (dt) => dt.category === 'secondary'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Completion bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Document Completion</span>
            <span
              className={cn('font-semibold', completionTextColor(completionStatus))}
            >
              {completionPercentage}%
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                completionBarColor(completionStatus)
              )}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Primary Documents */}
        {primaryTypes.length > 0 && (
          <DocumentSection
            title="Primary Documents"
            types={primaryTypes}
            uploadedByType={uploadedByType}
            propertyId={propertyId}
            queryClient={queryClient}
          />
        )}

        {/* Secondary Documents */}
        {secondaryTypes.length > 0 && (
          <>
            <Separator />
            <DocumentSection
              title="Secondary Documents"
              types={secondaryTypes}
              uploadedByType={uploadedByType}
              propertyId={propertyId}
              queryClient={queryClient}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface DocumentSectionProps {
  title: string;
  types: DocumentType[];
  uploadedByType: Map<number, PropertyDocument>;
  propertyId: number;
  queryClient: ReturnType<typeof useQueryClient>;
}

function DocumentSection({
  title,
  types,
  uploadedByType,
  propertyId,
  queryClient,
}: DocumentSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="space-y-2">
        {types.map((docType) => {
          const uploaded = uploadedByType.get(docType.id);
          return (
            <DocumentRow
              key={docType.id}
              docType={docType}
              uploaded={uploaded}
              propertyId={propertyId}
              queryClient={queryClient}
            />
          );
        })}
      </div>
    </div>
  );
}

interface DocumentRowProps {
  docType: DocumentType;
  uploaded?: PropertyDocument;
  propertyId: number;
  queryClient: ReturnType<typeof useQueryClient>;
}

function DocumentRow({
  docType,
  uploaded,
  propertyId,
  queryClient,
}: DocumentRowProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document_type_id', String(docType.id));
      formData.append('file', file);
      return api.post(`/properties/${propertyId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      setUploadError(null);
      queryClient.invalidateQueries({
        queryKey: ['property-documents', propertyId],
      });
      queryClient.invalidateQueries({
        queryKey: ['property', propertyId],
      });
    },
    onError: () => {
      setUploadError('Upload failed. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return api.delete(`/properties/${propertyId}/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['property-documents', propertyId],
      });
      queryClient.invalidateQueries({
        queryKey: ['property', propertyId],
      });
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setUploadError(null);
        uploadMutation.mutate(acceptedFiles[0]);
      }
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: docType.max_file_size_mb * 1024 * 1024,
    accept: docType.accepted_formats.reduce(
      (acc, format) => {
        const mimeMap: Record<string, string> = {
          pdf: 'application/pdf',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          doc: 'application/msword',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        const mime = mimeMap[format.toLowerCase()];
        if (mime) acc[mime] = [];
        return acc;
      },
      {} as Record<string, string[]>
    ),
    disabled: uploadMutation.isPending,
  });

  const statusBadge = uploaded ? docStatusConfig[uploaded.status] : null;

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          {uploaded ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-wisebox-status-success" />
          ) : (
            <Minus className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium">{docType.name}</p>
            {docType.guidance_text && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {docType.guidance_text}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {docType.score_weight} pts
        </span>
      </div>

      {uploaded && (
        <div className="ml-6 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate text-muted-foreground">
              {uploaded.file_name}
            </span>
            <span className="text-muted-foreground shrink-0">
              ({formatFileSize(uploaded.file_size)})
            </span>
            <span className="text-muted-foreground shrink-0">
              {formatDate(uploaded.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {statusBadge && (
              <Badge
                variant="secondary"
                className={cn('text-[10px]', statusBadge.className)}
              >
                {statusBadge.label}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-red-600"
              onClick={() => deleteMutation.mutate(uploaded.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {!uploaded && (
        <div className="ml-6">
          <div
            {...getRootProps()}
            className={cn(
              'flex items-center gap-2 rounded-md border border-dashed p-2 text-xs cursor-pointer transition-colors',
              isDragActive
                ? 'border-wisebox-primary bg-wisebox-primary-50'
                : 'border-gray-300 hover:border-wisebox-primary hover:bg-gray-50'
            )}
          >
            <input {...getInputProps()} />
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-wisebox-primary" />
                <span className="text-muted-foreground">Uploading...</span>
              </>
            ) : isDragActive ? (
              <>
                <FileUp className="h-3.5 w-3.5 text-wisebox-primary" />
                <span className="text-wisebox-primary">Drop file here</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Click or drag to upload (max {docType.max_file_size_mb}MB)
                </span>
              </>
            )}
          </div>
          {uploadError && (
            <p className="text-xs text-red-600 mt-1">{uploadError}</p>
          )}
        </div>
      )}
    </div>
  );
}
