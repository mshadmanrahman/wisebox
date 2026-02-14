'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, CheckCheck, Search } from 'lucide-react';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount,
} from '@/hooks/use-notifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Notification } from '@/types';

const TYPE_OPTIONS = [
  'ticket.assigned',
  'ticket.status.updated',
  'ticket.comment.added',
  'order.paid',
  'order.failed',
  'order.refunded',
];

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export default function NotificationsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, query]);

  const listParams = useMemo(
    () => ({
      page,
      perPage: 10,
      status: statusFilter === 'all' ? undefined : statusFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
      q: query.trim() || undefined,
    }),
    [page, statusFilter, typeFilter, query]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useNotifications(listParams);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const hasData = Boolean(data);
  const notifications = data?.data ?? [];
  const meta = data?.meta;
  const errorMessage =
    (error as { response?: { data?: { message?: string } }; message?: string } | null)?.response?.data?.message ||
    (error as { message?: string } | null)?.message ||
    'Please try again in a moment.';

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-wisebox-text-primary">Notification Center</h1>
          <p className="text-wisebox-text-secondary mt-1">Track assignments, ticket updates, and order events.</p>
          {isFetching && hasData && (
            <p className="text-xs text-wisebox-text-secondary mt-1">Refreshing notifications...</p>
          )}
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

      <Card>
        <CardContent className="pt-6 grid gap-3 md:grid-cols-3">
          <Select value={statusFilter} onValueChange={(value: 'all' | 'read' | 'unread') => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="unread">Unread only</SelectItem>
              <SelectItem value="read">Read only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-wisebox-text-secondary" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or body"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {isError && !hasData ? (
        <Card className="border-red-200 bg-red-50/60">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Could not load notifications.
            </div>
            <p className="text-sm text-red-700/90">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      ) : isLoading && !hasData ? (
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">Loading notifications...</CardContent>
        </Card>
      ) : isError && hasData ? (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-amber-800">
              Showing previously loaded notifications. {errorMessage}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-wisebox-primary-50 text-wisebox-primary-600 flex items-center justify-center">
              <Bell className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-wisebox-text-primary">No matching notifications</h2>
            <p className="text-sm text-wisebox-text-secondary">Try changing your filters or search query.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All notifications</CardTitle>
            <CardDescription>
              {unreadCount} unread in total
              {meta ? ` • ${meta.total} result(s)` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 transition-colors ${
                  notification.read_at
                    ? 'border-wisebox-border bg-wisebox-background-card'
                    : 'border-wisebox-primary-200 bg-wisebox-primary-50/40'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-wisebox-text-primary">{notification.title}</p>
                      {!notification.read_at && <Badge className="bg-wisebox-primary-500 text-white">Unread</Badge>}
                    </div>
                    <p className="text-xs text-wisebox-text-secondary uppercase tracking-wide">{notification.type}</p>
                    {notification.body && <p className="text-sm text-wisebox-text-secondary">{notification.body}</p>}
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

            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-wisebox-text-secondary">
                  Page {meta.current_page} of {meta.last_page}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={meta.current_page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))}
                    disabled={meta.current_page >= meta.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
