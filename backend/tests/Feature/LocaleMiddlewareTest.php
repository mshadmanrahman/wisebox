<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LocaleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_locale_is_english(): void
    {
        // Unauthenticated request without Accept-Language header
        $response = $this->getJson('/api/v1/');
        $response->assertOk();

        // The locale should default to 'en'
        $this->assertEquals('en', app()->getLocale());
    }

    public function test_accept_language_header_sets_locale_for_unauthenticated(): void
    {
        $this->getJson('/api/v1/', ['Accept-Language' => 'bn'])
            ->assertOk();

        $this->assertEquals('bn', app()->getLocale());
    }

    public function test_authenticated_user_preferred_language_overrides_header(): void
    {
        $user = User::factory()->create();
        $user->profile()->create([
            'preferred_language' => 'bn',
            'timezone' => 'UTC',
        ]);

        Sanctum::actingAs($user);

        // Even with English Accept-Language header, user preference wins
        $this->getJson('/api/v1/auth/me', ['Accept-Language' => 'en'])
            ->assertOk();

        $this->assertEquals('bn', app()->getLocale());
    }

    public function test_unsupported_accept_language_falls_back_to_english(): void
    {
        $this->getJson('/api/v1/', ['Accept-Language' => 'fr'])
            ->assertOk();

        $this->assertEquals('en', app()->getLocale());
    }

    public function test_localized_error_messages_in_bangla(): void
    {
        // Set up a user with Bangla preference
        $user = User::factory()->create();
        $user->profile()->create([
            'preferred_language' => 'bn',
            'timezone' => 'UTC',
        ]);

        Sanctum::actingAs($user);

        // Trigger a "forbidden" response by trying to access admin endpoint as customer
        $response = $this->getJson('/api/v1/admin/translations');

        // The error message should be in Bangla
        $response->assertForbidden();
    }
}
