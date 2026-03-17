'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
    color: 'bg-wisebox-status-warning/20 text-wisebox-status-warning border-wisebox-status-warning/30',
  },
  scheduled: {
    label: 'Meeting Scheduled',
    icon: Calendar,
    color: 'bg-wisebox-status-info/20 text-wisebox-status-info border-wisebox-status-info/30',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-wisebox-status-success/20 text-wisebox-status-success border-wisebox-status-success/30',
  },
  closed: {
    label: 'Closed',
    icon: CheckCircle,
    color: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30',
  },
};

const priorityConfig = {
  high: { color: 'bg-wisebox-status-danger/20 text-wisebox-status-danger border-wisebox-status-danger/30' },
  medium: { color: 'bg-wisebox-status-warning/20 text-wisebox-status-warning border-wisebox-status-warning/30' },
  low: { color: 'bg-wisebox-status-success/20 text-wisebox-status-success border-wisebox-status-success/30' },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ConsultantDashboard() {
  const { t } = useTranslation('consultant');
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('dashboard.welcomeBack', { name: user?.name?.split(' ')[0] ?? '' })}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border border-wisebox-status-warning/30 rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.stats.pendingAction')}</p>
                <p className="text-3xl font-semibold text-wisebox-status-warning mt-2">{stats.pending_action}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-wisebox-status-warning" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-wisebox-status-info/30 rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.stats.scheduled')}</p>
                <p className="text-3xl font-semibold text-wisebox-status-info mt-2">{stats.scheduled}</p>
              </div>
              <Calendar className="h-10 w-10 text-wisebox-status-info" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-wisebox-status-success/30 rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.stats.completedThisMonth')}</p>
                <p className="text-3xl font-semibold text-wisebox-status-success mt-2">{stats.completed_this_month}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-wisebox-status-success" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.stats.totalAssigned')}</p>
                <p className="text-3xl font-semibold text-foreground mt-2">{stats.assigned}</p>
              </div>
              <FileText className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Cases */}
      <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
        <CardHeader>
          <CardTitle className="text-foreground">{t('dashboard.cases.title')}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('dashboard.cases.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('dashboard.cases.loading')}</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-muted-foreground">{t('dashboard.cases.noCases')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || {
                  label: ticket.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                  icon: FileText,
                  color: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30',
                };
                const StatusIcon = statusInfo.icon;

                return (
                  <Link
                    key={ticket.id}
                    href={`/consultant/tickets/${ticket.id}`}
                    className="block"
                  >
                    <div className="bg-muted border border-border hover:border-primary/50 rounded-xl p-5 transition-all duration-200">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                              {ticket.ticket_number}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs', statusInfo.color)}>
                              <StatusIcon className="h-3 w-3 mr-1" strokeWidth={1.5} />
                              {statusInfo.label}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs', priorityConfig[ticket.priority].color)}>
                              {ticket.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-foreground text-base">{ticket.title}</h3>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">{t('dashboard.fields.customer')}</p>
                          <p className="text-foreground font-medium">{ticket.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">{t('dashboard.fields.property')}</p>
                          <p className="text-foreground font-medium truncate">{ticket.property_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">{t('dashboard.fields.service')}</p>
                          <p className="text-foreground font-medium truncate">{ticket.service_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">{t('dashboard.fields.created')}</p>
                          <p className="text-foreground font-medium">{formatDate(ticket.created_at)}</p>
                        </div>
                      </div>

                      {ticket.status === 'assigned' && ticket.preferred_time_slots && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-wisebox-status-warning flex items-center gap-1">
                            <Clock className="h-3 w-3" strokeWidth={1.5} />
                            {t('dashboard.actionRequired', { count: ticket.preferred_time_slots.length })}
                          </p>
                        </div>
                      )}

                      {ticket.scheduled_at && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-wisebox-status-info flex items-center gap-1">
                            <Calendar className="h-3 w-3" strokeWidth={1.5} />
                            {t('dashboard.meeting')}: {new Date(ticket.scheduled_at).toLocaleString('en-GB', {
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
