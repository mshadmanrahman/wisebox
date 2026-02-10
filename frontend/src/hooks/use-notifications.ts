import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { ApiResponse, Notification, PaginatedResponse } from '@/types';

interface UnreadCountResponse {
  unread_count: number;
}

export function useNotifications(perPage = 20) {
  return useQuery({
    queryKey: ['notifications', perPage],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Notification>>('/notifications', {
        params: { per_page: perPage },
      });
      return response.data;
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
