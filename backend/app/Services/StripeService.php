<?php

namespace App\Services;

use App\Models\Order;
use RuntimeException;
use Stripe\Checkout\Session;
use Stripe\Event;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeService
{
    public function createCheckoutSession(Order $order): Session
    {
        $secret = config('services.stripe.secret');

        if (empty($secret)) {
            throw new RuntimeException('Stripe secret is not configured.');
        }

        $order->loadMissing(['items.service']);

        $lineItems = [];

        foreach ($order->items as $item) {
            $service = $item->service;
            if (!$service) {
                continue;
            }

            if ($service->stripe_price_id) {
                $lineItems[] = [
                    'price' => $service->stripe_price_id,
                    'quantity' => $item->quantity,
                ];
                continue;
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => strtolower($order->currency ?: 'USD'),
                    'product_data' => [
                        'name' => $service->name,
                        'description' => $service->short_description ?: $service->description,
                    ],
                    'unit_amount' => (int) round(((float) $item->unit_price) * 100),
                ],
                'quantity' => $item->quantity,
            ];
        }

        if ($lineItems === []) {
            throw new RuntimeException('No billable items found for this order.');
        }

        $frontendUrl = rtrim(config('services.frontend.url', 'http://localhost:3000'), '/');

        $client = new StripeClient($secret);

        return $client->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'success_url' => "{$frontendUrl}/orders/{$order->id}/confirmation?session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => "{$frontendUrl}/orders/{$order->id}",
            'metadata' => [
                'order_id' => (string) $order->id,
                'user_id' => (string) $order->user_id,
            ],
        ]);
    }

    public function constructEvent(string $payload, ?string $signature): Event
    {
        $webhookSecret = config('services.stripe.webhook_secret');

        if (empty($webhookSecret)) {
            throw new RuntimeException('Stripe webhook secret is not configured.');
        }

        if (empty($signature)) {
            throw new RuntimeException('Missing Stripe signature header.');
        }

        return Webhook::constructEvent($payload, $signature, $webhookSecret);
    }
}
