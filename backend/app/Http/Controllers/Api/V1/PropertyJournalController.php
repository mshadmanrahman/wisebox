<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyJournalController extends Controller
{
    /**
     * Get consultation history for a property (property journal)
     */
    public function show(Request $request, Property $property): JsonResponse
    {
        $user = $request->user();

        // Ensure user owns this property
        if ($property->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Get all completed tickets with consultation responses
        $consultations = $property->tickets()
            ->with([
                'service:id,name',
                'consultant:id,name,email',
                'consultationResponses.template.fields',
            ])
            ->where('status', 'completed')
            ->whereNotNull('resolved_at')
            ->orderBy('resolved_at', 'desc')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'service_name' => $ticket->service?->name,
                    'consultant_name' => $ticket->consultant?->name,
                    'completed_at' => $ticket->resolved_at?->toISOString(),
                    'consultation_notes' => $ticket->consultation_notes,
                    'resolution_notes' => $ticket->resolution_notes,
                    'forms_completed' => $ticket->consultationResponses->map(function ($response) {
                        return [
                            'template_name' => $response->template->name,
                            'summary' => $response->summary,
                            'completed_at' => $response->created_at->toISOString(),
                            'responses' => $response->responses,
                        ];
                    }),
                ];
            });

        return response()->json([
            'data' => [
                'property' => [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                    'property_type' => $property->propertyType?->name,
                    'location' => $property->location,
                ],
                'consultations' => $consultations,
                'total_consultations' => $consultations->count(),
            ],
        ]);
    }

    /**
     * Get recommendations and action items for a property
     */
    public function recommendations(Request $request, Property $property): JsonResponse
    {
        $user = $request->user();

        // Ensure user owns this property
        if ($property->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Collect all recommendations from completed consultations
        $recommendations = [];

        $tickets = $property->tickets()
            ->with('consultationResponses.template')
            ->where('status', 'completed')
            ->whereNotNull('resolved_at')
            ->orderBy('resolved_at', 'desc')
            ->get();

        foreach ($tickets as $ticket) {
            foreach ($ticket->consultationResponses as $response) {
                $template = $response->template;

                // Extract recommendation fields
                $recommendationFields = $template->fields->where('field_name', 'LIKE', '%recommendation%');
                foreach ($recommendationFields as $field) {
                    $value = $response->getFieldResponse($field->field_name);
                    if ($value) {
                        $recommendations[] = [
                            'category' => $template->name,
                            'recommendation' => $value,
                            'consultant_name' => $ticket->consultant?->name,
                            'date' => $response->created_at->toISOString(),
                        ];
                    }
                }
            }
        }

        return response()->json(['data' => $recommendations]);
    }
}
