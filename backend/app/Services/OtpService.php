<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\OtpCodeNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class OtpService
{
    private const OTP_TTL_MINUTES = 10;

    private const RESEND_COOLDOWN_SECONDS = 60;

    public function send(User $user, string $channel = 'email'): void
    {
        if ($this->isRateLimited($user->id)) {
            throw new \RuntimeException('Please wait at least 60 seconds before requesting a new OTP.');
        }

        if ($channel === 'sms' && empty($user->phone)) {
            throw new \InvalidArgumentException('A phone number is required for SMS OTP delivery.');
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = now()->addMinutes(self::OTP_TTL_MINUTES);

        Cache::put($this->otpKey($user->id), [
            'hash' => Hash::make($code),
            'channel' => $channel,
            'expires_at' => $expiresAt->toISOString(),
        ], $expiresAt);

        Cache::put($this->rateLimitKey($user->id), now()->timestamp, now()->addSeconds(self::RESEND_COOLDOWN_SECONDS));

        if ($channel === 'sms') {
            $this->sendViaSms($user, $code);
            return;
        }

        $user->notify(new OtpCodeNotification($code, self::OTP_TTL_MINUTES));
    }

    public function verify(User $user, string $code): ?string
    {
        $payload = Cache::get($this->otpKey($user->id));
        if (!is_array($payload)) {
            return null;
        }

        $expiresAt = Carbon::parse((string) ($payload['expires_at'] ?? now()->toISOString()));
        if (now()->greaterThan($expiresAt)) {
            Cache::forget($this->otpKey($user->id));
            return null;
        }

        $hash = $payload['hash'] ?? null;
        if (!is_string($hash) || !Hash::check($code, $hash)) {
            return null;
        }

        Cache::forget($this->otpKey($user->id));
        Cache::forget($this->rateLimitKey($user->id));

        $channel = $payload['channel'] ?? 'email';

        return is_string($channel) ? $channel : 'email';
    }

    private function isRateLimited(int $userId): bool
    {
        return Cache::has($this->rateLimitKey($userId));
    }

    private function sendViaSms(User $user, string $code): void
    {
        $sid = (string) config('services.twilio.sid');
        $token = (string) config('services.twilio.auth_token');
        $from = (string) config('services.twilio.from');

        if ($sid === '' || $token === '' || $from === '') {
            Log::warning('Twilio not configured; OTP SMS delivery skipped.', [
                'user_id' => $user->id,
            ]);
            return;
        }

        $client = new Client($sid, $token);
        $client->messages->create($user->phone, [
            'from' => $from,
            'body' => "Your Wisebox verification code is {$code}. It expires in ".self::OTP_TTL_MINUTES.' minutes.',
        ]);
    }

    private function otpKey(int $userId): string
    {
        return "otp:{$userId}";
    }

    private function rateLimitKey(int $userId): string
    {
        return "otp:rate-limit:{$userId}";
    }
}

