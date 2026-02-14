'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  scheduled: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  open: 'Pending Review',
  assigned: 'Assigned',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Rejected',
};

const completionColors: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

export default function AdminConsultationsPage() {
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
    { value: '', label: 'All', count: stats.pending + stats.assigned + stats.scheduled + stats.completed + stats.rejected },
    { value: 'open', label: 'Pending', count: stats.pending },
    { value: 'assigned', label: 'Assigned', count: stats.assigned },
    { value: 'scheduled', label: 'Scheduled', count: stats.scheduled },
    { value: 'completed', label: 'Completed', count: stats.completed },
    { value: 'cancelled', label: 'Rejected', count: stats.rejected },
  ];

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Consultation Requests</h1>
        <p className="text-wisebox-text-secondary mt-1">
          Review, approve, and assign consultation requests to consultants
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
                : 'border-wisebox-border text-wisebox-text-secondary hover:bg-wisebox-background-lighter hover:text-white'
            )}
            onClick={() => setStatusFilter(btn.value)}
          >
            {btn.label}
            <span className="ml-1.5 text-xs opacity-70">({btn.count})</span>
          </Button>
        ))}
      </div>

      {/* Consultations List */}
      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-wisebox-text-secondary">Loading...</div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="h-16 w-16 text-wisebox-text-muted mx-auto mb-4" />
              <p className="text-wisebox-text-secondary">
                {statusFilter ? `No ${statusLabels[statusFilter]?.toLowerCase()} consultations` : 'No consultations yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-wisebox-border">
              {consultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/admin/consultations/${consultation.id}`}
                  className="block hover:bg-wisebox-background-lighter transition-colors"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs text-wisebox-text-secondary border-wisebox-border">
                            {consultation.ticket_number}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', statusColors[consultation.status] || '')}>
                            {statusLabels[consultation.status] || consultation.status}
                          </Badge>
                          {consultation.property?.completion_status && (
                            <span className="flex items-center gap-1 text-xs text-wisebox-text-muted">
                              <span className={cn('w-2 h-2 rounded-full', completionColors[consultation.property.completion_status])} />
                              {consultation.property.completion_percentage}% complete
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-white">{consultation.title}</h3>
                        {consultation.description && (
                          <p className="text-sm text-wisebox-text-secondary mt-1 line-clamp-1">
                            {consultation.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-wisebox-text-muted shrink-0 mt-1" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-wisebox-text-muted text-xs">Customer</p>
                        <p className="text-white font-medium">{consultation.customer?.name || 'N/A'}</p>
                        <p className="text-wisebox-text-muted text-xs">{consultation.customer?.email}</p>
                      </div>
                      <div>
                        <p className="text-wisebox-text-muted text-xs">Property</p>
                        <p className="text-white font-medium truncate">{consultation.property?.property_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-wisebox-text-muted text-xs">Consultant</p>
                        <p className="text-white font-medium">{consultation.consultant?.name || 'Unassigned'}</p>
                      </div>
                      <div>
                        <p className="text-wisebox-text-muted text-xs">Requested</p>
                        <p className="text-white font-medium">
                          {new Date(consultation.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {consultation.status === 'open' && consultation.preferred_time_slots && (
                      <div className="mt-3 pt-3 border-t border-wisebox-border flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-yellow-400" />
                        <span className="text-xs text-yellow-400">
                          {consultation.preferred_time_slots.length} preferred time slot(s) submitted
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
