<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssessmentQuestion;
use App\Models\Property;
use App\Models\User;
use App\Services\PropertyAssessmentService;
use App\Services\TransactionalEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AssessmentController extends Controller
{
    public function __construct(
        private PropertyAssessmentService $propertyAssessmentService,
        private TransactionalEmailService $emailService,
    ) {}

    public function questions(): JsonResponse
    {
        $questions = AssessmentQuestion::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'question', 'weight', 'doc_type']);

        return response()->json(['data' => $questions]);
    }

    public function freeAssessment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'answers' => ['required', 'array', 'min:5', 'max:50'],
            'answers.*.question_id' => ['required', 'exists:assessment_questions,id'],
            'answers.*.answer' => ['required', 'boolean'],
        ]);

        $questions = AssessmentQuestion::query()
            ->where('is_active', true)
            ->get(['id', 'question', 'weight']);

        $answers = collect($validated['answers'])
            ->mapWithKeys(fn (array $answer) => [(int) $answer['question_id'] => (bool) $answer['answer']]);

        $score = 0;
        $gaps = [];

        foreach ($questions as $question) {
            $answer = $answers->get((int) $question->id, false);
            $weight = (int) $question->weight;

            if ($answer) {
                $score += $weight;
            }

            $isGap = ($weight > 0 && !$answer) || ($weight < 0 && $answer);
            if ($isGap) {
                $gaps[] = $question->question;
            }
        }

        $score = max(0, min(100, $score));
        $status = $this->scoreStatus($score);

        $recommendedServices = DB::table('services')
            ->where('is_active', true)
            ->whereIn('slug', ['free-consultation', 'land-purchase-verification', 'deed-searching'])
            ->orderBy('sort_order')
            ->limit(3)
            ->get(['id', 'name', 'price'])
            ->map(fn ($service) => [
                'id' => (int) $service->id,
                'name' => (string) $service->name,
                'price' => (float) $service->price,
            ])
            ->values();

        // Auto-create account + property
        // Check for existing user (including soft-deleted to prevent duplicate email collision)
        $isNewUser = false;
        $token = null;
        $user = User::withTrashed()->where('email', $validated['email'])->first();

        if ($user && $user->trashed()) {
            // Soft-deleted account: don't re-create, don't reveal existence
            // Return results without account creation
            $this->logAssessmentActivity(null, $validated['email'], $score, $status, count($gaps), false, $request);

            return response()->json([
                'data' => [
                    'score' => $score,
                    'status' => $status,
                    'summary' => $this->freeSummary($score),
                    'gaps' => $gaps,
                    'recommended_services' => $recommendedServices,
                ],
            ]);
        }

        // Security: only issue tokens for customer accounts, never admin/consultant
        if ($user && !$user->isCustomer()) {
            // Non-customer account exists: return results without token or email (don't reveal role)
            $this->logAssessmentActivity($user->id, $validated['email'], $score, $status, count($gaps), false, $request);

            return response()->json([
                'data' => [
                    'score' => $score,
                    'status' => $status,
                    'summary' => $this->freeSummary($score),
                    'gaps' => $gaps,
                    'recommended_services' => $recommendedServices,
                ],
            ]);
        }

        $assessmentPropertyData = [
            'property_name' => 'Free Assessment',
            'status' => 'draft',
            'completion_percentage' => 0,
            'completion_status' => $status, // Use actual score status (red/yellow/green)
            'draft_data' => [
                'source' => 'free_assessment',
                'assessment_score' => $score,
                'assessment_status' => $status,
                'assessment_gaps' => $gaps,
                'assessed_at' => now()->toISOString(),
            ],
        ];

        if (!$user) {
            $isNewUser = true;

            try {
                $user = DB::transaction(function () use ($validated, $assessmentPropertyData) {
                    // Lock check inside transaction to prevent race condition
                    $existing = User::where('email', $validated['email'])->lockForUpdate()->first();
                    if ($existing) {
                        return $existing;
                    }

                    $newUser = User::create([
                        'name' => explode('@', $validated['email'])[0],
                        'email' => $validated['email'],
                        'password' => Str::random(32),
                        'role' => 'customer',
                        'status' => 'active',
                    ]);

                    $newUser->profile()->create([
                        'preferred_language' => 'en',
                        'timezone' => 'UTC',
                    ]);

                    Property::create([
                        ...$assessmentPropertyData,
                        'user_id' => $newUser->id,
                    ]);

                    return $newUser;
                });
            } catch (\Illuminate\Database\QueryException $e) {
                // Race condition: duplicate email inserted concurrently
                if (str_contains($e->getMessage(), 'Duplicate entry') || str_contains($e->getMessage(), 'UNIQUE constraint')) {
                    $user = User::where('email', $validated['email'])->firstOrFail();
                    $isNewUser = false;

                    // Re-guard recovered user: must be customer and not trashed
                    if ($user->trashed() || !$user->isCustomer()) {
                        $this->logAssessmentActivity($user->trashed() ? null : $user->id, $validated['email'], $score, $status, count($gaps), false, $request);

                        return response()->json([
                            'data' => [
                                'score' => $score,
                                'status' => $status,
                                'summary' => $this->freeSummary($score),
                                'gaps' => $gaps,
                                'recommended_services' => $recommendedServices,
                            ],
                        ]);
                    }
                } else {
                    throw $e;
                }
            }

            // If transaction returned an existing user (lock check), we didn't create
            if (!$isNewUser || $user->wasRecentlyCreated === false) {
                $isNewUser = false;
            }
        }

        // For existing users, create a draft property only if they don't already have a recent one
        if (!$isNewUser) {
            $hasRecentDraft = Property::where('user_id', $user->id)
                ->where('property_name', 'Free Assessment')
                ->where('status', 'draft')
                ->where('created_at', '>=', now()->subDay())
                ->exists();

            if (!$hasRecentDraft) {
                Property::create([
                    ...$assessmentPropertyData,
                    'user_id' => $user->id,
                ]);
            }
        }

        // Generate auth token for immediate login (customer-only, verified above)
        $token = $user->createToken('assessment-token')->plainTextToken;

        $this->logAssessmentActivity($user->id, $validated['email'], $score, $status, count($gaps), $isNewUser, $request);

        // Send assessment results email
        $this->emailService->sendAssessmentResults(
            $user,
            $score,
            $status,
            $this->freeSummary($score),
            $gaps,
            $isNewUser,
        );

        return response()->json([
            'data' => [
                'score' => $score,
                'status' => $status,
                'summary' => $this->freeSummary($score),
                'gaps' => $gaps,
                'recommended_services' => $recommendedServices,
                'token' => $token,
                'user' => $user->load('profile'),
            ],
        ]);
    }

    public function propertyAssessment(Request $request, Property $property): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $property->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $assessment = $this->propertyAssessmentService->assess($property, $user->id);

        return response()->json([
            'data' => $assessment,
        ]);
    }

    public function history(Request $request, Property $property): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $property->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $assessments = $property->assessments()
            ->orderByDesc('created_at')
            ->paginate((int) ($validated['per_page'] ?? 10));

        return response()->json($assessments);
    }

    private function scoreStatus(int $score): string
    {
        if ($score >= 80) {
            return 'green';
        }

        if ($score >= 40) {
            return 'yellow';
        }

        return 'red';
    }

    private function logAssessmentActivity(
        ?int $userId,
        string $email,
        int $score,
        string $status,
        int $gapsCount,
        bool $isNewUser,
        Request $request,
    ): void {
        try {
            DB::table('activity_log')->insert([
                'user_id' => $userId,
                'subject_type' => 'free_assessment',
                'subject_id' => 0,
                'action' => 'submitted',
                'changes' => json_encode([
                    'email' => $email,
                    'score' => $score,
                    'status' => $status,
                    'gaps_count' => $gapsCount,
                    'is_new_user' => $isNewUser,
                ], JSON_UNESCAPED_SLASHES),
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to log free assessment activity', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function freeSummary(int $score): string
    {
        if ($score === 0) {
            return 'No readiness signals found yet. Start by collecting core ownership and tax records.';
        }

        if ($score < 80) {
            return 'You have partial readiness. Closing the top gaps can significantly reduce ownership risk.';
        }

        if ($score < 100) {
            return 'You are close to complete. A final verification pass can secure your file.';
        }

        return 'Excellent readiness. Your property file appears strong and can move to expert verification.';
    }
}
