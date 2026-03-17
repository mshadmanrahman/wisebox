'use client';

import Link from 'next/link';
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PaginatedResponse, Ticket, TicketStatus } from '@/types';

function statusBadgeClass(status: Ticket['status']): string {
  if (status === 'completed') return 'bg-wisebox-status-success/20 text-wisebox-status-success';
  if (status === 'in_progress' || status === 'assigned') return 'bg-wisebox-status-info/20 text-wisebox-status-info';
  if (status === 'scheduled') return 'bg-wisebox-status-scheduled/20 text-wisebox-status-scheduled';
  if (status === 'cancelled') return 'bg-muted text-muted-foreground';
  return 'bg-wisebox-status-warning/20 text-wisebox-status-warning';
}

export default function TicketsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation(['tickets', 'common']);
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isConsultant = user?.role === 'consultant';

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['tickets', statusFilter, assignedFilter],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Ticket>>('/tickets', {
        params: {
          status: statusFilter === 'all' ? undefined : statusFilter,
          assigned: isAdmin && assignedFilter !== 'all' ? assignedFilter : undefined,
        },
      });
      return res.data;
    },
    retry: 2,
  });

  const hasData = Boolean(data);
  const tickets = data?.data ?? [];
  const errorMessage =
    (error as { response?: { data?: { message?: string } }; message?: string } | null)?.response?.data?.message ||
    (error as { message?: string } | null)?.message ||
    t('common:tryAgain');

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('tickets:title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {isConsultant
              ? t('tickets:subtitleConsultant')
              : t('tickets:subtitleCustomer')}
          </p>
          {isFetching && hasData && (
            <p className="text-xs text-muted-foreground mt-1">{t('tickets:refreshing')}</p>
          )}
        </div>
        <Button asChild variant="outline" className="border border-border hover:bg-muted transition-all duration-200">
          <Link href="/orders">{t('tickets:viewOrders')}</Link>
        </Button>
      </div>

      <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
        <CardContent className="pt-6 space-y-4">
          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as 'all' | TicketStatus)}
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 lg:grid-cols-7">
              <TabsTrigger value="all">{t('tickets:tabs.all')}</TabsTrigger>
              <TabsTrigger value="open">{t('tickets:tabs.open')}</TabsTrigger>
              <TabsTrigger value="assigned">{t('tickets:tabs.assigned')}</TabsTrigger>
              <TabsTrigger value="in_progress">{t('tickets:tabs.in_progress')}</TabsTrigger>
              <TabsTrigger value="awaiting_customer">{t('tickets:tabs.awaiting_customer')}</TabsTrigger>
              <TabsTrigger value="awaiting_consultant">{t('tickets:tabs.awaiting_consultant')}</TabsTrigger>
              <TabsTrigger value="completed">{t('tickets:tabs.completed')}</TabsTrigger>
            </TabsList>
          </Tabs>

          {isAdmin && (
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md border transition-all duration-200 ${
                  assignedFilter === 'all'
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-card text-muted-foreground border-border'
                }`}
                onClick={() => setAssignedFilter('all')}
              >
                {t('tickets:filters.allAssignments')}
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md border transition-all duration-200 ${
                  assignedFilter === 'assigned'
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-card text-muted-foreground border-border'
                }`}
                onClick={() => setAssignedFilter('assigned')}
              >
                {t('tickets:filters.assigned')}
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md border transition-all duration-200 ${
                  assignedFilter === 'unassigned'
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-card text-muted-foreground border-border'
                }`}
                onClick={() => setAssignedFilter('unassigned')}
              >
                {t('tickets:filters.unassigned')}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {isError && !hasData && (
        <Card className="border-destructive/20 bg-destructive/10 rounded-xl">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-destructive font-medium">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
              {t('tickets:couldNotLoad')}
            </div>
            <p className="text-sm text-destructive/90">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="border border-border hover:bg-muted transition-all duration-200">
              {isFetching ? t('common:retrying') : t('common:retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      {isError && hasData && (
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
      )}

      {isLoading && !hasData && (
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 text-sm text-muted-foreground">{t('tickets:loadingTickets')}</CardContent>
        </Card>
      )}

      {!isLoading && !isError && tickets.length === 0 && (
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 space-y-3">
            <h2 className="font-medium text-foreground">{t('tickets:empty.title')}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('tickets:empty.description')}
            </p>
            <Button asChild variant="outline" className="border border-border hover:bg-muted transition-all duration-200">
              <Link href="/workspace/services">{t('tickets:empty.bookServices')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base font-medium text-foreground">{ticket.ticket_number}</CardTitle>
                <Badge className={statusBadgeClass(ticket.status)}>{ticket.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium text-foreground">{ticket.title}</p>
              {ticket.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{ticket.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <p>
                  {t('tickets:fields.priority')}: <span className="font-medium text-foreground">{ticket.priority}</span>
                </p>
                <p>
                  {t('tickets:fields.updated')}: <span className="font-medium text-foreground">{new Date(ticket.updated_at).toLocaleString()}</span>
                </p>
                {ticket.property?.property_name && (
                  <p>
                    {t('tickets:fields.property')}: <span className="font-medium text-foreground">{ticket.property.property_name}</span>
                  </p>
                )}
                {ticket.service?.name && (
                  <p>
                    {t('tickets:fields.service')}: <span className="font-medium text-foreground">{ticket.service.name}</span>
                  </p>
                )}
                {ticket.customer?.name && (
                  <p>
                    {t('tickets:fields.customer')}: <span className="font-medium text-foreground">{ticket.customer.name}</span>
                  </p>
                )}
                {ticket.consultant?.name && (
                  <p>
                    {t('tickets:fields.consultant')}: <span className="font-medium text-foreground">{ticket.consultant.name}</span>
                  </p>
                )}
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto border border-border hover:bg-muted transition-all duration-200">
                <Link href={`/tickets/${ticket.id}`}>{t('tickets:openTicket')}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
