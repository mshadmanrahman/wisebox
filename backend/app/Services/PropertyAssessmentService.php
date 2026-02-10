<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyAssessment;
use Illuminate\Support\Facades\DB;

class PropertyAssessmentService
{
    public function __construct(
        private PropertyCompletionService $completionService
    ) {}

    public function assess(Property $property, ?int $assessedBy = null): PropertyAssessment
    {
        $property->loadMissing([
            'ownershipType:id,requires_co_owners,name,slug',
            'ownershipStatus:id,name,slug,display_label',
            'coOwners:id,property_id,name,ownership_percentage',
            'documents:id,property_id,document_type_id,has_document,status',
            'documents.documentType:id,slug,name',
        ]);

        $completion = $this->completionService->calculate($property);
        $documentScore = (int) ($completion['score'] ?? 0);
        $ownershipScore = $this->ownershipScore($property);
        $overallScore = (int) round(($documentScore * 0.8) + ($ownershipScore * 0.2));

        $riskFactors = $this->riskFactors($property, $completion['uploaded_documents'] ?? []);
        $recommendations = $this->recommendations($riskFactors, $documentScore);
        $summary = $this->summary($overallScore, $riskFactors, $recommendations);

        return DB::transaction(function () use ($property, $assessedBy, $overallScore, $documentScore, $ownershipScore, $riskFactors, $recommendations, $summary) {
            return PropertyAssessment::create([
                'property_id' => $property->id,
                'assessed_by' => $assessedBy,
                'overall_score' => $overallScore,
                'score_status' => $this->statusForScore($overallScore),
                'document_score' => $documentScore,
                'ownership_score' => $ownershipScore,
                'risk_factors' => $riskFactors,
                'recommendations' => $recommendations,
                'summary' => $summary,
                'detailed_report' => json_encode([
                    'document_missing' => array_values($completion['missing_documents'] ?? []),
                    'uploaded_documents' => array_values($completion['uploaded_documents'] ?? []),
                    'ownership' => [
                        'type' => $property->ownershipType?->name,
                        'status' => $property->ownershipStatus?->display_label ?? $property->ownershipStatus?->name,
                        'co_owner_count' => $property->coOwners->count(),
                    ],
                ], JSON_UNESCAPED_SLASHES),
            ]);
        });
    }

    private function ownershipScore(Property $property): int
    {
        $score = 0;

        if ($property->ownership_type_id) {
            $score += 35;
        }

        if ($property->ownership_status_id) {
            $score += 25;
        }

        $requiresCoOwners = (bool) ($property->ownershipType?->requires_co_owners ?? false);
        $coOwners = $property->coOwners;

        if ($requiresCoOwners) {
            if ($coOwners->count() > 0) {
                $score += 20;
                $total = (float) $coOwners->sum('ownership_percentage');
                if ($total > 0 && $total < 100) {
                    $score += 20;
                }
            }
        } else {
            $score += 40;
        }

        return min(100, max(0, $score));
    }

    /**
     * @param array<int, string> $uploadedSlugs
     * @return array<int, string>
     */
    private function riskFactors(Property $property, array $uploadedSlugs): array
    {
        $risks = [];

        if (!in_array('deed', $uploadedSlugs, true)) {
            $risks[] = 'HIGH: No deed uploaded. Ownership proof is incomplete.';
        }

        if (!in_array('mutation_khatian', $uploadedSlugs, true)) {
            $risks[] = 'MEDIUM: Mutation khatian is missing.';
        }

        $ownershipSlug = (string) ($property->ownershipStatus?->slug ?? '');
        if (str_contains($ownershipSlug, 'inherit') && !in_array('succession_certificate', $uploadedSlugs, true)) {
            $risks[] = 'MEDIUM: Inheritance claim without succession certificate.';
        }

        if (empty($risks)) {
            $risks[] = 'LOW: No major documentary gaps detected from current uploads.';
        }

        return $risks;
    }

    /**
     * @param array<int, string> $riskFactors
     * @return array<int, array{id:int,name:string,slug:string,reason:string,price:float}>
     */
    private function recommendations(array $riskFactors, int $documentScore): array
    {
        $serviceMap = [
            'deed-ownership-verification' => 'ownership verification',
            'mutation-application' => 'mutation support',
            'property-background-check' => 'risk reduction',
            'general-consultation' => 'assessment walkthrough',
        ];

        if ($documentScore < 60) {
            $targetSlugs = ['deed-ownership-verification', 'mutation-application', 'general-consultation'];
        } elseif ($documentScore < 90) {
            $targetSlugs = ['property-background-check', 'general-consultation'];
        } else {
            $targetSlugs = ['property-background-check'];
        }

        $services = DB::table('services')
            ->whereIn('slug', $targetSlugs)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'price'])
            ->map(function ($service) use ($serviceMap, $riskFactors) {
                $reason = $serviceMap[$service->slug] ?? 'property protection';
                if (!empty($riskFactors) && str_contains(strtolower($riskFactors[0]), 'deed') && $service->slug === 'deed-ownership-verification') {
                    $reason = 'critical deed gap';
                }

                return [
                    'id' => (int) $service->id,
                    'name' => (string) $service->name,
                    'slug' => (string) $service->slug,
                    'reason' => $reason,
                    'price' => (float) $service->price,
                ];
            })
            ->values()
            ->all();

        return $services;
    }

    /**
     * @param array<int, string> $riskFactors
     * @param array<int, array{id:int,name:string,slug:string,reason:string,price:float}> $recommendations
     */
    private function summary(int $overallScore, array $riskFactors, array $recommendations): string
    {
        $status = $this->statusForScore($overallScore);
        $headline = match ($status) {
            'green' => 'Property file is in strong shape.',
            'yellow' => 'Property file is partially complete and needs follow-up.',
            default => 'Property file has critical gaps requiring immediate action.',
        };

        $riskLine = $riskFactors[0] ?? 'No major risks identified.';
        $serviceLine = !empty($recommendations)
            ? 'Top recommendation: '.$recommendations[0]['name'].'.'
            : 'No service recommendation available at the moment.';

        return sprintf('%s Current score: %d/100. %s %s', $headline, $overallScore, $riskLine, $serviceLine);
    }

    private function statusForScore(int $score): string
    {
        if ($score >= 80) {
            return 'green';
        }

        if ($score >= 40) {
            return 'yellow';
        }

        return 'red';
    }
}
