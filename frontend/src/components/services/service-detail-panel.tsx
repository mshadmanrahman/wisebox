'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Loader2, MapPin } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ApiResponse, Order, Property, Service } from '@/types';

interface ServiceDetailPanelProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
}

function formatPrice(service: Service): string {
  if (service.pricing_type === 'free') return 'FREE';
  if (service.pricing_type === 'physical') return 'Request Quote';
  if (!service.price || Number(service.price) === 0) return 'FREE';
  const amount = Number(service.price);
  const currency = service.currency || 'USD';
  return `${currency} ${amount}`;
}

function buildLocation(property: Property): string | null {
  const parts: string[] = [];
  if (property.division?.name) parts.push(property.division.name);
  if (property.district?.name) parts.push(property.district.name);
  return parts.length > 0 ? parts.join(', ') : null;
}

export function ServiceDetailPanel({
  service,
  open,
  onOpenChange,
  properties,
}: ServiceDetailPanelProps) {
  const router = useRouter();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPropertyId || !service) {
        throw new Error('Please select a property first.');
      }

      const payload = {
        property_id: Number(selectedPropertyId),
        items: [{ service_id: service.id, quantity: 1 }],
      };

      const res = await api.post<ApiResponse<Order>>('/orders', payload);
      return res.data.data;
    },
    onSuccess: (order) => {
      onOpenChange(false);
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

  if (!service) return null;

  const price = formatPrice(service);
  const gradient = service.category?.slug === 'consultation'
    ? 'from-cyan-600 via-blue-700 to-indigo-800'
    : service.category?.slug === 'legal'
    ? 'from-emerald-600 via-teal-700 to-cyan-800'
    : service.category?.slug === 'administrative'
    ? 'from-violet-600 via-purple-700 to-indigo-800'
    : 'from-slate-600 via-slate-700 to-slate-800';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-wisebox-background border-wisebox-border overflow-y-auto">
        <SheetHeader className="pb-0">
          {/* Gradient header */}
          <div className={cn('rounded-xl h-24 bg-gradient-to-r -mx-2 mb-4', gradient)} />
          <div className="flex items-start justify-between gap-4">
            <SheetTitle className="text-xl text-white">{service.name}</SheetTitle>
            <Badge
              className={cn(
                'text-sm font-semibold shrink-0',
                service.pricing_type === 'free'
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-wisebox-primary/20 text-wisebox-primary border-wisebox-primary/30'
              )}
            >
              {price}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-wisebox-text-secondary uppercase tracking-wider">
              About this service
            </h3>
            <p className="text-sm text-white leading-relaxed">
              {service.description || service.short_description || 'No description available.'}
            </p>
          </div>

          {/* Category */}
          {service.category && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-wisebox-text-secondary uppercase tracking-wider">
                Category
              </h3>
              <Badge variant="outline" className="border-wisebox-border text-white">
                {service.category.name}
              </Badge>
            </div>
          )}

          {/* Select Property + Buy */}
          <div className="space-y-4 border-t border-wisebox-border pt-6">
            <h3 className="text-sm font-medium text-white">Select a property for this service</h3>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="bg-wisebox-background-input border-wisebox-border text-white">
                <SelectValue placeholder="Choose a property" />
              </SelectTrigger>
              <SelectContent className="bg-wisebox-background-card border-wisebox-border">
                {properties.map((property) => (
                  <SelectItem key={property.id} value={String(property.id)} className="text-white hover:bg-wisebox-background-lighter">
                    {property.property_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {error && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              className="w-full bg-wisebox-primary hover:bg-wisebox-primary-hover text-white"
              disabled={createOrderMutation.isPending || !selectedPropertyId}
              onClick={() => {
                setError(null);
                createOrderMutation.mutate();
              }}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Buy Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Related Properties */}
          {properties.length > 0 && (
            <div className="space-y-3 border-t border-wisebox-border pt-6">
              <h3 className="text-sm font-medium text-wisebox-text-secondary uppercase tracking-wider">
                Your Properties
              </h3>
              <div className="space-y-2">
                {properties.slice(0, 4).map((property) => {
                  const location = buildLocation(property);
                  return (
                    <div
                      key={property.id}
                      className="rounded-lg border border-wisebox-border p-3 bg-wisebox-background-card"
                    >
                      <p className="text-sm font-medium text-white">{property.property_name}</p>
                      {location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-wisebox-text-secondary">
                          <MapPin className="h-3 w-3" />
                          <span>{location}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
