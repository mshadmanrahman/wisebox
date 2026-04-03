<?php

namespace App\Services;

class CalendlyWebhookService
{
    public function isSignatureValid(string $payload, ?string $signatureHeader): bool
    {
        $secret = config('services.calendly.webhook_secret');

        if (empty($secret)) {
            return false;
        }

        if (empty($signatureHeader)) {
            return false;
        }

        $parts = collect(explode(',', $signatureHeader))
            ->map(fn ($segment) => explode('=', trim($segment), 2))
            ->filter(fn ($pair) => count($pair) === 2)
            ->mapWithKeys(fn ($pair) => [$pair[0] => $pair[1]]);

        $signature = $parts->get('v1');
        $timestamp = $parts->get('t');

        if (!$signature) {
            $signature = preg_replace('/^sha256=/i', '', trim($signatureHeader));
        }

        if (!$signature) {
            return false;
        }

        $expectedFromPayload = hash_hmac('sha256', $payload, $secret);

        if (hash_equals($expectedFromPayload, $signature)) {
            return true;
        }

        if ($timestamp) {
            $expectedFromTimestampPayload = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

            if (hash_equals($expectedFromTimestampPayload, $signature)) {
                return true;
            }
        }

        return false;
    }
}
