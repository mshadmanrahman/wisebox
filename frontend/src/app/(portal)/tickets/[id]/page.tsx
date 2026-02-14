'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, ExternalLink, Loader2, Send } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ApiResponse, Ticket, TicketComment, TicketStatus } from '@/types';

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

const STATUS_TIMELINE: Array<{ id: string; label: string }> = [
  { id: 'open', label: 'Opened' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'completed', label: 'Completed' },
];

function timelineStepIndex(status: TicketStatus): number {
  if (status === 'open') return 0;
  if (status === 'assigned') return 1;
  if (status === 'in_progress' || status === 'awaiting_customer' || status === 'awaiting_consultant') return 2;
  if (status === 'scheduled') return 3;
  return 4;
}

function statusBadgeClass(status: Ticket['status']): string {
  if (status === 'completed') return 'bg-green-500/20 text-green-400';
  if (status === 'in_progress' || status === 'assigned') return 'bg-blue-500/20 text-blue-400';
  if (status === 'scheduled') return 'bg-purple-500/20 text-purple-400';
  if (status === 'cancelled') return 'bg-wisebox-background-lighter text-wisebox-text-secondary';
  return 'bg-amber-500/20 text-amber-400';
}

interface ConsultantOption {
  id: number;
  name: string;
  email: string;
  open_tickets_count: number;
}

interface SchedulingLinkData {
  booking_url: string;
}

