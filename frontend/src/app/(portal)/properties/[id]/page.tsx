'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronRight, ArrowLeft, History, ClipboardList, ChevronRight as ArrowRight, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyOverview } from '@/components/property/property-overview';
import { PropertySidebar } from '@/components/property/property-sidebar';
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
  const { t } = useTranslation(['properties', 'common']);
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
        <div className="rounded-xl border border-wisebox-status-danger/20 bg-wisebox-status-danger/10 p-8 text-center space-y-4">
          <p className="text-sm text-wisebox-status-danger">
            {t('properties:detail.notFound')}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/properties">
              <ArrowLeft className="h-4 w-4" />
              {t('properties:detail.backToProperties')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-wisebox-text-secondary">
        <Link
          href="/properties"
          className="hover:text-wisebox-text-primary transition-colors"
        >
          {t('properties:breadcrumb.properties')}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {property.property_type && (
          <>
            <span className="text-wisebox-primary uppercase text-xs font-medium">
              {property.property_type.name}
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-wisebox-text-primary font-medium truncate max-w-xs">
          {property.property_name}
        </span>
      </nav>

      {/* 2-Column Layout */}
      <div className="flex gap-8">
        {/* Left Column */}
        <div className="flex-1 min-w-0 space-y-6">
          <PropertyOverview property={property} />

          <ConsultationSection property={property} />

          <DocumentStatusList
            propertyId={property.id}
            ownershipStatusSlug={property.ownership_status?.slug}
            completionPercentage={property.completion_percentage}
            completionStatus={property.completion_status}
          />

          <AssessmentSection property={property} assessmentHistory={assessmentsResponse?.data ?? []} />

          {/* Consultation Resources */}
          <Card className="bg-wisebox-background-card border-wisebox-border">
            <CardHeader>
              <CardTitle className="text-lg text-wisebox-text-primary">{t('properties:detail.consultationResources')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href={`/properties/${property.id}/journal`}>
                <div className="p-4 rounded-lg border border-wisebox-border hover:border-wisebox-primary/50 bg-wisebox-background-lighter hover:bg-wisebox-background-lighter/80 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <History className="h-5 w-5 text-wisebox-primary" />
                        <h3 className="font-semibold text-wisebox-text-primary">{t('properties:detail.consultationHistory')}</h3>
                      </div>
                      <p className="text-sm text-wisebox-text-secondary">
                        {t('properties:detail.consultationHistoryDesc')}
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
                        <h3 className="font-semibold text-wisebox-text-primary">{t('properties:detail.recommendations')}</h3>
                      </div>
                      <p className="text-sm text-wisebox-text-secondary">
                        {t('properties:detail.recommendationsDesc')}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-wisebox-text-muted group-hover:text-wisebox-primary transition-colors flex-shrink-0" />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <div className="rounded-xl border border-wisebox-status-danger/20 p-6 space-y-3">
            <h3 className="text-sm font-medium text-wisebox-status-danger">{t('properties:detail.dangerZone')}</h3>
            <Separator className="bg-wisebox-status-danger/20" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wisebox-text-primary">{t('properties:detail.deleteProperty')}</p>
                <p className="text-xs text-wisebox-text-secondary">{t('properties:detail.deleteDescription')}</p>
              </div>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-wisebox-status-danger/30 text-wisebox-status-danger hover:bg-wisebox-status-danger/10 hover:text-wisebox-status-danger/80">
                    <Trash2 className="h-4 w-4" />
                    {t('properties:detail.deleteProperty')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-wisebox-background-card border-wisebox-border">
                  <DialogHeader>
                    <DialogTitle className="text-wisebox-text-primary">{t('properties:detail.deleteConfirmTitle')}</DialogTitle>
                    <DialogDescription className="text-wisebox-text-secondary">
                      {t('properties:detail.deleteConfirmDescription', { name: property.property_name })}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteOpen(false)}
                      disabled={deleteMutation.isPending}
                    >
                      {t('common:cancel')}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? t('properties:detail.deleting') : t('common:delete')}
                    </Button>
                  </DialogFooter>
                  {deleteMutation.isError && (
                    <p className="text-sm text-wisebox-status-danger">
                      {t('properties:detail.deleteFailed')}
                    </p>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-8">
            <PropertySidebar property={property} />
          </div>
        </div>
      </div>
    </div>
  );
}
