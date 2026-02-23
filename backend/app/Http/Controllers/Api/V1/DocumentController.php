<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyDocument;
use App\Models\DocumentType;
use App\Services\PropertyCompletionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function __construct(
        private PropertyCompletionService $completionService
    ) {}

    /**
     * List documents for a property.
     */
    public function index(Request $request, Property $property): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

        $documents = $property->documents()
            ->with('documentType')
            ->get();

        // Get all applicable document types for this property
        $ownershipSlug = $property->ownershipStatus?->slug;
        $allDocTypes = DocumentType::active()
            ->forOwnership($ownershipSlug)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => [
                'document_types' => $allDocTypes->values(),
                'uploaded' => $documents->values(),
            ],
        ]);
    }

    /**
     * Upload a document.
     */
    public function store(Request $request, Property $property): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

        $request->validate([
            'document_type_id' => ['required', 'exists:document_types,id'],
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
        ]);

        $file = $request->file('file');
        $docType = DocumentType::findOrFail($request->document_type_id);

        // Generate S3 key
        $extension = $file->getClientOriginalExtension();
        $s3Key = "documents/{$property->id}/{$docType->slug}/" . Str::uuid() . ".{$extension}";

        // Store file (uses local disk in dev, S3 in production)
        $disk = config('app.env') === 'production' ? 'documents' : 'local';
        Storage::disk($disk)->put($s3Key, file_get_contents($file->getRealPath()));

        // Delete existing document of same type if any
        $existing = PropertyDocument::where('property_id', $property->id)
            ->where('document_type_id', $docType->id)
            ->first();
        if ($existing) {
            Storage::disk($disk)->delete($existing->file_path);
            $existing->delete();
        }

        $document = PropertyDocument::create([
            'property_id' => $property->id,
            'document_type_id' => $docType->id,
            'user_id' => $request->user()->id,
            'file_path' => $s3Key,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'status' => 'uploaded',
            'has_document' => true,
        ]);

        // Recalculate completion
        $completion = $this->completionService->calculate($property);

        $document->load('documentType');

        return response()->json([
            'data' => $document,
            'completion' => $completion,
        ], 201);
    }

    /**
     * Mark a document type as "I don't have this".
     */
    public function markMissing(Request $request, Property $property, int $documentTypeId): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

        $docType = DocumentType::findOrFail($documentTypeId);

        // Create or update a placeholder record
        PropertyDocument::updateOrCreate(
            [
                'property_id' => $property->id,
                'document_type_id' => $documentTypeId,
            ],
            [
                'user_id' => $request->user()->id,
                'file_path' => '',
                'file_name' => '',
                'file_size' => 0,
                'mime_type' => '',
                'has_document' => false,
                'status' => 'uploaded',
            ]
        );

        return response()->json([
            'message' => __('messages.document_marked_missing'),
            'guidance' => $docType->missing_guidance,
        ]);
    }

    /**
     * Download/view a document file.
     * Accessible by the document owner, consultants, and admins.
     */
    public function download(Request $request, PropertyDocument $document)
    {
        $user = $request->user();
        $isStaff = in_array($user->role, ['consultant', 'admin', 'super_admin']);
        $isOwner = $document->user_id === $user->id;

        if (!$isStaff && !$isOwner) {
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

        if (!$document->has_document || !$document->file_path) {
            return response()->json(['message' => __('messages.no_file_available')], 404);
        }

        $disk = config('app.env') === 'production' ? 'documents' : 'local';

        if (!Storage::disk($disk)->exists($document->file_path)) {
            return response()->json(['message' => __('messages.file_not_found')], 404);
        }

        return Storage::disk($disk)->download(
            $document->file_path,
            $document->file_name,
            ['Content-Type' => $document->mime_type]
        );
    }

    /**
     * Delete a document.
     */
    public function destroy(Request $request, Property $property, PropertyDocument $document): JsonResponse
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

        if ($document->property_id !== $property->id) {
            return response()->json(['message' => __('messages.document_not_belongs')], 404);
        }

        // Delete file from storage
        if ($document->has_document && $document->file_path) {
            $disk = config('app.env') === 'production' ? 'documents' : 'local';
            Storage::disk($disk)->delete($document->file_path);
        }

        $document->delete();

        // Recalculate completion
        $completion = $this->completionService->calculate($property);

        return response()->json([
            'message' => __('messages.document_deleted'),
            'completion' => $completion,
        ]);
    }
}
