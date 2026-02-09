<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Property;
use App\Models\Service;
use App\Models\User;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Stripe\Checkout\Session;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_create_paid_order(): void
    {
        $user = User::factory()->create();
        $property = $this->createPropertyForUser($user);
        $service = $this->createService(price: 45.00, pricingType: 'paid');

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/orders', [
            'property_id' => $property->id,
            'items' => [
                ['service_id' => $service->id, 'quantity' => 1],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.property_id', $property->id)
            ->assertJsonPath('data.payment_status', 'pending')
            ->assertJsonPath('data.status', 'pending');

        $orderId = $response->json('data.id');

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'user_id' => $user->id,
            'payment_status' => 'pending',
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'service_id' => $service->id,
        ]);

        $this->assertDatabaseMissing('tickets', [
            'order_id' => $orderId,
        ]);
    }

    public function test_free_order_is_auto_paid_and_creates_ticket(): void
    {
        $user = User::factory()->create();
        $property = $this->createPropertyForUser($user);
        $service = $this->createService(price: 0.00, pricingType: 'free');

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/orders', [
            'property_id' => $property->id,
            'items' => [
                ['service_id' => $service->id],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.status', 'confirmed');

        $orderId = $response->json('data.id');

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'payment_status' => 'paid',
        ]);

        $this->assertDatabaseHas('tickets', [
            'order_id' => $orderId,
            'property_id' => $property->id,
            'customer_id' => $user->id,
            'service_id' => $service->id,
            'title' => $service->name,
        ]);
    }

    public function test_customer_cannot_view_another_users_order(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $property = $this->createPropertyForUser($owner);
        $service = $this->createService(price: 30.00, pricingType: 'paid');

        $order = Order::create([
            'order_number' => 'WB-2026-00001',
            'user_id' => $owner->id,
            'property_id' => $property->id,
            'subtotal' => 30,
            'tax' => 0,
            'discount' => 0,
            'total' => 30,
            'currency' => 'USD',
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);

        $order->items()->create([
            'service_id' => $service->id,
            'quantity' => 1,
            'unit_price' => 30,
            'total_price' => 30,
        ]);

        Sanctum::actingAs($otherUser);

        $this->getJson("/api/v1/orders/{$order->id}")
            ->assertForbidden();
    }

    public function test_checkout_uses_stripe_service_and_stores_session_data(): void
    {
        $user = User::factory()->create();
        $property = $this->createPropertyForUser($user);
        $service = $this->createService(price: 65.00, pricingType: 'paid');

        Sanctum::actingAs($user);

        $orderResponse = $this->postJson('/api/v1/orders', [
            'property_id' => $property->id,
            'items' => [
                ['service_id' => $service->id],
            ],
        ])->assertCreated();

        $orderId = $orderResponse->json('data.id');

        $session = Session::constructFrom([
            'id' => 'cs_test_123',
            'object' => 'checkout.session',
            'url' => 'https://checkout.stripe.com/c/pay/cs_test_123',
            'payment_intent' => 'pi_test_123',
        ]);

        $stripeService = $this->createMock(StripeService::class);
        $stripeService->expects($this->once())
            ->method('createCheckoutSession')
            ->willReturn($session);

        $this->app->instance(StripeService::class, $stripeService);

        $this->postJson("/api/v1/orders/{$orderId}/checkout")
            ->assertOk()
            ->assertJsonPath('data.checkout_url', 'https://checkout.stripe.com/c/pay/cs_test_123')
            ->assertJsonPath('data.session_id', 'cs_test_123');

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'stripe_checkout_session_id' => 'cs_test_123',
            'stripe_payment_intent_id' => 'pi_test_123',
        ]);
    }

    private function createPropertyForUser(User $user): Property
    {
        $propertyTypeId = DB::table('property_types')->insertGetId([
            'name' => 'Apartment',
            'slug' => 'apartment',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipStatusId = DB::table('ownership_statuses')->insertGetId([
            'name' => 'Purchased',
            'slug' => 'purchased',
            'display_label' => 'I purchased it',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipTypeId = DB::table('ownership_types')->insertGetId([
            'name' => 'Sole',
            'slug' => 'sole',
            'requires_co_owners' => false,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Property::create([
            'user_id' => $user->id,
            'property_name' => 'Test Property',
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'status' => 'draft',
        ]);
    }

    private function createService(float $price, string $pricingType): Service
    {
        $categoryId = DB::table('service_categories')->insertGetId([
            'name' => 'Category',
            'slug' => 'category-'.uniqid(),
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Service::create([
            'category_id' => $categoryId,
            'name' => 'Service '.uniqid(),
            'slug' => 'service-'.uniqid(),
            'pricing_type' => $pricingType,
            'price' => $price,
            'currency' => 'USD',
            'requires_meeting' => false,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);
    }
}
