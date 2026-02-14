'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Sparkles, ArrowRight, FilterX, Search } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ApiResponse, Order, PaginatedResponse, Property, Service, ServiceCategory } from '@/types';
import { TimeSlotPicker } from '@/components/consultation/time-slot-picker';

interface TimeSlot {
  date: string;
  time: string;
  display: string;
}

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

export default function ServicesPage() {
  const router = useRouter();
  const perPage = 6;

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedServiceMap, setSelectedServiceMap] = useState<Record<number, Service>>({});
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid' | 'physical'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured'>('all');
  const [sortFilter, setSortFilter] = useState<'recommended' | 'price_low' | 'price_high' | 'name_asc' | 'name_desc'>('recommended');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query, categoryFilter, pricingFilter, featuredFilter, sortFilter]);

  const catalogParams = useMemo(
    () => ({
      page,
      per_page: perPage,
      q: query.trim() || undefined,
      category_slug: categoryFilter === 'all' ? undefined : categoryFilter,
      pricing_type: pricingFilter === 'all' ? undefined : pricingFilter,
      featured: featuredFilter === 'featured' ? 1 : undefined,
      sort: sortFilter,
    }),
    [page, perPage, query, categoryFilter, pricingFilter, featuredFilter, sortFilter]
  );

  const { data: serviceCatalog, isLoading: loadingServices, isFetching: fetchingServices } = useQuery({
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

  const { data: categories = [] } = useQuery({
    queryKey: ['service-categories'],
    staleTime: 60_000,
    queryFn: async () => {
      const res = await api.get<ApiResponse<ServiceCategory[]>>('/service-categories');
      return res.data.data;
    },
  });

  const { data: properties, isLoading: loadingProperties } = useQuery({
    queryKey: ['properties-for-order'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Property>>('/properties', {
        params: { per_page: 100 },
      });
      return res.data.data;
    },
  });

  const services = useMemo(() => serviceCatalog?.data ?? [], [serviceCatalog]);
  const serviceMeta = serviceCatalog?.meta;

  useEffect(() => {
    if (services.length === 0 || selectedServices.length === 0) {
      return;
    }

    setSelectedServiceMap((previous) => {
      const next = { ...previous };
      let changed = false;

      for (const service of services) {
        if (!selectedServices.includes(service.id)) {
          continue;
        }

        if (!next[service.id] || next[service.id].name !== service.name || next[service.id].price !== service.price) {
          next[service.id] = service;
          changed = true;
        }
      }

      return changed ? next : previous;
    });
  }, [services, selectedServices]);

  const selectedServiceObjects = useMemo(
    () =>
      selectedServices
        .map((serviceId) => selectedServiceMap[serviceId])
        .filter((service): service is Service => Boolean(service)),
    [selectedServices, selectedServiceMap]
  );

  const total = selectedServiceObjects.reduce(
    (sum, service) => sum + Number(service.price || 0),
    0
  );

  // Check if any selected service is a consultation service
  const hasConsultationService = selectedServiceObjects.some(
    (service) =>
      service.name.toLowerCase().includes('consultation') ||
      service.name.toLowerCase().includes('consult') ||
      service.category?.slug === 'consultation'
  );

  // Require time slots for consultation services
  const needsTimeSlots = hasConsultationService;
  const hasRequiredTimeSlots = !needsTimeSlots || selectedTimeSlots.length >= 2;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPropertyId) {
        throw new Error('Please select a property first.');
      }

      if (selectedServices.length === 0) {
        throw new Error('Please select at least one service.');
      }

      if (needsTimeSlots && selectedTimeSlots.length < 2) {
        throw new Error('Please select at least 2 preferred time slots for your consultation.');
      }

      const payload = {
        property_id: selectedPropertyId,
        items: selectedServices.map((serviceId) => ({ service_id: serviceId, quantity: 1 })),
        preferred_time_slots: needsTimeSlots ? selectedTimeSlots : undefined,
      };

      const res = await api.post<ApiResponse<Order>>('/orders', payload);
      return res.data.data;
    },
    onSuccess: (order) => {
      if (order.payment_status === 'paid') {
        router.push(`/orders/${order.id}/confirmation`);
        return;
      }

      router.push(`/orders/${order.id}`);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Could not create order.';
      setError(message);
    },
  });

  const toggleService = (service: Service) => {
    setSelectedServices((previous) => {
      const alreadySelected = previous.includes(service.id);

      setSelectedServiceMap((servicesMap) => {
        const next = { ...servicesMap };
        if (alreadySelected) {
          delete next[service.id];
        } else {
          next[service.id] = service;
        }
        return next;
      });

      return alreadySelected
        ? previous.filter((serviceId) => serviceId !== service.id)
        : [...previous, service.id];
    });
  };

  const clearFilters = () => {
    setQuery('');
    setCategoryFilter('all');
    setPricingFilter('all');
    setFeaturedFilter('all');
    setSortFilter('recommended');
    setPage(1);
  };

  const removeSelectedService = (serviceId: number) => {
    setSelectedServices((previous) => previous.filter((id) => id !== serviceId));
    setSelectedServiceMap((previous) => {
      const next = { ...previous };
      delete next[serviceId];
      return next;
    });
  };

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Choose Services</h1>
          <p className="text-wisebox-text-secondary mt-1">
            Select the services you want and proceed to checkout.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/orders')} className="border-wisebox-border text-white hover:bg-wisebox-background-lighter">
          View Orders
        </Button>
      </div>

      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardHeader>
          <CardTitle className="text-white">Order Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Select Property</p>
            <Select
              value={selectedPropertyId ? String(selectedPropertyId) : ''}
              onValueChange={(value) => setSelectedPropertyId(Number(value))}
            >
              <SelectTrigger className="bg-wisebox-background-input border-wisebox-border text-white">
                <SelectValue placeholder="Select the property for this order" />
              </SelectTrigger>
              <SelectContent className="bg-wisebox-background-card border-wisebox-border">
                {(properties ?? []).map((property) => (
                  <SelectItem key={property.id} value={String(property.id)} className="text-white hover:bg-wisebox-background-lighter">
                    {property.property_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-wisebox-text-muted" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search services by name or keywords"
                  className="pl-9 bg-wisebox-background-input border-wisebox-border text-white placeholder:text-wisebox-text-muted"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-wisebox-background-input border-wisebox-border text-white">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-wisebox-background-card border-wisebox-border">
                  <SelectItem value="all" className="text-white hover:bg-wisebox-background-lighter">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug} className="text-white hover:bg-wisebox-background-lighter">
                      {category.name}
                      {typeof category.active_services_count === 'number'
                        ? ` (${category.active_services_count})`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={pricingFilter} onValueChange={(value: 'all' | 'free' | 'paid' | 'physical') => setPricingFilter(value)}>
                <SelectTrigger className="bg-wisebox-background-input border-wisebox-border text-white">
                  <SelectValue placeholder="Filter by pricing" />
                </SelectTrigger>
                <SelectContent className="bg-wisebox-background-card border-wisebox-border">
                  <SelectItem value="all" className="text-white hover:bg-wisebox-background-lighter">All pricing types</SelectItem>
                  <SelectItem value="free" className="text-white hover:bg-wisebox-background-lighter">Free</SelectItem>
                  <SelectItem value="paid" className="text-white hover:bg-wisebox-background-lighter">Paid</SelectItem>
                  <SelectItem value="physical" className="text-white hover:bg-wisebox-background-lighter">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={sortFilter}
                onValueChange={(value: 'recommended' | 'price_low' | 'price_high' | 'name_asc' | 'name_desc') => setSortFilter(value)}
              >
                <SelectTrigger className="w-[220px] bg-wisebox-background-input border-wisebox-border text-white">
                  <SelectValue placeholder="Sort services" />
                </SelectTrigger>
                <SelectContent className="bg-wisebox-background-card border-wisebox-border">
                  <SelectItem value="recommended" className="text-white hover:bg-wisebox-background-lighter">Recommended order</SelectItem>
                  <SelectItem value="price_high" className="text-white hover:bg-wisebox-background-lighter">Price: High to Low</SelectItem>
                  <SelectItem value="price_low" className="text-white hover:bg-wisebox-background-lighter">Price: Low to High</SelectItem>
                  <SelectItem value="name_asc" className="text-white hover:bg-wisebox-background-lighter">Name: A to Z</SelectItem>
                  <SelectItem value="name_desc" className="text-white hover:bg-wisebox-background-lighter">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>

              <Select value={featuredFilter} onValueChange={(value: 'all' | 'featured') => setFeaturedFilter(value)}>
                <SelectTrigger className="w-[220px] bg-wisebox-background-input border-wisebox-border text-white">
                  <SelectValue placeholder="Featured filter" />
                </SelectTrigger>
                <SelectContent className="bg-wisebox-background-card border-wisebox-border">
                  <SelectItem value="all" className="text-white hover:bg-wisebox-background-lighter">All services</SelectItem>
                  <SelectItem value="featured" className="text-white hover:bg-wisebox-background-lighter">Featured only</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters} className="border-wisebox-border text-white hover:bg-wisebox-background-lighter">
                <FilterX className="h-4 w-4 mr-1.5" />
                Clear filters
              </Button>

              <p className="text-sm text-wisebox-text-secondary">
                {serviceMeta ? `${serviceMeta.total} service(s) found` : `${services.length} service(s) found`}
              </p>
              {fetchingServices && serviceCatalog && (
                <p className="text-xs text-wisebox-text-secondary">Refreshing services...</p>
              )}
            </div>
          </div>

          {(loadingProperties || loadingServices) && (
            <p className="text-sm text-wisebox-text-secondary">Loading services and properties...</p>
          )}

          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {services.length === 0 && !loadingServices ? (
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">
            No services match the current filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const selected = selectedServices.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service)}
                className={`text-left rounded-xl border p-4 transition-all bg-wisebox-background-card ${
                  selected
                    ? 'border-wisebox-primary ring-2 ring-wisebox-primary/30'
                    : 'border-wisebox-border hover:border-wisebox-border-light'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white">{service.name}</h3>
                  {selected && <CheckCircle2 className="h-4 w-4 text-wisebox-primary mt-1" />}
                </div>
                {service.short_description && (
                  <p className="text-sm text-wisebox-text-secondary mt-2 line-clamp-3">
                    {service.short_description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <Badge
                    className={
                      service.pricing_type === 'free'
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20 border-green-500/30'
                        : 'bg-wisebox-primary/20 text-wisebox-primary hover:bg-wisebox-primary/20 border-wisebox-primary/30'
                    }
                  >
                    {service.pricing_type === 'free' ? 'Free' : `${service.currency} ${service.price}`}
                  </Badge>
                  {service.is_featured && (
                    <span className="text-xs inline-flex items-center gap-1 text-amber-400">
                      <Sparkles className="h-3.5 w-3.5" /> Featured
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {serviceMeta && serviceMeta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-wisebox-text-secondary">
            Page {serviceMeta.current_page} of {serviceMeta.last_page}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={serviceMeta.current_page <= 1 || loadingServices}
              className="border-wisebox-border text-white hover:bg-wisebox-background-lighter"
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((current) => Math.min(serviceMeta.last_page, current + 1))}
              disabled={serviceMeta.current_page >= serviceMeta.last_page || loadingServices}
              className="border-wisebox-border text-white hover:bg-wisebox-background-lighter"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Time Slot Picker (shown when consultation service is selected) */}
      {needsTimeSlots && (
        <TimeSlotPicker
          onSlotsChange={setSelectedTimeSlots}
          minSlots={2}
          maxSlots={5}
        />
      )}

      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardHeader>
          <CardTitle className="text-white">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedServiceObjects.length === 0 ? (
            <p className="text-sm text-wisebox-text-secondary">No services selected yet.</p>
          ) : (
            <div className="space-y-2">
              {selectedServiceObjects.map((service) => (
                <div key={service.id} className="flex items-center justify-between text-sm">
                  <span className="text-white">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {service.pricing_type === 'free' ? 'Free' : `${service.currency} ${service.price}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSelectedService(service.id)}
                      className="text-xs text-wisebox-text-secondary hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-wisebox-border pt-3">
            <span className="font-semibold text-white">Total</span>
            <span className="text-lg font-bold text-wisebox-primary">USD {total.toFixed(2)}</span>
          </div>

          <Button
            className="w-full bg-wisebox-primary hover:bg-wisebox-primary-hover text-white"
            disabled={
              createOrderMutation.isPending ||
              !selectedPropertyId ||
              selectedServices.length === 0 ||
              !hasRequiredTimeSlots
            }
            onClick={() => {
              setError(null);
              createOrderMutation.mutate();
            }}
          >
            {createOrderMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating order...
              </>
            ) : (
              <>
                Proceed to checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
