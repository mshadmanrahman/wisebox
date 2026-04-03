# Wisebox Go-Live Dogfood Report

**Date:** 2026-04-03
**Tester:** Claude Code (automated E2E dogfood)
**Target:** https://wisebox-mvp.vercel.app
**Deadline:** April 12, 2026 (Shadman away from April 12)

---

## Summary

Tested 5 user flows: landing page, assessment, customer dashboard + property creation, consultant workspace, admin dashboard. Found **23 bugs** across 4 severity levels.

---

## P0 — CRITICAL (Must fix before go-live)

### BUG-01: Duplicate document fields in property creation
- **Where:** /properties/new → Step 2 (Documents)
- **What:** Three document types appear twice:
  - "Recorded Khatian (RS/BS/CS/BRS/BDS)" — 2x in Primary
  - "Mutation Khatian" — 2x in Primary
  - "Via Deed" — 2x in Secondary
- **Impact:** Inflates document count (shows 0/14, should be ~0/11), confuses users
- **Root cause:** Likely duplicate seed data or API returning duplicates
- **Screenshot:** wisebox-property-save-result.png

### BUG-02: Raw i18n/variable keys displayed throughout app
Multiple raw translation keys visible in production UI:
- `new.percentComplete` — property creation progress bar
- `new.docCompletion` — document completion progress bar
- `documents.scoreWeight` — on every document card (14 instances)
- `dashboard.welcomeBack` — consultant dashboard heading
- `dashboard.stats.scheduled` — consultant stats card
- `privacyPolicy` / `termsOfService` / `helpCenter` — login/register footer
- `login.adminLogin` — consultant login page
- **Impact:** App looks unfinished/broken. This is the "JS class name showing up" bug from tester feedback.
- **Root cause:** Translation strings not entered in admin Translations CMS, and no fallback to readable defaults.

### BUG-03: React hydration errors on login/register pages
- **Where:** /login (12 errors), /register (3 errors)
- **What:** React Error #425 (text mismatch) x7, #418 (hydration failed) x1, #423 (hydration error) x1
- **Impact:** Performance degradation, visual flicker during page load
- **Root cause:** SSR/CSR mismatch likely from Google OAuth iframe (locale-dependent "Fortsatt med Google" vs server-rendered English), possibly theme detection

