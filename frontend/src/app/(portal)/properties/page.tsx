'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProperties } from '@/hooks/use-properties';
import { PropertyCard } from '@/components/property/property-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import type { PropertyStatus } from '@/types';

type FilterTab = 'all' | PropertyStatus;

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);

  const statusParam = activeTab === 'all' ? undefined : activeTab;
  const { data, isLoading } = useProperties({ page, status: statusParam });

  const properties = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.last_page ?? 1;

  const handleTabChange = (value: string) => {
    setActiveTab(value as FilterTab);
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-wisebox-text-primary">
          My Properties
        </h1>
        <Button asChild className="bg-wisebox-primary hover:bg-wisebox-primary-hover">
          <Link href="/properties/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Property
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">
            All{meta ? ` (${meta.total})` : ''}
          </TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <SkeletonGrid />
          ) : properties.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="h-[180px] p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="h-5 w-2/3 rounded bg-wisebox-background-lighter animate-pulse" />
            <div className="h-5 w-16 rounded bg-wisebox-background-lighter animate-pulse" />
          </div>
          <div className="h-4 w-1/3 rounded bg-wisebox-background-lighter animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-wisebox-background-lighter animate-pulse" />
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between">
              <div className="h-3 w-16 rounded bg-wisebox-background-lighter animate-pulse" />
              <div className="h-3 w-8 rounded bg-wisebox-background-lighter animate-pulse" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-wisebox-background-lighter animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-wisebox-primary-50 p-4 mb-4">
        <Building2 className="h-8 w-8 text-wisebox-primary-600" />
      </div>
      <h2 className="text-lg font-semibold text-wisebox-text-primary mb-1">
        No properties yet
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Add your first property to get started with document management
      </p>
      <Button asChild className="bg-wisebox-primary hover:bg-wisebox-primary-hover">
        <Link href="/properties/new">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Property
        </Link>
      </Button>
    </div>
  );
}
