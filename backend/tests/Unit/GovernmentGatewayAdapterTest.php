<?php

namespace Tests\Unit;

use App\Contracts\GovernmentGatewayAdapter;
use App\Models\Service;
use App\Services\Government\MockGovernmentGatewayAdapter;
use App\Services\Government\NullGovernmentGatewayAdapter;
use Tests\TestCase;

class GovernmentGatewayAdapterTest extends TestCase
{
    public function test_mock_adapter_supports_physical_service_and_builds_payload(): void
    {
        $adapter = new MockGovernmentGatewayAdapter();
        $service = new Service();
        $service->id = 15;
        $service->slug = 'land-registry-intake';
        $service->pricing_type = 'physical';

        $this->assertTrue($adapter->supportsService($service));

        $payload = $adapter->buildIntakePayload($service, [
            'user_id' => 22,
            'property_id' => 9,
        ]);

        $this->assertSame('mock-lsg', $payload['provider']);
        $this->assertSame(15, $payload['service_id']);
        $this->assertSame('land-registry-intake', $payload['service_slug']);
        $this->assertSame('physical', $payload['pricing_type']);
        $this->assertSame(22, $payload['context']['user_id']);
        $this->assertSame(9, $payload['context']['property_id']);
    }

    public function test_null_adapter_is_noop(): void
    {
        $adapter = new NullGovernmentGatewayAdapter();
        $service = new Service();
        $service->id = 7;
        $service->slug = 'document-review';
        $service->pricing_type = 'paid';

        $this->assertFalse($adapter->supportsService($service));
        $this->assertSame([], $adapter->buildIntakePayload($service, [
            'user_id' => 1,
            'property_id' => 2,
        ]));
    }

    public function test_container_resolves_null_adapter_when_integration_is_disabled(): void
    {
        config()->set('services.government.enabled', false);
        config()->set('services.government.adapter', 'mock');
        $this->app->forgetInstance(GovernmentGatewayAdapter::class);

        $resolved = $this->app->make(GovernmentGatewayAdapter::class);

        $this->assertInstanceOf(NullGovernmentGatewayAdapter::class, $resolved);
    }

    public function test_container_resolves_mock_adapter_when_enabled(): void
    {
        config()->set('services.government.enabled', true);
        config()->set('services.government.adapter', 'mock');
        $this->app->forgetInstance(GovernmentGatewayAdapter::class);

        $resolved = $this->app->make(GovernmentGatewayAdapter::class);

        $this->assertInstanceOf(MockGovernmentGatewayAdapter::class, $resolved);
    }
}