export default function TicketDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const ticketId = Number(params.id);

  const [commentBody, setCommentBody] = useState('');
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [isInternal, setIsInternal] = useState(false);
  const [statusValue, setStatusValue] = useState<TicketStatus | ''>('');
  const [consultantIdValue, setConsultantIdValue] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [schedulingUrl, setSchedulingUrl] = useState<string>('');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const canManageStatus = isAdmin || user?.role === 'consultant';
  const canUseInternalComments = canManageStatus;

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ticket>>(`/tickets/${ticketId}`);
      return res.data.data;
    },
    enabled: Number.isFinite(ticketId),
  });

  const { data: consultants } = useQuery({
    queryKey: ['consultants-for-ticket-assignment'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ConsultantOption[]>>('/consultants');
      return res.data.data;
    },
    enabled: isAdmin,
  });

  const effectiveStatusValue = useMemo(
    () => statusValue || ticket?.status || '',
    [statusValue, ticket?.status]
  );

  const effectiveConsultantValue = useMemo(
    () => consultantIdValue || (ticket?.consultant_id ? String(ticket.consultant_id) : ''),
    [consultantIdValue, ticket?.consultant_id]
  );

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const hasFiles = commentFiles.length > 0;
      const payload = hasFiles ? new FormData() : {
        body: commentBody,
        is_internal: canUseInternalComments ? isInternal : false,
      };

      if (payload instanceof FormData) {
        if (commentBody.trim()) {
          payload.append('body', commentBody);
        }
        payload.append('is_internal', String(canUseInternalComments ? isInternal : false));
        commentFiles.forEach((file) => payload.append('attachments[]', file));
      }

      const res = await api.post<ApiResponse<TicketComment>>(`/tickets/${ticketId}/comments`, payload, payload instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined);
      return res.data.data;
    },
    onSuccess: async () => {
      setCommentBody('');
      setCommentFiles([]);
      setIsInternal(false);
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      await queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr.response?.data?.message || 'Could not send comment.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (nextStatus: TicketStatus) => {
      const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${ticketId}/status`, {
        status: nextStatus,
      });
      return res.data.data;
    },
    onSuccess: async (updatedTicket) => {
      setStatusValue(updatedTicket.status);
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      await queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr.response?.data?.message || 'Could not update status.');
    },
  });

  const assignConsultantMutation = useMutation({
    mutationFn: async (consultantId: number) => {
      const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${ticketId}/assign`, {
        consultant_id: consultantId,
      });
      return res.data.data;
    },
    onSuccess: async (updatedTicket) => {
      setConsultantIdValue(updatedTicket.consultant_id ? String(updatedTicket.consultant_id) : '');
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      await queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr.response?.data?.message || 'Could not assign consultant.');
    },
  });

  const schedulingLinkMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<SchedulingLinkData>>(`/tickets/${ticketId}/schedule-link`);
      return res.data.data;
    },
    onSuccess: (data) => {
      setSchedulingUrl(data.booking_url);
      setActionError(null);
      if (typeof window !== 'undefined') {
        window.open(data.booking_url, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setActionError(axiosErr.response?.data?.message || 'Could not generate scheduling link.');
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commentBody.trim() && commentFiles.length === 0) return;
    addCommentMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">Loading ticket...</CardContent>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="px-6 py-8">
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="font-medium text-wisebox-text-primary">Ticket not found.</p>
            <Button asChild variant="outline">
              <Link href="/tickets">Back to tickets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <Button asChild variant="ghost" className="-ml-2">
        <Link href="/tickets">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tickets
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{ticket.ticket_number}</CardTitle>
            <Badge className={statusBadgeClass(ticket.status)}>{ticket.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="font-semibold text-wisebox-text-primary">{ticket.title}</p>
          {ticket.description && <p className="text-wisebox-text-secondary">{ticket.description}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-wisebox-text-secondary">
            <p>
              Priority: <span className="font-medium text-wisebox-text-primary">{ticket.priority}</span>
            </p>
            <p>
              Created: <span className="font-medium text-wisebox-text-primary">{new Date(ticket.created_at).toLocaleString()}</span>
            </p>
            {ticket.customer?.name && (
              <p>
                Customer: <span className="font-medium text-wisebox-text-primary">{ticket.customer.name}</span>
              </p>
            )}
            {ticket.consultant?.name && (
              <p>
                Consultant: <span className="font-medium text-wisebox-text-primary">{ticket.consultant.name}</span>
              </p>
            )}
            {ticket.property?.property_name && (
              <p>
                Property: <span className="font-medium text-wisebox-text-primary">{ticket.property.property_name}</span>
              </p>
            )}
            {ticket.service?.name && (
              <p>
                Service: <span className="font-medium text-wisebox-text-primary">{ticket.service.name}</span>
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t">
            <p className="font-medium text-wisebox-text-primary">Status Timeline</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_TIMELINE.map((step, index) => {
                const currentIndex = timelineStepIndex(ticket.status);
                const isActive = index <= currentIndex;
                return (
                  <span
                    key={step.id}
                    className={`px-2.5 py-1 rounded-full text-xs border ${
                      isActive
                        ? 'bg-wisebox-primary-500/15 text-wisebox-primary-400 border-wisebox-primary-500/30'
                        : 'bg-wisebox-background-card text-wisebox-text-secondary border-wisebox-border'
                    }`}
                  >
                    {step.label}
                  </span>
                );
              })}
            </div>
            {(ticket.status === 'awaiting_customer' || ticket.status === 'awaiting_consultant') && (
              <p className="text-xs text-wisebox-text-secondary">
                Conversation is required before moving forward to scheduling.
              </p>
            )}
            {ticket.status === 'cancelled' && (
              <p className="text-xs text-red-400">This ticket has been cancelled.</p>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-wisebox-primary-400" />
              <p className="font-medium text-wisebox-text-primary">Meeting</p>
            </div>

            {ticket.scheduled_at ? (
              <p className="text-sm text-wisebox-text-secondary">
                Scheduled for{' '}
                <span className="font-medium text-wisebox-text-primary">
                  {new Date(ticket.scheduled_at).toLocaleString()}
                </span>
                {ticket.meeting_duration_minutes ? ` (${ticket.meeting_duration_minutes} mins)` : ''}
              </p>
            ) : (
              <p className="text-sm text-wisebox-text-secondary">
                No meeting scheduled yet.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {ticket.meeting_url && (
                <Button asChild variant="outline">
                  <a href={ticket.meeting_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join meeting link
                  </a>
                </Button>
              )}

              {!ticket.scheduled_at && ticket.consultant_id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => schedulingLinkMutation.mutate()}
                  disabled={schedulingLinkMutation.isPending}
                >
                  {schedulingLinkMutation.isPending ? 'Generating link...' : 'Get scheduling link'}
                </Button>
              )}
            </div>

            {schedulingUrl && (
              <p className="text-xs text-wisebox-text-secondary break-all">
                Latest link:{' '}
                <a
                  href={schedulingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-wisebox-primary-400 underline underline-offset-2"
                >
                  {schedulingUrl}
                </a>
              </p>
            )}
          </div>

          {(canManageStatus || isAdmin) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
              {canManageStatus && (
                <div className="space-y-2">
                  <p className="font-medium text-wisebox-text-primary">Update Status</p>
                  <div className="flex gap-2">
                    <Select
                      value={effectiveStatusValue}
                      onValueChange={(value) => setStatusValue(value as TicketStatus)}
                    >
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
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        updateStatusMutation.isPending ||
                        !effectiveStatusValue ||
                        effectiveStatusValue === ticket.status
                      }
                      onClick={() => updateStatusMutation.mutate(effectiveStatusValue as TicketStatus)}
                    >
                      {updateStatusMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="space-y-2">
                  <p className="font-medium text-wisebox-text-primary">Assign Consultant</p>
                  <div className="flex gap-2">
                    <Select
                      value={effectiveConsultantValue}
                      onValueChange={(value) => setConsultantIdValue(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select consultant" />
                      </SelectTrigger>
                      <SelectContent>
                        {(consultants ?? []).map((consultant) => (
                          <SelectItem key={consultant.id} value={String(consultant.id)}>
                            {consultant.name} ({consultant.open_tickets_count} open)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        assignConsultantMutation.isPending ||
                        !effectiveConsultantValue ||
                        String(ticket.consultant_id ?? '') === effectiveConsultantValue
                      }
                      onClick={() => assignConsultantMutation.mutate(Number(effectiveConsultantValue))}
                    >
                      {assignConsultantMutation.isPending ? 'Assigning...' : 'Assign'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {actionError && (
            <p className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-md px-3 py-2">
              {actionError}
            </p>
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
                <div key={comment.id} className="rounded-md border p-3 bg-wisebox-background-card">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-wisebox-text-primary">{comment.user?.name ?? 'User'}</p>
                    <div className="flex items-center gap-2">
                      {comment.is_internal && (
                        <Badge className="bg-purple-500/20 text-purple-400">Internal</Badge>
                      )}
                      <span className="text-xs text-wisebox-text-secondary">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-wisebox-text-secondary whitespace-pre-wrap">{comment.body}</p>
                  {(comment.attachments ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(comment.attachments ?? []).map((attachment) => (
                        <span
                          key={attachment}
                          className="rounded-full border border-wisebox-border bg-wisebox-background-card px-2.5 py-1 text-xs text-wisebox-text-secondary"
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

          <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
            <Textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Write a message..."
              rows={4}
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
                      className="rounded-full border border-wisebox-border bg-wisebox-background-card px-2.5 py-1 text-xs text-wisebox-text-secondary"
                    >
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {canUseInternalComments && (
              <label className="flex items-center gap-2 text-sm text-wisebox-text-secondary">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                Mark as internal note
              </label>
            )}
            <Button
              type="submit"
              className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600"
              disabled={addCommentMutation.isPending || (!commentBody.trim() && commentFiles.length === 0)}
            >
              {addCommentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send message
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
