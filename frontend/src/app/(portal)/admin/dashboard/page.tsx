'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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
  open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  scheduled: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminDashboard() {
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
            <Shield className="h-6 w-6 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-wisebox-text-secondary">
            Manage consultation requests and platform operations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-wisebox-background-card border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wisebox-text-secondary">Pending</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wisebox-background-card border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wisebox-text-secondary">Assigned</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{stats.assigned}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wisebox-background-card border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wisebox-text-secondary">Scheduled</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wisebox-background-card border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wisebox-text-secondary">Completed</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wisebox-background-card border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wisebox-text-secondary">Rejected</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Consultations */}
      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Consultation Requests</CardTitle>
            <CardDescription className="text-wisebox-text-secondary">
              Review and manage incoming consultation requests
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="border-wisebox-border text-white hover:bg-wisebox-background-lighter">
            <Link href="/admin/consultations">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-wisebox-text-secondary">Loading consultations...</p>
          ) : consultations.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-wisebox-text-muted mx-auto mb-4" />
              <p className="text-wisebox-text-secondary">No consultation requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/admin/consultations/${consultation.id}`}
                  className="block"
                >
                  <div className="bg-wisebox-background-lighter border border-wisebox-border hover:border-amber-500/50 rounded-xl p-5 transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs text-wisebox-text-secondary border-wisebox-border">
                            {consultation.ticket_number}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', statusColors[consultation.status] || '')}>
                            {consultation.status === 'open' ? 'Pending Review' : consultation.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-white text-base">{consultation.title}</h3>
                        {consultation.description && (
                          <p className="text-sm text-wisebox-text-secondary mt-1 line-clamp-2">
                            {consultation.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-wisebox-text-muted shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-wisebox-text-muted text-xs">Customer</p>
                        <p className="text-white font-medium">{consultation.customer?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-wisebox-text-muted text-xs">Property</p>
                        <p className="text-white font-medium truncate">{consultation.property?.property_name || 'N/A'}</p>
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
