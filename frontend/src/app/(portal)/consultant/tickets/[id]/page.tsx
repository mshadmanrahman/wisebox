'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
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
  if (status === 'completed') return 'bg-green-100 text-green-700';
  if (status === 'in_progress' || status === 'assigned') return 'bg-blue-100 text-blue-700';
  if (status === 'scheduled') return 'bg-purple-100 text-purple-700';
  if (status === 'cancelled') return 'bg-gray-100 text-gray-600';
  return 'bg-amber-100 text-amber-700';
}

function toLocalDateTimeValue(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ConsultantTicketDetailPage() {
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

  const [commentBody, setCommentBody] = useState('');
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [isInternal, setIsInternal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['consultant-ticket', ticketId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ticket>>(`/consultant/tickets/${ticketId}`);
      return res.data.data;
    },
    enabled: isConsultantRole && Number.isFinite(ticketId),
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
            Consultant access required.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !ticket) {
    return (
      <div className="px-6 py-8">
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">Loading consultant ticket...</CardContent>
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
          Back to consultant tickets
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
                    ? 'bg-wisebox-primary-50 text-wisebox-primary-700 border-wisebox-primary-200'
                    : 'bg-white text-wisebox-text-secondary border-gray-200'
                }`}
              >
                {step}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-wisebox-text-secondary">
            <p>
              Customer: <span className="font-medium text-wisebox-text-primary">{ticket.customer?.name ?? '-'}</span>
            </p>
            <p>
              Customer Email: <span className="font-medium text-wisebox-text-primary">{ticket.customer?.email ?? '-'}</span>
            </p>
            <p>
              Property: <span className="font-medium text-wisebox-text-primary">{ticket.property?.property_name ?? '-'}</span>
            </p>
            <p>
              Service: <span className="font-medium text-wisebox-text-primary">{ticket.service?.name ?? '-'}</span>
            </p>
            <p>
              Priority: <span className="font-medium text-wisebox-text-primary">{ticket.priority}</span>
            </p>
            <p>
              Scheduled: <span className="font-medium text-wisebox-text-primary">{ticket.scheduled_at ? new Date(ticket.scheduled_at).toLocaleString() : '-'}</span>
            </p>
          </div>

          {ticket.meeting_url && (
            <Button asChild variant="outline">
              <a href={ticket.meeting_url} target="_blank" rel="noreferrer">Join Meeting Link</a>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
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
              <Label>Scheduled At</Label>
              <Input
                type="datetime-local"
                value={scheduledAtValue || toLocalDateTimeValue(ticket.scheduled_at)}
                onChange={(e) => setScheduledAtValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Meeting URL</Label>
              <Input
                placeholder="https://meet.google.com/..."
                value={meetingUrlValue || ticket.meeting_url || ''}
                onChange={(e) => setMeetingUrlValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
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
            <Label>Resolution Notes</Label>
            <Textarea
              rows={3}
              value={resolutionNotesValue || ticket.resolution_notes || ''}
              onChange={(e) => setResolutionNotesValue(e.target.value)}
              placeholder="Add completion notes or summary..."
            />
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Updates'
            )}
          </Button>

          {actionError && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md px-3 py-2">
              {actionError}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-wisebox-text-secondary">No documents uploaded for this property yet.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc: PropertyDocument) => (
                <div key={doc.id} className="rounded-md border p-3 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium text-wisebox-text-primary">
                      {doc.document_type?.name ?? doc.file_name ?? 'Document'}
                    </p>
                    <p className="text-wisebox-text-secondary">
                      {doc.has_document ? doc.file_name : 'Marked as missing'}
                    </p>
                  </div>
                  <Badge className={doc.has_document ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {doc.has_document ? doc.status : 'missing'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(ticket.comments ?? []).length === 0 ? (
            <p className="text-sm text-wisebox-text-secondary">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {(ticket.comments ?? []).map((comment) => (
                <div key={comment.id} className="rounded-md border p-3 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-wisebox-text-primary">{comment.user?.name ?? 'User'}</p>
                    <div className="flex items-center gap-2">
                      {comment.is_internal && <Badge className="bg-purple-100 text-purple-700">Internal</Badge>}
                      <span className="text-xs text-wisebox-text-secondary">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-wisebox-text-secondary whitespace-pre-wrap">{comment.body}</p>
                  {(comment.attachments ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(comment.attachments ?? []).map((attachment) => (
                        <span
                          key={attachment}
                          className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-wisebox-text-secondary"
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
              placeholder="Write an update..."
            />
            <div className="space-y-2">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setCommentFiles(Array.from(e.target.files ?? []))}
                className="block w-full text-sm text-wisebox-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-wisebox-primary-50 file:px-3 file:py-1.5 file:text-wisebox-primary-700"
              />
              {commentFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {commentFiles.map((file) => (
                    <span
                      key={`${file.name}-${file.size}`}
                      className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-wisebox-text-secondary"
                    >
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-wisebox-text-secondary">
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
              Internal note (not visible to customer)
            </label>
            <Button
              type="submit"
              className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600"
              disabled={commentMutation.isPending || (!commentBody.trim() && commentFiles.length === 0)}
            >
              {commentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Add Comment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
