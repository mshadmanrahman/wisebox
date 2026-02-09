'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PropertyOverview } from '@/components/property/property-overview';
import { DocumentStatusList } from '@/components/property/document-status-list';
import { AssessmentSection } from '@/components/property/assessment-section';
import type { ApiResponse, Property } from '@/types';

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;

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

  if (isLoading) {
    return (
      <div className="px-6 py-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-48 rounded bg-gray-200" />
          <div className="h-64 w-full rounded-xl bg-gray-100" />
          <div className="h-48 w-full rounded-xl bg-gray-100" />
          <div className="h-32 w-full rounded-xl bg-gray-100" />
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

      <DocumentStatusList
        propertyId={property.id}
        ownershipStatusSlug={property.ownership_status?.slug}
        completionPercentage={property.completion_percentage}
        completionStatus={property.completion_status}
      />

      <AssessmentSection property={property} />
    </div>
  );
}
