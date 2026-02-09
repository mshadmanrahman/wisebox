'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ApiResponse, Order, PaginatedResponse, Property, Service } from '@/types';

export default function ServicesPage() {
  const router = useRouter();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Service[]>>('/services');
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

  const selectedServiceObjects = useMemo(
    () =>
      (services ?? []).filter((service) => selectedServices.includes(service.id)),
    [services, selectedServices]
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

  const toggleService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
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
        <CardContent className="space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(services ?? []).map((service) => {
          const selected = selectedServices.includes(service.id);
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.id)}
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
                  <span className="font-medium text-wisebox-text-primary">
                    {service.pricing_type === 'free' ? 'Free' : `${service.currency} ${service.price}`}
                  </span>
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
