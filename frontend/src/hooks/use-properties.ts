import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type {
  Property,
  PropertyStatus,
  CreatePropertyData,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

interface UsePropertiesParams {
  page?: number;
  status?: PropertyStatus;
}

export function useProperties(params?: UsePropertiesParams) {
  return useQuery({
    queryKey: ['properties', params?.page ?? 1, params?.status ?? 'all'],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.status) searchParams.set('status', params.status);
      const query = searchParams.toString();
      const url = query ? `/properties?${query}` : '/properties';
      const { data } = await api.get<PaginatedResponse<Property>>(url);
      return data;
    },
  });
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Property>>(`/properties/${id}`);
      return data.data;
    },
    enabled: id > 0,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePropertyData) => {
      const { data } = await api.post<ApiResponse<Property>>('/properties', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({ title: 'Property created' });
    },
    onError: () => {
      toast({ title: 'Failed to create property', variant: 'destructive' });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<CreatePropertyData> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Property>>(`/properties/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties', data.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({ title: 'Property updated' });
    },
    onError: () => {
      toast({ title: 'Failed to update property', variant: 'destructive' });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/properties/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({ title: 'Property deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete property', variant: 'destructive' });
    },
  });
}

export function useSaveDraft(propertyId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draftData: Record<string, unknown>) => {
      const { data } = await api.put<ApiResponse<Property>>(
        `/properties/${propertyId}/draft`,
        draftData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', propertyId] });
    },
    onError: () => {
      toast({ title: 'Failed to save draft', variant: 'destructive' });
    },
  });
}
