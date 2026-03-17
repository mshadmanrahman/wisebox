'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ApiResponse, PaginatedResponse, Ticket, TicketStatus } from '@/types';

interface ConsultantTicketListResponse extends PaginatedResponse<Ticket> {
  stats: {
    open_count: number;
    awaiting_customer_count: number;
    scheduled_count: number;
    completed_count: number;
  };
}

interface ConsultantDashboardResponse {
  stats: {
    open_count: number;
    awaiting_customer_count: number;
    upcoming_meetings_count: number;
    completed_this_month_count: number;
  };
  upcoming_meetings: Ticket[];
}

interface ConsultantMetricsResponse {
  kpis: {
    window_days: number;
    active_count: number;
    completed_in_window_count: number;
    awaiting_customer_count: number;
    upcoming_meetings_count: number;
    avg_resolution_hours: number | null;
    capacity?: {
      open_tickets_count: number;
      max_concurrent_tickets: number;
      utilization_percentage: number;
    };
  };
  status_breakdown: Record<string, number>;
}

function statusBadgeClass(status: Ticket['status']): string {
  if (status === 'completed') return 'bg-wisebox-status-success/20 text-wisebox-status-success';
  if (status === 'in_progress' || status === 'assigned') return 'bg-wisebox-status-info/20 text-wisebox-status-info';
  if (status === 'scheduled') return 'bg-wisebox-status-scheduled/20 text-wisebox-status-scheduled';
  if (status === 'cancelled') return 'bg-muted text-muted-foreground';
  return 'bg-wisebox-status-warning/20 text-wisebox-status-warning';
}

export default function ConsultantTicketsPage() {
  const { t } = useTranslation(['consultant', 'common']);
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');

  const isConsultantRole = user?.role === 'consultant' || user?.role === 'admin' || user?.role === 'super_admin';

  const { data: dashboardData } = useQuery({
    queryKey: ['consultant-dashboard'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ConsultantDashboardResponse>>('/consultant/dashboard');
      return res.data.data;
    },
    enabled: isConsultantRole,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['consultant-tickets', statusFilter],
    queryFn: async () => {
      const res = await api.get<ConsultantTicketListResponse>('/consultant/tickets', {
        params: {
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
      });
      return res.data;
    },
    enabled: isConsultantRole,
  });

  const { data: metricsData } = useQuery({
    queryKey: ['consultant-metrics'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ConsultantMetricsResponse>>('/consultant/metrics');
      return res.data.data;
    },
    enabled: isConsultantRole,
  });

  const tickets = data?.data ?? [];

  const summaryCards = useMemo(() => {
    if (!dashboardData) {
      return [
        { label: t('consultant:tickets.stats.open'), value: 0 },
        { label: t('consultant:tickets.stats.awaitingCustomer'), value: 0 },
        { label: t('consultant:tickets.stats.upcomingMeetings'), value: 0 },
        { label: t('consultant:tickets.stats.avgResolution'), value: '-' },
      ];
    }

    const avgResolution = metricsData?.kpis.avg_resolution_hours;
    const utilization = metricsData?.kpis.capacity?.utilization_percentage;

    return [
      { label: t('consultant:tickets.stats.open'), value: dashboardData.stats.open_count },
      { label: t('consultant:tickets.stats.awaitingCustomer'), value: dashboardData.stats.awaiting_customer_count },
      { label: t('consultant:tickets.stats.upcomingMeetings'), value: dashboardData.stats.upcoming_meetings_count },
      { label: t('consultant:tickets.stats.avgResolution'), value: avgResolution !== null && avgResolution !== undefined ? avgResolution : '-' },
      ...(utilization !== undefined ? [{ label: t('consultant:tickets.stats.utilization'), value: utilization }] : []),
    ];
  }, [dashboardData, metricsData]);

  if (!isConsultantRole) {
    return (
      <div className="px-6 py-8">
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 space-y-3">
            <h2 className="font-semibold text-foreground">{t('consultant:tickets.accessRequired')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('consultant:tickets.accessDescription')}
            </p>
            <Button asChild variant="outline">
              <Link href="/tickets">{t('consultant:tickets.backToTickets')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('consultant:tickets.title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('consultant:tickets.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-semibold text-primary mt-1">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
        <CardContent className="pt-6">
          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | TicketStatus)}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-8">
              <TabsTrigger value="all">{t('consultant:tickets.tabs.all')}</TabsTrigger>
              <TabsTrigger value="open">{t('consultant:tickets.tabs.open')}</TabsTrigger>
              <TabsTrigger value="assigned">{t('consultant:tickets.tabs.assigned')}</TabsTrigger>
              <TabsTrigger value="in_progress">{t('consultant:tickets.tabs.in_progress')}</TabsTrigger>
              <TabsTrigger value="awaiting_customer">{t('consultant:tickets.tabs.awaiting_customer')}</TabsTrigger>
              <TabsTrigger value="awaiting_consultant">{t('consultant:tickets.tabs.awaiting_consultant')}</TabsTrigger>
              <TabsTrigger value="scheduled">{t('consultant:tickets.tabs.scheduled')}</TabsTrigger>
              <TabsTrigger value="completed">{t('consultant:tickets.tabs.completed')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 text-sm text-muted-foreground">{t('consultant:tickets.loading')}</CardContent>
        </Card>
      )}

      {!isLoading && tickets.length === 0 && (
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 text-sm text-muted-foreground">
            {t('consultant:tickets.noTickets')}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{ticket.ticket_number}</CardTitle>
                <Badge className={statusBadgeClass(ticket.status)}>{ticket.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium text-foreground">{ticket.title}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <p>
                  {t('consultant:tickets.fields.priority')}: <span className="font-medium text-foreground">{ticket.priority}</span>
                </p>
                <p>
                  {t('consultant:tickets.fields.customer')}: <span className="font-medium text-foreground">{ticket.customer?.name ?? '-'}</span>
                </p>
                <p>
                  {t('consultant:tickets.fields.property')}: <span className="font-medium text-foreground">{ticket.property?.property_name ?? '-'}</span>
                </p>
                <p>
                  {t('consultant:tickets.fields.service')}: <span className="font-medium text-foreground">{ticket.service?.name ?? '-'}</span>
                </p>
                {ticket.scheduled_at && (
                  <p>
                    {t('consultant:tickets.fields.meeting')}: <span className="font-medium text-foreground">{new Date(ticket.scheduled_at).toLocaleString()}</span>
                  </p>
                )}
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto transition-all duration-200">
                <Link href={`/consultant/tickets/${ticket.id}`}>{t('consultant:tickets.openWorkspace')}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
