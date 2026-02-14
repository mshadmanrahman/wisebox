'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  scheduled: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminConsultationDetailPage() {
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
          <div className="h-5 w-48 rounded bg-wisebox-background-lighter" />
          <div className="h-64 w-full rounded-xl bg-wisebox-background-lighter" />
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="px-6 py-8">
        <p className="text-wisebox-text-secondary">Consultation not found.</p>
      </div>
    );
  }

  const isPending = consultation.status === 'open';

  return (
    <div className="px-6 py-8 space-y-6 max-w-4xl">
      {/* Back */}
      <Button variant="ghost" asChild className="text-wisebox-text-secondary hover:text-white">
        <Link href="/admin/consultations">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Consultations
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs text-wisebox-text-secondary border-wisebox-border">
              {consultation.ticket_number}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', statusColors[consultation.status] || '')}>
              {consultation.status === 'open' ? 'Pending Review' : consultation.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-white">{consultation.title}</h1>
        </div>
      </div>

      {/* Customer & Property Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardHeader>
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-white font-medium">{consultation.customer?.name}</p>
            <p className="text-wisebox-text-secondary">{consultation.customer?.email}</p>
            {consultation.customer?.phone && (
              <p className="text-wisebox-text-secondary">{consultation.customer.phone}</p>
            )}
            {consultation.customer?.country_of_residence && (
              <p className="text-wisebox-text-muted flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {consultation.customer.country_of_residence}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardHeader>
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-white font-medium">{consultation.property?.property_name}</p>
            {consultation.property?.property_type && (
              <p className="text-wisebox-text-secondary">Type: {consultation.property.property_type.name}</p>
            )}
            {consultation.property?.ownership_status && (
              <p className="text-wisebox-text-secondary">Status: {consultation.property.ownership_status.name}</p>
            )}
            {consultation.property?.documents && (
              <p className="text-wisebox-text-muted">
                {consultation.property.documents.length} document(s) uploaded
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {consultation.description && (
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardHeader>
            <CardTitle className="text-sm text-white">Consultation Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-wisebox-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {consultation.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preferred Time Slots */}
      {consultation.preferred_time_slots && consultation.preferred_time_slots.length > 0 && (
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardHeader>
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Preferred Time Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {consultation.preferred_time_slots.map((slot: { date: string; time: string }, i: number) => (
                <Badge key={i} variant="outline" className="border-wisebox-border text-white py-1.5 px-3">
                  <Clock className="h-3 w-3 mr-1.5" />
                  {new Date(slot.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at {slot.time}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Section (only for pending) */}
      {isPending && (
        <Card className="bg-wisebox-background-card border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white">Take Action</CardTitle>
            <CardDescription className="text-wisebox-text-secondary">
              Approve and assign a consultant, or reject the request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Approve Section */}
            {!showRejectForm && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Assign Consultant</Label>
                  <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                    <SelectTrigger className="bg-wisebox-background-lighter border-wisebox-border text-white">
                      <SelectValue placeholder="Select a consultant..." />
                    </SelectTrigger>
                    <SelectContent className="bg-wisebox-background-card border-wisebox-border">
                      {consultants.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={String(c.id)}
                          className="text-white hover:bg-wisebox-background-lighter"
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{c.name}</span>
                            <span className="text-xs text-wisebox-text-muted">
                              {c.active_tickets_count}/{c.max_concurrent} cases
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Admin Notes (optional)</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Any notes for the consultant..."
                    className="bg-wisebox-background-lighter border-wisebox-border text-white placeholder:text-wisebox-text-muted"
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
                    Approve & Assign
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => setShowRejectForm(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>

                {approveMutation.isError && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Failed to approve. Please try again.
                  </p>
                )}
              </div>
            )}

            {/* Reject Section */}
            {showRejectForm && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Reason for Rejection</Label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    className="bg-wisebox-background-lighter border-wisebox-border text-white placeholder:text-wisebox-text-muted"
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
                    Confirm Rejection
                  </Button>
                  <Button
                    variant="outline"
                    className="border-wisebox-border text-white hover:bg-wisebox-background-lighter"
                    onClick={() => setShowRejectForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assigned Consultant Info (for non-pending) */}
      {consultation.consultant && (
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardHeader>
            <CardTitle className="text-sm text-white">Assigned Consultant</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="text-white font-medium">{consultation.consultant.name}</p>
            <p className="text-wisebox-text-secondary">{consultation.consultant.email}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
