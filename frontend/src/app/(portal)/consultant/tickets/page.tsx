'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  if (status === 'completed') return 'bg-green-500/20 text-green-400';
  if (status === 'in_progress' || status === 'assigned') return 'bg-blue-500/20 text-blue-400';
  if (status === 'scheduled') return 'bg-purple-100 text-purple-700';
  if (status === 'cancelled') return 'bg-wisebox-background-lighter text-wisebox-text-secondary';
  return 'bg-amber-500/20 text-amber-400';
}

export default function ConsultantTicketsPage() {
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
        { label: 'Open', value: 0 },
        { label: 'Awaiting Customer', value: 0 },
        { label: 'Upcoming Meetings', value: 0 },
        { label: 'Avg Resolution (hrs)', value: '-' },
      ];
    }

    const avgResolution = metricsData?.kpis.avg_resolution_hours;
    const utilization = metricsData?.kpis.capacity?.utilization_percentage;

    return [
      { label: 'Open', value: dashboardData.stats.open_count },
      { label: 'Awaiting Customer', value: dashboardData.stats.awaiting_customer_count },
      { label: 'Upcoming Meetings', value: dashboardData.stats.upcoming_meetings_count },
      { label: 'Avg Resolution (hrs)', value: avgResolution !== null && avgResolution !== undefined ? avgResolution : '-' },
      ...(utilization !== undefined ? [{ label: 'Utilization (%)', value: utilization }] : []),
    ];
  }, [dashboardData, metricsData]);

  if (!isConsultantRole) {
    return (
      <div className="px-6 py-8">
        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="font-semibold text-wisebox-text-primary">Consultant access required</h2>
            <p className="text-sm text-wisebox-text-secondary">
              This section is available only to consultants and admins.
            </p>
            <Button asChild variant="outline">
              <Link href="/tickets">Back to Tickets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-wisebox-text-primary">Consultant Workspace</h1>
        <p className="mt-1 text-wisebox-text-secondary">
          Manage assigned tickets, update statuses, and coordinate meetings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-wisebox-text-secondary">{card.label}</p>
              <p className="text-2xl font-bold text-wisebox-primary-700 mt-1">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | TicketStatus)}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="awaiting_customer">Awaiting Customer</TabsTrigger>
              <TabsTrigger value="awaiting_consultant">Awaiting Consultant</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">Loading tickets...</CardContent>
        </Card>
      )}

      {!isLoading && tickets.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">
            No tickets found for the selected filter.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{ticket.ticket_number}</CardTitle>
                <Badge className={statusBadgeClass(ticket.status)}>{ticket.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium text-wisebox-text-primary">{ticket.title}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-wisebox-text-secondary">
                <p>
                  Priority: <span className="font-medium text-wisebox-text-primary">{ticket.priority}</span>
                </p>
                <p>
                  Customer: <span className="font-medium text-wisebox-text-primary">{ticket.customer?.name ?? '-'}</span>
                </p>
                <p>
                  Property: <span className="font-medium text-wisebox-text-primary">{ticket.property?.property_name ?? '-'}</span>
                </p>
                <p>
                  Service: <span className="font-medium text-wisebox-text-primary">{ticket.service?.name ?? '-'}</span>
                </p>
                {ticket.scheduled_at && (
                  <p>
                    Meeting: <span className="font-medium text-wisebox-text-primary">{new Date(ticket.scheduled_at).toLocaleString()}</span>
                  </p>
                )}
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={`/consultant/tickets/${ticket.id}`}>Open workspace</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
