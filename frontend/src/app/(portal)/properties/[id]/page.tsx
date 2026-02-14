'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronRight, ArrowLeft, History, ClipboardList, ChevronRight as ArrowRight, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyOverview } from '@/components/property/property-overview';
import { DocumentStatusList } from '@/components/property/document-status-list';
import { AssessmentSection } from '@/components/property/assessment-section';
import { ConsultationSection } from '@/components/property/consultation-section';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { ApiResponse, PaginatedResponse, Property, PropertyAssessment } from '@/types';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['property', Number(id)],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Property>>(`/properties/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/properties/${id}`),
    onSuccess: () => {
      router.push('/properties');
    },
  });

  const { data: assessmentsResponse } = useQuery({
    queryKey: ['property', Number(id), 'assessments'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<PropertyAssessment>>(`/properties/${id}/assessments`, {
        params: { per_page: 5 },
      });
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="px-6 py-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-48 rounded bg-wisebox-background-lighter" />
          <div className="h-64 w-full rounded-xl bg-wisebox-background-card" />
          <div className="h-48 w-full rounded-xl bg-wisebox-background-card" />
          <div className="h-32 w-full rounded-xl bg-wisebox-background-card" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center space-y-4">
          <p className="text-sm text-red-700">
            Property not found or could not be loaded.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/properties">
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/properties"
          className="hover:text-foreground transition-colors"
        >
          Properties
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-xs">
          {property.property_name}
        </span>
      </nav>

      <PropertyOverview property={property} />

      <ConsultationSection property={property} />

      <DocumentStatusList
        propertyId={property.id}
        ownershipStatusSlug={property.ownership_status?.slug}
        completionPercentage={property.completion_percentage}
        completionStatus={property.completion_status}
      />

      <AssessmentSection property={property} assessmentHistory={assessmentsResponse?.data ?? []} />

      {/* Quick Access to Consultation History */}
      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Consultation Resources</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href={`/properties/${property.id}/journal`}>
            <div className="p-4 rounded-lg border border-wisebox-border hover:border-wisebox-primary/50 bg-wisebox-background-lighter hover:bg-wisebox-background-lighter/80 transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="h-5 w-5 text-wisebox-primary" />
                    <h3 className="font-semibold text-white">Consultation History</h3>
                  </div>
                  <p className="text-sm text-wisebox-text-secondary">
                    View all completed consultations and expert assessments for this property
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-wisebox-text-muted group-hover:text-wisebox-primary transition-colors flex-shrink-0" />
              </div>
            </div>
          </Link>

          <Link href={`/properties/${property.id}/recommendations`}>
            <div className="p-4 rounded-lg border border-wisebox-border hover:border-wisebox-primary/50 bg-wisebox-background-lighter hover:bg-wisebox-background-lighter/80 transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="h-5 w-5 text-wisebox-primary" />
                    <h3 className="font-semibold text-white">Recommendations</h3>
                  </div>
                  <p className="text-sm text-wisebox-text-secondary">
                    See action items and expert recommendations from your consultations
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-wisebox-text-muted group-hover:text-wisebox-primary transition-colors flex-shrink-0" />
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 p-6 space-y-3">
        <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
        <Separator className="bg-red-500/20" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-wisebox-text-primary">Delete this property</p>
            <p className="text-xs text-wisebox-text-secondary">Permanently remove this property and all associated documents.</p>
          </div>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
                Delete Property
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-wisebox-background-card border-wisebox-border">
              <DialogHeader>
                <DialogTitle className="text-white">Are you sure?</DialogTitle>
                <DialogDescription className="text-wisebox-text-secondary">
                  This will permanently delete &quot;{property.property_name}&quot;
                  and all associated documents. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
              {deleteMutation.isError && (
                <p className="text-sm text-red-400">
                  Failed to delete property. Please try again.
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
