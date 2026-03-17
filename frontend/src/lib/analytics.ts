import * as amplitude from '@amplitude/analytics-browser';

const isEnabled = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_AMPLITUDE_KEY;
let initialized = false;

/** Initialize Amplitude. Call once from root layout. */
export function initAnalytics() {
  if (!isEnabled || initialized) return;
  amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_KEY!, {
    autocapture: { pageViews: true, sessions: true, elementInteractions: true, formInteractions: true, fileDownloads: true },
    defaultTracking: { pageViews: true, sessions: true, formInteractions: true, fileDownloads: true },
  });
  initialized = true;
}

/** Identify a logged-in user. Call on login/register. No PII (name/email) sent. */
export function identifyUser(user: { id: number; role: string; created_at?: string }) {
  if (!isEnabled) return;
  const identifyEvent = new amplitude.Identify();
  identifyEvent.set('role', user.role);
  if (user.created_at) {
    identifyEvent.set('registered_at', user.created_at);
  }
  amplitude.setUserId(String(user.id));
  amplitude.identify(identifyEvent);
}

/** Reset identity on logout. */
export function resetAnalytics() {
  if (!isEnabled) return;
  amplitude.reset();
}

/** Track a custom event. */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!isEnabled) return;
  amplitude.track(event, properties);
}

// ─── Auth Funnel ─────────────────────────────────────────────

export function trackRegistrationStarted() {
  track('registration_started');
}

export function trackRegistrationCompleted(role: string) {
  track('registration_completed', { role });
}

export function trackOtpVerified() {
  track('otp_verified');
}

export function trackLoginCompleted(role: string) {
  track('login_completed', { role });
}

export function trackPasswordResetRequested() {
  track('password_reset_requested');
}

// ─── Property Funnel ─────────────────────────────────────────

export function trackPropertyAdded(propertyType: string) {
  track('property_added', { property_type: propertyType });
}

export function trackPropertyViewed(propertyId: string | number) {
  track('property_viewed', { property_id: String(propertyId) });
}

export function trackCoOwnerInvited() {
  track('co_owner_invited');
}

export function trackDocumentUploaded(documentType: string) {
  track('document_uploaded', { document_type: documentType });
}

export function trackDocumentChecklistViewed(propertyId: string | number) {
  track('document_checklist_viewed', { property_id: String(propertyId) });
}

export function trackDocumentChecklistCompletion(percentComplete: number) {
  track('document_checklist_completion', { percent_complete: percentComplete });
}

// ─── Assessment Funnel ───────────────────────────────────────

export function trackAssessmentStarted() {
  track('risk_assessment_started');
}

export function trackAssessmentCompleted(riskScore: number) {
  track('risk_assessment_completed', { risk_score: riskScore });
}

// ─── Consultation Funnel ─────────────────────────────────────

export function trackServiceCatalogViewed() {
  track('service_catalog_viewed');
}

export function trackServiceSelected(serviceType: string) {
  track('service_selected', { service_type: serviceType });
}

export function trackConsultationBooked(consultationType: string) {
  track('consultation_booked', { consultation_type: consultationType });
}

export function trackConsultationCompleted(consultationType: string) {
  track('consultation_completed', { consultation_type: consultationType });
}

// ─── Payment Funnel ──────────────────────────────────────────

export function trackCheckoutStarted(serviceType: string, amount: number) {
  track('checkout_started', { service_type: serviceType, amount });
}

export function trackPaymentCompleted(serviceType: string, amount: number, currency: string) {
  track('payment_completed', { service_type: serviceType, amount, currency });
}

export function trackPaymentFailed(errorReason: string) {
  track('payment_failed', { error_reason: errorReason });
}

// ─── Engagement ──────────────────────────────────────────────

export function trackLanguageSwitched(from: string, to: string) {
  track('language_switched', { from_language: from, to_language: to });
}
