'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { trackServiceCatalogViewed, trackServiceSelected } from '@/lib/analytics';
import { Calendar, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ServiceDetailPanel } from '@/components/services/service-detail-panel';
import { FreeConsultationDialog } from '@/components/property/free-consultation-dialog';
import type { ApiResponse, PaginatedResponse, Property, Service, ServiceCategory, Ticket } from '@/types';

interface LegacyPaginatedServiceCatalogResponse {
  data: Service[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
  first_page_url?: string;
  last_page_url?: string;
  prev_page_url?: string | null;
  next_page_url?: string | null;
}

function normalizeServiceCatalogPayload(
  payload: PaginatedResponse<Service> | LegacyPaginatedServiceCatalogResponse,
  fallbackPerPage: number
): PaginatedResponse<Service> {
  if ('meta' in payload) {
    return payload;
  }

  const legacyPayload = payload as LegacyPaginatedServiceCatalogResponse;

  return {
    data: legacyPayload.data,
    meta: {
      current_page: legacyPayload.current_page ?? 1,
      from: legacyPayload.from ?? 0,
      last_page: legacyPayload.last_page ?? 1,
      per_page: legacyPayload.per_page ?? fallbackPerPage,
      to: legacyPayload.to ?? legacyPayload.data.length,
      total: legacyPayload.total ?? legacyPayload.data.length,
    },
    links: {
      first: legacyPayload.first_page_url ?? '',
      last: legacyPayload.last_page_url ?? '',
      prev: legacyPayload.prev_page_url ?? null,
      next: legacyPayload.next_page_url ?? null,
    },
  };
}

const categoryTabSlugs = ['all', 'consultation', 'legal', 'administrative'] as const;

const categoryTabLabels: Record<string, string> = {
  all: 'All',
  consultation: 'Consultation',
  legal: 'Legal',
  administrative: 'Administrative',
};

function useFormatPrice() {
  const { t } = useTranslation('common');
  return (service: Service): string => {
    if (service.pricing_type === 'free') return t('services.free');
    if (service.pricing_type === 'physical') return t('services.requestQuote');
    if (!service.price || Number(service.price) === 0) return t('services.free');
    const amount = Number(service.price);
    const currency = service.currency || 'USD';
    return `${currency} ${amount}`;
  };
}

export default function ServicesPage() {
  const { t } = useTranslation('common');
  const formatPrice = useFormatPrice();
  const perPage = 8;
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [consultPropertyId, setConsultPropertyId] = useState<string>('');

  useEffect(() => {
    trackServiceCatalogViewed();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const catalogParams = useMemo(
    () => ({
      page,
      per_page: perPage,
      category_slug: activeTab === 'all' ? undefined : activeTab,
      sort: 'recommended' as const,
    }),
    [page, perPage, activeTab]
  );

  const { data: serviceCatalog, isLoading: loadingServices } = useQuery({
    queryKey: ['services', catalogParams],
    placeholderData: keepPreviousData,
    retry: 2,
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Service> | LegacyPaginatedServiceCatalogResponse>('/services', {
        params: catalogParams,
      });
      return normalizeServiceCatalogPayload(res.data, perPage);
    },
  });

  const { data: properties } = useQuery({
    queryKey: ['properties-for-services'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Property>>('/properties', {
        params: { per_page: 100 },
      });
      return res.data.data;
    },
  });

  // Check if user already has a free consultation ticket
  const { data: ticketsData } = useQuery({
    queryKey: ['tickets', 'free-consultation-check'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Ticket>>('/tickets', {
        params: { per_page: 100 },
      });
      return res.data.data;
    },
  });

  const hasUsedFreeConsultation = useMemo(
    () => (ticketsData ?? []).some((t) => t.is_free_consultation),
    [ticketsData]
  );

  const services = useMemo(() => serviceCatalog?.data ?? [], [serviceCatalog]);
  const serviceMeta = serviceCatalog?.meta;

  const selectedConsultProperty = (properties ?? []).find(
    (p) => String(p.id) === consultPropertyId
  );

  const openServiceDetail = (service: Service) => {
    setSelectedService(service);
    setDetailOpen(true);
    trackServiceSelected(service.name ?? String(service.id));
  };

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('services.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('services.subtitle')}
        </p>
      </div>

      {/* Free Consultation Banner */}
      {!hasUsedFreeConsultation && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Icon + Badge + Text + Metadata */}
            <div className="space-y-3 lg:max-w-xl">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-full p-2">
                  <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {t('services.freeConsultation.badge')}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold text-foreground leading-tight">
                {t('services.freeConsultation.title')}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('services.freeConsultation.description')}
              </p>
              <div className="flex items-center gap-4 text-muted-foreground text-xs">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t('services.freeConsultation.duration')}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t('services.freeConsultation.noPayment')}
                </span>
              </div>
            </div>

