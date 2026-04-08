'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order, PaginatedResponse } from '@/types';

function paymentBadgeClass(status: Order['payment_status']): string {
  if (status === 'paid') return 'bg-wisebox-status-success/20 text-wisebox-status-success';
  if (status === 'pending') return 'bg-wisebox-status-warning/20 text-wisebox-status-warning';
  if (status === 'failed') return 'bg-destructive/20 text-destructive';
  return 'bg-muted text-muted-foreground';
}

function orderStatusBadgeClass(status: Order['status']): string {
  if (status === 'completed') return 'bg-wisebox-status-success/20 text-wisebox-status-success';
  if (status === 'cancelled') return 'bg-destructive/20 text-destructive';
  if (status === 'in_progress') return 'bg-primary/20 text-primary';
  if (status === 'confirmed') return 'bg-primary/20 text-primary';
  return 'bg-wisebox-status-warning/20 text-wisebox-status-warning';
}

export default function OrdersPage() {
  const { t } = useTranslation(['orders', 'common']);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Order>>('/orders');
      return res.data;
    },
    retry: 2,
  });

  const hasData = Boolean(data);
  const orders = data?.data ?? [];
  const errorMessage =
    (error as { response?: { data?: { message?: string } }; message?: string } | null)?.response?.data?.message ||
    (error as { message?: string } | null)?.message ||
    t('common:tryAgain');

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('orders:title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('orders:subtitle')}
          </p>
          {isFetching && hasData && (
            <p className="text-xs text-muted-foreground mt-1">{t('orders:refreshing')}</p>
          )}
        </div>
        <Button asChild className="bg-primary text-primary-foreground rounded-lg transition-all duration-200">
          <Link href="/workspace/services">{t('orders:addServices')}</Link>
        </Button>
      </div>

      {isError && !hasData && (
        <Card className="border-destructive/20 bg-destructive/10 rounded-xl">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-destructive font-medium">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
              {t('orders:couldNotLoad')}
            </div>
            <p className="text-sm text-destructive/90">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="border border-border hover:bg-muted transition-all duration-200">
              {isFetching ? t('common:retrying') : t('common:retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      {isError && hasData && (
        <Card className="border-wisebox-status-warning/20 bg-wisebox-status-warning/10 rounded-xl">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-wisebox-status-warning">
              {t('common:showingStaleData')} {errorMessage}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="border border-border hover:bg-muted transition-all duration-200">
              {isFetching ? t('common:retrying') : t('common:retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && !hasData && (
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 text-sm text-muted-foreground">{t('orders:loadingOrders')}</CardContent>
        </Card>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 space-y-3">
            <h2 className="font-medium text-foreground">{t('orders:empty.title')}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('orders:empty.description')}
            </p>
            <Button asChild variant="outline" className="border border-border hover:bg-muted transition-all duration-200">
              <Link href="/workspace/services">{t('orders:browseServices')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base font-medium text-foreground">{order.order_number}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={orderStatusBadgeClass(order.status)}>{order.status.replace('_', ' ')}</Badge>
                  {order.status !== 'cancelled' && (
                    <Badge className={paymentBadgeClass(order.payment_status)}>{order.payment_status}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                <p>{t('orders:fields.total')}: <span className="font-medium text-foreground">{order.currency} {Number(order.total).toFixed(2)}</span></p>
                <p>{t('orders:fields.payment')}: <span className="font-medium text-foreground">{order.payment_status}</span></p>
                <p>{t('orders:fields.date')}: <span className="font-medium text-foreground">{new Date(order.created_at).toLocaleDateString()}</span></p>
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto border border-border hover:bg-muted transition-all duration-200">
                <Link href={`/orders/${order.id}`}>{t('orders:viewOrder')}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
