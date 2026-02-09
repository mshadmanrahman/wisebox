'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PaginatedResponse, Ticket } from '@/types';

function statusBadgeClass(status: Ticket['status']): string {
  if (status === 'completed') return 'bg-green-100 text-green-700';
  if (status === 'in_progress' || status === 'assigned') return 'bg-blue-100 text-blue-700';
  if (status === 'scheduled') return 'bg-purple-100 text-purple-700';
  if (status === 'cancelled') return 'bg-gray-100 text-gray-600';
  return 'bg-amber-100 text-amber-700';
}

export default function TicketsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Ticket>>('/tickets');
      return res.data;
    },
  });

  const tickets = data?.data ?? [];

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wisebox-text-primary">Tickets</h1>
          <p className="mt-1 text-wisebox-text-secondary">
            Follow consultant progress for your service requests.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/orders">View Orders</Link>
        </Button>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">Loading tickets...</CardContent>
        </Card>
      )}

      {!isLoading && tickets.length === 0 && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="font-semibold text-wisebox-text-primary">No tickets yet</h2>
            <p className="text-sm text-wisebox-text-secondary">
              Tickets are automatically created after successful paid or free service orders.
            </p>
            <Button asChild variant="outline">
              <Link href="/services">Book Services</Link>
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
