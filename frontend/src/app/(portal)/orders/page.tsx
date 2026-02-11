'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order, PaginatedResponse } from '@/types';

function paymentBadgeClass(status: Order['payment_status']): string {
  if (status === 'paid') return 'bg-green-100 text-green-700';
  if (status === 'pending') return 'bg-amber-100 text-amber-700';
  if (status === 'failed') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
}

export default function OrdersPage() {
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
    'Please try again in a moment.';

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wisebox-text-primary">My Orders</h1>
          <p className="text-wisebox-text-secondary mt-1">
            Track checkout status and service fulfillment.
          </p>
          {isFetching && hasData && (
            <p className="text-xs text-wisebox-text-secondary mt-1">Refreshing orders...</p>
          )}
        </div>
        <Button asChild className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600">
          <Link href="/workspace/services">Add Services</Link>
        </Button>
      </div>

      {isError && !hasData && (
        <Card className="border-red-200 bg-red-50/60">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Could not load orders.
            </div>
            <p className="text-sm text-red-700/90">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isError && hasData && (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-amber-800">
              Showing previously loaded orders. {errorMessage}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && !hasData && (
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">Loading orders...</CardContent>
        </Card>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <h2 className="font-semibold text-wisebox-text-primary">No orders yet</h2>
            <p className="text-sm text-wisebox-text-secondary">
              Start by selecting services for one of your properties.
            </p>
            <Button asChild variant="outline">
              <Link href="/workspace/services">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{order.order_number}</CardTitle>
                <Badge className={paymentBadgeClass(order.payment_status)}>{order.payment_status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-wisebox-text-secondary">
                <p>Total: <span className="font-medium text-wisebox-text-primary">{order.currency} {Number(order.total).toFixed(2)}</span></p>
                <p>Status: <span className="font-medium text-wisebox-text-primary">{order.status}</span></p>
                <p>Date: <span className="font-medium text-wisebox-text-primary">{new Date(order.created_at).toLocaleDateString()}</span></p>
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={`/orders/${order.id}`}>View order</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
