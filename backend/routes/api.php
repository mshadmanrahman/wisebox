<?php

use App\Http\Controllers\Api\V1\AdminConsultationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AssessmentController;
use App\Http\Controllers\Api\V1\CalendlyWebhookController;
use App\Http\Controllers\Api\V1\ConsultantTicketController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\PublicFormController;
use App\Http\Controllers\Api\V1\FreeConsultationController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ServiceCatalogController;
use App\Http\Controllers\Api\V1\StripeWebhookController;
use App\Http\Controllers\Api\V1\TicketController;
use App\Http\Controllers\Api\V1\TranslationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1/
|
*/

// Top-level health check (for Railway / load balancer probes)
Route::get('/health', function () {
    $status = ['status' => 'ok', 'timestamp' => now()->toIso8601String()];

    try {
        \Illuminate\Support\Facades\DB::select('SELECT 1');
        $status['database'] = 'connected';
    } catch (\Throwable $e) {
        $status['database'] = 'error';
        $status['status'] = 'degraded';
    }

    return response()->json($status);
});

Route::prefix('v1')->group(function () {

    // Health check
    Route::get('/', function () {
        return response()->json(['status' => 'ok']);
    });

    // Auth routes (public, rate-limited: 5 attempts/min)
    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/google', [AuthController::class, 'googleAuth']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Auth routes (protected, rate-limited: 120 req/min per user)
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

        // Auth management
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
            Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::put('/me', [AuthController::class, 'updateMe']);
            Route::put('/change-password', [AuthController::class, 'changePassword']);
        });

        // Phase 2: Properties
        Route::apiResource('properties', \App\Http\Controllers\Api\V1\PropertyController::class);
        Route::put('properties/{property}/draft', [\App\Http\Controllers\Api\V1\PropertyController::class, 'saveDraft']);

        // Documents (nested under properties)
        Route::get('properties/{property}/documents', [\App\Http\Controllers\Api\V1\DocumentController::class, 'index']);
        Route::post('properties/{property}/documents', [\App\Http\Controllers\Api\V1\DocumentController::class, 'store']);
        Route::post('properties/{property}/documents/{documentTypeId}/mark-missing', [\App\Http\Controllers\Api\V1\DocumentController::class, 'markMissing']);
        Route::get('documents/{document}/download', [\App\Http\Controllers\Api\V1\DocumentController::class, 'download']);
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
            Route::get('stats', [ConsultantTicketController::class, 'stats']);
            Route::get('dashboard', [ConsultantTicketController::class, 'dashboard']);
            Route::get('metrics', [ConsultantTicketController::class, 'metrics']);
            Route::get('tickets', [ConsultantTicketController::class, 'index']);
            Route::get('tickets/{ticket}', [ConsultantTicketController::class, 'show']);
            Route::put('tickets/{ticket}', [ConsultantTicketController::class, 'update']);
            Route::post('tickets/{ticket}/comments', [ConsultantTicketController::class, 'addComment']);
            Route::post('tickets/{ticket}/confirm-slot', [ConsultantTicketController::class, 'confirmSlot']);
            Route::post('tickets/{ticket}/send-booking-link', [ConsultantTicketController::class, 'sendBookingLink']);
            Route::post('tickets/{ticket}/send-form', [ConsultantTicketController::class, 'sendForm']);
            Route::get('tickets/{ticket}/form-invitations', [ConsultantTicketController::class, 'formInvitations']);
        });

        // Consultation Forms
        Route::prefix('consultation-forms')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\ConsultationFormController::class, 'index']);
            Route::get('templates/{template}', [\App\Http\Controllers\Api\V1\ConsultationFormController::class, 'show']);
            Route::post('tickets/{ticket}/submit', [\App\Http\Controllers\Api\V1\ConsultationFormController::class, 'submitResponse']);
            Route::get('tickets/{ticket}/responses', [\App\Http\Controllers\Api\V1\ConsultationFormController::class, 'ticketResponses']);
        });

        // Free Consultation Requests (user-facing)
        Route::get('free-consultations/status', [FreeConsultationController::class, 'status']);
        Route::get('free-consultations', [FreeConsultationController::class, 'index']);
        Route::post('free-consultations', [FreeConsultationController::class, 'store']);
        Route::get('free-consultations/{ticket}', [FreeConsultationController::class, 'show']);

        // Admin: Translation Management (WB-229: admin middleware)
        Route::prefix('admin/translations')->middleware('admin')->group(function () {
            Route::get('/', [TranslationController::class, 'adminIndex']);
            Route::put('{id}', [TranslationController::class, 'update']);
            Route::post('/', [TranslationController::class, 'store']);
        });

        // Admin: Consultation Management (WB-229: admin middleware)
        Route::prefix('admin/consultations')->middleware('admin')->group(function () {
            Route::get('/', [AdminConsultationController::class, 'index']);
            Route::get('consultants', [AdminConsultationController::class, 'consultants']);
            Route::get('{ticket}', [AdminConsultationController::class, 'show']);
            Route::patch('{ticket}/approve', [AdminConsultationController::class, 'approve']);
            Route::patch('{ticket}/reject', [AdminConsultationController::class, 'reject']);
        });

        // Property Journal & Recommendations
        Route::prefix('properties/{property}')->group(function () {
            Route::get('journal', [\App\Http\Controllers\Api\V1\PropertyJournalController::class, 'show']);
            Route::get('recommendations', [\App\Http\Controllers\Api\V1\PropertyJournalController::class, 'recommendations']);
        });

        // Phase 6: Notifications and assessments
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::patch('notifications/{notificationId}/read', [NotificationController::class, 'markRead']);
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::get('dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('properties/{property}/assessment', [AssessmentController::class, 'propertyAssessment']);
        Route::get('properties/{property}/assessments', [AssessmentController::class, 'history']);
        Route::get('properties/{property}/consultations', [\App\Http\Controllers\Api\V1\PropertyController::class, 'consultations']);
    });

    // Public forms (no auth required, token-based access)
    Route::prefix('public-forms')->group(function () {
        Route::get('{token}', [PublicFormController::class, 'show']);
        Route::post('{token}/submit', [PublicFormController::class, 'submit']);
    });

    // Webhooks (rate-limited: 60 req/min)
    Route::middleware('throttle:webhooks')->group(function () {
        Route::post('/webhooks/stripe', StripeWebhookController::class);
        Route::post('/webhooks/calendly', CalendlyWebhookController::class);
    });

    // Public assessment routes
    Route::get('/assessments/questions', [AssessmentController::class, 'questions'])
        ->middleware('throttle:public');
    // Tight limit: creates accounts + sends emails
    Route::post('/assessments/free', [AssessmentController::class, 'freeAssessment'])
        ->middleware('throttle:5,1');

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

    // Public: Translations (for frontend i18n)
    Route::get('/translations', [TranslationController::class, 'index']);

    // Public: Services
    Route::get('/services', [ServiceCatalogController::class, 'index']);

    // Public: Service categories
    Route::get('/service-categories', [ServiceCatalogController::class, 'categories']);

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
            'data' => \App\Models\DocumentType::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(),
        ]);
    });
});
