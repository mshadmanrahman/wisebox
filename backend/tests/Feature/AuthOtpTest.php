<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\OtpCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthOtpTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_sends_email_otp_notification(): void
    {
        Notification::fake();

        $this->postJson('/api/v1/auth/register', [
            'name' => 'OTP User',
            'email' => 'otp-user@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'country_of_residence' => 'USA',
            'terms_accepted' => true,
        ])->assertCreated()
            ->assertJsonPath('data.otp_required', true);

        $user = User::query()->where('email', 'otp-user@example.com')->first();
        $this->assertNotNull($user);

        Notification::assertSentTo($user, OtpCodeNotification::class);
    }

    public function test_user_can_resend_and_verify_email_otp(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create([
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/resend-otp', [
            'channel' => 'email',
        ])->assertOk();

        $sentCode = null;
        Notification::assertSentTo($user, OtpCodeNotification::class, function (OtpCodeNotification $notification) use (&$sentCode) {
            $sentCode = $notification->code;
            return true;
        });

        $this->assertNotNull($sentCode);

        $this->postJson('/api/v1/auth/verify-otp', [
            'code' => $sentCode,
        ])->assertOk()
            ->assertJsonPath('message', 'OTP verified successfully.');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_verify_otp_fails_for_wrong_code(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create([
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/resend-otp', [
            'channel' => 'email',
        ])->assertOk();

        $this->postJson('/api/v1/auth/verify-otp', [
            'code' => '000000',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['code']);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_resend_otp_is_rate_limited_to_one_request_per_minute(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create([
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/resend-otp', ['channel' => 'email'])->assertOk();

        $this->postJson('/api/v1/auth/resend-otp', ['channel' => 'email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['channel']);
    }

    public function test_sms_otp_requires_phone_number(): void
    {
        $user = User::factory()->unverified()->create([
            'status' => 'active',
            'phone' => null,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/resend-otp', [
            'channel' => 'sms',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['channel']);
    }
}

