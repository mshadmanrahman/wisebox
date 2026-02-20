'use client';

import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
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

const categoryTabs = [
  { label: 'All', slug: 'all' },
  { label: 'Consultation', slug: 'consultation' },
  { label: 'Legal', slug: 'legal' },
  { label: 'Administrative', slug: 'administrative' },
];

const categoryGradients: Record<string, string> = {
  consultation: 'from-cyan-600 via-blue-700 to-indigo-800',
  legal: 'from-emerald-600 via-teal-700 to-cyan-800',
  administrative: 'from-violet-600 via-purple-700 to-indigo-800',
  default: 'from-slate-600 via-slate-700 to-slate-800',
};

function getServiceGradient(service: Service): string {
  const slug = service.category?.slug ?? '';
  return categoryGradients[slug] || categoryGradients.default;
}

function formatPrice(service: Service): string {
  if (service.pricing_type === 'free') return 'FREE';
  if (service.pricing_type === 'physical') return 'REQUEST QUOTE';
  if (!service.price || Number(service.price) === 0) return 'FREE';
  const amount = Number(service.price);
  const currency = service.currency || 'USD';
  return `${currency} ${amount}`;
}

export default function ServicesPage() {
  const perPage = 8;
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [consultPropertyId, setConsultPropertyId] = useState<string>('');

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
  };

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Wisebox Services</h1>
        <p className="text-wisebox-text-secondary mt-1">
          Browse our catalog of property services
        </p>
      </div>

      {/* Free Consultation Banner */}
      {!hasUsedFreeConsultation && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-800 p-[1px]">
          <div className="relative rounded-2xl bg-gradient-to-r from-cyan-600/95 via-blue-700/95 to-indigo-800/95 px-6 py-8 sm:px-8">
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50 pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left: Text */}
              <div className="space-y-3 lg:max-w-xl">
                <div className="flex items-center gap-2">
                  <div className="bg-white/15 rounded-full p-2 backdrop-blur-sm">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs font-semibold">
                    FREE
                  </Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Get a Free 30-Minute<br className="hidden sm:block" /> Expert Consultation
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  Not sure where to start? Our property experts will review your documents,
                  assess your situation, and give you a clear action plan. No strings attached.
                </p>
                <div className="flex items-center gap-4 text-white/60 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    30 minutes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    No payment required
                  </span>
                </div>
              </div>

              {/* Right: Property selector + CTA */}
              <div className="flex flex-col gap-3 lg:min-w-[320px]">
                <label className="text-white/80 text-sm font-medium">
                  Select a property for your consultation
                </label>
                {(properties ?? []).length === 0 ? (
                  <p className="text-white/60 text-sm">
                    Add a property first to book a consultation.
                  </p>
                ) : (
                  <Select value={consultPropertyId} onValueChange={setConsultPropertyId}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors backdrop-blur-sm h-12">
                      <SelectValue placeholder="Choose your property..." />
                    </SelectTrigger>
                    <SelectContent className="bg-wisebox-background-card border-wisebox-border">
                      {(properties ?? []).map((property) => (
                        <SelectItem key={property.id} value={String(property.id)} className="text-white hover:bg-wisebox-background-lighter">
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
                      <Button className="w-full bg-white hover:bg-gray-100 text-blue-800 font-semibold h-12 text-base shadow-lg">
                        <Calendar className="h-5 w-5 mr-2" />
                        Book Free Consultation
                      </Button>
                    }
                  />
                ) : (
                  <Button
                    disabled
                    className="w-full bg-white/20 text-white/50 cursor-not-allowed h-12 text-base"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    {(properties ?? []).length === 0
                      ? 'Add a Property First'
                      : 'Select a Property Above'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Filters */}
      <div className="flex items-center gap-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            onClick={() => setActiveTab(tab.slug)}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.slug
                ? 'bg-white text-wisebox-background shadow-md'
                : 'bg-wisebox-background-card text-wisebox-text-secondary border border-wisebox-border hover:border-wisebox-border-light hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loadingServices && services.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-wisebox-text-secondary" />
          <span className="ml-2 text-sm text-wisebox-text-secondary">Loading services...</span>
        </div>
      )}

      {/* Empty State */}
      {!loadingServices && services.length === 0 && (
        <div className="rounded-2xl border border-wisebox-border bg-wisebox-background-card p-8 text-center">
          <p className="text-wisebox-text-secondary">No services found in this category.</p>
        </div>
      )}

      {/* Service Grid - 2 columns */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const gradient = getServiceGradient(service);
            const price = formatPrice(service);

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => openServiceDetail(service)}
                className="text-left rounded-2xl border border-wisebox-border overflow-hidden transition-all hover:shadow-lg hover:border-wisebox-border-light bg-wisebox-background-card group"
              >
                {/* Gradient Banner */}
                <div className={cn('h-32 bg-gradient-to-r relative', gradient)}>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-wisebox-primary-light transition-colors">
                    {service.name}
                  </h3>
                  {service.short_description && (
                    <p className="text-sm text-wisebox-text-secondary line-clamp-2">
                      {service.short_description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <Badge
                      className={cn(
                        'text-xs font-semibold',
                        service.pricing_type === 'free'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-wisebox-primary/20 text-wisebox-primary border-wisebox-primary/30'
                      )}
                    >
                      {price}
                    </Badge>
                    <span className="text-xs text-wisebox-primary group-hover:text-wisebox-primary-light transition-colors">
                      View details →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {serviceMeta && serviceMeta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-wisebox-text-secondary">
            Page {serviceMeta.current_page} of {serviceMeta.last_page}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((c) => Math.max(1, c - 1))}
              disabled={serviceMeta.current_page <= 1 || loadingServices}
              className="border-wisebox-border text-white hover:bg-wisebox-background-lighter"
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((c) => Math.min(serviceMeta.last_page, c + 1))}
              disabled={serviceMeta.current_page >= serviceMeta.last_page || loadingServices}
              className="border-wisebox-border text-white hover:bg-wisebox-background-lighter"
            >
              Next
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
