<?php

namespace App\Services\Government;

use App\Contracts\GovernmentGatewayAdapter;
use App\Models\Service;

class NullGovernmentGatewayAdapter implements GovernmentGatewayAdapter
{
    public function supportsService(Service $service): bool
    {
        return false;
    }

    public function buildIntakePayload(Service $service, array $context = []): array
    {
        return [];
    }
}

