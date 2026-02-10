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
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
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
     */
    public function googleAuth(Request $request): JsonResponse
    {
        $request->validate([
            'id_token' => ['required', 'string'],
        ]);

        // In production, validate the Google ID token
        // For now, we'll accept the token and look up by google_id
        // TODO: Implement proper Google token validation via Socialite

        return response()->json([
            'message' => 'Google OAuth not yet configured. Use email/password login.',
        ], 501);
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
}
