# Wisebox MVP: UAT Test Instructions

**Version:** 1.0
**Date:** 2026-02-14
**Environment:** Local development (Docker + Next.js dev server)

---

## Prerequisites

Before testing, confirm these services are running:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Next.js app (customer, admin, consultant portals) |
| Backend API | http://localhost:8000 | Laravel API |
| Mailpit | http://localhost:8025 | Email inbox (catches all outgoing emails) |

If any service is down, run from the `wisebox/` directory:
```bash
docker compose up -d          # backend + DB + Redis + Mailpit
cd frontend && npm run dev    # frontend
```

---

## Test Accounts

| Role       | Email                    | Password    | Login URL                              |
| ---------- | ------------------------ | ----------- | -------------------------------------- |
| Customer   | connectshadman@gmail.com | TestPass123 | http://localhost:3000/login            |
| Admin      | admin@wisebox.local      | TestPass123 | http://localhost:3000/login/admin      |
| Consultant | consultant@wisebox.com   | TestPass123 | http://localhost:3000/login/consultant |

---

## Test 1: Login Pages Render

**Goal:** All three login portals load correctly with proper branding.

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 1.1 | Open http://localhost:3000/login | Customer login page loads with email/password fields and "Sign In" button | |
| 1.2 | Open http://localhost:3000/login/admin | Admin login page loads, shows "Admin" branding | |
| 1.3 | Open http://localhost:3000/login/consultant | Consultant login page loads, shows "Consultant" branding | |

---

## Test 2: Authentication and Role Enforcement

**Goal:** Login works correctly; roles are enforced across portals.

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 2.1 | Go to http://localhost:3000/login. Enter `connectshadman@gmail.com` / `TestPass123`. Click "Sign In". | Redirects to http://localhost:3000/dashboard. Shows "Hi Shadman Rahman!" greeting. | |
| 2.2 | Log out (click avatar in header, click "Logout"). Go to http://localhost:3000/login/admin. Enter `connectshadman@gmail.com` / `TestPass123`. Click "Sign In". | Error message appears: customer account cannot access admin portal. Does NOT redirect to admin dashboard. | |
| 2.3 | Open http://localhost:3000/dashboard in a private/incognito window (not logged in). | Redirects to http://localhost:3000/login?redirect=%2Fdashboard | |
| 2.4 | Open http://localhost:3000/admin/dashboard in a private/incognito window. | Redirects to http://localhost:3000/login/admin?redirect=%2Fadmin%2Fdashboard | |
| 2.5 | Open http://localhost:3000/consultant in a private/incognito window. | Redirects to http://localhost:3000/login/consultant?redirect=%2Fconsultant | |

---

## Test 3: Customer Portal

**Goal:** All customer pages load and function correctly.

