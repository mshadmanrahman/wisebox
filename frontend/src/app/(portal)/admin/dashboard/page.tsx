'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Shield, Users, Clock, CheckCircle, XCircle, ArrowRight, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConsultationStats {
  pending: number;
  assigned: number;
  scheduled: number;
  completed: number;
  rejected: number;
}

interface ConsultationRequest {
  id: number;
  ticket_number: string;
  title: string;
  description: string | null;
  status: string;
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

export default function AdminDashboard() {
  const { t } = useTranslation('admin');
  const { data: consultationsData, isLoading } = useQuery({
    queryKey: ['admin', 'consultations'],
    queryFn: async () => {
      const res = await api.get('/admin/consultations', { params: { per_page: 10 } });
      return res.data;
    },
  });

  const stats: ConsultationStats = consultationsData?.stats || {
    pending: 0, assigned: 0, scheduled: 0, completed: 0, rejected: 0,
  };
  const consultations: ConsultationRequest[] = consultationsData?.data || [];

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-amber-500" />
            <h1 className="text-3xl font-bold text-slate-900">{t('dashboard.title')}</h1>
          </div>
          <p className="text-slate-600">
            {t('dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{t('dashboard.stats.pending')}</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{t('dashboard.stats.assigned')}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.assigned}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{t('dashboard.stats.scheduled')}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.scheduled}</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-3">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{t('dashboard.stats.completed')}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
              </div>
              <div className="rounded-xl bg-green-50 p-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{t('dashboard.stats.rejected')}</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Consultations */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-slate-900">{t('dashboard.consultations.title')}</CardTitle>
            <CardDescription className="text-slate-500">
              {t('dashboard.consultations.description')}
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
            <Link href="/admin/consultations">
              {t('dashboard.consultations.viewAll')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">{t('dashboard.consultations.loading')}</p>
          ) : consultations.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">{t('dashboard.consultations.noRequests')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/admin/consultations/${consultation.id}`}
                  className="block"
                >
                  <div className="bg-slate-50 border border-slate-200 hover:border-amber-300 rounded-xl p-5 transition-all hover:shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs text-slate-500 border-slate-300 bg-white">
                            {consultation.ticket_number}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', statusColors[consultation.status] || '')}>
                            {consultation.status === 'open' ? t('dashboard.consultations.pendingReview') : consultation.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-base">{consultation.title}</h3>
                        {consultation.description && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {consultation.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400 shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">{t('dashboard.fields.customer')}</p>
                        <p className="text-slate-900 font-medium">{consultation.customer?.name || t('dashboard.na')}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">{t('dashboard.fields.property')}</p>
                        <p className="text-slate-900 font-medium truncate">{consultation.property?.property_name || t('dashboard.na')}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">{t('dashboard.fields.requested')}</p>
                        <p className="text-slate-900 font-medium">
                          {new Date(consultation.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
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
