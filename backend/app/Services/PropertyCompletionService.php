<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Support\Facades\DB;

class PropertyCompletionService
{
    /**
     * Document scoring weights (total: 100 points)
     * From the Jan 18 flow diagram and implementation plan.
     */
    private const DOCUMENT_WEIGHTS = [
        'position_of_land' => 40,
        'recorded_khatian' => 20,
        'deed' => 15,
        'mutation_khatian' => 10,
        'ld_tax' => 5,
        'dcr' => 5,
        'map_noksha' => 5,
    ];

    /**
     * Score thresholds for status.
     */
    private const STATUS_THRESHOLDS = [
        'green' => 80,
        'yellow' => 40,
    ];

    /**
     * Recalculate completion percentage and status for a property.
     */
    public function calculate(Property $property): array
    {
        // Get all uploaded documents for this property with their document type slugs
        $uploadedSlugs = DB::table('property_documents')
            ->join('document_types', 'property_documents.document_type_id', '=', 'document_types.id')
            ->where('property_documents.property_id', $property->id)
            ->where('property_documents.has_document', true)
            ->whereNull('property_documents.deleted_at')
            ->pluck('document_types.slug')
            ->toArray();

        // Calculate score based on uploaded documents
        $score = 0;
        foreach (self::DOCUMENT_WEIGHTS as $slug => $weight) {
            if (in_array($slug, $uploadedSlugs)) {
                $score += $weight;
            }
        }

        // Determine status based on score
        $status = 'red';
        if ($score >= self::STATUS_THRESHOLDS['green']) {
            $status = 'green';
        } elseif ($score >= self::STATUS_THRESHOLDS['yellow']) {
            $status = 'yellow';
        }

        // Update property
        $property->update([
            'completion_percentage' => $score,
            'completion_status' => $status,
        ]);

        return [
            'score' => $score,
            'status' => $status,
            'uploaded_documents' => $uploadedSlugs,
            'missing_documents' => array_diff(array_keys(self::DOCUMENT_WEIGHTS), $uploadedSlugs),
        ];
    }

    /**
     * Get service recommendations based on completion gaps.
     */
    public function getRecommendations(Property $property): array
    {
        $result = $this->calculate($property);
        $score = $result['score'];

        if ($score === 0) {
            return ['recommendation' => 'consultancy', 'message' => 'No documents uploaded. We recommend a consultancy service to help you get started.'];
        } elseif ($score < 100) {
            return ['recommendation' => 'retrieve_documents', 'message' => 'Some documents are missing. We can help you retrieve them.', 'missing' => $result['missing_documents']];
        } else {
            return ['recommendation' => 'assessment', 'message' => 'All documents uploaded! We recommend a document assessment to verify everything.'];
        }
    }
}
