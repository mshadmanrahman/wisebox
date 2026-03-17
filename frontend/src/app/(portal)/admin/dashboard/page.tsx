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
  open: 'bg-wisebox-status-warning/10 text-wisebox-status-warning border-wisebox-status-warning/20',
  assigned: 'bg-wisebox-status-info/10 text-wisebox-status-info border-wisebox-status-info/20',
  scheduled: 'bg-wisebox-status-scheduled/10 text-wisebox-status-scheduled-dark border-wisebox-status-scheduled/20',
  completed: 'bg-wisebox-status-success/10 text-wisebox-status-success border-wisebox-status-success/20',
  cancelled: 'bg-wisebox-status-danger/10 text-wisebox-status-danger border-wisebox-status-danger/20',
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
            <Shield className="h-6 w-6 text-wisebox-status-warning" />
            <h1 className="text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.stats.pending')}</p>
                <p className="text-3xl font-bold text-wisebox-status-warning mt-1">{stats.pending}</p>
              </div>
              <div className="rounded-xl bg-wisebox-status-warning/10 p-3">
                <Clock className="h-6 w-6 text-wisebox-status-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.stats.assigned')}</p>
                <p className="text-3xl font-bold text-wisebox-status-info mt-1">{stats.assigned}</p>
              </div>
              <div className="rounded-xl bg-wisebox-status-info/10 p-3">
                <Users className="h-6 w-6 text-wisebox-status-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.stats.scheduled')}</p>
                <p className="text-3xl font-bold text-wisebox-status-scheduled mt-1">{stats.scheduled}</p>
              </div>
              <div className="rounded-xl bg-wisebox-status-scheduled/10 p-3">
                <Calendar className="h-6 w-6 text-wisebox-status-scheduled" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.stats.completed')}</p>
                <p className="text-3xl font-bold text-wisebox-status-success mt-1">{stats.completed}</p>
              </div>
              <div className="rounded-xl bg-wisebox-status-success/10 p-3">
                <CheckCircle className="h-6 w-6 text-wisebox-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.stats.rejected')}</p>
                <p className="text-3xl font-bold text-wisebox-status-danger mt-1">{stats.rejected}</p>
              </div>
              <div className="rounded-xl bg-wisebox-status-danger/10 p-3">
                <XCircle className="h-6 w-6 text-wisebox-status-danger" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Consultations */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">{t('dashboard.consultations.title')}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('dashboard.consultations.description')}
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="border-border text-foreground hover:bg-muted">
            <Link href="/admin/consultations">
              {t('dashboard.consultations.viewAll')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('dashboard.consultations.loading')}</p>
          ) : consultations.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('dashboard.consultations.noRequests')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/admin/consultations/${consultation.id}`}
                  className="block"
                >
                  <div className="bg-muted border border-border hover:border-wisebox-status-warning/30 rounded-xl p-5 transition-all hover:shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs text-muted-foreground border-border bg-card">
                            {consultation.ticket_number}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', statusColors[consultation.status] || '')}>
                            {consultation.status === 'open' ? t('dashboard.consultations.pendingReview') : consultation.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground text-base">{consultation.title}</h3>
                        {consultation.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {consultation.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">{t('dashboard.fields.customer')}</p>
                        <p className="text-foreground font-medium">{consultation.customer?.name || t('dashboard.na')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">{t('dashboard.fields.property')}</p>
                        <p className="text-foreground font-medium truncate">{consultation.property?.property_name || t('dashboard.na')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">{t('dashboard.fields.requested')}</p>
                        <p className="text-foreground font-medium">
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
