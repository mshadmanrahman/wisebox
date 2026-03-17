'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Send, FileText, X, Download, Eye, Mail } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DynamicFormRenderer, ConsultationFormTemplate } from '@/components/consultation/dynamic-form-renderer';
import type { ApiResponse, PropertyDocument, Ticket, TicketComment, TicketStatus } from '@/types';

const STATUS_OPTIONS: TicketStatus[] = [
  'open',
  'assigned',
  'in_progress',
  'awaiting_customer',
  'awaiting_consultant',
  'scheduled',
  'completed',
  'cancelled',
];

const STATUS_FLOW: TicketStatus[] = [
  'open',
  'assigned',
  'in_progress',
  'scheduled',
  'completed',
];

function statusBadgeClass(status: Ticket['status']): string {
  if (status === 'completed') return 'bg-wisebox-status-success/20 text-wisebox-status-success';
  if (status === 'in_progress' || status === 'assigned') return 'bg-wisebox-status-info/20 text-wisebox-status-info';
  if (status === 'scheduled') return 'bg-wisebox-status-scheduled/20 text-wisebox-status-scheduled';
  if (status === 'cancelled') return 'bg-wisebox-background-lighter text-wisebox-text-secondary';
  return 'bg-wisebox-status-warning/20 text-wisebox-status-warning';
}

