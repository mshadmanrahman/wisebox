'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PaginatedResponse } from '@/types';

interface ConsultantTicket {
  id: number;
  ticket_number: string;
  title: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  scheduled_at: string | null;
  customer_name: string;
  property_name: string;
  service_name: string;
  preferred_time_slots: Array<{ date: string; time: string; display: string }>;
  meet_link: string | null;
}

interface ConsultantStats {
  assigned: number;
  scheduled: number;
  completed_this_month: number;
  pending_action: number;
}

const statusConfig = {
  assigned: {
    label: 'Awaiting Your Response',
    icon: AlertCircle,
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  scheduled: {
    label: 'Meeting Scheduled',
    icon: Calendar,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  closed: {
    label: 'Closed',
    icon: CheckCircle,
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
};

const priorityConfig = {
  high: { color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low: { color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ConsultantDashboard() {
  const { user } = useAuthStore();

  const { data: statsData } = useQuery({
    queryKey: ['consultant', 'stats'],
    queryFn: async () => {
      const res = await api.get<{ data: ConsultantStats }>('/consultant/stats');
      return res.data.data;
    },
  });

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['consultant', 'tickets'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<ConsultantTicket>>('/consultant/tickets', {
        params: { per_page: 20 },
      });
      return res.data;
    },
  });

  const stats = statsData || { assigned: 0, scheduled: 0, completed_this_month: 0, pending_action: 0 };
  const tickets = ticketsData?.data || [];

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-wisebox-text-secondary mt-2">
          Manage your consultation cases and help customers with their property needs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-wisebox-background-card border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wisebox-text-secondary">Pending Action</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pending_action}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wisebox-background-card border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wisebox-text-secondary">Scheduled</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{stats.scheduled}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wisebox-background-card border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wisebox-text-secondary">Completed This Month</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.completed_this_month}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wisebox-text-secondary">Total Assigned</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.assigned}</p>
              </div>
              <FileText className="h-10 w-10 text-wisebox-text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Cases */}
      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardHeader>
          <CardTitle className="text-white">Your Cases</CardTitle>
          <CardDescription className="text-wisebox-text-secondary">
            Consultation tickets assigned to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-wisebox-text-secondary">Loading cases...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-wisebox-text-muted mx-auto mb-4" />
              <p className="text-wisebox-text-secondary">No cases assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || {
                  label: ticket.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                  icon: FileText,
                  color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
                };
                const StatusIcon = statusInfo.icon;

                return (
                  <Link
                    key={ticket.id}
                    href={`/consultant/tickets/${ticket.id}`}
                    className="block"
                  >
                    <div className="bg-wisebox-background-lighter border border-wisebox-border hover:border-wisebox-primary/50 rounded-xl p-5 transition-all">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs text-wisebox-text-secondary border-wisebox-border">
                              {ticket.ticket_number}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs', statusInfo.color)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs', priorityConfig[ticket.priority].color)}>
                              {ticket.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-white text-base">{ticket.title}</h3>
                        </div>
                        <ArrowRight className="h-5 w-5 text-wisebox-text-muted shrink-0" />
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-wisebox-text-muted text-xs">Customer</p>
                          <p className="text-white font-medium">{ticket.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-wisebox-text-muted text-xs">Property</p>
                          <p className="text-white font-medium truncate">{ticket.property_name}</p>
                        </div>
                        <div>
                          <p className="text-wisebox-text-muted text-xs">Service</p>
                          <p className="text-white font-medium truncate">{ticket.service_name}</p>
                        </div>
                        <div>
                          <p className="text-wisebox-text-muted text-xs">Created</p>
                          <p className="text-white font-medium">{formatDate(ticket.created_at)}</p>
                        </div>
                      </div>

                      {ticket.status === 'assigned' && ticket.preferred_time_slots && (
                        <div className="mt-3 pt-3 border-t border-wisebox-border">
                          <p className="text-xs text-yellow-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Action Required: Select meeting time from {ticket.preferred_time_slots.length} preferred slots
                          </p>
                        </div>
                      )}

                      {ticket.scheduled_at && (
                        <div className="mt-3 pt-3 border-t border-wisebox-border">
                          <p className="text-xs text-blue-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Meeting: {new Date(ticket.scheduled_at).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
