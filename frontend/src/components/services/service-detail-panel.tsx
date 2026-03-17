'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Calendar, Loader2, MapPin, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { TimeSlotPicker } from '@/components/consultation/time-slot-picker';
import { cn } from '@/lib/utils';
import type { ApiResponse, Order, Property, Service } from '@/types';

interface ServiceDetailPanelProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
}

interface TimeSlot {
  date: string;
  time: string;
  display: string;
}

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
  const { t } = useTranslation('common');
  const formatPrice = useFormatPrice();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [preferredSlots, setPreferredSlots] = useState<TimeSlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const needsScheduling = service?.requires_meeting ?? false;
  const hasEnoughSlots = !needsScheduling || preferredSlots.length >= 2;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPropertyId || !service) {
        throw new Error(t('services.detail.selectPropertyFirst'));
      }
      if (needsScheduling && preferredSlots.length < 2) {
        throw new Error(t('services.detail.selectAtLeast2SlotsError'));
      }

      const payload: Record<string, unknown> = {
        property_id: Number(selectedPropertyId),
        items: [{ service_id: service.id, quantity: 1 }],
      };

      if (description.trim()) {
        payload.description = description.trim();
      }
      if (needsScheduling && preferredSlots.length > 0) {
        payload.preferred_slots = preferredSlots;
      }

      const res = await api.post<ApiResponse<Order>>('/orders', payload);
      return res.data.data;
    },
    onSuccess: (order) => {
      onOpenChange(false);
      // Reset form state
      setDescription('');
      setPreferredSlots([]);
      setSelectedPropertyId('');

      if (order.payment_status === 'paid') {
        router.push(`/orders/${order.id}/confirmation`);
        return;
      }
      router.push(`/orders/${order.id}`);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : t('services.detail.couldNotCreate');
      setError(message);
    },
  });

  if (!service) return null;

  const price = formatPrice(service);
  const isFree = service.pricing_type === 'free' || (!service.price || Number(service.price) === 0);

  const ctaLabel = isFree
    ? t('services.detail.bookNow')
    : needsScheduling
    ? t('services.detail.bookAndPay')
    : t('services.detail.buyNow');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          'w-full bg-card border-l border-border overflow-y-auto',
          needsScheduling ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        )}
      >
        <SheetHeader className="pb-0">
          <div className="flex items-start justify-between gap-4">
            <SheetTitle className="text-xl font-semibold text-foreground">{service.name}</SheetTitle>
            <Badge
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0',
                isFree
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-primary/10 text-primary border-primary/20'
              )}
            >
              {price}
            </Badge>
          </div>
          {service.estimated_duration_minutes && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" strokeWidth={1.5} />
              {t('services.detail.estimatedDuration', { minutes: service.estimated_duration_minutes })}
            </p>
          )}
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('services.detail.aboutService')}
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {service.description || service.short_description || t('services.detail.noDescription')}
            </p>
          </div>

          {/* Category */}
          {service.category && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('services.detail.category')}
              </h3>
              <Badge variant="outline" className="border-border text-foreground">
                {service.category.name}
              </Badge>
            </div>
          )}

          {/* Property Selection + Scheduling + Buy */}
          <div className="space-y-5 border-t border-border pt-6">
            {/* Step 1: Select Property */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
                {t('services.detail.selectProperty')}
              </h3>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="bg-background border-border text-foreground transition-all duration-200">
                  <SelectValue placeholder={t('services.detail.chooseProperty')} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={String(property.id)} className="text-foreground hover:bg-muted">
                      {property.property_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Describe your needs */}
            {needsScheduling && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">2</span>
                  {t('services.detail.describeNeeds')}
                </h3>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('services.detail.descriptionPlaceholder')}
                    className="pl-10 min-h-[100px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
                    maxLength={1000}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {description.length}/1000
                </p>
              </div>
            )}

            {/* Step 3: Preferred Time Slots */}
            {needsScheduling && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">3</span>
                  {t('services.detail.chooseTimeSlots')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('services.detail.timeSlotsHelp')}
                </p>
                <TimeSlotPicker
                  onSlotsChange={setPreferredSlots}
                  minSlots={2}
                  maxSlots={5}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* CTA Button */}
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200"
              disabled={
                createOrderMutation.isPending ||
                !selectedPropertyId ||
                !hasEnoughSlots
              }
              onClick={() => {
                setError(null);
                createOrderMutation.mutate();
              }}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('services.detail.processing')}
                </>
              ) : (
                <>
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4 ml-2" strokeWidth={1.5} />
                </>
              )}
            </Button>

            {needsScheduling && !hasEnoughSlots && selectedPropertyId && (
              <p className="text-xs text-center text-muted-foreground">
                {t('services.detail.selectAtLeast2Slots')}
              </p>
            )}
          </div>

          {/* Related Properties */}
          {properties.length > 0 && (
            <div className="space-y-3 border-t border-border pt-6">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('services.detail.yourProperties')}
              </h3>
              <div className="space-y-2">
                {properties.slice(0, 4).map((property) => {
                  const location = buildLocation(property);
                  return (
                    <div
                      key={property.id}
                      className="bg-card border border-border rounded-xl p-3"
                    >
                      <p className="text-sm font-medium text-foreground">{property.property_name}</p>
                      {location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" strokeWidth={1.5} />
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
