'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { ApiResponse, Ticket, TicketComment } from '@/types';

function statusBadgeClass(status: Ticket['status']): string {
  if (status === 'completed') return 'bg-green-100 text-green-700';
  if (status === 'in_progress' || status === 'assigned') return 'bg-blue-100 text-blue-700';
  if (status === 'scheduled') return 'bg-purple-100 text-purple-700';
  if (status === 'cancelled') return 'bg-gray-100 text-gray-600';
  return 'bg-amber-100 text-amber-700';
}

export default function TicketDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const ticketId = Number(params.id);

  const [commentBody, setCommentBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Ticket>>(`/tickets/${ticketId}`);
      return res.data.data;
    },
    enabled: Number.isFinite(ticketId),
  });

  const canUseInternalComments = user?.role === 'consultant' || user?.role === 'admin' || user?.role === 'super_admin';

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<TicketComment>>(`/tickets/${ticketId}/comments`, {
        body: commentBody,
        is_internal: canUseInternalComments ? isInternal : false,
      });
      return res.data.data;
    },
    onSuccess: async () => {
      setCommentBody('');
      setIsInternal(false);
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!commentBody.trim()) return;
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
          </div>
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
                      {comment.is_internal && (
                        <Badge className="bg-purple-100 text-purple-700">Internal</Badge>
                      )}
                      <span className="text-xs text-wisebox-text-secondary">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-wisebox-text-secondary whitespace-pre-wrap">{comment.body}</p>
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
              disabled={addCommentMutation.isPending || !commentBody.trim()}
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
