'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Calendar, Filter } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConsultationRequest {
  id: number;
  ticket_number: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  preferred_time_slots: Array<{ date: string; time: string }> | null;
  created_at: string;
  customer: { id: number; name: string; email: string; phone: string | null } | null;
  property: { id: number; property_name: string; completion_percentage: number; completion_status: string } | null;
  consultant: { id: number; name: string; email: string } | null;
}

const statusColors: Record<string, string> = {
  open: 'bg-wisebox-status-warning/10 text-wisebox-status-warning border-wisebox-status-warning/20',
  assigned: 'bg-wisebox-status-info/10 text-wisebox-status-info border-wisebox-status-info/20',
  scheduled: 'bg-wisebox-status-scheduled/10 text-wisebox-status-scheduled-dark border-wisebox-status-scheduled/20',
  completed: 'bg-wisebox-status-success/10 text-wisebox-status-success border-wisebox-status-success/20',
  cancelled: 'bg-wisebox-status-danger/10 text-wisebox-status-danger border-wisebox-status-danger/20',
};

const STATUS_LABEL_KEYS: Record<string, string> = {
  open: 'consultations.statusLabels.open',
  assigned: 'consultations.statusLabels.assigned',
  scheduled: 'consultations.statusLabels.scheduled',
  completed: 'consultations.statusLabels.completed',
  cancelled: 'consultations.statusLabels.cancelled',
};

const completionColors: Record<string, string> = {
  red: 'bg-wisebox-status-danger',
  yellow: 'bg-wisebox-status-warning',
  green: 'bg-wisebox-status-success',
};

export default function AdminConsultationsPage() {
  const { t } = useTranslation('admin');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: consultationsData, isLoading } = useQuery({
    queryKey: ['admin', 'consultations', statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { per_page: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/consultations', { params });
      return res.data;
    },
  });

  const consultations: ConsultationRequest[] = consultationsData?.data || [];
  const stats = consultationsData?.stats || { pending: 0, assigned: 0, scheduled: 0, completed: 0, rejected: 0 };

  const filterButtons = [
    { value: '', label: t('consultations.filters.all'), count: stats.pending + stats.assigned + stats.scheduled + stats.completed + stats.rejected },
    { value: 'open', label: t('consultations.filters.pending'), count: stats.pending },
    { value: 'assigned', label: t('consultations.filters.assigned'), count: stats.assigned },
    { value: 'scheduled', label: t('consultations.filters.scheduled'), count: stats.scheduled },
    { value: 'completed', label: t('consultations.filters.completed'), count: stats.completed },
    { value: 'cancelled', label: t('consultations.filters.rejected'), count: stats.rejected },
  ];

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('consultations.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('consultations.subtitle')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map((btn) => (
          <Button
            key={btn.value}
            variant={statusFilter === btn.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              statusFilter === btn.value
                ? 'bg-wisebox-status-warning text-white hover:bg-wisebox-status-warning/90'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground bg-card'
            )}
            onClick={() => setStatusFilter(btn.value)}
          >
            {btn.label}
            <span className="ml-1.5 text-xs opacity-70">({btn.count})</span>
          </Button>
        ))}
      </div>

      {/* Consultations List */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">{t('consultations.loading')}</div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {statusFilter ? t('consultations.noFilteredConsultations', { status: t(`consultations.statusLabels.${statusFilter}`) }) : t('consultations.noConsultations')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {consultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/admin/consultations/${consultation.id}`}
                  className="block hover:bg-muted transition-colors"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs text-muted-foreground border-border bg-muted">
                            {consultation.ticket_number}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', statusColors[consultation.status] || '')}>
                            {STATUS_LABEL_KEYS[consultation.status] ? t(STATUS_LABEL_KEYS[consultation.status]) : consultation.status}
                          </Badge>
                          {consultation.property?.completion_status && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span className={cn('w-2 h-2 rounded-full', completionColors[consultation.property.completion_status])} />
                              {t('consultations.percentComplete', { percent: consultation.property.completion_percentage })}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground">{consultation.title}</h3>
                        {consultation.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {consultation.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">{t('consultations.fields.customer')}</p>
                        <p className="text-foreground font-medium">{consultation.customer?.name || 'N/A'}</p>
                        <p className="text-muted-foreground text-xs">{consultation.customer?.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">{t('consultations.fields.property')}</p>
                        <p className="text-foreground font-medium truncate">{consultation.property?.property_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">{t('consultations.fields.consultant')}</p>
                        <p className="text-foreground font-medium">{consultation.consultant?.name || t('consultations.fields.unassigned')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">{t('consultations.fields.requested')}</p>
                        <p className="text-foreground font-medium">
                          {new Date(consultation.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {consultation.status === 'open' && consultation.preferred_time_slots && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-wisebox-status-warning" />
                        <span className="text-xs text-wisebox-status-warning font-medium">
                          {t('consultations.preferredSlots', { count: consultation.preferred_time_slots.length })}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
