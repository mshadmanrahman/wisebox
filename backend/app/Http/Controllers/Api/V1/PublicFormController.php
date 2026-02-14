<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ConsultationFormInvitation;
use App\Models\ConsultationFormTemplate;
use App\Models\ConsultationResponse;
use App\Models\User;
use App\Services\TransactionalEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicFormController extends Controller
{
    public function __construct(
        private TransactionalEmailService $transactionalEmailService
    ) {}

    /**
     * Show form data for a given invitation token (public, no auth)
     */
    public function show(string $token): JsonResponse
    {
        $invitation = ConsultationFormInvitation::where('token', $token)
            ->with([
                'template.fields',
                'ticket:id,ticket_number,property_id',
                'ticket.property:id,property_name,property_type_id,ownership_status_id,size_value,size_unit,district_id,upazila_id,mouza_id,address',
                'ticket.property.propertyType:id,name',
                'ticket.property.ownershipStatus:id,name,slug',
                'ticket.property.district:id,name',
                'ticket.property.upazila:id,name',
                'ticket.property.mouza:id,name',
            ])
            ->first();

        if (!$invitation) {
            return response()->json([
                'message' => 'Form not found.',
                'error_code' => 'not_found',
            ], 404);
        }

        if ($invitation->status === 'completed') {
            return response()->json([
                'message' => 'This form has already been completed.',
                'error_code' => 'already_completed',
            ], 410);
        }

        if ($invitation->expires_at->isPast()) {
            return response()->json([
                'message' => 'This form invitation has expired.',
                'error_code' => 'expired',
            ], 410);
        }

        // Build prefill values from existing property data
        $prefill = $this->buildPrefill($invitation);

        return response()->json([
            'data' => [
                'template' => $invitation->template,
                'ticket_number' => $invitation->ticket->ticket_number,
                'property_name' => $invitation->ticket->property?->property_name ?? 'Your Property',
                'customer_email' => $invitation->customer_email,
                'expires_at' => $invitation->expires_at->toISOString(),
                'prefill' => $prefill,
            ],
        ]);
    }

    /**
     * Submit a completed form for a given invitation token (public, no auth)
     */
    public function submit(Request $request, string $token): JsonResponse
    {
        $invitation = ConsultationFormInvitation::where('token', $token)
            ->with(['template.fields', 'ticket', 'consultant'])
            ->first();

        if (!$invitation) {
            return response()->json([
                'message' => 'Form not found.',
                'error_code' => 'not_found',
            ], 404);
        }

        if ($invitation->status === 'completed') {
            return response()->json([
                'message' => 'This form has already been completed.',
                'error_code' => 'already_completed',
            ], 410);
        }

        if ($invitation->expires_at->isPast()) {
            return response()->json([
                'message' => 'This form invitation has expired.',
                'error_code' => 'expired',
            ], 410);
        }

        $validated = $request->validate([
            'responses' => ['required', 'array'],
        ]);

        // Validate required fields against the template
        $template = $invitation->template;
        $requiredFields = $template->fields->where('is_required', true)->pluck('field_name');
        $missingFields = $requiredFields->diff(array_keys($validated['responses']));

        if ($missingFields->isNotEmpty()) {
            return response()->json([
                'message' => 'Missing required fields.',
                'missing_fields' => $missingFields->values(),
            ], 422);
        }

        // Wrap all writes in a transaction to prevent partial state
        DB::transaction(function () use ($invitation, $template, $validated) {
            // Create the consultation response (attributed to the consultant who sent it)
            $response = ConsultationResponse::create([
                'ticket_id' => $invitation->ticket_id,
                'template_id' => $invitation->template_id,
                'consultant_id' => $invitation->consultant_id,
                'responses' => $validated['responses'],
            ]);

            // Auto-generate summary
            $response->summary = $response->generateSummary();
            $response->save();

            // Append to ticket consultation_notes
            $ticket = $invitation->ticket;
            $ticket->consultation_notes = ($ticket->consultation_notes ? $ticket->consultation_notes . "\n\n" : '')
                . "=== {$template->name} (Customer Submitted) ===\n"
                . $response->summary;
            $ticket->save();

            // Mark invitation as completed
            $invitation->markCompleted();
        });

        // Notify the consultant (outside transaction; email failure should not roll back the submission)
        $consultant = $invitation->consultant;
        if ($consultant) {
            $this->transactionalEmailService->sendFormCompleted(
                $consultant,
                $invitation->ticket,
                $template->name,
            );
        }

        return response()->json([
            'message' => 'Form submitted successfully. Thank you!',
        ]);
    }

    /**
     * Build a prefill map from existing property/ticket data.
     *
     * Keys match customer template field_name values so the frontend
     * can seed the form without the customer re-entering known data.
     */
    private function buildPrefill(ConsultationFormInvitation $invitation): array
    {
        $property = $invitation->ticket?->property;
        if (!$property) {
            return [];
        }

        $prefill = [];

        // Property type: map DB names to form option values
        $typeMap = [
            'Land' => 'Land',
            'Apartment' => 'Apartment',
            'Building' => 'Both (Land + Building)',
        ];
        $typeName = $property->propertyType?->name;
        if ($typeName && isset($typeMap[$typeName])) {
            $prefill['property_type'] = $typeMap[$typeName];
        }

        // Property size: format cleanly (strip trailing zeros)
        if ($property->size_value) {
            $size = rtrim(rtrim($property->size_value, '0'), '.');
            $unit = $property->size_unit ?? '';
            $prefill['property_size'] = trim("{$size} {$unit}");
        }

        // Location: build "District, Upazila, Mouza" string
        $locationParts = array_filter([
            $property->district?->name,
            $property->upazila?->name,
            $property->mouza?->name,
        ]);
        if ($locationParts) {
            $prefill['property_location'] = implode(', ', $locationParts);
        }

        // Acquisition method: map ownership_status slug to form option
        $acquisitionMap = [
            'purchase' => 'Purchased',
            'inheritance' => 'Inherited',
            'gift' => 'Gift',
            'settlement' => 'Government allocation',
            'court_decree' => 'Other',
            'donation_waqf' => 'Other',
            'family' => 'Inherited',
        ];
        $statusSlug = $property->ownershipStatus?->slug;
        if ($statusSlug && isset($acquisitionMap[$statusSlug])) {
            $prefill['acquisition_method'] = $acquisitionMap[$statusSlug];
        }

        return $prefill;
    }
}
