<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssessmentQuestion;
use App\Models\Property;
use App\Services\PropertyAssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssessmentController extends Controller
{
    public function __construct(
        private PropertyAssessmentService $propertyAssessmentService
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
            'answers' => ['required', 'array', 'min:5'],
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
            ->whereIn('slug', ['general-consultation', 'deed-ownership-verification', 'property-background-check'])
            ->orderBy('sort_order')
            ->limit(3)
            ->get(['id', 'name', 'price'])
            ->map(fn ($service) => [
                'id' => (int) $service->id,
                'name' => (string) $service->name,
                'price' => (float) $service->price,
            ])
            ->values();

        DB::table('activity_log')->insert([
            'user_id' => null,
            'subject_type' => 'free_assessment',
            'subject_id' => 0,
            'action' => 'submitted',
            'changes' => json_encode([
                'email' => $validated['email'],
                'score' => $score,
                'status' => $status,
                'gaps_count' => count($gaps),
            ], JSON_UNESCAPED_SLASHES),
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'created_at' => now(),
        ]);

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
