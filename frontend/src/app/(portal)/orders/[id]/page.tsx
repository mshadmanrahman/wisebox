'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiResponse, Order } from '@/types';

function paymentBadgeClass(status: Order['payment_status']): string {
  if (status === 'paid') return 'bg-wisebox-status-success/20 text-wisebox-status-success';
  if (status === 'pending') return 'bg-wisebox-status-warning/20 text-wisebox-status-warning';
  if (status === 'failed') return 'bg-destructive/20 text-destructive';
  return 'bg-muted text-muted-foreground';
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['orders', 'common']);
  const orderId = Number(params.id);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
      return res.data.data;
    },
    enabled: Number.isFinite(orderId),
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<{ checkout_url: string; session_id: string | null }>>(
        `/orders/${orderId}/checkout`
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data.checkout_url.startsWith('http')) {
        window.location.href = data.checkout_url;
        return;
      }
      router.push(data.checkout_url);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/orders/${orderId}/cancel`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 text-sm text-muted-foreground">{t('orders:detail.loading')}</CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-6 py-8">
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 space-y-3">
            <p className="font-medium text-foreground">{t('orders:detail.notFound')}</p>
            <Button asChild variant="outline" className="border border-border hover:bg-muted transition-all duration-200">
              <Link href="/orders">{t('orders:detail.backToOrders')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <Button asChild variant="ghost" className="-ml-2 transition-all duration-200">
        <Link href="/orders">
          <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={1.5} />
          {t('orders:detail.backToOrders')}
        </Link>
      </Button>

      <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base font-medium text-foreground">{order.order_number}</CardTitle>
            <Badge className={paymentBadgeClass(order.payment_status)}>{order.payment_status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <p className="text-muted-foreground">
              {t('orders:detail.status')}: <span className="font-medium text-foreground">{order.status}</span>
            </p>
            <p className="text-muted-foreground">
              {t('orders:detail.total')}: <span className="font-medium text-foreground">{order.currency} {Number(order.total).toFixed(2)}</span>
            </p>
            <p className="text-muted-foreground">
              {t('orders:detail.created')}: <span className="font-medium text-foreground">{new Date(order.created_at).toLocaleString()}</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-foreground">{t('orders:detail.items')}</p>
            <div className="rounded-lg border border-border divide-y divide-border">
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.service?.name ?? `Service #${item.service_id}`}</span>
                  <span className="font-medium text-foreground">{order.currency} {Number(item.total_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {order.payment_status === 'pending' && order.status !== 'cancelled' && (
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                className="bg-primary text-primary-foreground rounded-lg transition-all duration-200"
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('orders:detail.redirecting')}
                  </>
                ) : (
                  t('orders:detail.payWithStripe')
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="border border-border hover:bg-muted transition-all duration-200"
              >
                {cancelMutation.isPending ? t('orders:detail.cancelling') : t('orders:detail.cancelOrder')}
              </Button>
            </div>
          )}

          {order.payment_status === 'paid' && (
            <Button asChild variant="outline" className="border border-border hover:bg-muted transition-all duration-200">
              <Link href={`/orders/${order.id}/confirmation`}>{t('orders:detail.viewConfirmation')}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
