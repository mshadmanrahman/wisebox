'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { CheckCircle2, Clock3 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiResponse, Order } from '@/types';
import { trackPaymentCompleted } from '@/lib/analytics';

export default function OrderConfirmationPage() {
  const params = useParams();
  const { t } = useTranslation(['orders', 'common']);
  const orderId = Number(params.id);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-confirmation', orderId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
      return res.data.data;
    },
    refetchInterval: (query) => (query.state.data?.payment_status === 'paid' ? false : 4000),
    enabled: Number.isFinite(orderId),
  });

  if (isLoading || !order) {
    return (
      <div className="px-6 py-8">
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 text-sm text-muted-foreground">{t('orders:confirmation.loading')}</CardContent>
        </Card>
      </div>
    );
  }

  const paid = order.payment_status === 'paid';
  const trackedRef = useRef(false);

  useEffect(() => {
    if (paid && !trackedRef.current) {
      trackedRef.current = true;
      trackPaymentCompleted(
        order.items?.[0]?.service?.name ?? 'unknown',
        Number(order.total),
        order.currency
      );
    }
  }, [paid, order]);

  return (
    <div className="px-6 py-8">
      <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
            {paid ? (
              <CheckCircle2 className="h-5 w-5 text-wisebox-status-success" strokeWidth={1.5} />
            ) : (
              <Clock3 className="h-5 w-5 text-wisebox-status-warning" strokeWidth={1.5} />
            )}
            {paid ? t('orders:confirmation.paymentConfirmed') : t('orders:confirmation.paymentProcessing')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('orders:confirmation.orderLabel')} <span className="font-medium text-foreground">{order.order_number}</span>
          </p>

          {paid ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('orders:confirmation.paymentReceived')}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('orders:confirmation.waitingForPayment')}
            </p>
          )}

          <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              {t('orders:detail.total')}: <span className="font-medium text-foreground">{order.currency} {Number(order.total).toFixed(2)}</span>
            </p>
            <p className="text-muted-foreground mt-1">
              {t('orders:confirmation.paymentStatus')}: <span className="font-medium text-foreground">{order.payment_status}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-primary text-primary-foreground rounded-lg transition-all duration-200">
              <Link href="/orders">{t('orders:detail.backToOrders')}</Link>
            </Button>
            <Button asChild variant="outline" className="border border-border hover:bg-muted transition-all duration-200">
              <Link href="/workspace/services">{t('orders:confirmation.bookMoreServices')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
