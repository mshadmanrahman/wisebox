'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-notifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Notification } from '@/types';

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications(100);
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-wisebox-text-primary">Notification Center</h1>
          <p className="text-wisebox-text-secondary mt-1">Track assignments, ticket updates, and order events.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllMutation.mutate()}
          disabled={unreadCount === 0 || markAllMutation.isPending}
        >
          <CheckCheck className="h-4 w-4 mr-1.5" />
          Mark all as read
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">Loading notifications...</CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-wisebox-primary-50 text-wisebox-primary-600 flex items-center justify-center">
              <Bell className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-wisebox-text-primary">You’re all caught up</h2>
            <p className="text-sm text-wisebox-text-secondary">No notifications available right now.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All notifications</CardTitle>
            <CardDescription>{unreadCount} unread notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 transition-colors ${
                  notification.read_at
                    ? 'border-gray-200 bg-white'
                    : 'border-wisebox-primary-200 bg-wisebox-primary-50/40'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-wisebox-text-primary">{notification.title}</p>
                      {!notification.read_at && (
                        <Badge className="bg-wisebox-primary-500 text-white">Unread</Badge>
                      )}
                    </div>
                    {notification.body && (
                      <p className="text-sm text-wisebox-text-secondary">{notification.body}</p>
                    )}
                    <p className="text-xs text-wisebox-text-secondary">{formatDate(notification.created_at)}</p>
                  </div>

                  {!notification.read_at && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markReadMutation.mutate(notification.id)}
                      disabled={markReadMutation.isPending}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
