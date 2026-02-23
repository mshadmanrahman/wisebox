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
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_LABEL_KEYS: Record<string, string> = {
  open: 'consultations.statusLabels.open',
  assigned: 'consultations.statusLabels.assigned',
  scheduled: 'consultations.statusLabels.scheduled',
  completed: 'consultations.statusLabels.completed',
  cancelled: 'consultations.statusLabels.cancelled',
};

const completionColors: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
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
        <h1 className="text-2xl font-bold text-slate-900">{t('consultations.title')}</h1>
        <p className="text-slate-600 mt-1">
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
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white'
            )}
            onClick={() => setStatusFilter(btn.value)}
          >
            {btn.label}
            <span className="ml-1.5 text-xs opacity-70">({btn.count})</span>
          </Button>
        ))}
      </div>

      {/* Consultations List */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-slate-500">{t('consultations.loading')}</div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {statusFilter ? t('consultations.noFilteredConsultations', { status: t(`consultations.statusLabels.${statusFilter}`) }) : t('consultations.noConsultations')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {consultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/admin/consultations/${consultation.id}`}
                  className="block hover:bg-slate-50 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs text-slate-500 border-slate-300 bg-slate-50">
                            {consultation.ticket_number}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', statusColors[consultation.status] || '')}>
                            {STATUS_LABEL_KEYS[consultation.status] ? t(STATUS_LABEL_KEYS[consultation.status]) : consultation.status}
                          </Badge>
                          {consultation.property?.completion_status && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <span className={cn('w-2 h-2 rounded-full', completionColors[consultation.property.completion_status])} />
                              {t('consultations.percentComplete', { percent: consultation.property.completion_percentage })}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900">{consultation.title}</h3>
                        {consultation.description && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                            {consultation.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400 shrink-0 mt-1" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">{t('consultations.fields.customer')}</p>
                        <p className="text-slate-900 font-medium">{consultation.customer?.name || 'N/A'}</p>
                        <p className="text-slate-400 text-xs">{consultation.customer?.email}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">{t('consultations.fields.property')}</p>
                        <p className="text-slate-900 font-medium truncate">{consultation.property?.property_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">{t('consultations.fields.consultant')}</p>
                        <p className="text-slate-900 font-medium">{consultation.consultant?.name || t('consultations.fields.unassigned')}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">{t('consultations.fields.requested')}</p>
                        <p className="text-slate-900 font-medium">
                          {new Date(consultation.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {consultation.status === 'open' && consultation.preferred_time_slots && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs text-amber-600 font-medium">
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