### BUG-04: Missing pages — /terms, /privacy, /help return 404
- **Where:** Footer links on /login, /register
- **What:** All three legal/support pages don't exist
- **Impact:** Broken links, legal compliance risk (users can't read ToS before agreeing)

### BUG-05: Consultant ticket cards show empty Customer/Property/Service
- **Where:** /consultant dashboard → Active Cases
- **What:** Every ticket card has blank Customer, Property, and Service fields
- **Impact:** Consultant can't identify which client or property a ticket relates to

---

## P1 — HIGH (Fix before sharing with users)

### BUG-06: Logout redirects to /login instead of / (landing page)
- **Where:** User menu → Logout
- **What:** After logout, user lands on /login with no way to reach the marketing page
- **Impact:** User is trapped in auth flow. Login page logo links to /dashboard (which redirects back to /login)

### BUG-07: Mouza dropdown dead end — no manual entry
- **Where:** /properties/new → Location → Mouza
- **What:** Shows "No mouza for this upazila" (disabled option) with no way to type custom value
- **Impact:** Users can't complete property creation for locations without mouza data
- **Fix:** Add text input fallback when dropdown has no options

### BUG-08: "Test" property type visible in production
- **Where:** /properties/new → Property type radio buttons
- **What:** "Test" appears as a property type option alongside Land, Building, etc.
- **Impact:** Users might select it, pollutes data

### BUG-09: Phone number field accepts characters
- **Where:** (Reported by tester — needs verification on exact page, likely /settings or /register)
- **What:** Phone field allows alphabetic input instead of numbers only
- **Fix:** Add input type="tel" with pattern validation

### BUG-10: Consultant can access /admin/dashboard
- **Where:** /admin/dashboard
- **What:** Logged-in consultant session can navigate to admin dashboard (shows empty data)
- **Impact:** Authorization bypass — roles should be enforced on admin routes

### BUG-11: Admin dashboard shows all stats as 0
- **Where:** /admin/dashboard
- **What:** Pending, Assigned, Scheduled, Completed, Rejected all show 0 despite consultant having 8 tickets
- **Impact:** Admin has no visibility into platform activity

---

## P2 — MEDIUM (Fix before broad launch)

### BUG-12: "Talk to an expert" links to auth-required page for anonymous users
- **Where:** Assessment results page → "Talk to an expert" CTA
- **What:** Links to /workspace/services which requires authentication
- **Impact:** Anonymous users hit a redirect wall after completing assessment

### BUG-13: Form submission doesn't indicate missing fields near submit button
- **Where:** /properties/new → Save & Continue
- **What:** When form is incomplete, no inline validation messages near the submit button
- **Impact:** Users don't know what's missing (reported by tester)

### BUG-14: Google Sign-in shows Swedish locale
- **Where:** /login, /register
- **What:** Google button shows "Fortsatt med Google" instead of English
- **Impact:** Confusing for English-speaking target audience (diaspora users)
- **Root cause:** Google OAuth iframe picks up browser locale

### BUG-15: Google Sign-in below the fold on registration
- **Where:** /register
- **What:** "OR CONTINUE WITH" Google button is at the bottom after the full form
- **Impact:** Users who prefer Google auth don't see the option until after scrolling (Apurba feedback)

### BUG-16: No delete option for properties
- **Where:** Customer dashboard / property list
- **What:** Users can't delete duplicate or half-filled properties created by mistake
- **Impact:** Data clutter, no way to clean up (Apurba feedback)

### BUG-17: Mobile back-button creates duplicate properties
- **Where:** Property creation flow on mobile
- **What:** Pressing back while searching for file lands on property description, re-filling creates duplicate
- **Impact:** Data integrity issue (Apurba feedback)

### BUG-18: Free consultation not removed from service page after availing
- **Where:** Services page
- **What:** Once a user has had their free consultation, it should no longer appear
- **Impact:** Confusing UX, potential double-booking

---

## P3 — LOW (Post-launch improvements)

### BUG-19: Assessment questions lack tooltips for Bangla terms
- **Where:** /assessment/start
- **What:** Questions like "certified copy of deed" and "original property deed (Dolil)" need context tooltips
- **Impact:** Diaspora users unfamiliar with Bangla legal terms get confused (Apurba/Hasib feedback)

### BUG-20: Score section placement
- **Where:** Property detail / assessment results
- **What:** If doc missing + assessment score = 30, score section should be moved to top for visibility
- **Impact:** Users with low scores might miss critical information

### BUG-21: Email confirmation should include service details + property metadata
- **Where:** Email notifications
- **What:** Confirmation emails are too basic, should include what was ordered and for which property
- **Impact:** Poor transactional email experience

### BUG-22: Country field shows no value on property form
- **Where:** /properties/new → Location
- **What:** "Country" label exists but no value shown (presumably auto-set to Bangladesh)
- **Impact:** Users don't know what country is selected

### BUG-23: Landing page excessive whitespace
- **Where:** / (landing page)
- **What:** Large padding (py-24/py-32) between sections creates empty-looking areas
- **Impact:** Page feels unfinished on desktop, especially between hero and features

---

## Infrastructure Items (Not bugs — manual tasks)

1. Connect mywisebox.com domain (GoDaddy → Vercel nameservers)
2. Set up api.mywisebox.com on Railway
3. Update NEXT_PUBLIC_API_URL env var
4. Clean up test data (test properties, E2E audit tickets, "Test" property type)
5. Populate i18n strings via admin Translations CMS
6. Create /terms, /privacy, /help pages (even placeholder)
7. Google OAuth: Publish app from Testing to Production mode

---

## Console Error Summary

| Page | Errors | Type |
|------|--------|------|
| Landing | 0 | Clean |
| Assessment | 0 | Clean |
| Register | 3 | 404s for /terms, /privacy, /help |
| Login | 12 | Hydration (x9) + 404s (x3) |
| Dashboard | 12 | Carried from login |
| Property New | 46 | Accumulated hydration + interaction errors |
| Consultant | 4 | Minor |
| Admin | 11 | Various |
