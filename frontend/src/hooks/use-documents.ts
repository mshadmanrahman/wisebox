import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { DocumentType, PropertyDocument, ApiResponse } from '@/types';

interface PropertyDocumentsResponse {
  document_types: DocumentType[];
  uploaded: PropertyDocument[];
}

export function usePropertyDocuments(propertyId: number) {
  return useQuery({
    queryKey: ['properties', propertyId, 'documents'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PropertyDocumentsResponse>>(
        `/properties/${propertyId}/documents`
      );
      return data.data;
    },
    enabled: propertyId > 0,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      documentTypeId,
      file,
    }: {
      propertyId: number;
      documentTypeId: number;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append('document_type_id', String(documentTypeId));
      formData.append('file', file);

      const { data } = await api.post<ApiResponse<PropertyDocument>>(
        `/properties/${propertyId}/documents`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['properties', variables.propertyId, 'documents'],
      });
      queryClient.invalidateQueries({
        queryKey: ['properties', variables.propertyId],
      });
      toast({ title: 'Document uploaded' });
    },
    onError: () => {
      toast({ title: 'Failed to upload document', variant: 'destructive' });
    },
  });
}

export function useMarkDocumentMissing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      documentTypeId,
    }: {
      propertyId: number;
      documentTypeId: number;
    }) => {
      const { data } = await api.post<ApiResponse<PropertyDocument>>(
        `/properties/${propertyId}/documents/${documentTypeId}/mark-missing`
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['properties', variables.propertyId, 'documents'],
      });
      toast({ title: 'Document marked as missing' });
    },
    onError: () => {
      toast({ title: 'Failed to mark document', variant: 'destructive' });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      documentId,
    }: {
      propertyId: number;
      documentId: number;
    }) => {
      await api.delete(`/properties/${propertyId}/documents/${documentId}`);
      return { propertyId, documentId };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['properties', variables.propertyId, 'documents'],
      });
      queryClient.invalidateQueries({
        queryKey: ['properties', variables.propertyId],
      });
      toast({ title: 'Document removed' });
    },
    onError: () => {
      toast({ title: 'Failed to remove document', variant: 'destructive' });
    },
  });
}
