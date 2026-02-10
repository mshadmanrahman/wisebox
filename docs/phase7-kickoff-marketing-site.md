# Phase 7 Kickoff: Marketing Site

Date: 2026-02-10  
Status: In progress

## Objective

Deliver a production-ready marketing surface that improves acquisition and conversion while preserving the authenticated portal workflows delivered in Phases 1-6.

## Scope baseline (from implementation plan)

- Landing page sections on `/`:
  - Hero with dual CTA (`Get Free Assessment`, `Start Managing Properties`)
  - Problem statement cards
  - How-it-works flow
  - Feature grid
  - Pricing comparison
  - Trust/security section
  - FAQ
  - Footer
- Additional pages:
  - `/about`
  - `/faq`
  - `/contact`
  - `/services` (marketing perspective + portal compatibility)
- SEO:
  - Metadata and Open Graph
  - Structured data
  - `sitemap.xml` and `robots.txt`

## Work breakdown

### Track A: Information architecture and content

1. Finalize page map and section hierarchy for all Phase 7 routes.
2. Draft copy blocks for hero, problem statements, feature cards, trust, and CTA.
3. Define componentized content primitives so sections remain reusable.

### Track B: Frontend implementation

1. Build modular marketing components in `frontend/src/components/marketing`.
2. Implement `/` with all required sections and responsive behavior.
3. Implement `/about`, `/faq`, `/contact`, and align `/services` messaging.
4. Ensure portal and marketing visual systems remain coherent.

### Track C: SEO and technical delivery

1. Add metadata per route.
2. Add JSON-LD for services and organization data.
3. Implement sitemap and robots handling.
4. Validate social preview tags and canonical handling.

### Track D: Validation and quality gates

1. Backend unchanged for this slice unless API contract updates are required.
2. Frontend quality gates:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`
3. E2E validation expanded beyond route reachability:
  - auth redirect behavior
  - login-to-dashboard workflow
  - notification center interactions
  - assessment history render path

## Progress snapshot (current)

Completed:
- Built modular marketing component primitives under `frontend/src/components/marketing`.
- Implemented full public landing page at `/` with hero, pain points, workflow, features, pricing, trust, and FAQ.
- Implemented public pages: `/about`, `/faq`, `/contact`.
- Added SEO baseline:
  - route-level metadata (root + page-level)
  - JSON-LD on landing page
  - `sitemap.xml` and `robots.txt` via App Router metadata routes
- Expanded smoke E2E coverage for marketing route reachability.

Pending:
- `/services` marketing/public variant: currently blocked by route collision because `/services` is still the authenticated portal ordering page.
- Final copy polish and visual QA pass for mobile/tablet breakpoints.
- CI run confirmation for the updated marketing routes.

## Definition of done (Phase 7)

1. Marketing pages are complete and mobile/desktop responsive.
2. SEO metadata and structured data are present and validated.
3. Existing portal flows remain green under full validation matrix.
4. E2E includes both smoke and authenticated workflow coverage.
5. Docs updated:
  - `BUILD-LOG.md`
  - `docs/testing-validation-matrix.md`
  - phase-specific delivery notes.
