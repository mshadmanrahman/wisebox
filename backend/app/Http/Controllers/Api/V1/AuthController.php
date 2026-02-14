<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private OtpService $otpService
    ) {}

    /**
     * Register a new customer account.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'country_of_residence' => ['nullable', 'string', 'size:3'],
            'terms_accepted' => ['required', 'accepted'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'country_of_residence' => $validated['country_of_residence'] ?? null,
            'role' => 'customer',
            'status' => 'active',
        ]);

        $user->profile()->create([
            'preferred_language' => 'en',
            'timezone' => 'UTC',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;
        $this->otpService->send($user, 'email');

        return response()->json([
            'data' => [
                'user' => $user->load('profile'),
                'token' => $token,
                'otp_required' => true,
            ],
        ], 201);
    }

    /**
     * Login with email and password.
     * Optionally accepts a 'portal' param to enforce role-based access.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'portal' => ['nullable', 'in:user,admin,consultant'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended.'],
            ]);
        }

        // Enforce portal-based role check
        $portal = $request->input('portal');
        if ($portal === 'admin' && !$user->isAdmin()) {
            throw ValidationException::withMessages([
                'email' => ['This account does not have admin access.'],
            ]);
        }
        if ($portal === 'consultant' && !$user->isConsultant() && !$user->isAdmin()) {
            throw ValidationException::withMessages([
                'email' => ['This account does not have consultant access.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->load('profile'),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout (revoke current token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Login or register via Google OAuth.
     * Accepts a Google ID token (from frontend Google Sign-In), validates it,
     * and creates/logs in the user.
     */
    public function googleAuth(Request $request): JsonResponse
    {
        $request->validate([
            'id_token' => ['required', 'string'],
            'role' => ['nullable', 'in:customer,consultant,admin'],
        ]);

        // Verify Google ID token using Google's tokeninfo endpoint
        $googleUser = $this->verifyGoogleToken($request->input('id_token'));

        if (!$googleUser) {
            throw ValidationException::withMessages([
                'id_token' => ['Invalid or expired Google token.'],
            ]);
        }

        $email = $googleUser['email'] ?? null;
        $googleId = $googleUser['sub'] ?? null;
        $name = $googleUser['name'] ?? $googleUser['given_name'] ?? 'User';
        $avatarUrl = $googleUser['picture'] ?? null;

        if (!$email || !$googleId) {
            throw ValidationException::withMessages([
                'id_token' => ['Could not retrieve email from Google account.'],
            ]);
        }

        // Find existing user by google_id or email
        $user = User::where('google_id', $googleId)->first()
            ?? User::where('email', $email)->first();

        $isNewUser = false;

        if ($user) {
            // Update google_id if not set (user previously registered with email)
            if (!$user->google_id) {
                $user->update(['google_id' => $googleId]);
            }
            if ($avatarUrl && !$user->avatar_url) {
                $user->update(['avatar_url' => $avatarUrl]);
            }
        } else {
            // Create new user
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'google_id' => $googleId,
                'avatar_url' => $avatarUrl,
                'email_verified_at' => now(), // Google emails are pre-verified
                'role' => 'customer',
                'status' => 'active',
                'password' => Hash::make(\Illuminate\Support\Str::random(32)),
            ]);

            $user->profile()->create([
                'preferred_language' => 'en',
                'timezone' => 'UTC',
            ]);

            $isNewUser = true;
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->load('profile'),
                'token' => $token,
                'is_new_user' => $isNewUser,
            ],
        ]);
    }

    /**
     * Verify a Google ID token using Google's tokeninfo endpoint.
     */
    private function verifyGoogleToken(string $idToken): ?array
    {
        try {
            $clientId = config('services.google.client_id');

            // Use Google's tokeninfo endpoint for validation
            $response = \Illuminate\Support\Facades\Http::get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken,
            ]);

            if (!$response->successful()) {
                return null;
            }

            $payload = $response->json();

            // Verify the audience matches our client ID
            if ($clientId && ($payload['aud'] ?? '') !== $clientId) {
                return null;
            }

            return $payload;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Google token verification failed', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Send password reset email.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link sent to your email.',
            ]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    /**
     * Reset password with token.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->update(['password' => $password]);
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password has been reset.',
            ]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    /**
     * Verify OTP code.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        $channel = $this->otpService->verify($user, $request->string('code')->toString());
        if ($channel === null) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired OTP code.'],
            ]);
        }

        if ($channel === 'sms') {
            $user->update(['phone_verified_at' => now()]);
        } else {
            $user->update(['email_verified_at' => now()]);
        }

        return response()->json([
            'message' => 'OTP verified successfully.',
            'data' => ['user' => $user->fresh()],
        ]);
    }

    /**
     * Resend OTP code.
     */
    public function resendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'channel' => ['nullable', 'in:email,sms'],
        ]);

        try {
            $channel = $validated['channel'] ?? 'email';
            $this->otpService->send($request->user(), $channel);
        } catch (\InvalidArgumentException|\RuntimeException $exception) {
            throw ValidationException::withMessages([
                'channel' => [$exception->getMessage()],
            ]);
        }

        return response()->json([
            'message' => 'OTP code sent successfully.',
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->load('profile'),
        ]);
    }

    /**
     * Update authenticated user profile.
     */
    public function updateMe(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'country_of_residence' => ['sometimes', 'nullable', 'string', 'size:3'],
            'avatar_url' => ['sometimes', 'nullable', 'url', 'max:500'],
        ]);

        $user->update($validated);

        // Update profile fields if provided
        $profileFields = $request->validate([
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'nationality' => ['sometimes', 'nullable', 'string', 'size:3'],
            'nid_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'passport_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'address_line_1' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address_line_2' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'state' => ['sometimes', 'nullable', 'string', 'max:100'],
            'postal_code' => ['sometimes', 'nullable', 'string', 'max:20'],
            'country' => ['sometimes', 'nullable', 'string', 'size:3'],
            'preferred_language' => ['sometimes', 'in:en,bn'],
            'timezone' => ['sometimes', 'string', 'max:50'],
            'notification_preferences' => ['sometimes', 'array'],
            'notification_preferences.order_updates' => ['sometimes', 'boolean'],
            'notification_preferences.ticket_updates' => ['sometimes', 'boolean'],
            'notification_preferences.consultant_updates' => ['sometimes', 'boolean'],
            'notification_preferences.marketing_updates' => ['sometimes', 'boolean'],
        ]);

        if (!empty($profileFields)) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileFields
            );
        }

        return response()->json([
            'data' => $user->fresh()->load('profile'),
        ]);
    }

    /**
     * Change password for authenticated user.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Rules\Password::defaults(), 'different:current_password'],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
