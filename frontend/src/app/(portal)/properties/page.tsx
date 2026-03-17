'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['properties', 'common']);

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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('properties:title')}
        </h1>
        <Button asChild className="bg-primary text-primary-foreground rounded-lg transition-all duration-200">
          <Link href="/properties/new">
            <Plus className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
            {t('properties:addProperty')}
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">
            {t('properties:tabs.all')}{meta ? ` (${meta.total})` : ''}
          </TabsTrigger>
          <TabsTrigger value="draft">{t('properties:tabs.draft')}</TabsTrigger>
          <TabsTrigger value="active">{t('properties:tabs.active')}</TabsTrigger>
          <TabsTrigger value="verified">{t('properties:tabs.verified')}</TabsTrigger>
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
                    className="border border-border hover:bg-muted transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                    {t('common:previous')}
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    {t('common:page', { current: page, total: totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="border border-border hover:bg-muted transition-all duration-200"
                  >
                    {t('common:next')}
                    <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
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
        <Card key={i} className="h-[180px] bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none space-y-4">
          <div className="flex items-start justify-between">
            <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-5 w-16 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between">
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              <div className="h-3 w-8 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation('properties');

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <Building2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-medium text-foreground mb-1">
        {t('empty.title')}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
        {t('empty.description')}
      </p>
      <Button asChild className="bg-primary text-primary-foreground rounded-lg transition-all duration-200">
        <Link href="/properties/new">
          <Plus className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
          {t('addProperty')}
        </Link>
      </Button>
    </div>
  );
}
