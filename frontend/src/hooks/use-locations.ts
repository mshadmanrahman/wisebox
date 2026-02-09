import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Division, District, Upazila, Mouza, ApiResponse } from '@/types';

export function useDivisions() {
  return useQuery({
    queryKey: ['locations', 'divisions'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Division[]>>('/locations/divisions');
      return data.data;
    },
    staleTime: Infinity,
  });
}

export function useDistricts(divisionId?: number) {
  return useQuery({
    queryKey: ['locations', 'districts', divisionId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<District[]>>(
        `/locations/districts?division_id=${divisionId}`
      );
      return data.data;
    },
    enabled: !!divisionId,
    staleTime: Infinity,
  });
}

export function useUpazilas(districtId?: number) {
  return useQuery({
    queryKey: ['locations', 'upazilas', districtId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Upazila[]>>(
        `/locations/upazilas?district_id=${districtId}`
      );
      return data.data;
    },
    enabled: !!districtId,
    staleTime: Infinity,
  });
}

export function useMouzas(upazilaId?: number) {
  return useQuery({
    queryKey: ['locations', 'mouzas', upazilaId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Mouza[]>>(
        `/locations/mouzas?upazila_id=${upazilaId}`
      );
      return data.data;
    },
    enabled: !!upazilaId,
    staleTime: Infinity,
  });
}
