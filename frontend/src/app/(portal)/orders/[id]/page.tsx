'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiResponse, Order } from '@/types';

function paymentBadgeClass(status: Order['payment_status']): string {
  if (status === 'paid') return 'bg-green-100 text-green-700';
  if (status === 'pending') return 'bg-amber-100 text-amber-700';
  if (status === 'failed') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
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
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">Loading order...</CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-6 py-8">
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="font-medium text-wisebox-text-primary">Order not found.</p>
            <Button asChild variant="outline">
              <Link href="/orders">Back to orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <Button asChild variant="ghost" className="-ml-2">
        <Link href="/orders">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to orders
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{order.order_number}</CardTitle>
            <Badge className={paymentBadgeClass(order.payment_status)}>{order.payment_status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <p className="text-wisebox-text-secondary">
              Status: <span className="font-medium text-wisebox-text-primary">{order.status}</span>
            </p>
            <p className="text-wisebox-text-secondary">
              Total: <span className="font-medium text-wisebox-text-primary">{order.currency} {Number(order.total).toFixed(2)}</span>
            </p>
            <p className="text-wisebox-text-secondary">
              Created: <span className="font-medium text-wisebox-text-primary">{new Date(order.created_at).toLocaleString()}</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-wisebox-text-primary">Items</p>
            <div className="rounded-lg border divide-y">
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <span className="text-wisebox-text-primary">{item.service?.name ?? `Service #${item.service_id}`}</span>
                  <span className="font-medium text-wisebox-text-primary">{order.currency} {Number(item.total_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {order.payment_status === 'pending' && order.status !== 'cancelled' && (
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600"
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  'Pay with Stripe'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </div>
          )}

          {order.payment_status === 'paid' && (
            <Button asChild variant="outline">
              <Link href={`/orders/${order.id}/confirmation`}>View confirmation</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