function toLocalDateTimeValue(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ConsultantTicketDetailPage() {
  const { t } = useTranslation('consultant');
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const ticketId = Number(params.id);

  const isConsultantRole = user?.role === 'consultant' || user?.role === 'admin' || user?.role === 'super_admin';

  const [statusValue, setStatusValue] = useState<TicketStatus | ''>('');
  const [scheduledAtValue, setScheduledAtValue] = useState('');
  const [meetingUrlValue, setMeetingUrlValue] = useState('');
  const [durationValue, setDurationValue] = useState('');
  const [resolutionNotesValue, setResolutionNotesValue] = useState('');
  const [consultationNotesValue, setConsultationNotesValue] = useState('');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const [commentBody, setCommentBody] = useState('');
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [isInternal, setIsInternal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConsultationFormTemplate | null>(null);
  const [showSendFormModal, setShowSendFormModal] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['consultant-ticket', ticketId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ticket>>(`/consultant/tickets/${ticketId}`);
      return res.data.data;
    },
    enabled: isConsultantRole && Number.isFinite(ticketId),
  });

  const { data: consultantTemplates } = useQuery({
    queryKey: ['consultation-templates', 'consultant'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ConsultationFormTemplate[]>>('/consultation-forms/', {
        params: { audience: 'consultant' },
      });
      return res.data.data;
    },
    enabled: isConsultantRole,
  });

  const { data: customerTemplates } = useQuery({
    queryKey: ['consultation-templates', 'customer'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ConsultationFormTemplate[]>>('/consultation-forms/', {
        params: { audience: 'customer' },
      });
      return res.data.data;
    },
    enabled: isConsultantRole,
  });

  const { data: responses } = useQuery({
    queryKey: ['ticket-responses', ticketId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Array<{
        id: number;
        template: { name: string };
        summary: string;
        created_at: string;
      }>>>(`/consultation-forms/tickets/${ticketId}/responses`);
      return res.data.data;
    },
    enabled: isConsultantRole && Number.isFinite(ticketId),
  });

  const { data: invitations } = useQuery({
    queryKey: ['ticket-invitations', ticketId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Array<{
        id: number;
        template: { id: number; name: string };
        customer_email: string;
        status: string;
        sent_at: string;
        completed_at: string | null;
        expires_at: string;
      }>>>(`/consultant/tickets/${ticketId}/form-invitations`);
      return res.data.data;
    },
    enabled: isConsultantRole && Number.isFinite(ticketId),
  });

  const sendFormMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const res = await api.post(`/consultant/tickets/${ticketId}/send-form`, {
        template_id: templateId,
      });
      return res.data;
    },
    onSuccess: async () => {
      setShowSendFormModal(false);
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['ticket-invitations', ticketId] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr.response?.data?.message || 'Failed to send form to customer.');
    },
  });

  const effectiveStatus = useMemo(() => statusValue || ticket?.status || '', [statusValue, ticket?.status]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};

      if (effectiveStatus && effectiveStatus !== ticket?.status) {
        payload.status = effectiveStatus;
      }

      if (scheduledAtValue) {
        payload.scheduled_at = new Date(scheduledAtValue).toISOString();
      }

      if (meetingUrlValue) {
        payload.meeting_url = meetingUrlValue;
      }

      if (durationValue) {
        payload.meeting_duration_minutes = Number(durationValue);
      }

      if (resolutionNotesValue) {
        payload.resolution_notes = resolutionNotesValue;
      }

      if (consultationNotesValue) {
        payload.consultation_notes = consultationNotesValue;
      }

      const res = await api.put<ApiResponse<Ticket>>(`/consultant/tickets/${ticketId}`, payload);
      return res.data.data;
    },
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['consultant-ticket', ticketId] });
      await queryClient.invalidateQueries({ queryKey: ['consultant-tickets'] });
      await queryClient.invalidateQueries({ queryKey: ['consultant-dashboard'] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr.response?.data?.message || 'Failed to update ticket.');
    },
  });

  const confirmSlotMutation = useMutation({
    mutationFn: async () => {
      if (selectedSlotIndex === null) {
        throw new Error('Please select a time slot');
      }

      const res = await api.post<ApiResponse<Ticket>>(`/consultant/tickets/${ticketId}/confirm-slot`, {
        slot_index: selectedSlotIndex,
        duration_minutes: durationValue ? Number(durationValue) : 60,
      });
      return res.data.data;
    },
    onSuccess: async () => {
      setActionError(null);
      setSelectedSlotIndex(null);
      await queryClient.invalidateQueries({ queryKey: ['consultant-ticket', ticketId] });
      await queryClient.invalidateQueries({ queryKey: ['consultant-tickets'] });
      await queryClient.invalidateQueries({ queryKey: ['consultant-dashboard'] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr.response?.data?.message || 'Failed to confirm time slot.');
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const hasFiles = commentFiles.length > 0;
      const payload = hasFiles ? new FormData() : {
        body: commentBody,
        is_internal: isInternal,
      };

      if (payload instanceof FormData) {
        if (commentBody.trim()) {
          payload.append('body', commentBody);
        }
        payload.append('is_internal', String(isInternal));
        commentFiles.forEach((file) => payload.append('attachments[]', file));
      }

      const res = await api.post<ApiResponse<TicketComment>>(`/consultant/tickets/${ticketId}/comments`, payload, payload instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined);
      return res.data.data;
    },
    onSuccess: async () => {
      setCommentBody('');
      setCommentFiles([]);
      setIsInternal(false);
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['consultant-ticket', ticketId] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr.response?.data?.message || 'Failed to add comment.');
    },
  });

  const handleCommentSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commentBody.trim() && commentFiles.length === 0) return;
    commentMutation.mutate();
  };

  if (!isConsultantRole) {
    return (
      <div className="px-6 py-8">
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">
            {t('detail.accessRequired')}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !ticket) {
    return (
      <div className="px-6 py-8">
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">{t('detail.loading')}</CardContent>
        </Card>
      </div>
    );
  }

  const documents = ticket.property?.documents ?? [];

  return (
    <div className="px-6 py-8 space-y-6">
      <Button asChild variant="ghost" className="-ml-2">
        <Link href="/consultant/tickets">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('detail.backToTickets')}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{ticket.ticket_number}</CardTitle>
            <Badge className={statusBadgeClass(ticket.status)}>{ticket.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="font-semibold text-wisebox-text-primary">{ticket.title}</p>

          <div className="flex flex-wrap gap-2">
            {STATUS_FLOW.map((step) => (
              <span
                key={step}
                className={`px-2.5 py-1 rounded-full text-xs border ${
                  step === ticket.status
                    ? 'bg-wisebox-primary-500/15 text-wisebox-primary-400 border-wisebox-primary-500/30'
                    : 'bg-wisebox-background-card text-wisebox-text-secondary border-wisebox-border'
                }`}
              >
                {step}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-wisebox-text-secondary">
            <p>
              {t('detail.fields.customer')}: <span className="font-medium text-wisebox-text-primary">{ticket.customer?.name ?? '-'}</span>
            </p>
            <p>
              {t('detail.fields.customerEmail')}: <span className="font-medium text-wisebox-text-primary">{ticket.customer?.email ?? '-'}</span>
            </p>
            <p>
              {t('detail.fields.property')}: <span className="font-medium text-wisebox-text-primary">{ticket.property?.property_name ?? '-'}</span>
            </p>
            <p>
              {t('detail.fields.service')}: <span className="font-medium text-wisebox-text-primary">{ticket.service?.name ?? '-'}</span>
            </p>
            <p>
              {t('detail.fields.priority')}: <span className="font-medium text-wisebox-text-primary">{ticket.priority}</span>
            </p>
            <p>
              {t('detail.fields.scheduled')}: <span className="font-medium text-wisebox-text-primary">{ticket.scheduled_at ? new Date(ticket.scheduled_at).toLocaleString() : '-'}</span>
            </p>
          </div>

          {ticket.meeting_url && (
            <Button asChild variant="outline">
              <a href={ticket.meeting_url} target="_blank" rel="noreferrer">{t('detail.joinMeeting')}</a>
            </Button>
          )}
        </CardContent>
      </Card>

      {ticket.preferred_time_slots && Array.isArray(ticket.preferred_time_slots) && ticket.preferred_time_slots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('detail.timeSlots.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-wisebox-text-secondary">
              {t('detail.timeSlots.description', { count: ticket.preferred_time_slots.length })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ticket.preferred_time_slots.map((slot: { date: string; time: string; display: string }, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedSlotIndex(index)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedSlotIndex === index
                      ? 'border-wisebox-primary-500 bg-wisebox-primary-500/10'
                      : 'border-wisebox-border hover:border-wisebox-primary-500/50 bg-wisebox-background-card'
                  }`}
                >
                  <div className="font-medium text-wisebox-text-primary">
                    {slot.display || `${new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${slot.time}`}
                  </div>
                  {selectedSlotIndex === index && (
                    <div className="mt-2 text-xs text-wisebox-primary-400 font-medium">✓ {t('detail.timeSlots.selected')}</div>
                  )}
                </button>
              ))}
            </div>
            {selectedSlotIndex !== null && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => confirmSlotMutation.mutate()}
                  disabled={confirmSlotMutation.isPending}
                  className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600 w-full sm:w-auto"
                >
                  {confirmSlotMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('detail.timeSlots.creatingMeet')}
                    </>
                  ) : (
                    t('detail.timeSlots.confirmAndCreate')
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.updateTicket')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('detail.statusLabel')}</Label>
              <Select value={effectiveStatus} onValueChange={(value) => setStatusValue(value as TicketStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('detail.scheduledAt')}</Label>
              <Input
                type="datetime-local"
                value={scheduledAtValue || toLocalDateTimeValue(ticket.scheduled_at)}
                onChange={(e) => setScheduledAtValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('detail.meetingUrl')}</Label>
              <Input
                placeholder="https://meet.google.com/..."
                value={meetingUrlValue || ticket.meeting_url || ''}
                onChange={(e) => setMeetingUrlValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('detail.duration')}</Label>
              <Input
                type="number"
                min={1}
                max={480}
                value={durationValue || (ticket.meeting_duration_minutes ? String(ticket.meeting_duration_minutes) : '')}
                onChange={(e) => setDurationValue(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('detail.resolutionNotes')}</Label>
            <Textarea
              rows={3}
              value={resolutionNotesValue || ticket.resolution_notes || ''}
              onChange={(e) => setResolutionNotesValue(e.target.value)}
              placeholder={t('detail.resolutionNotesPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('detail.consultationNotes')}</Label>
            <Textarea
              rows={5}
              value={consultationNotesValue || ticket.consultation_notes || ''}
              onChange={(e) => setConsultationNotesValue(e.target.value)}
              placeholder={t('detail.consultationNotesPlaceholder')}
            />
            <p className="text-xs text-wisebox-text-secondary">
              {t('detail.consultationNotesHint')}
            </p>
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('detail.saving')}
              </>
            ) : (
              t('detail.saveUpdates')
            )}
          </Button>

          {actionError && (
            <p className="text-sm text-wisebox-status-danger border border-wisebox-status-danger/30 bg-wisebox-status-danger/10 rounded-md px-3 py-2">
              {actionError}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.documents.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-wisebox-text-secondary">{t('detail.documents.noDocuments')}</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc: PropertyDocument) => (
                <div key={doc.id} className="rounded-md border p-3 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium text-wisebox-text-primary">
                      {doc.document_type?.name ?? doc.file_name ?? t('detail.documents.title')}
                    </p>
                    <p className="text-wisebox-text-secondary">
                      {doc.has_document ? doc.file_name : t('detail.documents.markedMissing')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.has_document && (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-wisebox-primary-400 hover:text-wisebox-primary-300"
                      >
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/documents/${doc.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            api.get(`/documents/${doc.id}/download`, { responseType: 'blob' })
                              .then((res) => {
                                const url = window.URL.createObjectURL(new Blob([res.data], { type: doc.mime_type }));
                                if (doc.mime_type === 'application/pdf' || doc.mime_type.startsWith('image/')) {
                                  window.open(url, '_blank');
                                } else {
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = doc.file_name;
                                  link.click();
                                  window.URL.revokeObjectURL(url);
                                }
                              })
                              .catch(() => setActionError(t('detail.documents.downloadFailed')));
                          }}
                        >
                          {doc.mime_type === 'application/pdf' || doc.mime_type?.startsWith('image/')
                            ? <><Eye className="h-4 w-4 mr-1" />{t('detail.documents.view')}</>
                            : <><Download className="h-4 w-4 mr-1" />{t('detail.documents.download')}</>
                          }
                        </a>
                      </Button>
                    )}
                    <Badge className={doc.has_document ? 'bg-wisebox-status-success/20 text-wisebox-status-success' : 'bg-wisebox-status-warning/20 text-wisebox-status-warning'}>
                      {doc.has_document ? doc.status : 'missing'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('detail.forms.title')}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowSendFormModal(true)}
                variant="outline"
                size="sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                {t('detail.forms.sendToCustomer')}
              </Button>
              <Button
                onClick={() => setShowFormModal(true)}
                className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t('detail.forms.fillForm')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sent Invitations */}
          {invitations && invitations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-wisebox-text-secondary uppercase tracking-wider">{t('detail.forms.sentToCustomer')}</p>
              {invitations.map((inv) => (
                <div key={inv.id} className="rounded-md border p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-wisebox-text-primary">{inv.template.name}</p>
                    <p className="text-xs text-wisebox-text-secondary">
                      {t('detail.forms.sentAt', { date: new Date(inv.sent_at).toLocaleString(), email: inv.customer_email })}
                    </p>
                  </div>
                  <Badge className={
                    inv.status === 'completed'
                      ? 'bg-wisebox-status-success/20 text-wisebox-status-success'
                      : inv.status === 'expired' || new Date(inv.expires_at) < new Date()
                        ? 'bg-wisebox-background-lighter text-wisebox-text-secondary'
                        : 'bg-wisebox-status-warning/20 text-wisebox-status-warning'
                  }>
                    {inv.status === 'completed'
                      ? t('detail.forms.statusCompleted')
                      : new Date(inv.expires_at) < new Date()
                        ? t('detail.forms.statusExpired')
                        : t('detail.forms.statusPending')}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Completed Responses */}
          {!responses || responses.length === 0 ? (
            <p className="text-sm text-wisebox-text-secondary">
              {t('detail.forms.noForms')}
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-medium text-wisebox-text-secondary uppercase tracking-wider">{t('detail.forms.completedResponses')}</p>
              {responses.map((response) => (
                <div key={response.id} className="rounded-md border p-3 bg-wisebox-background-lighter">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-medium text-wisebox-text-primary">{response.template.name}</p>
                    <span className="text-xs text-wisebox-text-secondary">
                      {new Date(response.created_at).toLocaleString()}
                    </span>
                  </div>
                  {response.summary && (
                    <p className="text-sm text-wisebox-text-secondary whitespace-pre-wrap">
                      {response.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-wisebox-background-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {!selectedTemplate ? (
              <>
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('detail.forms.selectForm')}</h3>
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="text-wisebox-text-muted hover:text-wisebox-text-secondary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 space-y-3 overflow-y-auto">
                  {consultantTemplates?.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className="w-full text-left p-4 rounded-lg border-2 border-wisebox-border hover:border-wisebox-primary-500 hover:bg-wisebox-primary-500/10 transition-all"
                    >
                      <h4 className="font-semibold text-wisebox-text-primary mb-1">{template.name}</h4>
                      <p className="text-sm text-wisebox-text-secondary">{template.description}</p>
                      <p className="text-xs text-wisebox-text-muted mt-2">
                        {t('detail.forms.fieldsCount', { count: template.fields.length })}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      setShowFormModal(false);
                    }}
                    className="text-wisebox-text-muted hover:text-wisebox-text-secondary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <DynamicFormRenderer
                    template={selectedTemplate}
                    ticketId={ticketId}
                    onSuccess={() => {
                      setSelectedTemplate(null);
                      setShowFormModal(false);
                    }}
                    onCancel={() => setSelectedTemplate(null)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Send Form to Customer Modal */}
      {showSendFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-wisebox-background-card rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('detail.forms.sendFormTitle')}</h3>
              <button
                onClick={() => setShowSendFormModal(false)}
                className="text-wisebox-text-muted hover:text-wisebox-text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-2 overflow-y-auto">
              <p className="text-sm text-wisebox-text-secondary mb-4">
                {t('detail.forms.sendFormDescription', { email: ticket.customer?.email ?? '' })}
              </p>
              {customerTemplates?.map((template) => (
                <button
                  key={template.id}
                  onClick={() => sendFormMutation.mutate(template.id)}
                  disabled={sendFormMutation.isPending}
                  className="w-full text-left p-4 rounded-lg border-2 border-wisebox-border hover:border-wisebox-primary-500 hover:bg-wisebox-primary-500/10 transition-all disabled:opacity-50"
                >
                  <h4 className="font-semibold text-wisebox-text-primary mb-1">{template.name}</h4>
                  <p className="text-sm text-wisebox-text-secondary">{template.description}</p>
                  <p className="text-xs text-wisebox-text-muted mt-2">
                    {t('detail.forms.fieldsCount', { count: template.fields.length })}
                  </p>
                </button>
              ))}
              {sendFormMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-wisebox-text-secondary pt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('detail.forms.sendingForm')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.conversation.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(ticket.comments ?? []).length === 0 ? (
            <p className="text-sm text-wisebox-text-secondary">{t('detail.conversation.noComments')}</p>
          ) : (
            <div className="space-y-3">
              {(ticket.comments ?? []).map((comment) => (
                <div key={comment.id} className="rounded-md border p-3 bg-wisebox-background-card">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-wisebox-text-primary">{comment.user?.name ?? t('detail.conversation.user')}</p>
                    <div className="flex items-center gap-2">
                      {comment.is_internal && <Badge className="bg-wisebox-status-scheduled/20 text-wisebox-status-scheduled">{t('detail.conversation.internalBadge')}</Badge>}
                      <span className="text-xs text-wisebox-text-secondary">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-wisebox-text-secondary whitespace-pre-wrap">{comment.body}</p>
                  {(comment.attachments ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(comment.attachments ?? []).map((attachment) => (
                        <span
                          key={attachment}
                          className="rounded-full border border-wisebox-border bg-wisebox-background-lighter px-2.5 py-1 text-xs text-wisebox-text-secondary"
                        >
                          {attachment.split('/').pop()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="space-y-3 border-t pt-4">
            <Textarea
              rows={4}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder={t('detail.conversation.writePlaceholder')}
            />
            <div className="space-y-2">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setCommentFiles(Array.from(e.target.files ?? []))}
                className="block w-full text-sm text-wisebox-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-wisebox-primary-500/20 file:px-3 file:py-1.5 file:text-wisebox-primary-400"
              />
              {commentFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {commentFiles.map((file) => (
                    <span
                      key={`${file.name}-${file.size}`}
                      className="rounded-full border border-wisebox-border bg-wisebox-background-lighter px-2.5 py-1 text-xs text-wisebox-text-secondary"
                    >
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-wisebox-text-secondary">
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
              {t('detail.conversation.internalNote')}
            </label>
            <Button
              type="submit"
              className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600"
              disabled={commentMutation.isPending || (!commentBody.trim() && commentFiles.length === 0)}
            >
              {commentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('detail.conversation.sending')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('detail.conversation.addComment')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
