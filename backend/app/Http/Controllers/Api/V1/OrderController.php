<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Service;
use App\Services\OrderFulfillmentService;
use App\Services\StripeService;
use App\Services\TransactionalEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use RuntimeException;

class OrderController extends Controller
{
    public function __construct(
        private StripeService $stripeService,
        private OrderFulfillmentService $fulfillmentService,
        private TransactionalEmailService $transactionalEmailService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with(['items.service', 'property'])
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'property_id' => [
                'required',
                Rule::exists('properties', 'id')->where(
                    fn ($query) => $query->where('user_id', $user->id)
                ),
            ],
            'items' => ['required', 'array', 'min:1'],
            'items.*.service_id' => ['required', 'integer', 'distinct', 'exists:services,id'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1', 'max:10'],
            'notes' => ['nullable', 'string'],
        ]);

        $serviceIds = collect($validated['items'])->pluck('service_id')->values();
        $services = Service::query()
            ->active()
            ->whereIn('id', $serviceIds)
            ->get()
            ->keyBy('id');

        if ($services->count() !== $serviceIds->count()) {
            return response()->json([
                'message' => 'One or more selected services are unavailable.',
            ], 422);
        }

        $order = DB::transaction(function () use ($validated, $services, $user) {
            $subtotal = 0.0;
            $items = [];

            foreach ($validated['items'] as $item) {
                $service = $services[$item['service_id']];
                $quantity = $item['quantity'] ?? 1;
                $unitPrice = (float) $service->price;
                $totalPrice = $unitPrice * $quantity;

                $items[] = [
                    'service_id' => $service->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ];

                $subtotal += $totalPrice;
            }

            $tax = 0.0;
            $discount = 0.0;
            $total = max(0, $subtotal + $tax - $discount);

            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $user->id,
                'property_id' => $validated['property_id'],
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'currency' => 'USD',
                'payment_status' => $total > 0 ? 'pending' : 'paid',
                'paid_at' => $total > 0 ? null : now(),
                'status' => $total > 0 ? 'pending' : 'confirmed',
                'notes' => $validated['notes'] ?? null,
            ]);

            $order->items()->createMany($items);

            if ($total <= 0) {
                $this->fulfillmentService->createFromOrder($order);
            }

            return $order;
        });

        $order->load(['items.service', 'property', 'tickets']);
        $this->transactionalEmailService->sendOrderCreated($user, $order);

        return response()->json(['data' => $order], 201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $order->load(['items.service', 'property', 'tickets']);

        return response()->json(['data' => $order]);
    }

    public function checkout(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'message' => 'Order is already paid.',
                'data' => [
                    'confirmation_url' => "/orders/{$order->id}/confirmation",
                ],
            ]);
        }

        if ($order->payment_status !== 'pending' || $order->status === 'cancelled') {
            return response()->json([
                'message' => 'Only pending orders can be checked out.',
            ], 422);
        }

        if ((float) $order->total <= 0) {
            $order->update([
                'payment_status' => 'paid',
                'status' => 'confirmed',
                'paid_at' => now(),
            ]);

            $this->fulfillmentService->createFromOrder($order);
            $this->transactionalEmailService->sendOrderPaid($request->user(), $order->fresh());

            return response()->json([
                'data' => [
                    'checkout_url' => "/orders/{$order->id}/confirmation",
                    'session_id' => null,
                ],
            ]);
        }

        try {
            $session = $this->stripeService->createCheckoutSession($order);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $order->update([
            'stripe_checkout_session_id' => $session->id,
            'stripe_payment_intent_id' => is_string($session->payment_intent ?? null)
                ? $session->payment_intent
                : $order->stripe_payment_intent_id,
        ]);

        return response()->json([
            'data' => [
                'checkout_url' => $session->url,
                'session_id' => $session->id,
            ],
        ]);
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($order->payment_status !== 'pending' || $order->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending orders can be cancelled.',
            ], 422);
        }

        $order->update([
            'status' => 'cancelled',
        ]);

        $order->load(['items.service', 'property']);
        $this->transactionalEmailService->sendOrderCancelled($request->user(), $order);

        return response()->json([
            'data' => $order,
            'message' => 'Order cancelled.',
        ]);
    }

    private function generateOrderNumber(): string
    {
        $year = now()->format('Y');
        $sequence = (Order::max('id') ?? 0) + 1;

        do {
            $orderNumber = sprintf('WB-%s-%05d', $year, $sequence);
            $sequence++;
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
