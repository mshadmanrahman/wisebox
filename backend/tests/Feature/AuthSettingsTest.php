<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_notification_preferences_via_profile_endpoint(): void
    {
        $user = User::factory()->create();
        $user->profile()->create([
            'preferred_language' => 'en',
            'timezone' => 'UTC',
        ]);

        Sanctum::actingAs($user);

        $this->putJson('/api/v1/auth/me', [
            'name' => 'Updated User',
            'notification_preferences' => [
                'order_updates' => true,
                'ticket_updates' => true,
                'consultant_updates' => false,
                'marketing_updates' => false,
            ],
        ])->assertOk()
            ->assertJsonPath('data.name', 'Updated User')
            ->assertJsonPath('data.profile.notification_preferences.order_updates', true)
            ->assertJsonPath('data.profile.notification_preferences.marketing_updates', false);
    }

    public function test_user_can_change_password_with_correct_current_password(): void
    {
        $user = User::factory()->create([
            'password' => 'Password123!',
        ]);

        Sanctum::actingAs($user);

        $this->putJson('/api/v1/auth/change-password', [
            'current_password' => 'Password123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])->assertOk()
            ->assertJsonPath('message', 'Password updated successfully.');

        $this->assertTrue(Hash::check('NewPassword123!', (string) $user->fresh()->password));
    }
}
