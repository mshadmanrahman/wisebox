'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Calendar, CheckCircle, XCircle, User, MapPin,
  FileText, Clock, Loader2, AlertTriangle,
} from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Consultant {
  id: number;
  name: string;
  email: string;
  specialization: string[];
  languages: string[];
  rating: number;
  active_tickets_count: number;
  max_concurrent: number;
  is_available: boolean;
}

const statusColors: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminConsultationDetailPage() {
  const { t } = useTranslation(['admin', 'common']);
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [selectedConsultant, setSelectedConsultant] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Fetch consultation details
  const { data: consultation, isLoading } = useQuery({
    queryKey: ['admin', 'consultation', id],
    queryFn: async () => {
      const res = await api.get(`/admin/consultations/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Fetch available consultants
  const { data: consultantsData } = useQuery({
    queryKey: ['admin', 'consultants'],
    queryFn: async () => {
      const res = await api.get('/admin/consultations/consultants');
      return res.data.data as Consultant[];
    },
  });

  const consultants = consultantsData || [];

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      return api.patch(`/admin/consultations/${id}/approve`, {
        consultant_id: parseInt(selectedConsultant),
        admin_notes: adminNotes || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      router.push('/admin/consultations');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      return api.patch(`/admin/consultations/${id}/reject`, {
        reason: rejectReason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      router.push('/admin/consultations');
    },
  });

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="h-64 w-full rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="px-6 py-8">
        <p className="text-slate-500">{t('admin:detail.notFound')}</p>
      </div>
    );
  }

  const isPending = consultation.status === 'open';

  return (
    <div className="px-6 py-8 space-y-6 max-w-4xl">
      {/* Back */}
      <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
        <Link href="/admin/consultations">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('admin:detail.backToConsultations')}
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs text-slate-500 border-slate-300 bg-white">
              {consultation.ticket_number}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', statusColors[consultation.status] || '')}>
              {consultation.status === 'open' ? t('admin:detail.pendingReview') : consultation.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{consultation.title}</h1>
        </div>
      </div>

      {/* Customer & Property Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              {t('admin:detail.customer')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-slate-900 font-medium">{consultation.customer?.name}</p>
            <p className="text-slate-500">{consultation.customer?.email}</p>
            {consultation.customer?.phone && (
              <p className="text-slate-500">{consultation.customer.phone}</p>
            )}
            {consultation.customer?.country_of_residence && (
              <p className="text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {consultation.customer.country_of_residence}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              {t('admin:detail.property')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-slate-900 font-medium">{consultation.property?.property_name}</p>
            {consultation.property?.property_type && (
              <p className="text-slate-500">{t('admin:detail.type')}: {consultation.property.property_type.name}</p>
            )}
            {consultation.property?.ownership_status && (
              <p className="text-slate-500">{t('admin:detail.status')}: {consultation.property.ownership_status.name}</p>
            )}
            {consultation.property?.documents && (
              <p className="text-slate-400">
                {t('admin:detail.documentsCount', { count: consultation.property.documents.length })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {consultation.description && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-slate-900">{t('admin:detail.requestDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {consultation.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preferred Time Slots */}
      {consultation.preferred_time_slots && consultation.preferred_time_slots.length > 0 && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              {t('admin:detail.preferredTimeSlots')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {consultation.preferred_time_slots.map((slot: { date: string; time: string }, i: number) => (
                <Badge key={i} variant="outline" className="border-slate-200 text-slate-700 bg-slate-50 py-1.5 px-3">
                  <Clock className="h-3 w-3 mr-1.5 text-slate-400" />
                  {new Date(slot.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at {slot.time}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Section (only for pending) */}
      {isPending && (
        <Card className="bg-white border-amber-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">{t('admin:detail.takeAction')}</CardTitle>
            <CardDescription className="text-slate-500">
              {t('admin:detail.takeActionDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Approve Section */}
            {!showRejectForm && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 text-sm">{t('admin:detail.assignConsultant')}</Label>
                  <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                      <SelectValue placeholder={t('admin:detail.selectConsultant')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {consultants.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={String(c.id)}
                          className="text-slate-900 hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{c.name}</span>
                            <span className="text-xs text-slate-400">
                              {c.active_tickets_count}/{c.max_concurrent} cases
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 text-sm">{t('admin:detail.adminNotes')}</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={t('admin:detail.adminNotesPlaceholder')}
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => approveMutation.mutate()}
                    disabled={!selectedConsultant || approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {t('admin:detail.approveAndAssign')}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setShowRejectForm(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t('admin:detail.reject')}
                  </Button>
                </div>

                {approveMutation.isError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {t('admin:detail.failedToApprove')}
                  </p>
                )}
              </div>
            )}

            {/* Reject Section */}
            {showRejectForm && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 text-sm">{t('admin:detail.rejectReason')}</Label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t('admin:detail.rejectReasonPlaceholder')}
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => rejectMutation.mutate()}
                    disabled={!rejectReason.trim() || rejectMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    {t('admin:detail.confirmRejection')}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    onClick={() => setShowRejectForm(false)}
                  >
                    {t('common:cancel')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assigned Consultant Info (for non-pending) */}
      {consultation.consultant && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-slate-900">{t('admin:detail.assignedConsultant')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="text-slate-900 font-medium">{consultation.consultant.name}</p>
            <p className="text-slate-500">{consultation.consultant.email}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
