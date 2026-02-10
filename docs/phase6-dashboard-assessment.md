# Phase 6: Dashboard, Assessment, Settings, and Notification Center

Date: 2026-02-10
Status: In progress (core APIs and UI delivered)

## Scope delivered in this slice

### Backend

1. Assessment questions system
- Added table: `assessment_questions`
- Added model: `AssessmentQuestion`
- Added seeder: `AssessmentQuestionSeeder` (15 weighted yes/no questions)
- Added routes:
  - `GET /api/v1/assessments/questions`
  - `POST /api/v1/assessments/free`

2. Free assessment endpoint
- Public endpoint accepts:
  - `email`
  - `answers[]` with `question_id` + boolean answer
- Calculates score with positive and negative weights.
- Returns:
  - score
  - status (`red`, `yellow`, `green`)
  - summary
  - detected gaps
  - recommended services
- Stores lead-tracking entry in `activity_log` with `subject_type = free_assessment`.

3. Property assessment endpoint
- Added service: `PropertyAssessmentService`
- Added route:
  - `GET /api/v1/properties/{property}/assessment` (auth required)
- Creates `property_assessments` records with:
  - `overall_score`
  - `document_score`
  - `ownership_score`
  - `risk_factors`
  - `recommendations`
  - summary + detailed report
- Uses existing `PropertyCompletionService` for document scoring continuity.

4. Notification center API
- Added model: `InAppNotification` (maps to `notifications` table)
- Added controller: `NotificationController`
- Added routes (auth required):
  - `GET /api/v1/notifications`
  - `GET /api/v1/notifications/unread-count`
  - `PATCH /api/v1/notifications/{notificationId}/read`
  - `PATCH /api/v1/notifications/read-all`

5. Settings security + preferences
- Added route:
  - `PUT /api/v1/auth/change-password`
- Extended `PUT /api/v1/auth/me` to accept `notification_preferences` object.
- Added migration to store preferences in profile:
  - `user_profiles.notification_preferences` (JSON)

### Frontend

1. Dashboard refresh (`/dashboard`)
- Replaced placeholder with production-ready dashboard:
  - hero banner fed by `/sliders`
  - quick action cards
  - properties preview
  - recent activity
  - notification preview
  - ticket-at-a-glance section

2. Public assessment page (`/assessment`)
- Multi-step yes/no questionnaire.
- Progress indicator.
- Email capture before score generation.
- Result state with score, gaps, and service recommendations.

3. Notification center page (`/notifications`)
- Full list view.
- unread/read states.
- mark single read.
- mark all read.

4. Header bell and dropdown integration
- Added unread badge in portal header.
- Dropdown shows latest notifications.
- One-click mark-read + mark-all-read.
- Link to full notification center.

5. Settings page (`/settings`)
- Profile and preference update UI.
- Notification preference toggles.
- Password change form wired to `PUT /auth/change-password`.
- Danger-zone placeholder section.

6. Middleware updates
- Added `/notifications` to protected route matcher.

### Tests added

Backend:
- `backend/tests/Feature/AssessmentApiTest.php`
  - public question retrieval
  - free assessment scoring flow
  - authenticated property assessment generation
- `backend/tests/Feature/NotificationApiTest.php`
  - list notifications
  - unread count
  - mark read
  - mark all read
- `backend/tests/Feature/AuthSettingsTest.php`
  - notification preference persistence via `/auth/me`
  - password change flow via `/auth/change-password`

Frontend E2E:
- Extended Playwright smoke coverage with `/assessment` reachability.

## Validation checklist run for this slice

Local validations completed in this environment:
- `frontend`: `npm run build` ✅
- `frontend`: `npx tsc --noEmit` ✅
- `frontend`: `npm run lint` ✅

Blocked by sandbox restrictions (run on local machine):
- `docker compose exec app php artisan test`
- `npm run test:e2e` (sandbox cannot bind dev server port)

## Files introduced in this slice

- `backend/app/Http/Controllers/Api/V1/AssessmentController.php`
- `backend/app/Http/Controllers/Api/V1/NotificationController.php`
- `backend/app/Models/AssessmentQuestion.php`
- `backend/app/Models/InAppNotification.php`
- `backend/app/Services/PropertyAssessmentService.php`
- `backend/database/migrations/2026_02_10_130100_create_assessment_questions_table.php`
- `backend/database/migrations/2026_02_10_130200_add_notification_preferences_to_user_profiles_table.php`
- `backend/database/seeders/AssessmentQuestionSeeder.php`
- `backend/tests/Feature/AssessmentApiTest.php`
- `backend/tests/Feature/AuthSettingsTest.php`
- `backend/tests/Feature/NotificationApiTest.php`
- `frontend/src/hooks/use-notifications.ts`
- `frontend/src/app/assessment/page.tsx`
- `frontend/src/app/(portal)/notifications/page.tsx`
- `frontend/src/app/(portal)/settings/page.tsx`

## Known next steps inside Phase 6

1. Add a dedicated dashboard API to reduce client-side fan-out requests.
2. Add persisted user-facing assessment history in portal UI.
3. Add notification filters (`type`, `unread only`) and pagination controls in `/notifications`.
4. Add backend assertions for recommendation-service mapping behavior edge cases.
