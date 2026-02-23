'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock3 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiResponse, Order } from '@/types';

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
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">{t('orders:confirmation.loading')}</CardContent>
        </Card>
      </div>
    );
  }

  const paid = order.payment_status === 'paid';

  return (
    <div className="px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {paid ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock3 className="h-5 w-5 text-amber-600" />
            )}
            {paid ? t('orders:confirmation.paymentConfirmed') : t('orders:confirmation.paymentProcessing')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-wisebox-text-secondary">
            {t('orders:confirmation.orderLabel')} <span className="font-medium text-wisebox-text-primary">{order.order_number}</span>
          </p>

          {paid ? (
            <p className="text-sm text-wisebox-text-secondary">
              {t('orders:confirmation.paymentReceived')}
            </p>
          ) : (
            <p className="text-sm text-wisebox-text-secondary">
              {t('orders:confirmation.waitingForPayment')}
            </p>
          )}

          <div className="rounded-md border bg-wisebox-background-lighter px-4 py-3 text-sm">
            <p className="text-wisebox-text-secondary">
              {t('orders:detail.total')}: <span className="font-semibold text-wisebox-text-primary">{order.currency} {Number(order.total).toFixed(2)}</span>
            </p>
            <p className="text-wisebox-text-secondary mt-1">
              {t('orders:confirmation.paymentStatus')}: <span className="font-semibold text-wisebox-text-primary">{order.payment_status}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600">
              <Link href="/orders">{t('orders:detail.backToOrders')}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/workspace/services">{t('orders:confirmation.bookMoreServices')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
