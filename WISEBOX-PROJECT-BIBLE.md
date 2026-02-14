---
tags:
  - VibeCoding
  - VibeCoding/Hobby
  - Wisebox
---

# Wisebox Project Bible

> **Last updated:** 2026-02-08
> **Owner:** Shadman Rahman (Product)
> **Status:** Pre-launch / Internal testing blocked by CORS
> **Category:** Side project (NOT related to Keystone)

---

## Table of Contents

1. [What is Wisebox](#1-what-is-wisebox)
2. [Access Credentials and Links](#2-access-credentials-and-links)
3. [Team and Stakeholders](#3-team-and-stakeholders)
4. [Timeline and Milestones](#4-timeline-and-milestones)
5. [Product Architecture](#5-product-architecture)
6. [Backend Admin Panel Audit](#6-backend-admin-panel-audit)
7. [Frontend State](#7-frontend-state)
8. [Design Decisions Log](#8-design-decisions-log)
9. [Meeting History](#9-meeting-history)
10. [Technical Blockers](#10-technical-blockers)
11. [Business Model](#11-business-model)
12. [What Needs to Happen Next](#12-what-needs-to-happen-next)
13. [Local Files and Resources](#13-local-files-and-resources)

---

## 1. What is Wisebox

Wisebox is a digital property management platform targeting the South Asian diaspora (NRBs, NRIs, NRPs) living abroad. It helps users securely manage property documents, verify ownership, and connect with legal consultants for properties they own in Bangladesh, India, and Pakistan.

**Core problem:** Non-Resident Bangladeshis face document fraud, dalal (middleman) exploitation, distance barriers, and complex inheritance/mutation processes when managing ancestral properties from abroad.

**Solution:** A trusted digital platform combining:
- Secure document vault (upload, classify, track)
- AI-powered document assessment and gap analysis
- Expert consultation network (retired government officials, lawyers, local agents)
- On-ground service delivery (inspections, document preparation, tax payments)

**Target market:** 49 million NRBs, NRIs, and NRPs globally; 960,000 potential users in UK alone.

---

## 2. Access Credentials and Links

### Frontend (User-Facing)

| Environment | URL | Status |
|-------------|-----|--------|
| **v2 Staging** | https://wisebox-v2.vercel.app/ | Login blocked (CORS) |
| **Fork Staging** | https://wisebox-fork.vercel.app/ | Login blocked (CORS) |
| **Production** | https://mywisebox.com | Pending DNS/hosting setup |

**Test user account:**
- Email: `simran.khan.mim1998@gmail.com`
- Password: `Simran@12`

### Backend Admin Panel

| Environment | URL | Status |
|-------------|-----|--------|
| **Admin Panel** | https://wisebox-backend.singularitybd.net/login | Working |

**Admin credentials:**
- Email: `platform.singularity@gmail.com`
- Password: `12345678`

### Design Files (Figma)

| Design | URL |
|--------|-----|
| **Main UI Design (2025.8.1)** | https://www.figma.com/design/UQAGgNkE53Ebom984gQBBA/2025.8.1?m=auto&t=Uw7S4y4MGgQAZW6b-6 |
| **Singularity Team Prototype (2025.11.20)** | https://www.figma.com/proto/jXZNaczpbaI3m8BcZf7SQn/Wise-Box-2025.11.20-Singularity-Team?node-id=6943-3246&p=f&t=AlxJz4J3Lb55TqoA-1&scaling=min-zoom&content-scaling=fixed&page-id=6960%3A4305&starting-point-node-id=6943%3A3246 |

### Email Accounts

| Email | Purpose |
|-------|---------|
| `hello@wiseboxinc.com` | Primary business email |
| `admin@wisebox.com` | Admin/system email (needs SMTP config) |
| `shadman.rahman@wiseboxinc.com` | Shadman's Wisebox email |

### API / Backend

| Service | URL/Detail |
|---------|------------|
| **Backend API base** | `https://wisebox-backend.singularitybd.net/api/v1/` |
| **Framework** | Laravel (PHP) with Blade admin templates |
| **Auth method** | Session-based (admin), API tokens needed for SPA |
| **Google Cloud** | API credentials in local `API Credentials Test Project/` folder |

---

## 3. Team and Stakeholders

### Core Team

| Name | Role | Email | Organization |
|------|------|-------|-------------|
| **Sadequl Arefeen (Rumman)** | CEO | sadequl.arefeen@gmail.com | Wisebox Inc |
| **Shadman Sakib** | Head of Ops & Strategy | info.shadman@gmail.com | Wisebox Inc |
| **Shadman Rahman** | Head of Product | connectshadman@gmail.com / shadman.rahman@wiseboxinc.com | Wisebox (side project) |
| **Shah Hasibur Rahman** | Business Director | - | Spellbound |
| **Ahasan Apurbo Chowdhury** | Marketing Director | - | Spellbound |
| **Sabrina Haider Chowdury** | Business Development | - | Wisebox |
| **Meshkatozzaman** | Technology Lead | meshkatozzaman@spellboundbd.com | SpellBound |

### Development Team (Singularity BD)

| Name | Role | Email |
|------|------|-------|
| **Shahriar Ferdous (Ocean)** | Project Coordinator | ferdous.singularity@gmail.com |
| **Shadman Fahim Ahmed** | Project Manager | shadman.singularity@gmail.com |
| **Naziabashar** | Developer | - |
| **Rakib** | Developer | - |
| **Sabuj Kumar Modak** | QA | sabuj1.modak.qa@gmail.com |
| **Rafi (William Sutton)** | Developer | rafi.singularity01@gmail.com |
| **Abir (John)** | Developer | abir.singularity1@gmail.com |
| **Rezaul Karim** | Developer | rezaul.karim@example.com |
| **Sharmin Akter** | Developer | sharmin.akter@example.com |


---

## 4. Timeline and Milestones

### Chronological History

| Date | Milestone | Status |
|------|-----------|--------|
| **2024 (early)** | Business plan (86 pages, R35) completed | Done |
| **2024** | Contracts signed: NDA, Master Services Agreement, Offer Letter | Done |
| **2025-09-08** | First weekly development catchup recorded | Done |
| **2025-09-29** | Weekly sync: Auth flow, property CRUD, document upload, service module, ticketing all on backend | Done |
| **2025-10-09** | MVP deadline set for Oct 24; demo target Oct 15 | Missed |
| **2025-10-12** | Wisebox Workshop: Full platform overview, government API integration discussed | Done |
| **2025-10-20** | Product demo planned for Oct 26; AI discussion begins, Koly assigned as AI lead | Done |
| **2025-10-24** | Original MVP deadline | Missed |
| **2025-10-26** | Product demo: user creation, property creation, booking, admin panels | Done |
| **2025-11-11** | Property onboarding flow redesign: Start simple, upload one doc, auto-extract via OCR | Done |
| **2025-11-20** | UX/UI design feedback: Radio buttons, double columns, progress indicators approved | Done |
| **2025-11-24** | Dynamic landing page + property listing live; multi-step property flow active | Done |
| **2025-12-11** | MVP discussion with Wisebox consultants: Three-tier service structure defined | Done |
| **2025-12-22** | Document comparison feature designed (logical, not AI); target Jan 6 | Done |
| **2026-01-01** | MVP design discussion: Property registration workflow, document upload system, Figma designs | Done |
| **2026-01-07** | Platform links and credentials shared in meeting | Done |
| **2026-01-12** | MVP completion targeted for Thursday; communication gaps flagged | Partial |
| **2026-01-18** | **Major milestone: Singularity x Wisebox MVP Feedback Meeting** with full team. OTP non-functional, payment incomplete, CORS issues. End-to-end MVP loop defined (7-step user journey). Feb 15 deadline set. | Partial |
| **2026-01-19** | Flow simplification: 6-step reduced to 2-step. SRS requirement added before design. WhatsApp replaces Slack. | Done |
| **2026-01-26** | Add Property flow design session: Conditional branching, ownership types, co-owner management, dynamic schema | Done |
| **2026-02-01** | **Final design review before development.** International positioning (not Bangladesh-only). Target: Feb 15 completion. | Done |
| **2026-02-02** | Weekly catchup: Banner design, property flow, document upload infrastructure reviewed | Done |
| **2026-02-08** | Current state audit: Backend has 83 properties, 29 customers, 25 orders, 17 services. Frontend blocked by CORS. | **Current** |
| **2026-02-15** | MVP delivery target | **At risk** |

---

## 5. Product Architecture

### Two-Tier Platform

```
Marketing Website (MyWisebox.com)
  - Explainer videos, FAQs
  - Free assessment tool (10-15 yes/no questions)
  - Lead generation and education
  - CTA: "Check property status" / "Get free assessment"

Portal App (wisebox-v2.vercel.app)
  - User registration and login
  - Property management (add, view, edit)
  - Document upload and classification
  - Service booking and payment
  - Expert consultation
  - Dashboard with progress tracking
```

### End-to-End MVP User Journey (Defined Jan 18, 2026)

1. **Landing on marketing site:** Brand promise, explainer video, FAQs. CTA: "Check property/document status" or "Get free assessment"
2. **Free assessment (lead magnet):** 10-15 yes/no questions about deeds, certified copies, mutations, khatian. Collects email/phone. Calculates completion score (green/yellow/red). Generates report.
3. **Bridge to consultation:** After assessment, invite to book consultation ("Talk to expert") or get help ("I don't have this document")
4. **Portal: Property detail and upload:** Create account/login. Add property (simplified 3-4 steps). Upload docs via mobile camera/scan or desktop drag-and-drop.
5. **Assessment + report + service offer:** Detailed check using uploaded docs and question bank. Status report (green/yellow/red). Written summary of risks/gaps. Concrete service offers.
6. **Consultant interaction and paid services:** Book expert (retired land officer, lawyer, on-ground agent). Services: detailed verification, on-ground visits, full property management.
7. **Ongoing loop and retention:** Dashboard for property and documents. Status tracking, reminders, nudges.

### Property Registration Flow (Simplified 2-Step)

**Step 1: Property and Ownership**
- Property type: Land, Apartment, Commercial, Agricultural, Industrial
- Ownership status (human-readable):
  - "I purchased it" (Purchase/Sale Deed)
  - "I received it as a gift" (Gift/Heba)
  - "I inherited it" (Inheritance/Succession)
  - "I own it by court order/decree" (Court Settlement)
  - "I own it by lease" (Settlement/Lease/Patta)
  - "I do not own it, it's family property" (Family)
- Sole owner? Yes/No (branches to co-owner flow)
- Property name, location (Division > District > Upazila > Mouza)

**Step 2: Document Upload**
- Yes/no questions to filter required documents
- Two-tier classification:
  - **Primary (essential):** Deed (Dolil), LD Tax/Dakhila/Rent Receipt (Khazna), Mutation Khatian, Recorded Khatian (RS/BS/CS/BRS/BDS)
  - **Secondary (supporting):** Court order/Decree, Duplicate Carbon Receipt (DCR), Position of Land, Possession of Land, Settlement/Lease Gazettes, Succession Certificate, Via Deed
- "I don't have this document" option with guidance
- "Save and continue" to overview page
- Completion percentage tracking (green/yellow/red)

### Dashboard Design

- Hero banner rotating every 30 seconds
- Three primary CTAs:
  1. "Add new property"
  2. "Talk to an expert"
  3. "Get free property assessment"
- "Feeling lost? Let us guide you" messaging for empty states
- Property cards with service status and progress indicators

---

## 6. Backend Admin Panel Audit (Feb 8, 2026)

Full audit of `https://wisebox-backend.singularitybd.net/administrative/`

### Admin Menu Structure

```
Dashboard
Property Setup
  - Property Type
  - Ownership Status
  - Ownership Type
Document Uploads (Document Types)
Properties
Services
Service Categories
Sliders
FAQs
Orders Manage
  - My Orders
Tickets
Customers
Account Settings
  - User List
  - Role
  - Permission
  - File Manager
```

### Property Types (3 configured)

| Type | Description | Status |
|------|-------------|--------|
| Land | Includes ground, structure and water | Active |
| Apartment | Residential unit in a building complex | Active |
| Others | Any other type | Active |

### Ownership Statuses (7 configured, with Bengali labels)

| # | Status | Bengali | Description |
|---|--------|---------|-------------|
| 1 | Ownership by Purchase / Sale Deed | কয় | This property is exclusively yours |
| 2 | Ownership by Gift (Heba / Gift Deed) | হেবা | Ownership can be claimed by multiple entity |
| 3 | Ownership by Inheritance / Succession | উত্তরাধিকার | You hold power of attorney |
| 4 | Ownership by Court Decree / Order | ডিক্রি | - |
| 5 | Ownership by Settlement / Lease / Patta | বন্দোবস্ত | - |
| 6 | SP Ownership by Donation/Religious Trust (Devottor / Waqf) | এওয়াজ/বিনিময় | You hold power of attorney |
| 7 | Family Property (Registered in Parents Name) | পারিবারিক সম্পত্তি | - |

### Document Types

**Primary (4):**
1. Deed (Dolil): The primary legal document proving the deceased's original ownership
2. LD Tax / Dakhila / Rent Receipt (RR) (Khazna): Registered legal agreement dividing inherited property
3. Mutation Khatian: Registered legal agreement dividing inherited property among co-heirs
4. Recorded Khatian (RS/BS/CS/BRS/BDS): Official government land record (Record of Rights)

**Secondary (7+):**
1. Court order/Decree (if ownership through Court Order / Decree)
2. Duplicate Carbon Receipt (DCR): Official duplicate of a lost land registration receipt
3. Position of the Land: Exact physical location and boundaries
4. Possession of the Land: Actual physical control and use
5. Settlement / Lease Gazettes: Official government notifications granting land
6. Succession Certificate / Other Documents
7. Via Deed: Historical deed

### Properties: 83 entries

- Mix of test data ("sd", "dsf", "hgfhg") and real entries ("rangpur house", "Test_prop_1")
- Users: Shahriar Ferdous Ocean (first 5), Modak, Simran Khan Mim (entries 8-10+)
- Fields working: Property Name, Property Type, Ownership Type, Ownership Status, Status, Latitude/Longitude, Address, Division, District, Upazilla, Size Type, Description, Property Images

### Customers: 29 accounts

- Mix of test/fake accounts and real users
- Real users include: Simran Khan Mim, Modak, Shah Hasibur Rahman, Destiny Whitaker (Jahidhasan), Test 123
- Fake accounts: Dieter Solis (Algeria), Lillian Okoro (Afghanistan), Miguel Santos (Brazil), Ms. Elena Petrova (Estonia), Geoffrey Patterson (mailinator)

### Services: 17 configured

| # | Service | Type | Price | Duration |
|---|---------|------|-------|----------|
| 1 | Deed & Ownership Verification | Paid | $45.00 | 1h 30m |
| 2 | Property Background Check | Paid | $60.00 | 2h |
| 3 | Deed Transfer Processing | Physical | $120.00 | 3h |
| 4 | Power of Attorney Transfer | Paid | $95.00 | 2h 15m |
| 5 | Mutation Application Assistance | Paid | $40.00 | 2h |
| 6 | Khatian Record Update | Paid | $55.00 | 2h 30m |
| 7 | Land Tax Payment Assistance | Paid | $20.00 | 1h |
| 8 | Utility Bill Verification | Free | Free | 45m |
| 9 | Market Value Assessment | Paid | $50.00 | 2h |
| 10 | Construction Cost Estimation | Paid | $65.00 | 2h 30m |
| 11-17 | (Additional services on page 2) | - | - | - |

### Orders: 25 total

- Date range: Oct 30, 2025 to Jan 17, 2026
- Services ordered: Lease Agreement Preparation ($30), Secure Document Storage ($40), Deed & Ownership Verification ($45), Utility Bill Verification (Free)
- Users who ordered: Simran Khan Mim, Destiny Whitaker, Shadman Fahim Ahmad, Ms. Elena Petrova, Modak, Shah Hasibur Rahman
- Payment statuses: Paid and Pending

### Tickets: Active system

- Agent assignment working
- Agents: Rafid Al Ridwan, Destiny Whitaker, Ms. Elena Petrova, David Armstrong
- Services: Land Tax Payment Assistance (most common)
- Properties referenced: Baridhara Lakeview Apartment, Maple Heights Residence

### Admin Users: 9+

| # | Name | Email | Role |
|---|------|-------|------|
| 1 | Developer | platform.singularity@gmail.com | Administrative |
| 2 | Rezaul Karim | rezaul.karim@example.com | Not Set |
| 3 | William Sutton (Rafi) | rafi.singularity01@gmail.com | Not Set |
| 4 | Sabuj Kumar Modak | sabuj1.modak.qa@gmail.com | Not Set |
| 5 | Geoffrey Patterson | jirami@mailinator.com | Not Set |
| 6 | John (Abir) | abir.singularity1@gmail.com | Not Set |
| 7 | Sharmin Akter | sharmin.akter@example.com | Not Set |
| 8 | Rubina Sultana | rubina.sultana@example.com | Not Set |
| 9 | Khalid Chowdhury | khalid.chowdhury@example.com | Not Set |

---

## 7. Frontend State (Feb 8, 2026)

### wisebox-v2.vercel.app (Primary staging)

- **Login page:** Clean design, email/password fields, Google OAuth button, "Forgot password" link, sign-up link. Working UI but API calls fail.
- **Sign-up page:** Full name, email, password, country of residence dropdown, ToS checkbox, Google sign-up. UI complete but untestable.
- **Dashboard:** Inaccessible (redirects to login due to auth failure)
- **All internal routes:** Redirect to login when unauthenticated

### wisebox-fork.vercel.app (Marketing site + app)

- **Marketing homepage:** Hero section ("Manage Your Ancestral Properties From Anywhere in the World"), three feature cards (Document Management, Remote Monitoring, Legal Support), "Start Managing Properties" CTA, "View Demo Dashboard" button
- **Feature section:** 8 feature cards including Smart Document Management, Property Monitoring, Legal Consultations, Digital Will Creation, Smart Notifications, Flexible Payments, Property Valuation, Family Collaboration. Last two show "Coming Soon" badges.
- **Login/signup:** Same as v2 staging, same CORS failure
- **All internal routes:** Redirect to sign-in

### Blocking Issue: CORS

Both frontends fail to authenticate because:
```
Access to fetch at 'https://wisebox-backend.singularitybd.net/login'
(redirected from 'https://wisebox-backend.singularitybd.net/api/v1/user')
from origin 'https://wisebox-v2.vercel.app' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

The backend is Laravel. The fix is adding allowed origins to `config/cors.php`.

---

## 8. Design Decisions Log

### Jan 18, 2026: MVP Feedback Meeting (Major Decisions)

- **Onboarding simplification:** 7-8 steps reduced to 3-4 core steps
- **Two-tier platform:** Separate marketing site (lead gen) from portal (property management)
- **Assessment as lead magnet:** Free 10-15 question tool that generates a score
- **Three-tier revenue:** Free > Premium > Enterprise
- **Expert network model:** Retired government officials, lawyers, local agents
- **80% threshold:** Triggers basic service eligibility

### Jan 19, 2026: Flow Simplification

- **6-step to 2-step:** Accordion-style single-page form
- **SRS document required** before design phase
- **Clickable prototype** before any coding
- **WhatsApp replaces Slack** as primary communication

### Jan 26, 2026: Add Property Flow Design

- **Conditional branching:** Property type determines subsequent fields
- **Human-readable ownership options:** "I purchased it" instead of "Ownership by purchase"
- **Co-owner management:** Dynamic list with ownership percentage totaling 100%
- **Location hierarchy:** Division > District > Upazila > Mouza (API-driven, cached locally)
- **White-label architecture:** JSON-driven dynamic forms for multi-jurisdiction support
- **Auto-save drafts** every 30 seconds

### Feb 1, 2026: Final Design Review

- **International positioning:** Not Bangladesh-only; Uber-style automatic law-of-the-land compliance
- **Dual login:** Google OAuth + email/password with OTP
- **5-step signup:** Name > Password > Country > ToS > OTP
- **Progressive disclosure:** JavaScript-based form unfolding
- **Two-tier documents:** Primary (essential) vs Secondary (supporting) with visual hierarchy
- **Target: Feb 15, 2026** for complete delivery

### Feb 2, 2026: Home Page and Upload Flow

- **Three equal-weight CTAs:** Add property, Talk to expert, Get free assessment
- **"Feeling lost" messaging** above buttons for empty state
- **Property naming:** "Choose a name for your property" (final label)
- **Document upload:** Three buttons per type: "I have this", "I don't have this", Info icon
- **Progress indicator:** Half-filled state when basic info entered

### UX Principles (from Nov 20 review)

- Radio buttons over checkboxes for single selection
- Double column layout to reduce scrolling
- Save/continue button only appears after valid selection
- Instructional tooltips after selection
- Color-coded status: Green (complete), Yellow (partial), Red (critical gaps)

---

## 9. Meeting History

### All Wisebox Meetings (Chronological)

| Date | Meeting | Key Topic |
|------|---------|-----------|
| 2025-09-08 | Wisebox Weekly Development Catchup | First recorded sync |
| 2025-09-29 | Wisebox Weekly Sync | Auth flow complete, property CRUD done, resource allocation |
| 2025-10-09 | Weekly Catchup: Product Development | MVP deadline Oct 24, demo Oct 15 |
| 2025-10-12 | Wisebox Workshop | Full platform overview, 3-4M target users, government API integration |
| 2025-10-20 | Wisebox Weekly Sync Meeting | Demo Oct 26, AI discussion begins, OCR strategy |
| 2025-11-11 | Weekly Catchup: Product Development | Onboarding redesign: upload one doc first, auto-extract, 20-30% initial completion |
| 2025-11-20 | Weekly Catchup: Product Development | UX/UI feedback, radio buttons, double columns, progress indicators |
| 2025-11-22 | Meeshkat Bhaiya | Advisory discussion |
| 2025-11-24 | Weekly Catchup: Product Development | Landing page live, property listing functional, service integration |
| 2025-12-08 | Weekly Catchup: Product Development | Regular weekly sync |
| 2025-12-11 | Wisebox MVP Discussion with Consultants | Three-tier service structure, chatbot integration, Bengali/English RAG |
| 2025-12-22 | Wisebox Weekly Development Catchup | Document comparison feature, weighted scoring, target Jan 6 |
| 2026-01-01 | Wisebox MVP Design Discussion | Registration workflow, document upload system, Figma designs shared |
| 2026-01-07 | Wisebox Platform | Platform links and credentials shared |
| 2026-01-12 | Weekly Catchup: Product Development (x2) | MVP target Thursday, communication gaps flagged |
| 2026-01-18 | **Singularity x Wisebox: MVP Feedback Meeting** | Full team, OTP/payment non-functional, end-to-end loop defined, Feb 15 deadline |
| 2026-01-19 | Weekly Catchup: Product Development (x2) | 6-step to 2-step, SRS requirement, WhatsApp switch |
| 2026-01-26 | Wisebox: Add Property Flow Design (x2) | Conditional branching, ownership types, co-owner management, dynamic schema |
| 2026-02-01 | Wisebox MVP Final Design Review | International positioning, Feb 15 target, all dependencies cleared |
| 2026-02-02 | Weekly Catchup: Product Development (x2) | Banner design, three CTAs, document upload UX finalized |

**Total Wisebox meetings recorded:** ~20 (some with duplicate Granola entries)
**Cadence:** Weekly on Sundays/Mondays (11:30 AM), with ad-hoc design sessions

---

## 10. Technical Blockers (as of Feb 8, 2026)

### P0: Must fix before any internal testing

| # | Blocker | Detail | Fix |
|---|---------|--------|-----|
| 1 | **CORS policy** | Backend at `wisebox-backend.singularitybd.net` has no `Access-Control-Allow-Origin` header for Vercel origins | Add origins to Laravel `config/cors.php`: `wisebox-v2.vercel.app`, `wisebox-fork.vercel.app`, `mywisebox.com` |
| 2 | **API auth flow** | Frontend hits `/api/v1/user` which redirects to `/login` (Blade page). SPA needs token-based auth, not session redirect. | Expose proper API login endpoint returning Bearer token. If using Sanctum, expose `/sanctum/csrf-cookie` with CORS. |
| 3 | **CSRF token** | Direct POST to `/login` returns 419 "Page Expired" (missing CSRF token) | API routes should use `api` middleware group (stateless), not `web` (session/CSRF) |

### P1: Should fix before internal launch

| # | Blocker | Detail |
|---|---------|--------|
| 4 | **OTP system non-functional** | Email, SMS, and app-based OTP all broken. Need Twilio setup or bypass for testing. |
| 5 | **Payment gateway incomplete** | No working payment integration. Not needed for internal testing but needed for paid services. |
| 6 | **Calendar booking (Twilio)** | Pending. Consultation booking flow incomplete. |
| 7 | **AWS hosting** | Production environment pending. Needs card details/billing setup. `mywisebox.com` domain pending DNS. |
| 8 | **Email gateway** | `admin@wisebox.com` needs SMTP configuration. SMTP server reportedly configured as of Feb 1. |

### P2: Nice to have

| # | Item | Detail |
|---|------|--------|
| 9 | Test data cleanup | 83 properties include junk ("sd", "dsf", "hgfhg"). 29 customers include fakes (Algeria, Afghanistan, Brazil, Estonia). |
| 10 | Admin role assignment | All non-admin users show "Not Set" for roles. |
| 11 | Mobile responsiveness | Critical for Bangladesh market (mobile-first). Untested. |

---

## 11. Business Model

### Revenue Tiers

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | Basic assessment, consultation booking, property dashboard |
| **Premium** | $20-$120/service | Document preparation, verification, background checks |
| **Enterprise** | Custom | Full property management, dedicated consultant, white-glove service |

### Service Pricing (from backend)

| Service | Price |
|---------|-------|
| Land Tax Payment Assistance | $20 |
| Mutation Application Assistance | $40 |
| Deed & Ownership Verification | $45 |
| Market Value Assessment | $50 |
| Khatian Record Update | $55 |
| Property Background Check | $60 |
| Construction Cost Estimation | $65 |
| Power of Attorney Transfer | $95 |
| Deed Transfer Processing | $120 |
| Utility Bill Verification | Free |

### Subscription Model (from Business Plan)

- Basic: $99/year
- Mid-tier: ~$250/year
- Premium: $399/year

### 5-Year Financial Projections

- Year 5 revenue target: $6.18M
- Year 5 net profit: $1.75M (status quo), $2.54M (best case)
- Gross margin target: 85% by Year 5
- Founders' reserve: $30,000

---

## 12. What Needs to Happen Next

### Immediate (This Week)

1. **Fix CORS**: 15-minute config change in Laravel. Add Vercel origins.
2. **Fix API auth**: Ensure `/api/v1/login` returns a token, not a redirect.
3. **Test login from frontend** after fixes.

### Short-term (Next 2 Weeks)

4. Seed 5-10 internal tester accounts via admin panel
5. Clean up test junk data (properties, customers)
6. Verify property creation flow end-to-end
7. Verify document upload and storage works
8. Create internal testing guide (1-page doc)

### Medium-term (Feb-March)

9. Deploy to production (`mywisebox.com`)
10. Set up OTP gateway (or bypass for beta)
11. Integrate payment gateway
12. Invite 5-10 internal testers
13. Iterate based on feedback

### Success Criteria for Internal Launch

- 5 internal users log in successfully
- Each creates at least 1 property
- Each uploads at least 3 documents
- No critical flow-breaking bugs

---

## 13. Local Files and Resources

### Documents Folder

Location: `/Users/connectshadman/Documents/Wisebox/`

```
API Credentials Test Project/
  - Wisebox Property API Client Secret.json
  - gen-lang-client-0520478624-9fce858a150e.json
Business Plan/
  - Business Plan_R35_ WiseBOX.pdf (86 pages)
  - Concept of WiseBox.pdf
Contract/
  - WIsebox-NDA-ShadmanRahman.pdf
  - Wisebox - MASTER SERVICES AGREEMENT_Signed.pdf
  - Wisebox_Offer_Letter_Shadman_Rahman.pdf
Logo/
  - Figma Full Logo Dark Mode.png
  - Full Logo Dark Mode Off Figma.png
  - Symbol Dark Mode Figma.png
  - Symbol Dark Mode Off Figma.png
Pitch Deck/
  - WiseBox.pdf
  - WiseBox.pptx
Services/
  - List of Services.docx / .pdf
  - Wise Box Vault.docx / .pdf
Test Deeds/
  - WhatsApp Image 2025-10-13 at 9.03.51 AM.jpeg
  - att.DyQ5xMhsR70TFhWCkfjMPj7xp4TF2PcBVMkwNuPVja8.png
  - att.RlEIwdSddKF-hHzZ9Mv-BL6-HbBAV7D6R5OAWIdffak.png
ToR/
  - Draft_Terms of Reference.pdf
```

### Obsidian Vault Notes

Location: Obsidian vault, various folders

- 20 Wisebox-related meeting notes (Sep 2025 - Feb 2026)
- README - Wisebox.md (main project overview)
- 2026-01-04 Wisebox Journey.excalidraw.md (visual diagram)

### Granola Meeting Transcripts

All meeting transcripts available via Granola app. Key meeting IDs for reference:
- Jan 18 MVP Feedback: `e20ec4ce-bd06-4a77-b3cb-ce5ec65dd614`
- Jan 26 Add Property Flow: `1f0e6854-5441-4f91-8604-720c1cd2f671`
- Feb 1 Final Design Review: `76ed2508-3c87-4c5d-b54e-c8a0149d66b2`
- Dec 11 Consultant Discussion: `af1e5fe5-e2eb-4915-b9dc-275c56ed306f`

---

## Appendix: Communication Channels

| Channel | Purpose | Status |
|---------|---------|--------|
| **WhatsApp** | Primary day-to-day communication | Active (replaced Slack Jan 2026) |
| **Slack** | Was primary, caused communication gaps | Deprecated |
| **Weekly meetings** | Sunday/Monday 11:30 AM | Active |
| **Figma** | Design handoff and review | Active |
| **Granola** | Meeting transcription and notes | Active |

---

*This document was generated on 2026-02-08 from: Obsidian vault (20 notes), Granola meeting transcripts (20+ meetings), backend admin panel live audit, frontend browser testing, business plan PDF, and local project files.*

## Related
- [[Vibe Coding/_hobby/README|Hobby Projects Index]]
