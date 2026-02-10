'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock3 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiResponse, Order } from '@/types';

export default function OrderConfirmationPage() {
  const params = useParams();
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
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">Loading confirmation...</CardContent>
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
            {paid ? 'Payment Confirmed' : 'Payment Processing'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-wisebox-text-secondary">
            Order <span className="font-medium text-wisebox-text-primary">{order.order_number}</span>
          </p>

          {paid ? (
            <p className="text-sm text-wisebox-text-secondary">
              Your payment was received. Tickets for selected services have been created.
            </p>
          ) : (
            <p className="text-sm text-wisebox-text-secondary">
              We are waiting for final payment confirmation from Stripe. This page refreshes automatically.
            </p>
          )}

          <div className="rounded-md border bg-wisebox-surface px-4 py-3 text-sm">
            <p className="text-wisebox-text-secondary">
              Total: <span className="font-semibold text-wisebox-text-primary">{order.currency} {Number(order.total).toFixed(2)}</span>
            </p>
            <p className="text-wisebox-text-secondary mt-1">
              Payment status: <span className="font-semibold text-wisebox-text-primary">{order.payment_status}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600">
              <Link href="/orders">Back to Orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/workspace/services">Book More Services</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
