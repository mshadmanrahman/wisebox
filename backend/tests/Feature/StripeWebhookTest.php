<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Property;
use App\Models\Service;
use App\Models\User;
use App\Notifications\OrderLifecycleNotification;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Stripe\Event;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_session_completed_marks_order_paid_and_creates_tickets(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $property = $this->createPropertyForUser($user);
        $service = $this->createService(55.00);

        Sanctum::actingAs($user);

        $order = $this->postJson('/api/v1/orders', [
            'property_id' => $property->id,
            'items' => [['service_id' => $service->id]],
        ])->assertCreated()->json('data');

        $orderId = $order['id'];

        $event = Event::constructFrom([
            'id' => 'evt_test_paid',
            'object' => 'event',
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_paid_1',
                    'payment_intent' => 'pi_test_paid_1',
                    'metadata' => [
                        'order_id' => (string) $orderId,
                    ],
                ],
            ],
        ]);

        $stripeService = $this->createMock(StripeService::class);
        $stripeService->expects($this->once())
            ->method('constructEvent')
            ->willReturn($event);

        $this->app->instance(StripeService::class, $stripeService);

        $this->postJson('/api/v1/webhooks/stripe', [], [
            'Stripe-Signature' => 'test-signature',
        ])->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'payment_status' => 'paid',
            'status' => 'confirmed',
            'stripe_checkout_session_id' => 'cs_test_paid_1',
            'stripe_payment_intent_id' => 'pi_test_paid_1',
        ]);

        $this->assertDatabaseHas('tickets', [
            'order_id' => $orderId,
            'property_id' => $property->id,
            'customer_id' => $user->id,
            'service_id' => $service->id,
        ]);

        Notification::assertSentTo($user, OrderLifecycleNotification::class, function (OrderLifecycleNotification $notification) {
            return $notification->event === 'paid';
        });
    }

    public function test_payment_failed_webhook_marks_order_failed(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $property = $this->createPropertyForUser($user);
        $service = $this->createService(70.00);

        Sanctum::actingAs($user);

        $orderId = $this->postJson('/api/v1/orders', [
            'property_id' => $property->id,
            'items' => [['service_id' => $service->id]],
        ])->assertCreated()->json('data.id');

        Order::query()->where('id', $orderId)->update([
            'stripe_payment_intent_id' => 'pi_failed_1',
            'stripe_checkout_session_id' => 'cs_failed_1',
        ]);

        $event = Event::constructFrom([
            'id' => 'evt_test_failed',
            'object' => 'event',
            'type' => 'payment_intent.payment_failed',
            'data' => [
                'object' => [
                    'id' => 'pi_failed_1',
                ],
            ],
        ]);

        $stripeService = $this->createMock(StripeService::class);
        $stripeService->expects($this->once())
            ->method('constructEvent')
            ->willReturn($event);

        $this->app->instance(StripeService::class, $stripeService);

        $this->postJson('/api/v1/webhooks/stripe', [], [
            'Stripe-Signature' => 'test-signature',
        ])->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'payment_status' => 'failed',
            'status' => 'pending',
        ]);

        Notification::assertSentTo($user, OrderLifecycleNotification::class, function (OrderLifecycleNotification $notification) {
            return $notification->event === 'failed';
        });
    }

    public function test_charge_refunded_webhook_marks_order_refunded_and_sends_email(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $property = $this->createPropertyForUser($user);
        $service = $this->createService(70.00);

        Sanctum::actingAs($user);

        $orderId = $this->postJson('/api/v1/orders', [
            'property_id' => $property->id,
            'items' => [['service_id' => $service->id]],
        ])->assertCreated()->json('data.id');

        Order::query()->where('id', $orderId)->update([
            'payment_status' => 'paid',
            'status' => 'confirmed',
            'stripe_payment_intent_id' => 'pi_refunded_1',
            'stripe_checkout_session_id' => 'cs_refunded_1',
            'paid_at' => now(),
        ]);

        $event = Event::constructFrom([
            'id' => 'evt_test_refunded',
            'object' => 'event',
            'type' => 'charge.refunded',
            'data' => [
                'object' => [
                    'id' => 'ch_refunded_1',
                    'payment_intent' => 'pi_refunded_1',
                ],
            ],
        ]);

        $stripeService = $this->createMock(StripeService::class);
        $stripeService->expects($this->once())
            ->method('constructEvent')
            ->willReturn($event);

        $this->app->instance(StripeService::class, $stripeService);

        $this->postJson('/api/v1/webhooks/stripe', [], [
            'Stripe-Signature' => 'test-signature',
        ])->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'payment_status' => 'refunded',
            'status' => 'cancelled',
        ]);

        Notification::assertSentTo($user, OrderLifecycleNotification::class, function (OrderLifecycleNotification $notification) {
            return $notification->event === 'refunded';
        });
    }

    private function createPropertyForUser(User $user): Property
    {
        $propertyTypeId = DB::table('property_types')->insertGetId([
            'name' => 'Land',
            'slug' => 'land-'.uniqid(),
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipStatusId = DB::table('ownership_statuses')->insertGetId([
            'name' => 'Inherited',
            'slug' => 'inherited-'.uniqid(),
            'display_label' => 'I inherited it',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipTypeId = DB::table('ownership_types')->insertGetId([
            'name' => 'Joint',
            'slug' => 'joint-'.uniqid(),
            'requires_co_owners' => true,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Property::create([
            'user_id' => $user->id,
            'property_name' => 'Webhook Property',
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'status' => 'draft',
        ]);
    }

    private function createService(float $price): Service
    {
        $categoryId = DB::table('service_categories')->insertGetId([
            'name' => 'Webhook Category '.uniqid(),
            'slug' => 'webhook-category-'.uniqid(),
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Service::create([
            'category_id' => $categoryId,
            'name' => 'Webhook Service '.uniqid(),
            'slug' => 'webhook-service-'.uniqid(),
            'pricing_type' => 'paid',
            'price' => $price,
            'currency' => 'USD',
            'requires_meeting' => false,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);
    }
}