**Setup:** Log in as customer at http://localhost:3000/login with `connectshadman@gmail.com` / `TestPass123`

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 3.1 | After login, verify dashboard. | Dashboard shows greeting "Hi Shadman Rahman!", "Add New Property" card, hero carousel, and guide section. | |
| 3.2 | Click "Assets" in the header nav (or go to http://localhost:3000/properties). | Properties page loads. Shows existing properties (4 draft properties currently in system). | |
| 3.3 | Go to http://localhost:3000/properties/new | Property creation form loads. | |
| 3.4 | Click on any existing property from the properties list. | Property detail page loads. Shows "Free Consultation" CTA button. | |
| 3.5 | On the property detail page, click the "Free Consultation" button. | Dialog opens asking "What do you need help with?" with description field and preferred time slot picker. | |
| 3.6 | Fill in the consultation dialog: enter a description, pick a date/time, click Submit. | Either creates successfully (success toast) or shows "already active" message (if property already has a consultation). Both are valid. | |
| 3.7 | Click "Services" in the header (or go to http://localhost:3000/workspace/services). | Services workspace loads. Shows available services (Deed Verification, Background Check, etc.). | |
| 3.8 | Click "Billing" in the header (or go to http://localhost:3000/orders). | Orders page loads. Shows order history (may be empty). | |
| 3.9 | Go to http://localhost:3000/tickets | Tickets page loads. Shows support tickets. | |
| 3.10 | Go to http://localhost:3000/settings | Settings page loads with profile form and notification preferences. | |
| 3.11 | Go to http://localhost:3000/notifications | Notifications page loads. Shows notification history. | |
| 3.12 | Verify header nav does NOT show "Admin" or "Consultant" links. | Only "Assets", "Services", "Billing" are visible. No amber "Admin" link. No "Consultant" link. | |

---

## Test 4: Admin Portal

**Goal:** Admin can view and manage consultation requests.

**Setup:** Log in as admin at http://localhost:3000/login/admin with `admin@wisebox.local` / `TestPass123`

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 4.1 | After login, verify admin dashboard at http://localhost:3000/admin/dashboard | Shows "Admin Dashboard" heading with shield icon. Shows stat cards: Pending (1), Assigned (2), Scheduled (0), Completed (0), Rejected (0). Shows "Consultation Requests" list. | |
| 4.2 | Verify header shows amber "Admin" link. | Header nav includes an amber-colored "Admin" link pointing to /admin/dashboard. | |
| 4.3 | Click "View All" or go to http://localhost:3000/admin/consultations | Consultation Requests page loads. Shows heading "Consultation Requests" with subtitle. Shows filter buttons: All, Pending, Assigned, Scheduled, Completed, Rejected (each with count). | |
| 4.4 | Click the "Pending" filter button. | List filters to show only pending consultations. Button becomes highlighted (amber). | |
| 4.5 | Click on any consultation in the list. | Consultation detail page loads. Shows ticket number, status badge, customer info, property info, and description. | |
| 4.6 | On the consultation detail page, try approving/assigning the pending consultation. Select a consultant and click approve. | Status changes from "Pending" to "Assigned". Consultant name appears. | |
| 4.7 | Open http://localhost:8025 (Mailpit). | Mailpit inbox shows emails sent during consultation actions (ticket assigned notifications, status updates). | |

---

## Test 5: Consultant Portal

**Goal:** Consultant can view assigned cases and take action.

**Setup:** Log in as consultant at http://localhost:3000/login/consultant with `consultant@wisebox.com` / `TestPass123`

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 5.1 | After login, verify consultant dashboard at http://localhost:3000/consultant | Shows "Welcome back, [name]!" greeting. Shows stat cards: Pending Action, Scheduled, Completed This Month, Total Assigned. | |
| 5.2 | Verify header shows "Consultant" link. | Header nav includes a "Consultant" link. | |
| 5.3 | Check the "Your Cases" section on the dashboard. | Shows assigned consultation tickets with ticket numbers, status badges, customer names, and property names. | |
| 5.4 | Click on an assigned ticket. | Ticket detail page loads. Shows full consultation details, customer info, property info. If ticket has preferred time slots, shows "Action Required: Select meeting time" message. | |
| 5.5 | If a ticket shows preferred time slots, select one and confirm. | Meeting gets scheduled. Status changes. Calendar event is created (if Google Calendar is connected). | |

---

## Test 6: Free Consultation End-to-End Flow

**Goal:** Full lifecycle from customer request to consultant assignment.

This test walks through the complete consultation flow across all three portals.

| # | Step | Actor | Expected Result | Pass/Fail |
|---|------|-------|-----------------|-----------|
| 6.1 | Log in as customer at http://localhost:3000/login. Go to any property detail page. Click "Free Consultation". Fill in description and preferred time. Submit. | Customer | Success message. Consultation created with status "Pending". | |
| 6.2 | Check http://localhost:8025 (Mailpit). | - | Email notification received for new consultation request. | |
| 6.3 | Log in as admin at http://localhost:3000/login/admin. Go to http://localhost:3000/admin/dashboard. | Admin | New consultation appears in the list with "Pending" status. Pending count increased by 1. | |
| 6.4 | Click the new consultation. Approve it and assign to consultant@wisebox.com. | Admin | Status changes to "Assigned". Consultant name appears. | |
| 6.5 | Check http://localhost:8025 (Mailpit). | - | Email notification sent to consultant about new assignment. | |
| 6.6 | Log in as consultant at http://localhost:3000/login/consultant. Check dashboard. | Consultant | Newly assigned consultation appears in "Your Cases". Pending Action count reflects it. | |
| 6.7 | Click the assigned consultation. Review details. | Consultant | Full details visible: customer name, property, description, preferred time slots. | |
| 6.8 | Log back in as customer. Go to http://localhost:3000/tickets or the property detail page. | Customer | Consultation status visible as "Assigned" with consultant info. | |

---

## Test 7: Navigation and UI Components

**Goal:** Header navigation, notifications, and user menu work across portals.

| # | Step | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 7.1 | As customer: click the bell icon in the header. | Notification dropdown opens. Shows "Notifications" label, "Mark all read" button, notification list (up to 5), and "Open notification center" link. | |
| 7.2 | Click "Open notification center" in the dropdown. | Navigates to http://localhost:3000/notifications. Full notification list visible. | |
| 7.3 | Click the user avatar (circle with initial) in the header. | Dropdown shows user email, "Settings" link, and "Logout" button (red). | |
| 7.4 | Click "Settings" in the dropdown. | Navigates to http://localhost:3000/settings. | |
| 7.5 | Click "Logout" in the dropdown. | Redirects to http://localhost:3000/login. Auth state cleared. | |
| 7.6 | As admin: verify header shows "Assets", "Services", "Billing", "Admin" (amber). | All four nav links visible. Admin link is amber-colored. | |
| 7.7 | As consultant: verify header shows "Assets", "Services", "Billing", "Consultant". | All four nav links visible, including "Consultant". | |

---

## Test 8: Email Verification (Mailpit)

**Goal:** All transactional emails are delivered and readable.

**URL:** http://localhost:8025

| # | Trigger | Expected Email | Pass/Fail |
|---|---------|----------------|-----------|
| 8.1 | Customer submits free consultation | Notification to admin about new request | |
| 8.2 | Admin assigns consultation to consultant | "Ticket Assigned" email to consultant | |
| 8.3 | Admin changes consultation status | Status update email to customer | |
| 8.4 | Customer places a service order | "Order Received" confirmation email | |

**Note:** All emails are captured by Mailpit locally. No real emails are sent. Open http://localhost:8025 to view all captured emails.

---

## Quick Reference: All URLs

| Page | URL |
|------|-----|
| **Customer Login** | http://localhost:3000/login |
| **Admin Login** | http://localhost:3000/login/admin |
| **Consultant Login** | http://localhost:3000/login/consultant |
| **Customer Dashboard** | http://localhost:3000/dashboard |
| **Properties** | http://localhost:3000/properties |
| **New Property** | http://localhost:3000/properties/new |
| **Services** | http://localhost:3000/workspace/services |
| **Orders/Billing** | http://localhost:3000/orders |
| **Tickets** | http://localhost:3000/tickets |
| **Settings** | http://localhost:3000/settings |
| **Notifications** | http://localhost:3000/notifications |
| **Admin Dashboard** | http://localhost:3000/admin/dashboard |
| **Admin Consultations** | http://localhost:3000/admin/consultations |
| **Consultant Dashboard** | http://localhost:3000/consultant |
| **Mailpit (Email Inbox)** | http://localhost:8025 |
| **Backend API** | http://localhost:8000/api/v1 |

---

## Known Limitations (MVP)

- Google Calendar integration requires the OAuth token to be refreshed if expired (run `docker compose exec app php artisan google:auth`)
- Stripe payments are in test mode; use Stripe test card `4242 4242 4242 4242` with any future expiry and any CVC
- Properties are in "draft" status; full property completion flow is not yet tested in this UAT
- Mobile responsive layout is not covered in this UAT round (desktop only)

---

## Reporting Issues

For each failed test, note:
1. **Test number** (e.g., 3.4)
2. **What happened** (actual result)
3. **Screenshot** (if visual issue)
4. **Browser console errors** (open DevTools with F12, check Console tab)
