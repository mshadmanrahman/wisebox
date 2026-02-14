<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ConsultationFormTemplate;
use App\Models\ConsultationResponse;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultationFormController extends Controller
{
    /**
     * List all active consultation form templates
     *
     * Optional query param: ?audience=consultant|customer
     * When provided, only templates for that audience are returned.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ConsultationFormTemplate::query()
            ->active()
            ->with('fields');

        if ($audience = $request->query('audience')) {
            $request->validate(['audience' => 'in:consultant,customer']);
            $query->forAudience($audience);
        }

        $templates = $query->orderBy('sort_order')->get();

        return response()->json(['data' => $templates]);
    }

    /**
     * Get a specific template with its fields
     */
    public function show(ConsultationFormTemplate $template): JsonResponse
    {
        $template->load('fields');

        return response()->json(['data' => $template]);
    }

    /**
     * Submit a consultation form response
     */
    public function submitResponse(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        // Ensure user is a consultant and has access to this ticket
        if (!$user->isConsultant() && !$user->isAdmin()) {
            return response()->json(['message' => 'Only consultants can submit consultation forms.'], 403);
        }

        if (!$user->isAdmin() && $ticket->consultant_id !== $user->id) {
            return response()->json(['message' => 'You can only submit forms for your assigned tickets.'], 403);
        }

        $validated = $request->validate([
            'template_id' => ['required', 'exists:consultation_form_templates,id'],
            'responses' => ['required', 'array'],
            'summary' => ['nullable', 'string'],
        ]);

        // Validate that required fields are present
        $template = ConsultationFormTemplate::with('fields')->findOrFail($validated['template_id']);
        $requiredFields = $template->fields->where('is_required', true)->pluck('field_name');
        $missingFields = $requiredFields->diff(array_keys($validated['responses']));

        if ($missingFields->isNotEmpty()) {
            return response()->json([
                'message' => 'Missing required fields',
                'missing_fields' => $missingFields->values(),
            ], 422);
        }

        // Create the consultation response
        $response = ConsultationResponse::create([
            'ticket_id' => $ticket->id,
            'template_id' => $validated['template_id'],
            'consultant_id' => $user->id,
            'responses' => $validated['responses'],
            'summary' => $validated['summary'] ?? null,
        ]);

        // Auto-generate summary if not provided
        if (empty($response->summary)) {
            $response->summary = $response->generateSummary();
            $response->save();
        }

        // Update ticket consultation_notes with the summary
        $ticket->consultation_notes = ($ticket->consultation_notes ? $ticket->consultation_notes . "\n\n" : '')
            . "=== {$template->name} ===\n"
            . $response->summary;
        $ticket->save();

        $response->load(['template.fields', 'consultant:id,name,email']);

        return response()->json(['data' => $response], 201);
    }

    /**
     * Get consultation responses for a ticket
     */
    public function ticketResponses(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        // Check access: customer sees their own tickets, consultants see assigned tickets, admins see all
        if (!$user->isAdmin()) {
            if ($user->isConsultant() && $ticket->consultant_id !== $user->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            } elseif (!$user->isConsultant() && $ticket->customer_id !== $user->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $responses = ConsultationResponse::query()
            ->where('ticket_id', $ticket->id)
            ->with(['template.fields', 'consultant:id,name,email'])
            ->latest()
            ->get();

        return response()->json(['data' => $responses]);
    }
}
