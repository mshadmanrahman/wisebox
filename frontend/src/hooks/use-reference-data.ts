import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PropertyType, OwnershipStatus, OwnershipType, DocumentType, ApiResponse } from '@/types';

export function usePropertyTypes() {
  return useQuery({
    queryKey: ['reference', 'property-types'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PropertyType[]>>('/property-types');
      return data.data;
    },
    staleTime: Infinity,
  });
}

export function useOwnershipStatuses() {
  return useQuery({
    queryKey: ['reference', 'ownership-statuses'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<OwnershipStatus[]>>('/ownership-statuses');
      return data.data;
    },
    staleTime: Infinity,
  });
}

export function useOwnershipTypes() {
  return useQuery({
    queryKey: ['reference', 'ownership-types'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<OwnershipType[]>>('/ownership-types');
      return data.data;
    },
    staleTime: Infinity,
  });
}

export function useDocumentTypes() {
  return useQuery({
    queryKey: ['reference', 'document-types'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DocumentType[]>>('/document-types');
      return data.data;
    },
    staleTime: Infinity,
  });
}
