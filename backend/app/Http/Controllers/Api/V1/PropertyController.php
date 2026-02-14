<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Services\PropertyCompletionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PropertyController extends Controller
{
    public function __construct(
        private PropertyCompletionService $completionService
    ) {}

    /**
     * List user's properties with completion stats.
     */
    public function index(Request $request): JsonResponse
    {
        $properties = Property::forUser($request->user()->id)
            ->with(['propertyType', 'ownershipStatus', 'ownershipType', 'division', 'district'])
            ->withCount('documents', 'coOwners')
            ->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json($properties);
    }

    /**
     * Create a new property with optional co-owners.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_name' => ['required', 'string', 'max:255'],
            'property_type_id' => ['required', 'exists:property_types,id'],
            'ownership_status_id' => ['required', 'exists:ownership_statuses,id'],
            'ownership_type_id' => ['required', 'exists:ownership_types,id'],
            'division_id' => ['nullable', 'exists:divisions,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
            'upazila_id' => ['nullable', 'exists:upazilas,id'],
            'mouza_id' => ['nullable', 'exists:mouzas,id'],
            'address' => ['nullable', 'string'],
            'size_value' => ['nullable', 'numeric', 'min:0'],
            'size_unit' => ['nullable', 'in:sqft,katha,bigha,acre,decimal,shotangsho'],
            'description' => ['nullable', 'string'],
            'co_owners' => ['nullable', 'array'],
            'co_owners.*.name' => ['required_with:co_owners', 'string', 'max:255'],
            'co_owners.*.relationship' => ['nullable', 'string', 'max:100'],
            'co_owners.*.ownership_percentage' => ['required_with:co_owners', 'numeric', 'min:0.01', 'max:99.99'],
            'co_owners.*.phone' => ['nullable', 'string', 'max:20'],
            'co_owners.*.email' => ['nullable', 'email'],
            'co_owners.*.nid_number' => ['nullable', 'string', 'max:50'],
        ]);

        if ($coOwnerValidationError = $this->validateCoOwnerOwnership($validated['co_owners'] ?? null)) {
            return $coOwnerValidationError;
        }

        $property = DB::transaction(function () use ($request, $validated) {
            $property = Property::create([
                'user_id' => $request->user()->id,
                'property_name' => $validated['property_name'],
                'property_type_id' => $validated['property_type_id'],
                'ownership_status_id' => $validated['ownership_status_id'],
                'ownership_type_id' => $validated['ownership_type_id'],
                'division_id' => $validated['division_id'] ?? null,
                'district_id' => $validated['district_id'] ?? null,
                'upazila_id' => $validated['upazila_id'] ?? null,
                'mouza_id' => $validated['mouza_id'] ?? null,
                'address' => $validated['address'] ?? null,
                'size_value' => $validated['size_value'] ?? null,
                'size_unit' => $validated['size_unit'] ?? null,
                'description' => $validated['description'] ?? null,
                'status' => 'draft',
            ]);

            if (!empty($validated['co_owners'])) {
                foreach ($validated['co_owners'] as $coOwner) {
                    $property->coOwners()->create($coOwner);
                }
            }

            return $property;
        });

        $property->load(['propertyType', 'ownershipStatus', 'ownershipType', 'coOwners', 'division', 'district', 'upazila', 'mouza']);

        return response()->json(['data' => $property], 201);
    }

    /**
     * Get property details with all relations.
     */
    public function show(Request $request, Property $property): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $property->load([
            'propertyType', 'ownershipStatus', 'ownershipType',
            'coOwners', 'documents.documentType',
            'division', 'district', 'upazila', 'mouza',
            'assessments' => fn($q) => $q->latest()->limit(1),
        ]);

        $completion = $this->completionService->calculate($property);

        return response()->json([
            'data' => $property,
            'completion' => $completion,
        ]);
    }

    /**
     * Update property and sync co-owners.
     */
    public function update(Request $request, Property $property): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'property_name' => ['sometimes', 'string', 'max:255'],
            'property_type_id' => ['sometimes', 'exists:property_types,id'],
            'ownership_status_id' => ['sometimes', 'exists:ownership_statuses,id'],
            'ownership_type_id' => ['sometimes', 'exists:ownership_types,id'],
            'division_id' => ['sometimes', 'nullable', 'exists:divisions,id'],
            'district_id' => ['sometimes', 'nullable', 'exists:districts,id'],
            'upazila_id' => ['sometimes', 'nullable', 'exists:upazilas,id'],
            'mouza_id' => ['sometimes', 'nullable', 'exists:mouzas,id'],
            'address' => ['sometimes', 'nullable', 'string'],
            'size_value' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'size_unit' => ['sometimes', 'nullable', 'in:sqft,katha,bigha,acre,decimal,shotangsho'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'in:draft,active'],
            'co_owners' => ['sometimes', 'array'],
            'co_owners.*.name' => ['required_with:co_owners', 'string', 'max:255'],
            'co_owners.*.relationship' => ['nullable', 'string', 'max:100'],
            'co_owners.*.ownership_percentage' => ['required_with:co_owners', 'numeric', 'min:0.01', 'max:99.99'],
            'co_owners.*.phone' => ['nullable', 'string', 'max:20'],
            'co_owners.*.email' => ['nullable', 'email'],
            'co_owners.*.nid_number' => ['nullable', 'string', 'max:50'],
        ]);

        if (array_key_exists('co_owners', $validated)) {
            if ($coOwnerValidationError = $this->validateCoOwnerOwnership($validated['co_owners'])) {
                return $coOwnerValidationError;
            }
        }

        DB::transaction(function () use ($property, $validated) {
            $coOwners = $validated['co_owners'] ?? null;
            unset($validated['co_owners']);

            $property->update($validated);

            if ($coOwners !== null) {
                $property->coOwners()->delete();
                foreach ($coOwners as $coOwner) {
                    $property->coOwners()->create($coOwner);
                }
            }
        });

        $property->load(['propertyType', 'ownershipStatus', 'ownershipType', 'coOwners', 'division', 'district']);

        return response()->json(['data' => $property]);
    }

    /**
     * Soft delete property.
     */
    public function destroy(Request $request, Property $property): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted.']);
    }

    /**
     * Auto-save draft data.
     */
    public function saveDraft(Request $request, Property $property): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'draft_data' => ['required', 'array'],
        ]);

        $property->update([
            'draft_data' => $request->draft_data,
            'last_draft_at' => now(),
        ]);

        return response()->json([
            'data' => ['last_draft_at' => $property->last_draft_at],
        ]);
    }

    /**
     * Get consultation tickets for a property.
     */
    public function consultations(Request $request, Property $property): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $tickets = $property->tickets()
            ->with(['consultant', 'service'])
            ->latest()
            ->paginate($request->get('per_page', 10));

        // Transform tickets to match frontend expectations
        $tickets->getCollection()->transform(function ($ticket) {
            return [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'status' => $ticket->status,
                'created_at' => $ticket->created_at->toISOString(),
                'scheduled_at' => $ticket->scheduled_at?->toISOString(),
                'completed_at' => $ticket->completed_at?->toISOString(),
                'meet_link' => $ticket->meet_link,
                'consultant_name' => $ticket->consultant?->name,
                'consultation_notes' => $ticket->consultation_notes,
            ];
        });

        return response()->json($tickets);
    }

    private function validateCoOwnerOwnership(?array $coOwners): ?JsonResponse
    {
        if (empty($coOwners)) {
            return null;
        }

        $total = (float) collect($coOwners)->sum(function ($coOwner) {
            return (float) ($coOwner['ownership_percentage'] ?? 0);
        });

        if ($total > 100.01) {
            $formattedTotal = rtrim(rtrim(number_format($total, 2, '.', ''), '0'), '.');

            return response()->json([
                'message' => 'Co-owner percentages cannot exceed 100%.',
                'errors' => ['co_owners' => ["Total is {$formattedTotal}% and must be 100% or less."]],
            ], 422);
        }

        return null;
    }
}
