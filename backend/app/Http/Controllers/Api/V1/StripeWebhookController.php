<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderFulfillmentService;
use App\Services\StripeService;
use App\Services\TransactionalEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    public function __construct(
        private StripeService $stripeService,
        private OrderFulfillmentService $fulfillmentService,
        private TransactionalEmailService $transactionalEmailService
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $event = $this->stripeService->constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature')
            );
        } catch (RuntimeException|SignatureVerificationException|\UnexpectedValueException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutCompleted($event->data->object);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($event->data->object);
                break;

            case 'charge.refunded':
                $this->handleChargeRefunded($event->data->object);
                break;

            default:
                break;
        }

        return response()->json(['received' => true]);
    }

    private function handleCheckoutCompleted(object $session): void
    {
        $orderId = data_get($session, 'metadata.order_id');

        $order = Order::query()
            ->when($orderId, fn ($query) => $query->where('id', $orderId))
            ->orWhere('stripe_checkout_session_id', data_get($session, 'id'))
            ->first();

        if (!$order) {
            return;
        }

        if ($order->payment_status === 'paid') {
            return;
        }

        $order->update([
            'payment_status' => 'paid',
            'status' => 'confirmed',
            'paid_at' => now(),
            'stripe_checkout_session_id' => data_get($session, 'id'),
            'stripe_payment_intent_id' => data_get($session, 'payment_intent'),
        ]);

        $this->fulfillmentService->createFromOrder($order);

        if ($order->user) {
            $this->transactionalEmailService->sendOrderPaid($order->user, $order);
        }
    }

    private function handlePaymentFailed(object $paymentIntent): void
    {
        $intentId = data_get($paymentIntent, 'id');
        if (!$intentId) {
            return;
        }

        $order = Order::query()->where('stripe_payment_intent_id', $intentId)->first();
        if (!$order) {
            return;
        }

        $order->update([
            'payment_status' => 'failed',
            'status' => 'pending',
        ]);

        if ($order->user) {
            $this->transactionalEmailService->sendOrderPaymentFailed($order->user, $order);
        }
    }

    private function handleChargeRefunded(object $charge): void
    {
        $intentId = data_get($charge, 'payment_intent');
        if (!$intentId) {
            return;
        }

        $order = Order::query()->where('stripe_payment_intent_id', $intentId)->first();
        if (!$order) {
            return;
        }

        $order->update([
            'payment_status' => 'refunded',
            'status' => 'cancelled',
        ]);

        if ($order->user) {
            $this->transactionalEmailService->sendOrderRefunded($order->user, $order);
        }
    }
}
