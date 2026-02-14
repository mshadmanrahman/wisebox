'use client';

import Link from 'next/link';
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PaginatedResponse, Ticket, TicketStatus } from '@/types';

function statusBadgeClass(status: Ticket['status']): string {
  if (status === 'completed') return 'bg-green-500/20 text-green-400';
  if (status === 'in_progress' || status === 'assigned') return 'bg-blue-500/20 text-blue-400';
  if (status === 'scheduled') return 'bg-purple-100 text-purple-700';
  if (status === 'cancelled') return 'bg-wisebox-background-lighter text-wisebox-text-secondary';
  return 'bg-amber-500/20 text-amber-400';
}

export default function TicketsPage() {
  const { user } = useAuthStore();
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
    'Please try again in a moment.';

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-wisebox-text-primary">Tickets</h1>
          <p className="mt-1 text-wisebox-text-secondary">
            {isConsultant
              ? 'Manage your assigned tickets and keep customers updated.'
              : 'Follow consultant progress for your service requests.'}
          </p>
          {isFetching && hasData && (
            <p className="text-xs text-wisebox-text-secondary mt-1">Refreshing tickets...</p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href="/orders">View Orders</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as 'all' | TicketStatus)}
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 lg:grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="awaiting_customer">Awaiting Customer</TabsTrigger>
              <TabsTrigger value="awaiting_consultant">Awaiting Consultant</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {isAdmin && (
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md border ${
                  assignedFilter === 'all'
                    ? 'bg-wisebox-primary-50 text-wisebox-primary-700 border-wisebox-primary-200'
                    : 'bg-wisebox-background-card text-wisebox-text-secondary border-wisebox-border'
                }`}
                onClick={() => setAssignedFilter('all')}
              >
                All Assignments
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md border ${
                  assignedFilter === 'assigned'
                    ? 'bg-wisebox-primary-50 text-wisebox-primary-700 border-wisebox-primary-200'
                    : 'bg-wisebox-background-card text-wisebox-text-secondary border-wisebox-border'
                }`}
                onClick={() => setAssignedFilter('assigned')}
              >
                Assigned
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md border ${
                  assignedFilter === 'unassigned'
                    ? 'bg-wisebox-primary-50 text-wisebox-primary-700 border-wisebox-primary-200'
                    : 'bg-wisebox-background-card text-wisebox-text-secondary border-wisebox-border'
                }`}
                onClick={() => setAssignedFilter('unassigned')}
              >
                Unassigned
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {isError && !hasData && (
        <Card className="border-red-200 bg-red-50/60">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Could not load tickets.
            </div>
            <p className="text-sm text-red-700/90">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isError && hasData && (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-amber-800">
              Showing previously loaded tickets. {errorMessage}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && !hasData && (
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">Loading tickets...</CardContent>
        </Card>
      )}

      {!isLoading && !isError && tickets.length === 0 && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="font-semibold text-wisebox-text-primary">No tickets found</h2>
            <p className="text-sm text-wisebox-text-secondary">
              Try changing filters or create new service orders to generate tickets.
            </p>
            <Button asChild variant="outline">
              <Link href="/workspace/services">Book Services</Link>
            </Button>
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
              {ticket.description && (
                <p className="text-sm text-wisebox-text-secondary line-clamp-2">{ticket.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-wisebox-text-secondary">
                <p>
                  Priority: <span className="font-medium text-wisebox-text-primary">{ticket.priority}</span>
                </p>
                <p>
                  Updated: <span className="font-medium text-wisebox-text-primary">{new Date(ticket.updated_at).toLocaleString()}</span>
                </p>
                {ticket.property?.property_name && (
                  <p>
                    Property: <span className="font-medium text-wisebox-text-primary">{ticket.property.property_name}</span>
                  </p>
                )}
                {ticket.service?.name && (
                  <p>
                    Service: <span className="font-medium text-wisebox-text-primary">{ticket.service.name}</span>
                  </p>
                )}
                {ticket.customer?.name && (
                  <p>
                    Customer: <span className="font-medium text-wisebox-text-primary">{ticket.customer.name}</span>
                  </p>
                )}
                {ticket.consultant?.name && (
                  <p>
                    Consultant: <span className="font-medium text-wisebox-text-primary">{ticket.consultant.name}</span>
                  </p>
                )}
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={`/tickets/${ticket.id}`}>Open ticket</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
