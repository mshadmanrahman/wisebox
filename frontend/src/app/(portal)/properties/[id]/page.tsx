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
          <div className="h-5 w-48 rounded bg-muted" />
          <div className="h-64 w-full rounded-xl bg-card" />
          <div className="h-48 w-full rounded-xl bg-card" />
          <div className="h-32 w-full rounded-xl bg-card" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-8 text-center space-y-4">
          <p className="text-sm text-destructive">
            {t('properties:detail.notFound')}
          </p>
          <Button variant="outline" size="sm" asChild className="border border-border hover:bg-muted transition-all duration-200">
            <Link href="/properties">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
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
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/properties"
          className="hover:text-foreground transition-all duration-200"
        >
          {t('properties:breadcrumb.properties')}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        {property.property_type && (
          <>
            <span className="text-primary uppercase text-xs font-medium">
              {property.property_type.name}
            </span>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </>
        )}
        <span className="text-foreground font-medium truncate max-w-xs">
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
          <Card className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-medium text-foreground">{t('properties:detail.consultationResources')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href={`/properties/${property.id}/journal`}>
                <div className="p-4 rounded-lg border border-border hover:border-primary/50 bg-muted hover:bg-muted/80 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <History className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        <h3 className="font-medium text-foreground">{t('properties:detail.consultationHistory')}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('properties:detail.consultationHistoryDesc')}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-200 flex-shrink-0" strokeWidth={1.5} />
                  </div>
                </div>
              </Link>

              <Link href={`/properties/${property.id}/recommendations`}>
                <div className="p-4 rounded-lg border border-border hover:border-primary/50 bg-muted hover:bg-muted/80 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <ClipboardList className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        <h3 className="font-medium text-foreground">{t('properties:detail.recommendations')}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('properties:detail.recommendationsDesc')}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-200 flex-shrink-0" strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <div className="rounded-xl border border-destructive/20 p-6 space-y-3">
            <h3 className="text-sm font-medium text-destructive">{t('properties:detail.dangerZone')}</h3>
            <Separator className="bg-destructive/20" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{t('properties:detail.deleteProperty')}</p>
                <p className="text-xs text-muted-foreground">{t('properties:detail.deleteDescription')}</p>
              </div>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive/80 transition-all duration-200">
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    {t('properties:detail.deleteProperty')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">{t('properties:detail.deleteConfirmTitle')}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {t('properties:detail.deleteConfirmDescription', { name: property.property_name })}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteOpen(false)}
                      disabled={deleteMutation.isPending}
                      className="border border-border hover:bg-muted transition-all duration-200"
                    >
                      {t('common:cancel')}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="transition-all duration-200"
                    >
                      {deleteMutation.isPending ? t('properties:detail.deleting') : t('common:delete')}
                    </Button>
                  </DialogFooter>
                  {deleteMutation.isError && (
                    <p className="text-sm text-destructive">
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