            {/* Right: Property selector + CTA */}
            <div className="flex flex-col gap-3 lg:min-w-[320px]">
              <label className="text-sm font-medium text-foreground">
                {t('services.freeConsultation.selectProperty')}
              </label>
              {(properties ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('services.freeConsultation.addPropertyFirst')}
                </p>
              ) : (
                <Select value={consultPropertyId} onValueChange={setConsultPropertyId}>
                  <SelectTrigger className="bg-background border-border text-foreground hover:bg-muted transition-all duration-200 h-12">
                    <SelectValue placeholder={t('services.freeConsultation.chooseProperty')} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(properties ?? []).map((property) => (
                      <SelectItem key={property.id} value={String(property.id)} className="text-foreground hover:bg-muted">
                        {property.property_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedConsultProperty ? (
                <FreeConsultationDialog
                  propertyId={selectedConsultProperty.id}
                  propertyName={selectedConsultProperty.property_name}
                  trigger={
                    <Button className="w-full bg-primary text-primary-foreground rounded-lg font-medium h-12 text-base transition-all duration-200">
                      <Calendar className="h-5 w-5 mr-2" strokeWidth={1.5} />
                      {t('services.freeConsultation.bookFree')}
                    </Button>
                  }
                />
              ) : (
                <Button
                  disabled
                  className="w-full bg-muted text-muted-foreground cursor-not-allowed h-12 text-base rounded-lg"
                >
                  <Calendar className="h-5 w-5 mr-2" strokeWidth={1.5} />
                  {(properties ?? []).length === 0
                    ? t('services.freeConsultation.addPropertyBtn')
                    : t('services.freeConsultation.selectPropertyAbove')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Filters */}
      <div className="flex items-center gap-2">
        {categoryTabSlugs.map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => setActiveTab(slug)}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === slug
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-foreground hover:bg-muted'
            )}
          >
            {categoryTabLabels[slug] ?? slug}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loadingServices && services.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={1.5} />
          <span className="ml-2 text-sm text-muted-foreground">{t('services.loadingServices')}</span>
        </div>
      )}

      {/* Empty State */}
      {!loadingServices && services.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-8 text-center shadow-sm dark:shadow-none">
          <p className="text-sm text-muted-foreground">{t('services.noServicesInCategory')}</p>
        </div>
      )}

      {/* Service Grid - 2 columns */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const price = formatPrice(service as Service);

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => openServiceDetail(service)}
                className="text-left bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:border-border/80 group"
              >
                {/* Content */}
                <div className="p-6 space-y-2">
                  <h3 className="text-lg font-medium text-foreground">
                    {service.name}
                  </h3>
                  {service.short_description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {service.short_description}
                    </p>
                  )}
                </div>

                {/* Bottom row */}
                <div className="border-t border-border px-6 py-4 flex items-center justify-between">
                  <Badge
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-medium',
                      service.pricing_type === 'free'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-primary/10 text-primary border-primary/20'
                    )}
                  >
                    {price}
                  </Badge>
                  <span className="text-sm text-primary font-medium transition-all duration-200">
                    {t('services.viewDetails')} &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {serviceMeta && serviceMeta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t('page', { current: serviceMeta.current_page, total: serviceMeta.last_page })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((c) => Math.max(1, c - 1))}
              disabled={serviceMeta.current_page <= 1 || loadingServices}
              className="border border-border text-foreground hover:bg-muted rounded-lg transition-all duration-200"
            >
              {t('previous')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((c) => Math.min(serviceMeta.last_page, c + 1))}
              disabled={serviceMeta.current_page >= serviceMeta.last_page || loadingServices}
              className="border border-border text-foreground hover:bg-muted rounded-lg transition-all duration-200"
            >
              {t('next')}
            </Button>
          </div>
        </div>
      )}

      {/* Service Detail Slide-Over */}
      <ServiceDetailPanel
        service={selectedService}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        properties={properties ?? []}
      />
    </div>
  );
}
