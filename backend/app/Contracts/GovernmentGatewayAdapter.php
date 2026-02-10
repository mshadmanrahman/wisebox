<?php

namespace App\Contracts;

use App\Models\Service;

interface GovernmentGatewayAdapter
{
    public function supportsService(Service $service): bool;

    /**
     * @return array<string, mixed>
     */
    public function buildIntakePayload(Service $service, array $context = []): array;
}

