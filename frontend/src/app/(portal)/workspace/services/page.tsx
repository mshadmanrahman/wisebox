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

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPropertyId) {
        throw new Error('Please select a property first.');
      }

      if (selectedServices.length === 0) {
        throw new Error('Please select at least one service.');
      }

      const payload = {
        property_id: selectedPropertyId,
        items: selectedServices.map((serviceId) => ({ service_id: serviceId, quantity: 1 })),
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
          <h1 className="text-2xl font-bold text-wisebox-text-primary">Choose Services</h1>
          <p className="text-wisebox-text-secondary mt-1">
            Select the services you want and proceed to checkout.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/orders')}>
          View Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-wisebox-text-primary">Select Property</p>
            <Select
              value={selectedPropertyId ? String(selectedPropertyId) : ''}
              onValueChange={(value) => setSelectedPropertyId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the property for this order" />
              </SelectTrigger>
              <SelectContent>
                {(properties ?? []).map((property) => (
                  <SelectItem key={property.id} value={String(property.id)}>
                    {property.property_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-wisebox-text-secondary" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search services by name or keywords"
                  className="pl-9"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                      {typeof category.active_services_count === 'number'
                        ? ` (${category.active_services_count})`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={pricingFilter} onValueChange={(value: 'all' | 'free' | 'paid' | 'physical') => setPricingFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by pricing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All pricing types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={sortFilter}
                onValueChange={(value: 'recommended' | 'price_low' | 'price_high' | 'name_asc' | 'name_desc') => setSortFilter(value)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Sort services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended order</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="name_asc">Name: A to Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>

              <Select value={featuredFilter} onValueChange={(value: 'all' | 'featured') => setFeaturedFilter(value)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Featured filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  <SelectItem value="featured">Featured only</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
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
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {services.length === 0 && !loadingServices ? (
        <Card>
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
                className={`text-left rounded-xl border p-4 transition-all bg-white ${
                  selected
                    ? 'border-wisebox-primary-500 ring-2 ring-wisebox-primary-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-wisebox-text-primary">{service.name}</h3>
                  {selected && <CheckCircle2 className="h-4 w-4 text-wisebox-primary-600 mt-1" />}
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
                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                        : 'bg-wisebox-primary-100 text-wisebox-primary-700 hover:bg-wisebox-primary-100'
                    }
                  >
                    {service.pricing_type === 'free' ? 'Free' : `${service.currency} ${service.price}`}
                  </Badge>
                  {service.is_featured && (
                    <span className="text-xs inline-flex items-center gap-1 text-amber-700">
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
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((current) => Math.min(serviceMeta.last_page, current + 1))}
              disabled={serviceMeta.current_page >= serviceMeta.last_page || loadingServices}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedServiceObjects.length === 0 ? (
            <p className="text-sm text-wisebox-text-secondary">No services selected yet.</p>
          ) : (
            <div className="space-y-2">
              {selectedServiceObjects.map((service) => (
                <div key={service.id} className="flex items-center justify-between text-sm">
                  <span className="text-wisebox-text-primary">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-wisebox-text-primary">
                      {service.pricing_type === 'free' ? 'Free' : `${service.currency} ${service.price}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSelectedService(service.id)}
                      className="text-xs text-wisebox-text-secondary hover:text-wisebox-text-primary"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-semibold text-wisebox-text-primary">Total</span>
            <span className="text-lg font-bold text-wisebox-primary-700">USD {total.toFixed(2)}</span>
          </div>

          <Button
            className="w-full bg-wisebox-primary-500 hover:bg-wisebox-primary-600"
            disabled={
              createOrderMutation.isPending ||
              !selectedPropertyId ||
              selectedServices.length === 0
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
