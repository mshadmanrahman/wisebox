import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { ApiResponse, Notification, PaginatedResponse } from '@/types';

interface UnreadCountResponse {
  unread_count: number;
}

export interface NotificationsQueryOptions {
  page?: number;
  perPage?: number;
  status?: 'read' | 'unread';
  type?: string;
  q?: string;
}

export function useNotifications(options: number | NotificationsQueryOptions = 20) {
  const normalized =
    typeof options === 'number'
      ? { perPage: options }
      : {
          page: options.page,
          perPage: options.perPage ?? 20,
          status: options.status,
          type: options.type,
          q: options.q,
        };

  return useQuery({
    queryKey: ['notifications', normalized],
    placeholderData: keepPreviousData,
    retry: 2,
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Notification> & {
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
        from?: number | null;
        to?: number | null;
        first_page_url?: string;
        last_page_url?: string;
        prev_page_url?: string | null;
        next_page_url?: string | null;
      }>('/notifications', {
        params: {
          page: normalized.page,
          per_page: normalized.perPage,
          status: normalized.status,
          type: normalized.type,
          q: normalized.q,
        },
      });
      const payload = response.data;

      if ('meta' in payload && payload.meta) {
        return payload;
      }

      return {
        data: payload.data,
        meta: {
          current_page: payload.current_page ?? 1,
          from: payload.from ?? 0,
          last_page: payload.last_page ?? 1,
          per_page: payload.per_page ?? normalized.perPage ?? 20,
          to: payload.to ?? 0,
          total: payload.total ?? payload.data.length,
        },
        links: {
          first: payload.first_page_url ?? '',
          last: payload.last_page_url ?? '',
          prev: payload.prev_page_url ?? null,
          next: payload.next_page_url ?? null,
        },
      } satisfies PaginatedResponse<Notification>;
    },
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<UnreadCountResponse>>('/notifications/unread-count');
      return response.data.data.unread_count;
    },
    staleTime: 15 * 1000,
    retry: 2,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.patch<ApiResponse<Notification>>(`/notifications/${notificationId}/read`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast({
        title: 'Could not mark notification as read',
        variant: 'destructive',
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.patch<ApiResponse<{ marked_count: number }>>('/notifications/read-all');
      return response.data.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Notifications updated',
        description: `${result.marked_count} notification(s) marked as read.`,
      });
    },
    onError: () => {
      toast({
        title: 'Could not update notifications',
        variant: 'destructive',
      });
    },
  });
}
