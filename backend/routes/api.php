<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CalendlyWebhookController;
use App\Http\Controllers\Api\V1\ConsultantTicketController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\StripeWebhookController;
use App\Http\Controllers\Api\V1\TicketController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1/
|
*/

Route::prefix('v1')->group(function () {

    // Health check
    Route::get('/', function () {
        return response()->json(['status' => 'ok']);
    });

    // Auth routes (public)
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/google', [AuthController::class, 'googleAuth']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Auth routes (protected)
    Route::middleware('auth:sanctum')->group(function () {

        // Auth management
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
            Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::put('/me', [AuthController::class, 'updateMe']);
        });

        // Phase 2: Properties
        Route::apiResource('properties', \App\Http\Controllers\Api\V1\PropertyController::class);
        Route::put('properties/{property}/draft', [\App\Http\Controllers\Api\V1\PropertyController::class, 'saveDraft']);

        // Documents (nested under properties)
        Route::get('properties/{property}/documents', [\App\Http\Controllers\Api\V1\DocumentController::class, 'index']);
        Route::post('properties/{property}/documents', [\App\Http\Controllers\Api\V1\DocumentController::class, 'store']);
        Route::post('properties/{property}/documents/{documentTypeId}/mark-missing', [\App\Http\Controllers\Api\V1\DocumentController::class, 'markMissing']);
        Route::delete('properties/{property}/documents/{document}', [\App\Http\Controllers\Api\V1\DocumentController::class, 'destroy']);

        // Phase 3: Orders
        Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show']);
        Route::post('orders/{order}/checkout', [OrderController::class, 'checkout']);
        Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);

        // Phase 4: Tickets
        Route::apiResource('tickets', TicketController::class)->only(['index', 'store', 'show']);
        Route::patch('tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
        Route::patch('tickets/{ticket}/assign', [TicketController::class, 'assignConsultant']);
        Route::post('tickets/{ticket}/schedule-link', [TicketController::class, 'schedulingLink']);
        Route::get('tickets/{ticket}/comments', [TicketController::class, 'comments']);
        Route::post('tickets/{ticket}/comments', [TicketController::class, 'addComment']);
        Route::get('consultants', [TicketController::class, 'consultants']);
        Route::get('consultants/workload', [TicketController::class, 'consultantWorkload']);

        // Consultant workflow
        Route::prefix('consultant')->group(function () {
            Route::get('dashboard', [ConsultantTicketController::class, 'dashboard']);
            Route::get('metrics', [ConsultantTicketController::class, 'metrics']);
            Route::get('tickets', [ConsultantTicketController::class, 'index']);
            Route::get('tickets/{ticket}', [ConsultantTicketController::class, 'show']);
            Route::put('tickets/{ticket}', [ConsultantTicketController::class, 'update']);
            Route::post('tickets/{ticket}/comments', [ConsultantTicketController::class, 'addComment']);
        });
    });

    // Public routes (no auth)
    Route::post('/webhooks/stripe', StripeWebhookController::class);
    Route::post('/webhooks/calendly', CalendlyWebhookController::class);

    // Phase 2: Locations
    Route::prefix('locations')->group(function () {
        Route::get('/divisions', function () {
            return response()->json([
                'data' => \Illuminate\Support\Facades\DB::table('divisions')->get(),
            ]);
        });
        Route::get('/districts', function (\Illuminate\Http\Request $request) {
            $query = \Illuminate\Support\Facades\DB::table('districts');
            if ($request->has('division_id')) {
                $query->where('division_id', $request->division_id);
            }
            return response()->json(['data' => $query->get()]);
        });
        Route::get('/upazilas', function (\Illuminate\Http\Request $request) {
            $query = \Illuminate\Support\Facades\DB::table('upazilas');
            if ($request->has('district_id')) {
                $query->where('district_id', $request->district_id);
            }
            return response()->json(['data' => $query->get()]);
        });
        Route::get('/mouzas', function (\Illuminate\Http\Request $request) {
            $query = \Illuminate\Support\Facades\DB::table('mouzas');
            if ($request->has('upazila_id')) {
                $query->where('upazila_id', $request->upazila_id);
            }
            return response()->json(['data' => $query->get()]);
        });
    });

    // Public: Services
    Route::get('/services', function () {
        return response()->json([
            'data' => \Illuminate\Support\Facades\DB::table('services')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(),
        ]);
    });

    // Public: Service categories
    Route::get('/service-categories', function () {
        return response()->json([
            'data' => \Illuminate\Support\Facades\DB::table('service_categories')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(),
        ]);
    });

    // Public: FAQs
    Route::get('/faqs', function () {
        return response()->json([
            'data' => \Illuminate\Support\Facades\DB::table('faqs')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(),
        ]);
    });

    // Public: Sliders
    Route::get('/sliders', function () {
        return response()->json([
            'data' => \Illuminate\Support\Facades\DB::table('sliders')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(),
        ]);
    });

    // Public: Property types, ownership statuses, etc. (for forms)
    Route::get('/property-types', function () {
        return response()->json([
            'data' => \Illuminate\Support\Facades\DB::table('property_types')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(),
        ]);
    });

    Route::get('/ownership-statuses', function () {
        return response()->json([
            'data' => \Illuminate\Support\Facades\DB::table('ownership_statuses')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(),
        ]);
    });

    Route::get('/ownership-types', function () {
        return response()->json([
            'data' => \Illuminate\Support\Facades\DB::table('ownership_types')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(),
        ]);
    });

    Route::get('/document-types', function () {
        return response()->json([
            'data' => \Illuminate\Support\Facades\DB::table('document_types')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(),
        ]);
    });
});
