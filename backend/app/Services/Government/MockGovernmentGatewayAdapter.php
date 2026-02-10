<?php

namespace App\Services\Government;

use App\Contracts\GovernmentGatewayAdapter;
use App\Models\Service;

class MockGovernmentGatewayAdapter implements GovernmentGatewayAdapter
{
    public function supportsService(Service $service): bool
    {
        return (string) $service->pricing_type === 'physical';
    }

    public function buildIntakePayload(Service $service, array $context = []): array
    {
        return [
            'provider' => 'mock-lsg',
            'service_id' => (int) $service->id,
            'service_slug' => (string) $service->slug,
            'pricing_type' => (string) $service->pricing_type,
            'context' => [
                'user_id' => isset($context['user_id']) ? (int) $context['user_id'] : null,
                'property_id' => isset($context['property_id']) ? (int) $context['property_id'] : null,
            ],
        ];
    }
}

