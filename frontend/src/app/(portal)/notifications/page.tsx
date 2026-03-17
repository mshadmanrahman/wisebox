'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['notifications', 'common']);
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
    t('common:tryAgain');

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('notifications:title')}</h1>
          <p className="text-muted-foreground mt-1">{t('notifications:subtitle')}</p>
          {isFetching && hasData && (
            <p className="text-xs text-muted-foreground mt-1">{t('notifications:refreshing')}</p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => markAllMutation.mutate()}
          disabled={unreadCount === 0 || markAllMutation.isPending}
          className="border border-border hover:bg-muted transition-all duration-200"
        >
          <CheckCheck className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
          {t('notifications:markAllAsRead')}
        </Button>
      </div>

      <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
        <CardContent className="pt-6 grid gap-3 md:grid-cols-3">
          <Select value={statusFilter} onValueChange={(value: 'all' | 'read' | 'unread') => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('notifications:filters.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('notifications:filters.allStatuses')}</SelectItem>
              <SelectItem value="unread">{t('notifications:filters.unreadOnly')}</SelectItem>
              <SelectItem value="read">{t('notifications:filters.readOnly')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('notifications:filters.type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('notifications:filters.allTypes')}</SelectItem>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('notifications:filters.searchPlaceholder')}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {isError && !hasData ? (
        <Card className="border-destructive/20 bg-destructive/10 rounded-xl">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-destructive font-medium">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
              {t('notifications:couldNotLoad')}
            </div>
            <p className="text-sm text-destructive/90">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="border border-border hover:bg-muted transition-all duration-200">
              {isFetching ? t('common:retrying') : t('common:retry')}
            </Button>
          </CardContent>
        </Card>
      ) : isLoading && !hasData ? (
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 text-sm text-muted-foreground">{t('notifications:loadingNotifications')}</CardContent>
        </Card>
      ) : isError && hasData ? (
        <Card className="border-wisebox-status-warning/20 bg-wisebox-status-warning/10 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-wisebox-status-warning">
              {t('common:showingStaleData')} {errorMessage}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="border border-border hover:bg-muted transition-all duration-200">
              {isFetching ? t('common:retrying') : t('common:retry')}
            </Button>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-10 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <Bell className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-medium text-foreground">{t('notifications:empty.title')}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('notifications:empty.description')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground">{t('notifications:allNotifications')}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('notifications:unreadCount', { count: unreadCount })}
              {meta ? ` • ${t('notifications:resultCount', { count: meta.total })}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 transition-all duration-200 ${
                  notification.read_at
                    ? 'border-border bg-card'
                    : 'border-primary/20 bg-primary/5'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{notification.title}</p>
                      {!notification.read_at && <Badge className="bg-primary text-primary-foreground">{t('notifications:badge.unread')}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{notification.type}</p>
                    {notification.body && <p className="text-sm text-muted-foreground leading-relaxed">{notification.body}</p>}
                    <p className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                  </div>

                  {!notification.read_at && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markReadMutation.mutate(notification.id)}
                      disabled={markReadMutation.isPending}
                      className="transition-all duration-200"
                    >
                      {t('notifications:markRead')}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {t('common:page', { current: meta.current_page, total: meta.last_page })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={meta.current_page <= 1}
                    className="border border-border hover:bg-muted transition-all duration-200"
                  >
                    {t('common:previous')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))}
                    disabled={meta.current_page >= meta.last_page}
                    className="border border-border hover:bg-muted transition-all duration-200"
                  >
                    {t('common:next')}
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
